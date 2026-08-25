import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";

const ALLOWED_PUBLIC_EVENTS = new Set([
  "ab_tester_run",
  "agent_architect_action",
  "agent_clicked",
  "ai_playbook_generated",
  "ai_playbook_prompt_copied",
  "ai_playbook_send_to_pilot",
  "checkout_started",
  "contact_submission_completed",
  "content_shared",
  "custom_agent_build_application_started",
  "custom_agent_build_viewed",
  "demo_completed",
  "demo_cta_clicked",
  "demo_requested",
  "demo_started",
  "deposit_paid",
  "deposit_started",
  "diagnostic_intake_submitted",
  "diagnostic_page_viewed",
  "eval_studio_run",
  "final_payment_started",
  "fit_finder_completed",
  "free_pack_claimed",
  "fit_finder_recommendation_clicked",
  "fit_finder_started",
  "fit_finder_viewed",
  "funnel_landing_viewed",
  "gpt_trainer_action",
  "guide_message_sent",
  "lead_qualified",
  "mcp_builder_action",
  "ministry_ai_application_started",
  "ministry_ai_implementation_viewed",
  "model_playground_run",
  "pilot_converted_to_managed",
  "pilot_launched",
  "policy_generator_action",
  "product_clicked",
  "prompt_pilot_action",
  "proposal_sent",
  "purchase_completed",
  "rag_chunker_export",
  "recommendation_click",
  "recommendation_impression",
  "recommendation_reason_click",
  "roi_calculator_share",
  "service_model_selected",
  "service_page_viewed",
  "sop_generator_action",
  "start_small_viewed",
  "starter_kit_downloaded",
  "starter_kit_email_captured",
  "strategy_sprint_application_started",
  "strategy_sprint_application_submitted",
  "strategy_sprint_clicked",
  "strategy_sprint_viewed",
  "systems_page_viewed",
  "team_ai_workshop_application_started",
  "team_ai_workshop_viewed",
  "tool_card_clicked",
  "tool_cross_sell_clicked",
  "unlock_clicked",
  "waitlist_joined",
]);

const SENSITIVE_PROP_KEYS = /(^|_)(email|phone|name|message|content|address)($|_)/i;

function containsSensitiveProp(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsSensitiveProp);
  return Object.entries(value).some(
    ([key, nested]) => SENSITIVE_PROP_KEYS.test(key) || containsSensitiveProp(nested),
  );
}

const analyticsPropsSchema = z.record(z.string(), z.unknown()).superRefine((props, ctx) => {
  if (containsSensitiveProp(props)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Analytics properties may not contain PII." });
  }
  if (JSON.stringify(props).length > 4_096) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Analytics properties are too large." });
  }
});

const eventSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .refine((name) => ALLOWED_PUBLIC_EVENTS.has(name), "Unsupported analytics event."),
  props: analyticsPropsSchema.default({}),
  session_id: z.string().trim().max(80).nullable().optional(),
  occurred_at: z.string().datetime().optional(),
});

const recordEventsSchema = z.object({
  events: z.array(eventSchema).min(1).max(50),
});

/**
 * Public ingestion: anyone (signed in or not) may record analytics events.
 * RLS enforces caller can only attribute events to themselves.
 */
export const recordEvents = createServerFn({ method: "POST" })
  .validator((d: unknown) => recordEventsSchema.parse(d))
  .handler(async ({ data }) => {
    // Dampen metric pollution: cap how fast one IP can pump events in.
    const { getRequest } = await import("@tanstack/react-start/server");
    const { allowPersistentRequest, getClientIp, getCallerUserId } =
      await import("@/lib/request-guard.server");
    const headers = getRequest()?.headers;
    if (
      headers &&
      !(await allowPersistentRequest(`analytics:${getClientIp(headers)}`, 20, 60_000))
    ) {
      return { ok: true, count: 0 }; // silently drop — never break the page over analytics
    }

    // Writes go through the service role so the event allowlist, the PII check,
    // and the rate limit above are the ONLY way into this table. Inserting with
    // the publishable key made all three optional: that key ships in the browser
    // bundle, so anyone could POST arbitrary rows straight to PostgREST and skip
    // every guard in this file.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Attribute to the signed-in caller when the request carries a valid token.
    // Anonymous events stay anonymous rather than being rejected.
    const request = getRequest();
    const userId = request ? await getCallerUserId(request) : null;

    const rows = data.events.map((e) => ({
      name: e.name,
      // Validated by analyticsPropsSchema and parsed from the JSON request body,
      // so it is Json-shaped; the zod type is just wider than the column type.
      props: (e.props ?? {}) as Json,
      session_id: e.session_id ?? null,
      user_id: userId,
      occurred_at: clampOccurredAt(e.occurred_at),
    }));
    const { error } = await supabaseAdmin.from("analytics_events").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true, count: rows.length };
  });

