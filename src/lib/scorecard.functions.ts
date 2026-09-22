import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  SCORECARD_PDF_FILENAME,
  type ScorecardCommerceEnv,
} from "@/lib/scorecard-commerce";

type StripeEnv = "sandbox" | "live";
import {
  scoreScorecard,
  type ScorecardAnswers,
  type ScorecardResult,
} from "@/lib/scorecard-scoring";

const envSchema = z.enum(["sandbox", "live"]);

const answersSchema = z
  .object({
    buyer_email: z.string().email().max(254),
    buyer_name: z.string().trim().min(1).max(120),
    buyer_role: z.enum(["owner", "ops_lead", "manager", "admin", "it", "other"]),
    company_name: z.string().trim().min(1).max(160),
    workflow_one_liner: z.string().trim().min(1).max(280),
    workflow_start: z.string().trim().min(1).max(200),
    workflow_end: z.string().trim().min(1).max(200),
    workflow_frequency: z.enum([
      "daily",
      "few_week",
      "weekly",
      "monthly",
      "bursts",
      "unsure",
    ]),
    workflow_volume_week: z.enum(["1_5", "6_20", "21_50", "51_plus", "unsure"]),
    leak_signals: z
      .array(
        z.enum([
          "delays",
          "rework",
          "missed_followup",
          "handoffs",
          "inbox_friction",
          "spreadsheet_friction",
          "no_visibility",
          "duplicate_entry",
          "after_hours",
          "other_leak",
        ]),
      )
      .min(1)
      .max(10),
    leak_other: z.string().trim().max(200).optional(),
    systems: z
      .array(
        z.enum([
          "email",
          "phone_sms",
          "crm",
          "spreadsheet",
          "calendar",
          "scheduling",
          "ticketing",
          "sis",
          "erp",
          "docs",
          "other_system",
        ]),
      )
      .min(1)
      .max(11),
    systems_other: z.string().trim().max(120).optional(),
    approval_points: z.enum(["every_item", "exceptions", "final_only", "rarely", "unsure"]),
    approval_detail: z.string().trim().min(1).max(400),
    goal_90d: z.enum([
      "save_time",
      "fewer_errors",
      "visibility",
      "follow_through",
      "capacity",
      "other_goal",
    ]),
    urgency: z.enum(["this_month", "this_quarter", "exploring", "not_urgent"]),
    owner_named: z.enum(["yes", "partial", "no", "me"]),
    budget_conversation: z.enum(["yes", "maybe", "no", "unsure"]),
    pain_severity: z.enum(["1", "2", "3", "4", "5"]),
  })
  .superRefine((data, ctx) => {
    if (data.leak_signals.includes("other_leak") && !data.leak_other?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please briefly describe the other leak.",
        path: ["leak_other"],
      });
    }
    if (data.systems.includes("other_system") && !data.systems_other?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please name the other system.",
        path: ["systems_other"],
      });
    }
  });

function resolveEnv(explicit?: StripeEnv): ScorecardCommerceEnv {
  if (explicit) return explicit;
  const token = process.env.VITE_PAYMENTS_CLIENT_TOKEN?.trim() || "";
  if (token.startsWith("pk_test_")) return "sandbox";
  return "live";
}

export type VerifyScorecardResult =
  | {
      ok: true;
      email: string | null;
      name: string | null;
      amountCents: number | null;
      alreadyCompleted: boolean;
      report: null | {
        opportunityScore: number;
        band: string;
        sprintFit: string;
        nextStep: string;
        nextStepLine?: string;
        pdfBase64: string | null;
        pdfFilename: string;
        buyerName: string;
      };
    }
  | { ok: false; error: string };

/**
 * Gate the thank-you questionnaire: session must be a paid Scorecard checkout.
 */
