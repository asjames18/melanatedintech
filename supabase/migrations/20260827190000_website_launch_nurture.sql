-- Website Launch Sprint nurture state.
-- Stores no subscriber email: waitlist_signups remains the protected source record.

CREATE TABLE IF NOT EXISTS public.website_launch_nurture_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  sequence_key TEXT NOT NULL DEFAULT 'website_launch_sprint_v1',
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.website_launch_nurture_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.website_launch_nurture_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waitlist_signup_id UUID NOT NULL REFERENCES public.waitlist_signups(id) ON DELETE CASCADE,
  sequence_key TEXT NOT NULL DEFAULT 'website_launch_sprint_v1',
  status TEXT NOT NULL DEFAULT 'pending_confirmation'
    CHECK (status IN ('pending_confirmation', 'active', 'paused', 'completed', 'unsubscribed', 'suppressed')),
  current_step SMALLINT NOT NULL DEFAULT 0 CHECK (current_step BETWEEN 0 AND 4),
  next_send_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  last_error TEXT,
  lease_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (waitlist_signup_id, sequence_key)
);

CREATE INDEX IF NOT EXISTS website_launch_nurture_due_idx
  ON public.website_launch_nurture_enrollments (next_send_at, status)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS website_launch_nurture_signup_idx
  ON public.website_launch_nurture_enrollments (waitlist_signup_id);

CREATE TABLE IF NOT EXISTS public.website_launch_confirmation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waitlist_signup_id UUID NOT NULL REFERENCES public.waitlist_signups(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ,
  UNIQUE (waitlist_signup_id)
);

CREATE INDEX IF NOT EXISTS website_launch_confirmation_token_idx
  ON public.website_launch_confirmation_tokens (token);

CREATE INDEX IF NOT EXISTS website_launch_confirmation_expiry_idx
  ON public.website_launch_confirmation_tokens (expires_at)
  WHERE confirmed_at IS NULL;

GRANT ALL ON public.website_launch_nurture_settings TO service_role;
GRANT ALL ON public.website_launch_nurture_enrollments TO service_role;
GRANT ALL ON public.website_launch_confirmation_tokens TO service_role;

REVOKE ALL ON public.website_launch_nurture_settings FROM anon, authenticated;
REVOKE ALL ON public.website_launch_nurture_enrollments FROM anon, authenticated;
REVOKE ALL ON public.website_launch_confirmation_tokens FROM anon, authenticated;

ALTER TABLE public.website_launch_nurture_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_launch_nurture_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_launch_confirmation_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can manage nurture settings"
    ON public.website_launch_nurture_settings FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage nurture enrollments"
    ON public.website_launch_nurture_enrollments FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage confirmation tokens"
    ON public.website_launch_confirmation_tokens FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
