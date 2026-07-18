import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/integrations/supabase/env";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const eventSchema = z.object({
  name: z.string().trim().min(1).max(80),
  props: z.record(z.string(), z.unknown()).default({}),
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
    const { allowRequest, getClientIp } = await import("@/lib/request-guard.server");
    const headers = getRequest()?.headers;
    if (headers && !allowRequest(`analytics:${getClientIp(headers)}`, 20, 60_000)) {
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
