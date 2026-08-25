-- Close the direct-to-PostgREST path into analytics_events.
--
-- recordEvents() enforces a 66-name event allowlist, a PII-shaped-key refusal, a
-- 4 KB payload cap and a 20/min per-IP limit — but it inserted with the
-- publishable key, and the RLS policy behind it only checked that `name` was
-- 1..80 characters. Since that key ships in the browser bundle, every one of
-- those guards was optional: anyone could POST arbitrary rows straight to the
-- REST endpoint. analytics_events is already the largest table in the database.
--
-- recordEvents now writes with the service role, so revoking these grants makes
-- the server function the only way in. The admin read path is unaffected: it uses
-- the service role too, and the "Admins can read analytics events" SELECT policy
-- stays in place.

revoke insert on public.analytics_events from anon, authenticated;

-- The policy only ever gated inserts that are no longer possible. Dropping it so
-- the remaining policy set reflects how the table is actually written.
drop policy if exists "Insert analytics events (own user only)" on public.analytics_events;
