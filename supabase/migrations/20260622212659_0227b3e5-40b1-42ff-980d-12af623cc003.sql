CREATE TABLE public.user_entitlements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('agent','product')),
  slug TEXT NOT NULL,
  price_id TEXT,
  stripe_session_id TEXT,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, slug, environment)
);

CREATE UNIQUE INDEX user_entitlements_session_uniq
  ON public.user_entitlements(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX user_entitlements_user_idx ON public.user_entitlements(user_id);

GRANT SELECT ON public.user_entitlements TO authenticated;
GRANT ALL ON public.user_entitlements TO service_role;

ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own entitlements"
  ON public.user_entitlements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages entitlements"
  ON public.user_entitlements FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);