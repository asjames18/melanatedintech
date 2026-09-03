import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/integrations/supabase/env";
import { rankItem } from "@/lib/radar";
import {
  fetchAiRadarFeed,
  type AiRadarFeedResponse,
  type AiRadarItem,
  type AiRadarSourceStatus,
} from "@/lib/ai-radar.functions";

/**
 * Read path for the AI Radar.
 *
 * /radar is served from `radar_items`, which the scheduled ingest fills — a
 * database read instead of ~38 upstream fetches on the critical path. When the
 * table is empty or the last ingest is stale (migration not applied yet, cron
 * paused, ingest failing) this falls back to fetching live, so the page never
 * depends on the job having run.
 */

/** Beyond this, the stored feed is treated as stale and we fetch live instead. */
const STALE_AFTER_MS = 3 * 60 * 60 * 1000;
/**
 * Ceiling on the store read. Without it an unreachable database does not fail
 * over to the live path, it just makes the page wait: the fallback is only
 * useful if it triggers quickly.
 */
const STORE_TIMEOUT_MS = 2500;
/**
 * How long to stop probing the store after it comes back empty or unreachable.
 * Without this, a database that is down (or a migration that has not been
 * applied) costs every single request the full STORE_TIMEOUT_MS before the
 * fallback runs. Short enough that the page picks the store up within a minute
 * of the first successful ingest.
 */
const STORE_RETRY_AFTER_MS = 60_000;
/** Matches the live path's window so both render the same slice of time. */
const WINDOW_DAYS = 21;

/** Per-isolate negative cache for the store probe. */
let storeUnavailableUntil = 0;

type RadarRow = {
  id: string;
  url: string;
  title: string;
  summary: string | null;
  source: string;
  source_group: string;
  category: string;
  author: string | null;
  published_at: string;
  tags: string[] | null;
  score: number | null;
  comments_count: number | null;
  track: string;
  signal: string;
};

function publicClient() {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Rank is recomputed here rather than read from the row. The stored value is a
 * snapshot from ingest time, and recency decay keeps moving after that — a
 * two-hour-old release should outrank a three-week-old one without the ingest
 * having to rewrite every row to say so.
 */
function rowToItem(row: RadarRow, now: number): AiRadarItem {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    summary: row.summary ?? "",
    source: row.source,
    group: row.source_group as AiRadarItem["group"],
    category: row.category as AiRadarItem["category"],
    author: row.author ?? undefined,
    publishedAt: row.published_at,
    tags: row.tags ?? [],
    score: row.score ?? undefined,
    commentsCount: row.comments_count ?? undefined,
    track: row.track as AiRadarItem["track"],
    signal: row.signal as AiRadarItem["signal"],
    rank: rankItem({
      source: row.source,
      publishedAt: row.published_at,
      score: row.score ?? undefined,
      now,
    }),
  };
}

const inputSchema = z
  .object({ limit: z.number().int().min(5).max(150).default(120) })
  .strict();

/**
 * Server Function: the Radar feed for the public page.
 *
 * Prefers the stored feed; falls back to a live gather when the store is empty
 * or stale. The response carries `servedFrom` so the page can say which.
 */
export const fetchRadarForPage = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => inputSchema.parse(d ?? {}))
  .handler(
    async ({
      data,
    }): Promise<AiRadarFeedResponse & { servedFrom: "store" | "live"; storeCount: number }> => {
      const now = Date.now();
      const sb = now >= storeUnavailableUntil ? publicClient() : null;

      if (sb) {
        try {
          const cutoff = new Date(now - WINDOW_DAYS * 86_400_000).toISOString();
          const [itemsResult, runResult] = await Promise.all([
            sb
              .from("radar_items")
              .select(
                "id,url,title,summary,source,source_group,category,author,published_at,tags,score,comments_count,track,signal",
              )
              .eq("status", "published")
              .gte("published_at", cutoff)
              .order("published_at", { ascending: false })
              .limit(300)
              .abortSignal(AbortSignal.timeout(STORE_TIMEOUT_MS)),
            sb
              .from("radar_ingest_runs")
              .select("started_at, finished_at, source_status")
              .not("finished_at", "is", null)
              .order("started_at", { ascending: false })
              .limit(1)
              .abortSignal(AbortSignal.timeout(STORE_TIMEOUT_MS))
              .maybeSingle(),
          ]);

          const rows = (itemsResult.data ?? []) as RadarRow[];
          const lastRun = runResult.data as
            | { started_at: string; finished_at: string; source_status: AiRadarSourceStatus[] }
            | null;
          const runAge = lastRun ? now - new Date(lastRun.started_at).getTime() : Infinity;

          if (!itemsResult.error && rows.length > 0 && runAge < STALE_AFTER_MS) {
            const items = rows
              .map((row) => rowToItem(row, now))
              .sort((a, b) => b.rank - a.rank)
              .slice(0, data.limit);

            storeUnavailableUntil = 0;
            return {
              items,
              sources: Array.from(new Set(items.map((i) => i.group))).sort(),
              sourceStatus: lastRun?.source_status ?? [],
              total: items.length,
              lastUpdated: lastRun?.started_at ?? new Date(now).toISOString(),
              servedFrom: "store",
              storeCount: rows.length,
            };
          }
          // Reachable but not usable yet (no rows, or the last ingest is old).
          storeUnavailableUntil = now + STORE_RETRY_AFTER_MS;
        } catch (err) {
          // A missing table (migration not applied) lands here too.
          console.warn("[radar] store read unavailable, falling back to live:", err);
          storeUnavailableUntil = now + STORE_RETRY_AFTER_MS;
        }
      }

      const live = await fetchAiRadarFeed({ data: { category: "all", limit: data.limit } });
      return { ...live, servedFrom: "live", storeCount: 0 };
    },
  );

