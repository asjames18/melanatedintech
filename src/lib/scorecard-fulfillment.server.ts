/**
 * Scorecard purchase recording + fulfillment email.
 * Separate from pack entitlement grants (fulfillment-grant.server.ts).
 */
import type Stripe from "stripe";
import {
  SCORECARD_EMAIL_SUBJECT,
  SCORECARD_PDF_FILENAME,
  SCORECARD_SKU,
  getScorecardIds,
  isAcceptedScorecardAmount,
  isScorecardPriceId,
  isScorecardSkuMetadata,
  type ScorecardCommerceEnv,
} from "@/lib/scorecard-commerce";
import { SITE_URL } from "@/lib/site";
import type { ScorecardAnswers, ScorecardResult } from "@/lib/scorecard-scoring";

type CheckoutSessionLike = {
  id?: string | null;
  metadata?: Record<string, string> | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  currency_conversion?: { amount_total?: number | null } | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
  customer_email?: string | null;
};

function settledUsdCents(session: CheckoutSessionLike): number | null {
  const converted = session.currency_conversion?.amount_total;
  if (typeof converted === "number") return converted;
  const total = session.amount_total;
  if (typeof total !== "number") return null;
  const currency = session.currency?.toLowerCase();
  if (currency && currency !== "usd") return null;
  return total;
}

function safe(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * True when this checkout session is a Scorecard purchase (metadata, price id,
 * or accepted amount against known Scorecard price ids once expanded).
 */
export function isScorecardCheckoutSession(
  session: CheckoutSessionLike,
  lineItemPriceIds: string[] = [],
): boolean {
  if (isScorecardSkuMetadata(session.metadata ?? undefined)) return true;
  if (lineItemPriceIds.some((id) => isScorecardPriceId(id))) return true;
  return false;
}

export async function resolveScorecardLinePriceIds(
  session: Stripe.Checkout.Session,
  env: ScorecardCommerceEnv,
): Promise<string[]> {
  try {
    const { createStripeClient } = await import("@/lib/stripe.server");
    const stripe = createStripeClient(env);
    const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 10 });
    return items.data
      .map((item) => (typeof item.price === "string" ? item.price : item.price?.id))
      .filter((id): id is string => Boolean(id));
  } catch (error) {
    console.warn("[scorecard] listLineItems failed", error);
    return [];
  }
}

/**
 * Validate a paid Scorecard session for thank-you gating / submit.
 */
export async function assertPaidScorecardSession(
  sessionId: string,
  env: ScorecardCommerceEnv,
): Promise<{
  session: Stripe.Checkout.Session;
  email: string | null;
  name: string | null;
  amountCents: number | null;
}> {
  const { createStripeClient } = await import("@/lib/stripe.server");
  const stripe = createStripeClient(env);
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new Error("This checkout session is not paid yet.");
  }

  const priceIds = await resolveScorecardLinePriceIds(session, env);
  const metaMatch = isScorecardSkuMetadata(session.metadata as Record<string, string> | null);
  const priceMatch = priceIds.some((id) => isScorecardPriceId(id));
  const amount = settledUsdCents(session);
  const amountMatch = isAcceptedScorecardAmount(env, amount);

  // Prefer explicit sku/price match. Amount alone is not enough (could collide).
  if (!metaMatch && !priceMatch) {
    // Fallback: Payment Links sometimes omit custom metadata on older sessions —
    // accept when amount matches AND line item price matches configured product.
    const ids = getScorecardIds(env);
    const productMatch = priceIds.length === 0 && amountMatch;
    // Also accept when amount matches configured smoke/live amounts AND session
    // success_url points at /scorecard/thank-you (Payment Link config).
    const successUrl = session.success_url ?? "";
    const successLooksLikeScorecard = successUrl.includes("/scorecard/thank-you");
    if (!(amountMatch && (productMatch || successLooksLikeScorecard || priceIds.includes(ids.priceId)))) {
      throw new Error("This checkout session is not a Workflow Opportunity Scorecard purchase.");
    }
  } else if (!amountMatch && typeof amount === "number") {
    console.error("[scorecard] paid session amount outside accepted list", {
      sessionId,
      amount,
      env,
    });
    throw new Error("Scorecard payment amount could not be reconciled. Contact support.");
  }

  const email =
    session.customer_details?.email ||
    session.customer_email ||
    (typeof session.customer === "object" && session.customer && "email" in session.customer
      ? (session.customer.email as string | null)
      : null) ||
    null;
  const name = session.customer_details?.name ?? null;

  return { session, email, name, amountCents: amount };
}

