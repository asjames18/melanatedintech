# AI Radar ingest — operations

The Radar (`/radar`) reads `radar_items`, filled every 30 minutes by a scheduled
ingest. Until that job runs successfully the page falls back to fetching its ~38
sources live on each cold request, so nothing breaks while this is being set up —
it is only slower, and there is no archive.

## Bring-up order

The scheduler migration must not be applied before the secret exists in both
places, or every run returns 500.

1. **Generate a high-entropy secret.** Any 32+ byte random value.

2. **Set it on the Worker** as `RADAR_INGEST_SECRET` (Cloudflare project
   settings, same place as `EMAIL_QUEUE_PROCESSOR_SECRET`).

3. **Store it in Supabase Vault** under the name `radar_ingest_secret` — the
   scheduler migration reads it by that exact name.

4. **Apply the migrations**, in order:
   - `20260903120000_create_radar_items.sql` — tables, RLS, grants
   - `20260903120500_radar_ingest_scheduler.sql` — the pg_cron entry

5. **Verify.** Either wait for the next half-hour boundary or trigger it by hand:

   ```bash
   curl -X POST https://melanatedintech.com/lovable/radar/ingest -H "Authorization: Bearer $RADAR_INGEST_SECRET"
   ```

   A healthy run returns `{ "run_id": "...", "feeds_ok": 38, "feeds_total": 38, ... }`.
   Then load `/radar`: the "Where this came from" strip should read
   *"Synced … by the scheduled ingest"* rather than *"by a live fetch"*.

## What the job does

Fetches every configured source (bounded to 10 concurrent requests and a 7s
whole-gather budget), dedupes, and writes rows keyed on `url_hash`.

It is idempotent and non-destructive to moderation state. A story already in the
table only gets its `last_seen_at` touched — an item an admin approved or
rejected is never dragged back by a later run. Rows older than 180 days are
pruned.

## Moderation

Radar items are links to third-party publishers, not Melanated In Tech claims,
so they publish by default; holding all ~120 items per run would leave the page
empty rather than make it safer.

Items whose text touches a subject `docs/daily-content-agent-spec.md` marks as
mandatory human review — legal, health, political, hiring, financial, ministry —
land as `pending` and stay hidden until an admin approves them at
`/admin/radar`. An admin can also reject anything already published; a rejected
item never returns.

Every decision is written to `radar_item_events` with the actor and the
before/after status.

## When something looks wrong

- **Page says "by a live fetch"** — the last ingest is missing or more than
  three hours old. Check `radar_ingest_runs` for a row with `failure_message`.
- **A source shows as failed in the public strip** — expected and intentional.
  Free feeds rate-limit and go down; the page names the failure rather than
  filling the gap with placeholder items. Only investigate if a feed fails for
  several runs in a row.
- **Dev.to intermittently returns 403** — it blocks some datacenter egress IPs.
  Nothing to fix on our side.
- **Nothing on the page at all** — every source failed on a cold cache. The page
  says so explicitly instead of showing sample content.
