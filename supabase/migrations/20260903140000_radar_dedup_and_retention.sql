-- Duplicate suppression and a 30-day retention window for the AI Radar.
--
-- The source list now runs to eighty-odd feeds, and they overlap heavily: one
-- model launch is covered by the vendor's own blog, four outlets, a newsletter
-- and Hacker News inside an hour. Deduping on URL alone catches almost none of
-- that, because every one of those is a different URL for the same story.
--
-- `title_fingerprint` is an order-insensitive hash of a headline's significant
-- tokens (see titleFingerprint in src/lib/radar.ts). The ingest checks it
-- against the last ten days before inserting, and falls back to token-overlap
-- comparison for restatements the exact hash misses.

alter table public.radar_items
  add column if not exists title_fingerprint text;

comment on column public.radar_items.title_fingerprint is
  'Order-insensitive hash of the headline''s significant tokens. Used to suppress the same story arriving from a second publisher under a different URL.';

-- Supports the ingest''s "have we already got this story?" lookup, which is
-- always bounded by published_at.
create index if not exists radar_items_fingerprint_idx
  on public.radar_items (title_fingerprint, published_at desc);

-- Retention is enforced by the ingest, which deletes anything published more
-- than 30 days ago on every run. This index keeps that delete cheap.
create index if not exists radar_items_published_idx
  on public.radar_items (published_at);

-- Backfill is unnecessary: rows without a fingerprint simply do not suppress
-- anything, and all of them age out within 30 days.

alter table public.radar_ingest_runs
  add column if not exists items_duplicate integer not null default 0;

comment on column public.radar_ingest_runs.items_duplicate is
  'Incoming items dropped because the store already held the same story from another publisher.';

comment on table public.radar_items is
  'Aggregated third-party AI/agent updates for /radar. Populated by the scheduled ingest; items publish by default, held items stay hidden until an admin approves them, and every row is deleted 30 days after its publication date.';
