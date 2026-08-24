import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/integrations/supabase/env";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
  "diagnostic_page_viewed",
  "eval_studio_run",
  "final_payment_started",
  "fit_finder_completed",
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
    const { allowPersistentRequest, getClientIp } = await import("@/lib/request-guard.server");
    const headers = getRequest()?.headers;
    if (
      headers &&
      !(await allowPersistentRequest(`analytics:${getClientIp(headers)}`, 20, 60_000))
    ) {
      return { ok: true, count: 0 }; // silently drop — never break the page over analytics
    }

    const { createClient } = await import("@supabase/supabase-js");
    const url = getSupabaseUrl()!;
    const key = getSupabasePublishableKey()!;
    const supabase = createClient(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });
    const rows = data.events.map((e) => ({
      name: e.name,
      props: e.props ?? {},
      session_id: e.session_id ?? null,
      occurred_at: e.occurred_at ?? new Date().toISOString(),
    }));
    const { error } = await supabase.from("analytics_events").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true, count: rows.length };
  });

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

    // Daily trend buckets
    const dailyMap = new Map<string, { totalEvents: number; toolRuns: number; leadsChecked: number; conversions: number }>();

    // Lead quality breakdown
    const leadQuality = {
      totalChecks: 0,
      corporate: 0,
      personal: 0,
      inactive: 0,
      invalid: 0,
    };

    // Funnel metrics
    const funnel = {
      diagnosticViews: 0,
      leadsQualified: 0,
      demosRequested: 0,
      purchasesCompleted: 0,
    };

    const TOOL_EVENT_NAMES = new Set([
      "tool_used",
      "fit_finder_completed",
      "sop_generator_action",
      "sop_generated",
      "eval_studio_run",
      "agent_architect_run",
      "agent_architect_action",
      "prompt_pilot_run",
      "prompt_pilot_action",
      "mcp_builder_action",
      "model_playground_run",
      "gpt_trainer_action",
      "policy_generator_action",
      "ab_tester_run",
      "rag_chunker_export",
      "roi_calculator_share",
      "ai_playbook_generated",
      "voice_agent_builder",
    ]);

    for (const e of events) {
      const dateStr = e.occurred_at.slice(0, 10);
      const dayBucket = dailyMap.get(dateStr) ?? { totalEvents: 0, toolRuns: 0, leadsChecked: 0, conversions: 0 };
      dayBucket.totalEvents++;

      if (TOOL_EVENT_NAMES.has(e.name)) {
        totalToolRuns++;
        dayBucket.toolRuns++;
        const rawName = String(e.props?.tool ?? e.name).replace(/_(run|action|generated|export|completed|share)$/, "").replace(/_/g, " ");
        const toolName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        toolUsage.set(toolName, (toolUsage.get(toolName) ?? 0) + 1);
      }

      if (e.name === "diagnostic_page_viewed") {
        funnel.diagnosticViews++;
      }

      if (e.name === "lead_qualified") {
        leadQuality.totalChecks++;
        dayBucket.leadsChecked++;
        funnel.leadsQualified++;
        const status = String(e.props?.status ?? "");
        if (status === "corporate") leadQuality.corporate++;
        else if (status === "personal") leadQuality.personal++;
        else if (status === "unregistered" || status === "inactive") leadQuality.inactive++;
        else if (status === "invalid") leadQuality.invalid++;
      }

      if (e.name === "demo_requested" || e.name === "strategy_sprint_application_submitted" || e.name === "contact_submission_completed") {
        funnel.demosRequested++;
        dayBucket.conversions++;
      }

      if (e.name === "purchase_completed" || e.name === "deposit_paid") {
        funnel.purchasesCompleted++;
        dayBucket.conversions++;
      }

      const isImp = e.name === "recommendation_impression";
      const isClk = e.name === "recommendation_click";
      if (!isImp && !isClk) {
        dailyMap.set(dateStr, dayBucket);
        continue;
      }
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

      dailyMap.set(dateStr, dayBucket);
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

    // Format daily timeline trend array sorted chronologically
    const dailyTrends = [...dailyMap.entries()]
      .map(([date, metrics]) => ({ date, ...metrics }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      days: data.days,
      totals: {
        events: events.length,
        impressions: totalImpressions,
        clicks: totalClicks,
        ctr: totalImpressions ? totalClicks / totalImpressions : 0,
        toolRuns: totalToolRuns,
        leadChecks: leadQuality.totalChecks,
      },
      bySurface,
      topItems,
      topReasons,
      topTools,
      dailyTrends,
      leadQuality,
      funnel,
    };
  });