export const verifyScorecardSession = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionId: string; environment?: StripeEnv }) =>
    z
      .object({
        sessionId: z.string().min(1).max(200),
        environment: envSchema.optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<VerifyScorecardResult> => {
    try {
      const { allowPersistentRequest, getClientIp } = await import("@/lib/request-guard.server");
      const { getRequest } = await import("@tanstack/react-start/server");
      const ip = getClientIp(getRequest()?.headers ?? new Headers());
      if (!(await allowPersistentRequest(`scorecard-verify:${ip}`, 30, 60_000))) {
        return { ok: false, error: "Too many requests. Please try again shortly." };
      }

      const env = resolveEnv(data.environment);
      const { assertPaidScorecardSession, loadScorecardReport } = await import(
        "@/lib/scorecard-fulfillment.server"
      );
      const { email, name, amountCents } = await assertPaidScorecardSession(data.sessionId, env);
      const existing = await loadScorecardReport(data.sessionId);
      if (existing) {
        const { SCORECARD_SCORING_V1 } = await import("@/lib/scorecard-scoring");
        const nextStep = existing.next_step as keyof typeof SCORECARD_SCORING_V1.nextStepCopy;
        return {
          ok: true,
          email: existing.buyer_email || email,
          name: existing.buyer_name || name,
          amountCents,
          alreadyCompleted: true,
          report: {
            opportunityScore: existing.opportunity_score,
            band: existing.opportunity_band,
            sprintFit: existing.sprint_fit,
            nextStep: existing.next_step,
            nextStepLine: SCORECARD_SCORING_V1.nextStepCopy[nextStep],
            pdfBase64: existing.pdf_base64,
            pdfFilename: SCORECARD_PDF_FILENAME,
            buyerName: existing.buyer_name,
          },
        };
      }
      return {
        ok: true,
        email,
        name,
        amountCents,
        alreadyCompleted: false,
        report: null,
      };
    } catch (error) {
      console.error("[scorecard] verifySession failed", error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Could not verify payment session.",
      };
    }
  });

export type SubmitScorecardResult =
  | {
      ok: true;
      result: ScorecardResult;
      pdfBase64: string;
      pdfFilename: string;
    }
  | { ok: false; error: string };

/**
 * Score answers, generate PDF, persist, email, return download payload.
 */
export const submitScorecardQuestionnaire = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { sessionId: string; environment?: StripeEnv; answers: ScorecardAnswers }) =>
      z
        .object({
          sessionId: z.string().min(1).max(200),
          environment: envSchema.optional(),
          answers: answersSchema,
        })
        .parse(data),
  )
  .handler(async ({ data }): Promise<SubmitScorecardResult> => {
    try {
      const { allowPersistentRequest, getClientIp } = await import("@/lib/request-guard.server");
      const { getRequest } = await import("@tanstack/react-start/server");
      const ip = getClientIp(getRequest()?.headers ?? new Headers());
      if (!(await allowPersistentRequest(`scorecard-submit:${ip}`, 10, 60_000))) {
        return { ok: false, error: "Too many requests. Please try again shortly." };
      }

      const env = resolveEnv(data.environment);
      const {
        assertPaidScorecardSession,
        persistScorecardReport,
        sendScorecardFulfillmentEmail,
        loadScorecardReport,
      } = await import("@/lib/scorecard-fulfillment.server");

      await assertPaidScorecardSession(data.sessionId, env);

      const existing = await loadScorecardReport(data.sessionId);
      if (existing?.pdf_base64) {
        const result = scoreScorecard(existing.answers);
        return {
          ok: true,
          result,
          pdfBase64: existing.pdf_base64,
          pdfFilename: SCORECARD_PDF_FILENAME,
        };
      }

      const answers = data.answers as ScorecardAnswers;
      const result = scoreScorecard(answers);
      const { generateScorecardPdf, pdfToBase64 } = await import("@/lib/scorecard-pdf.server");
      const pdfBytes = generateScorecardPdf(answers, result);
      const pdfBase64 = pdfToBase64(pdfBytes);

      await persistScorecardReport({
        sessionId: data.sessionId,
        env,
        answers,
        result,
        pdfBase64,
      });

      await sendScorecardFulfillmentEmail({
        answers,
        result,
        pdfBase64,
        sessionId: data.sessionId,
      });

      return {
        ok: true,
        result,
        pdfBase64,
        pdfFilename: SCORECARD_PDF_FILENAME,
      };
    } catch (error) {
      console.error("[scorecard] submit failed", error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Could not generate your Scorecard.",
      };
    }
  });