/**
 * Record a paid Scorecard order. Does NOT grant pack entitlements.
 */
export async function recordScorecardPurchase(
  sessionObj: CheckoutSessionLike,
  env: ScorecardCommerceEnv,
): Promise<{ recorded: boolean; reason?: string }> {
  const sessionId = sessionObj.id;
  if (!sessionId) return { recorded: false, reason: "missing-session-id" };
  if (sessionObj.payment_status && sessionObj.payment_status !== "paid") {
    return { recorded: false, reason: "not-paid" };
  }

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email =
      sessionObj.customer_details?.email || sessionObj.customer_email || null;
    const amount = settledUsdCents(sessionObj);
    const now = new Date().toISOString();

    const { error } = await supabaseAdmin.from("scorecard_orders" as never).upsert(
      {
        stripe_session_id: sessionId,
        buyer_email: email,
        amount_total_cents: amount,
        currency: sessionObj.currency ?? "usd",
        environment: env,
        payment_status: sessionObj.payment_status ?? "paid",
        metadata: {
          ...(sessionObj.metadata ?? {}),
          sku: SCORECARD_SKU,
        },
        updated_at: now,
      } as never,
      { onConflict: "stripe_session_id" },
    );

    if (error) {
      // Table may not be migrated yet — log and continue so webhook still acks
      // after skipping pack grants. Platform applies the migration before deploy.
      console.error("[scorecard] order upsert failed", error);
      return { recorded: false, reason: "db-error" };
    }
    return { recorded: true };
  } catch (error) {
    console.error("[scorecard] order record failed", error);
    return { recorded: false, reason: "db-error" };
  }
}

export async function persistScorecardReport(params: {
  sessionId: string;
  env: ScorecardCommerceEnv;
  answers: ScorecardAnswers;
  result: ScorecardResult;
  pdfBase64: string;
}): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();
    const { error } = await supabaseAdmin.from("scorecard_reports" as never).upsert(
      {
        stripe_session_id: params.sessionId,
        environment: params.env,
        buyer_email: params.answers.buyer_email,
        buyer_name: params.answers.buyer_name,
        company_name: params.answers.company_name,
        answers: params.answers,
        opportunity_score: params.result.opportunityScore,
        opportunity_band: params.result.band,
        sprint_fit: params.result.sprintFit,
        next_step: params.result.nextStep,
        pdf_base64: params.pdfBase64,
        updated_at: now,
      } as never,
      { onConflict: "stripe_session_id" },
    );
    if (error) console.error("[scorecard] report upsert failed", error);
  } catch (error) {
    console.error("[scorecard] report persist failed", error);
  }
}

export async function loadScorecardReport(sessionId: string): Promise<{
  answers: ScorecardAnswers;
  opportunity_score: number;
  opportunity_band: string;
  sprint_fit: string;
  next_step: string;
  pdf_base64: string | null;
  buyer_email: string;
  buyer_name: string;
  email_sent_at: string | null;
} | null> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("scorecard_reports" as never)
      .select(
        "answers, opportunity_score, opportunity_band, sprint_fit, next_step, pdf_base64, buyer_email, buyer_name, email_sent_at",
      )
      .eq("stripe_session_id" as never, sessionId)
      .maybeSingle();
    if (error || !data) return null;
    return data as never;
  } catch {
    return null;
  }
}