/** How far back a client may date an event, covering offline buffering. */
const MAX_EVENT_BACKDATE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * The client buffers events in localStorage and flushes later, so its
 * `occurred_at` carries real information and is worth keeping. It is still
 * caller-supplied, though: clamp it into a sane window so a bad actor cannot
 * back- or forward-date rows and distort every report built on this table.
 */
function clampOccurredAt(value: string | null | undefined): string {
  const now = Date.now();
  if (!value) return new Date(now).toISOString();

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return new Date(now).toISOString();

  return new Date(Math.min(Math.max(parsed, now - MAX_EVENT_BACKDATE_MS), now)).toISOString();
}

// ---------- Admin reads ----------

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required.");
}

const summarySchema = z.object({
  days: z.number().int().min(1).max(90).default(30),
});

type EventRow = {
  name: string;
  props: Record<string, unknown>;
  occurred_at: string;
};

export const adminAnalyticsSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => summarySchema.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - data.days * 24 * 60 * 60 * 1000).toISOString();
    const { data: rows, error } = await supabaseAdmin
      .from("analytics_events")
      .select("name, props, occurred_at")
      .gte("occurred_at", since)
      .order("occurred_at", { ascending: false })
      .limit(5000);
    if (error) throw new Error(error.message);

    const events = (rows ?? []) as EventRow[];

    type Bucket = { impressions: number; clicks: number };
    const surfaces = new Map<string, Bucket>();
    const items = new Map<
      string,
      Bucket & { itemType: string; itemSlug: string; itemCategory: string }
    >();
    const reasons = new Map<string, Bucket>();
    let totalImpressions = 0;
    let totalClicks = 0;

    const toolUsage = new Map<string, number>();
    let totalToolRuns = 0;

    for (const e of events) {
      if (
        e.name === "tool_used" ||
        e.name === "fit_finder_completed" ||
        e.name === "sop_generated" ||
        e.name === "eval_studio_run" ||
        e.name === "agent_architect_run" ||
        e.name === "prompt_pilot_run"
      ) {
        totalToolRuns++;
        const toolName = String(e.props?.tool ?? e.name).replace(/_/g, " ");
        toolUsage.set(toolName, (toolUsage.get(toolName) ?? 0) + 1);
      }

      const isImp = e.name === "recommendation_impression";
      const isClk = e.name === "recommendation_click";
      if (!isImp && !isClk) continue;
      const p = e.props ?? {};
      const surface = String(p.surface ?? "unknown");
      const itemType = String(p.itemType ?? "unknown");
      const itemSlug = String(p.itemSlug ?? "unknown");
      const itemCategory = String(p.itemCategory ?? "unknown");
      const reason = String(p.reason ?? "unknown");

      if (isImp) totalImpressions++;
      else totalClicks++;

      const sBucket = surfaces.get(surface) ?? { impressions: 0, clicks: 0 };
      if (isImp) sBucket.impressions++;
      else sBucket.clicks++;
      surfaces.set(surface, sBucket);

      const itemKey = `${itemType}:${itemSlug}`;
      const iBucket = items.get(itemKey) ?? {
        impressions: 0,
        clicks: 0,
        itemType,
        itemSlug,
        itemCategory,
      };
      if (isImp) iBucket.impressions++;
      else iBucket.clicks++;
      items.set(itemKey, iBucket);

      const rBucket = reasons.get(reason) ?? { impressions: 0, clicks: 0 };
      if (isImp) rBucket.impressions++;
      else rBucket.clicks++;
      reasons.set(reason, rBucket);
    }

    const toCtr = (b: Bucket) => (b.impressions ? b.clicks / b.impressions : 0);

    const bySurface = [...surfaces.entries()]
      .map(([surface, b]) => ({ surface, ...b, ctr: toCtr(b) }))
      .sort((a, b) => b.impressions - a.impressions);

    const topItems = [...items.values()]
      .map((b) => ({ ...b, ctr: toCtr(b) }))
      .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
      .slice(0, 25);

    const topReasons = [...reasons.entries()]
      .map(([reason, b]) => ({ reason, ...b, ctr: toCtr(b) }))
      .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
      .slice(0, 10);

    const topTools = [...toolUsage.entries()]
      .map(([tool, count]) => ({ tool, count }))
      .sort((a, b) => b.count - a.count);

    return {
      days: data.days,
      totals: {
        events: events.length,
        impressions: totalImpressions,
        clicks: totalClicks,
        ctr: totalImpressions ? totalClicks / totalImpressions : 0,
        toolRuns: totalToolRuns,
      },
      bySurface,
      topItems,
      topReasons,
      topTools,
    };
  });