// ---------------------------------------------------------------------------
// Admin moderation
// ---------------------------------------------------------------------------

type UntypedDb = { from: (table: string) => any };

async function getAdminDb(userId: string): Promise<UntypedDb> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as unknown as UntypedDb;
  const { data, error } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required.");
  return db;
}

export interface RadarModerationRow {
  id: string;
  url: string;
  title: string;
  summary: string | null;
  source: string;
  source_group: string;
  signal: string;
  track: string;
  status: string;
  hold_reason: string | null;
  published_at: string;
  created_at: string;
  reviewed_at: string | null;
  review_notes: string | null;
}

export interface RadarModerationView {
  pending: RadarModerationRow[];
  recent: RadarModerationRow[];
  lastRun: {
    started_at: string;
    finished_at: string | null;
    duration_ms: number | null;
    feeds_ok: number;
    feeds_total: number;
    items_seen: number;
    items_new: number;
    items_held: number;
    failure_message: string | null;
  } | null;
}

const MODERATION_COLUMNS =
  "id,url,title,summary,source,source_group,signal,track,status,hold_reason,published_at,created_at,reviewed_at,review_notes";

export const adminListRadarQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RadarModerationView> => {
    const db = await getAdminDb(context.userId);

    const [pending, recent, run] = await Promise.all([
      db
        .from("radar_items")
        .select(MODERATION_COLUMNS)
        .eq("status", "pending")
        .order("published_at", { ascending: false })
        .limit(100),
      db
        .from("radar_items")
        .select(MODERATION_COLUMNS)
        .in("status", ["published", "rejected"])
        .not("reviewed_at", "is", null)
        .order("reviewed_at", { ascending: false })
        .limit(25),
      db
        .from("radar_ingest_runs")
        .select(
          "started_at, finished_at, duration_ms, feeds_ok, feeds_total, items_seen, items_new, items_held, failure_message",
        )
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (pending.error) throw new Error(pending.error.message);
    if (recent.error) throw new Error(recent.error.message);

    return {
      pending: (pending.data ?? []) as RadarModerationRow[],
      recent: (recent.data ?? []) as RadarModerationRow[],
      lastRun: (run.data ?? null) as RadarModerationView["lastRun"],
    };
  });

const reviewInput = z
  .object({
    id: z.string().uuid(),
    action: z.enum(["approve", "reject"]),
    notes: z.string().max(2000).optional(),
  })
  .strict();

/**
 * Approve a held item onto the page, or reject anything off it.
 *
 * A rejected `url_hash` is never resurfaced: the ingest skips rows it already
 * holds, so the decision survives every later run.
 */
export const adminReviewRadarItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => reviewInput.parse(d))
  .handler(async ({ data, context }): Promise<RadarModerationRow> => {
    const db = await getAdminDb(context.userId);

    const { data: existing, error: readError } = await db
      .from("radar_items")
      .select("id,status")
      .eq("id", data.id)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!existing) throw new Error("Radar item not found.");

    const toStatus = data.action === "approve" ? "published" : "rejected";

    const { data: updated, error } = await db
      .from("radar_items")
      .update({
        status: toStatus,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
        review_notes: data.notes?.trim() || null,
      })
      .eq("id", data.id)
      .select(MODERATION_COLUMNS)
      .single();
    if (error) throw new Error(error.message);

    const { error: eventError } = await db.from("radar_item_events").insert({
      item_id: data.id,
      event_type: data.action === "approve" ? "approved" : "rejected",
      actor_id: context.userId,
      from_status: existing.status,
      to_status: toStatus,
      details: data.notes?.trim() ? { notes: data.notes.trim() } : {},
    });
    if (eventError) console.warn("[radar] moderation event log failed", eventError);

    return updated as RadarModerationRow;
  });