async function stampScorecardEmailSent(sessionId: string): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from("scorecard_reports" as never)
      .update({ email_sent_at: now, updated_at: now } as never)
      .eq("stripe_session_id" as never, sessionId);
    if (error) console.error("[scorecard] email_sent_at stamp failed", error);
  } catch (error) {
    console.error("[scorecard] email_sent_at stamp failed", error);
  }
}

/**
 * Send Scorecard PDF via Resend (preferred) or enqueue without attachment.
 * Returns true only when Resend accepted the message (email_sent_at stamped).
 */
export async function sendScorecardFulfillmentEmail(params: {
  answers: ScorecardAnswers;
  result: ScorecardResult;
  pdfBase64: string;
  sessionId: string;
}): Promise<boolean> {
  const to = params.answers.buyer_email.trim().toLowerCase();
  if (!to) return false;

  const thankYouUrl = `${SITE_URL}/scorecard/thank-you?session_id=${encodeURIComponent(params.sessionId)}`;
  const subject = SCORECARD_EMAIL_SUBJECT;
  const text = [
    `Hi ${params.answers.buyer_name},`,
    "",
    "Thanks for completing the Workflow Opportunity Scorecard.",
    "",
    "Your scored PDF is attached (and available on your thank-you page):",
    SCORECARD_PDF_FILENAME,
    "",
    "What this is:",
    "A self-serve snapshot from your answers for one repeated workflow.",
    "",
    "What this is not:",
    "It is not the $297 AI Workflow Diagnostic and not the Workflow Opportunity Sprint.",
    "",
    "Suggested next step from your results:",
    params.result.nextStepLine,
    "",
    `Re-open your thank-you page: ${thankYouUrl}`,
    "",
    "If something looks wrong with the file, reply to this email.",
    "",
    "— Melanated In Tech",
  ].join("\n");

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#2b2118;line-height:1.6;">
      <p>Hi ${safe(params.answers.buyer_name)},</p>
      <p>Thanks for completing the Workflow Opportunity Scorecard.</p>
      <p>Your scored PDF is attached (and available on your thank-you page): <strong>${SCORECARD_PDF_FILENAME}</strong></p>
      <p><strong>What this is:</strong><br/>A self-serve snapshot from your answers for one repeated workflow.</p>
      <p><strong>What this is not:</strong><br/>It is not the $297 AI Workflow Diagnostic and not the Workflow Opportunity Sprint.</p>
      <p><strong>Suggested next step from your results:</strong><br/>${safe(params.result.nextStepLine)}</p>
      <p><a href="${thankYouUrl}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#2b2118;color:#fff;text-decoration:none;font-weight:700;margin-top:8px;">Open thank-you page</a></p>
      <p style="margin-top:24px;border-top:1px solid #e5dcd2;padding-top:12px;color:#8b7a68;font-size:12px;">If something looks wrong with the file, reply to this email.<br/>— Melanated In Tech</p>
    </div>
  `;

  const messageId = `scorecard_report:${params.sessionId}`;
  const from = process.env.RESEND_FROM_EMAIL || "Melanated In Tech <hello@melanatedintech.com>";
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": messageId,
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html,
          text,
          attachments: [
            {
              filename: SCORECARD_PDF_FILENAME,
              content: params.pdfBase64,
            },
          ],
        }),
      });
      if (!response.ok) {
        throw new Error(`Resend returned HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
      }
      await stampScorecardEmailSent(params.sessionId);
      return true;
    } catch (error) {
      console.error("[scorecard] direct Resend send failed; queueing without attachment", error);
    }
  }

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc(
      "enqueue_email" as never,
      {
        queue_name: "transactional_emails",
        payload: {
          to,
          from,
          subject,
          html,
          text,
          label: "scorecard_fulfillment",
          purpose: "transactional",
          message_id: messageId,
          idempotency_key: messageId,
          queued_at: new Date().toISOString(),
        },
      } as never,
    );
    if (error) console.error("[scorecard] fulfillment email enqueue failed", error);
  } catch (error) {
    console.error("[scorecard] fulfillment email enqueue failed", error);
  }
  return false;
}
