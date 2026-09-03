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
   - `20260903140000_radar_dedup_and_retention.sql` — fingerprint column and
     the indexes the dedup lookup and the 30-day delete rely on

5. **Verify.** Either wait for the next half-hour boundary or trigger it by hand:

   ```bash
   curl -X POST https://melanatedintech.com/lovable/radar/ingest -H "Authorization: Bearer $RADAR_INGEST_SECRET"
   ```

   A healthy run returns `{ "run_id": "...", "feeds_ok": 80, "feeds_total": 82,
   "items_new": …, "items_duplicate": …, "items_held": … }`. A couple of feeds
   failing on any given run is normal.
   Then load `/radar`: the "Where this came from" strip should read
   *"Synced … by the scheduled ingest"* rather than *"by a live fetch"*.

## What the job does

Fetches every configured source — around eighty feeds and APIs — bounded to 12
concurrent requests and a 20s whole-gather budget, dedupes, and writes rows
keyed on `url_hash`.

It is idempotent and non-destructive to moderation state. A story already in the
table only gets its `last_seen_at` touched, so an item an admin approved or
rejected is never dragged back by a later run.

### Two profiles

- **full** — every source. Only the scheduled job runs this.
- **fast** — about ten high-signal sources (model catalog, both status pages,
  the main vendor blogs, Hacker News). This is what a page request runs when it
  has to gather live, because a visitor cannot wait on eighty feeds.

Adding a feed to the fast profile means putting it on the critical path of a
page load. `fast: true` in `RSS_FEEDS` is deliberately rare.

## Duplicate suppression

The feeds overlap heavily on purpose — a single model launch is covered by the
vendor blog, four outlets, a newsletter and Hacker News within the hour. Three
checks, cheapest first:

1. **Normalized URL** — protocol, `www.`, tracking params and trailing slashes
   stripped.
2. **Title fingerprint** — an order-insensitive hash of the headline's
   significant tokens, stored on the row. Collapses case, punctuation, word
   order and filler words.
3. **Token overlap** — Jaccard similarity against headlines already held,
   duplicate above 0.6. This is what catches "OpenAI Launches GPT-6, Expanding
   Context to One Million Tokens" against "OpenAI launches GPT-6 with a one
   million token context window".

Checks 2 and 3 run both within a batch and against the last 10 days in the
table, so a story that arrived this morning blocks the afternoon's restatement
of it.

**Known limit:** matching is on headlines only. A vendor's terse
"Introducing GPT-6" and an outlet's "OpenAI Launches GPT-6 With a Huge Context
Window" share too few tokens to be recognised as one story, so both can appear.
Outlet-to-outlet restatement — the high-volume case — is caught.

## Retention

Every row is deleted 30 days after its publication date, on every run. That
includes rejected rows, which by then have aged out of any feed that could
resurface them. Ingest-run history is pruned on the same schedule.

The page's display window matches, so everything retained is reachable.

## Sources

Every feed was checked before being added; the ones that 404, 403 or return an
empty document are not in the list. Notably absent because they publish no
working public feed: Anthropic's blog (its status page and SDK releases stand in
for it), Meta AI, BAIR, fast.ai, The Batch, Wired AI, ZDNET, Groq, Cohere,
LangChain's blog, Stability, Ai2, Pinecone, Chroma, TLDR AI, Epoch AI, Neel
Nanda, MITRE ATLAS and Transformer Circuits.

Keyed news APIs (NewsAPI, GNews, NewsData, World News, Mediastack, Currents) are
deliberately excluded. Their free tiers run 50–200 requests a day, which a
30-minute cron would exhaust before lunch, and they mostly re-syndicate outlets
already in the list. Google News RSS and GDELT are excluded for the same
duplication reason: both are aggregators of sources we already read directly.

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
