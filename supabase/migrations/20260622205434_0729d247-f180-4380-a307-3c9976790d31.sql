
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  props JSONB NOT NULL DEFAULT '{}'::jsonb,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.analytics_events TO authenticated;
GRANT INSERT ON public.analytics_events TO anon;
GRANT ALL ON public.analytics_events TO service_role;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read analytics events"
  ON public.analytics_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX analytics_events_occurred_at_idx ON public.analytics_events (occurred_at DESC);
CREATE INDEX analytics_events_name_idx ON public.analytics_events (name);
CREATE INDEX analytics_events_props_gin_idx ON public.analytics_events USING gin (props);
