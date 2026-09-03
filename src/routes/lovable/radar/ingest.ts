import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import {
  getRadarIngestSecret,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/integrations/supabase/env";
import { gatherRadarFeed } from "@/lib/ai-radar.functions";
import {
  holdReasonFor,
  isNearDuplicateTitle,
  normalizeUrl,
  stableId,
  titleFingerprint,
  titleTokens,
} from "@/lib/radar";

/**
 * Scheduled AI Radar ingest.
 *
 * Called by Supabase pg_cron (see the radar ingest scheduler migration) with a
 * dedicated bearer secret, the same shape as the transactional-email queue
 * processor. Moving the ~38 upstream fetches here means /radar is a database
 * read: no third-party tail latency on a page load, an archive that outlives
 * the cache TTL, and a place for a human to intervene.
 *
 * Idempotent. Rows are keyed on `url_hash`; a story we have already stored only
 * gets its `last_seen_at` touched, so an item an admin approved or rejected is
 * never dragged back by a later run.
 */

/** Rows older than this are deleted on every run. */
const RETAIN_DAYS = 30;

/**
 * How many runs it takes to walk the whole source list. See gatherRadarFeed:
 * a Worker request has a fixed subrequest budget (50 on the free plan) and the
 * full list plus the database calls exceeds it. Four slices keeps a run near
 * ~20 feed fetches plus ~10 database calls, comfortably inside the budget, and
 * covers everything every two hours on a 30-minute schedule.
 */
const SLICE_COUNT = 4;
/** Matches the cron schedule, so consecutive runs land on consecutive slices. */
const SLICE_INTERVAL_MS = 30 * 60 * 1000;

/**
 * How far back to look for an existing version of an incoming story. Anything
 * older is not something a reader would experience as a duplicate.
 */
const DUPLICATE_LOOKBACK_DAYS = 10;

export const Route = createFileRoute("/lovable/radar/ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = getSupabaseUrl();
        const supabaseServiceKey = getSupabaseServiceRoleKey();
        const ingestSecret = getRadarIngestSecret();

        if (!supabaseUrl || !supabaseServiceKey || !ingestSecret) {
          console.error("[radar-ingest] missing required environment variables");
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        // Verify the caller with a dedicated scheduler secret. The service-role
        // key stays private to database access.
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (authHeader.slice("Bearer ".length).trim() !== ingestSecret) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);
        const startedAt = new Date();

        const { data: runRow, error: runError } = await supabase
          .from("radar_ingest_runs")
          .insert({ started_at: startedAt.toISOString() })
          .select("id")
          .single();

        if (runError) {
          console.error("[radar-ingest] could not open a run row", runError);
          return Response.json({ error: "Could not record ingest run" }, { status: 500 });
        }
        const runId = runRow.id as string;

        try {
          const sliceIndex = Math.floor(Date.now() / SLICE_INTERVAL_MS) % SLICE_COUNT;
          const feed = await gatherRadarFeed(Date.now(), "full", {
            index: sliceIndex,
            count: SLICE_COUNT,
          });

          const feedsOk = feed.sourceStatus.reduce((sum, s) => sum + s.feedsOk, 0);
          const feedsTotal = feed.sourceStatus.reduce((sum, s) => sum + s.feedsTotal, 0);

          // Moderation state belongs to the admin, not to the ingest. Split the
          // batch by what the table already knows: rows we have seen before get
          // their ranking inputs refreshed and nothing else, so an approved item
          // is never dragged back to 'pending' and a rejected one never revives.
          const hashes = feed.items.map((item) => stableId("u", normalizeUrl(item.url)));
          const known = new Map<string, string>();
          for (let i = 0; i < hashes.length; i += 200) {
            const { data, error } = await supabase
              .from("radar_items")
              .select("url_hash, status")
              .in("url_hash", hashes.slice(i, i + 200));
            if (error) throw new Error(`existing lookup failed: ${error.message}`);
            for (const row of data ?? []) known.set(row.url_hash as string, row.status as string);
          }

          // Cross-run duplicate suppression. gatherRadarFeed already dedupes
          // within a run, but the same launch reaches us from a vendor blog at
          // 10:00 and from four outlets at 10:30 — different URLs, different
          // headlines, one story. Compare each candidate against what the last
          // ten days already hold, by exact fingerprint first and then by token
          // overlap for restatements.
          const lookbackFrom = new Date(
            Date.now() - DUPLICATE_LOOKBACK_DAYS * 86_400_000,
          ).toISOString();
          const { data: recentRows, error: recentError } = await supabase
            .from("radar_items")
            .select("title_fingerprint, title")
            .gte("published_at", lookbackFrom)
            .limit(2000);
          if (recentError) throw new Error(`duplicate lookup failed: ${recentError.message}`);

          const storedFingerprints = new Set<string>();
          const storedTokens: Set<string>[] = [];
          for (const row of recentRows ?? []) {
            if (row.title_fingerprint) storedFingerprints.add(row.title_fingerprint as string);
            if (row.title) storedTokens.push(titleTokens(row.title as string));
          }

          const nowIso = new Date().toISOString();
          const inserts: Record<string, unknown>[] = [];
          const seenAgain: string[] = [];
          let held = 0;
          let duplicates = 0;

          feed.items.forEach((item, index) => {
            const hash = hashes[index]!;
            if (known.has(hash)) {
              seenAgain.push(hash);
              return;
            }

            const fingerprint = titleFingerprint(item.title);
            if (storedFingerprints.has(fingerprint)) {
              duplicates += 1;
              return;
            }
            if (isNearDuplicateTitle(item.title, storedTokens)) {
              duplicates += 1;
              return;
            }
            // A story kept in this batch also has to block the ones behind it.
            storedFingerprints.add(fingerprint);
            storedTokens.push(titleTokens(item.title));

            const holdReason = holdReasonFor(`${item.title} ${item.summary}`);
            if (holdReason) held += 1;
            inserts.push({
              url_hash: hash,
              title_fingerprint: fingerprint,
              url: item.url.slice(0, 2000),
              title: item.title.slice(0, 500),
              summary: item.summary.slice(0, 2000),
              source: item.source,
              source_group: item.group,
              category: item.category,
              author: item.author ?? null,
              published_at: item.publishedAt,
              tags: item.tags,
              score: item.score ?? null,
              comments_count: item.commentsCount ?? null,
              track: item.track,
              signal: item.signal,
              rank: item.rank,
              status: holdReason ? "pending" : "published",
              hold_reason: holdReason,
              last_seen_at: nowIso,
            });
          });

          for (let i = 0; i < inserts.length; i += 100) {
            const batch = inserts.slice(i, i + 100);
            const { data, error } = await supabase
              .from("radar_items")
              .insert(batch)
              .select("id, status, hold_reason");
            if (error) throw new Error(`insert failed: ${error.message}`);
            const events = (data ?? []).map((row) => ({
              item_id: row.id as string,
              event_type: row.status === "pending" ? "held" : "ingested",
              to_status: row.status as string,
              details: row.hold_reason ? { hold_reason: row.hold_reason } : {},
            }));
            if (events.length) {
              const { error: eventError } = await supabase.from("radar_item_events").insert(events);
              if (eventError) console.warn("[radar-ingest] event log failed", eventError);
            }
          }

          // Rows we already hold only need their liveness stamp. The stored
          // `rank` is a snapshot from ingest time and deliberately not refreshed
          // here: recency decay is a pure function of published_at, so the read
          // path recomputes it and one round trip per item is pure waste.
          for (let i = 0; i < seenAgain.length; i += 200) {
            const { error } = await supabase
              .from("radar_items")
              .update({ last_seen_at: nowIso })
              .in("url_hash", seenAgain.slice(i, i + 200));
            if (error) console.warn("[radar-ingest] last_seen refresh failed", error.message);
          }

          // Retention: nothing older than 30 days survives a run. Deleted, not
          // hidden — including rejected rows, which by then have aged out of
          // any feed that could resurface them.
          const cutoff = new Date(Date.now() - RETAIN_DAYS * 86_400_000).toISOString();
          const { error: pruneError } = await supabase
            .from("radar_items")
            .delete()
            .lt("published_at", cutoff);
          if (pruneError) console.warn("[radar-ingest] prune failed", pruneError);

          // Ingest-run history is metadata, not content, but it should not grow
          // forever either.
          const { error: runPruneError } = await supabase
            .from("radar_ingest_runs")
            .delete()
            .lt("started_at", cutoff);
          if (runPruneError) console.warn("[radar-ingest] run prune failed", runPruneError);

          const finishedAt = new Date();
          await supabase
            .from("radar_ingest_runs")
            .update({
              finished_at: finishedAt.toISOString(),
              duration_ms: finishedAt.getTime() - startedAt.getTime(),
              feeds_ok: feedsOk,
              feeds_total: feedsTotal,
              items_seen: feed.items.length,
              items_new: inserts.length,
              items_held: held,
              items_duplicate: duplicates,
              source_status: feed.sourceStatus,
            })
            .eq("id", runId);

          return Response.json({
            run_id: runId,
            feeds_ok: feedsOk,
            feeds_total: feedsTotal,
            items_seen: feed.items.length,
            slice: `${sliceIndex + 1}/${SLICE_COUNT}`,
            items_new: inserts.length,
            items_refreshed: seenAgain.length,
            items_duplicate: duplicates,
            items_held: held,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("[radar-ingest] failed", message);

          // Report the reason in the response as well as the row. When this
          // handler ran out of subrequests, the row update below was itself a
          // subrequest and failed too — and because supabase-js returns errors
          // instead of throwing, discarding its result meant the run recorded a
          // null failure_message and nothing said why. The caller is already
          // authenticated, so telling it what broke costs nothing.
          const finishedAt = new Date();
          const { error: writeError } = await supabase
            .from("radar_ingest_runs")
            .update({
              finished_at: finishedAt.toISOString(),
              duration_ms: finishedAt.getTime() - startedAt.getTime(),
              failure_message: message.slice(0, 4000),
            })
            .eq("id", runId);
          if (writeError) {
            console.error("[radar-ingest] could not record the failure", writeError.message);
          }

          return Response.json(
            {
              error: "Ingest failed",
              run_id: runId,
              reason: message.slice(0, 500),
              recorded: !writeError,
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
