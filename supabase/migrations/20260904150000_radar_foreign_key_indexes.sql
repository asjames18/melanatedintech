-- Cover the two radar foreign keys that had no index.
--
-- Both were introduced with the radar tables and both were flagged by the
-- Supabase performance advisor (`unindexed_foreign_keys`). They are the only
-- two such findings in the whole database — the project already did this pass
-- once in 20260825170000_foreign_key_indexes.sql, and these arrived after it.
--
-- Without a covering index Postgres scans the referencing table on every
-- delete or update of the referenced auth.users row, and the admin review
-- queries filter on exactly these columns.

-- radar_items.reviewed_by -> auth.users(id)
-- Read by the admin queue when showing who actioned an item.
create index if not exists radar_items_reviewed_by_idx
  on public.radar_items (reviewed_by)
  where reviewed_by is not null;

-- radar_item_events.actor_id -> auth.users(id)
-- Read when assembling the audit trail for a moderator.
create index if not exists radar_item_events_actor_id_idx
  on public.radar_item_events (actor_id)
  where actor_id is not null;

-- Both are partial: the columns are null for every ingested row and only set
-- when a human acts, so a full index would be almost entirely dead entries.
