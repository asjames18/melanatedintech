-- Profile privacy: restrict profile reads to the owner.
-- Author display (name/avatar) for community posts is served via the service-role
-- client in community.functions.ts, which bypasses RLS, so this does not affect
-- public-facing author info. Account pages only ever read the caller's own row.
DROP POLICY IF EXISTS "Profiles are readable by authenticated" ON public.profiles;
CREATE POLICY "Users read their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- Per-IP abuse protection for the unauthenticated public forms.
-- We store a SHA-256 hash of the client IP (never the raw IP) so the server
-- function can throttle bursts from a single source within a time window.
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS ip_hash TEXT;
ALTER TABLE public.waitlist_signups ADD COLUMN IF NOT EXISTS ip_hash TEXT;

CREATE INDEX IF NOT EXISTS contact_messages_ip_hash_created_at_idx
  ON public.contact_messages (ip_hash, created_at);
CREATE INDEX IF NOT EXISTS waitlist_signups_ip_hash_created_at_idx
  ON public.waitlist_signups (ip_hash, created_at);
