-- Workflow Opportunity Scorecard purchase + report storage.
-- Service-role writes only. No pack entitlement coupling.

CREATE TABLE IF NOT EXISTS public.scorecard_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text NOT NULL UNIQUE,
  buyer_email text,
  amount_total_cents integer,
  currency text DEFAULT 'usd',
  environment text NOT NULL CHECK (environment IN ('sandbox', 'live')),
  payment_status text NOT NULL DEFAULT 'paid',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS scorecard_orders_email_idx
  ON public.scorecard_orders (buyer_email);

CREATE TABLE IF NOT EXISTS public.scorecard_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text NOT NULL UNIQUE,
  environment text NOT NULL CHECK (environment IN ('sandbox', 'live')),
  buyer_email text NOT NULL,
  buyer_name text NOT NULL,
  company_name text,
  answers jsonb NOT NULL,
  opportunity_score integer NOT NULL,
  opportunity_band text NOT NULL,
  sprint_fit text NOT NULL,
  next_step text NOT NULL,
  pdf_base64 text,
  email_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS scorecard_reports_email_idx
  ON public.scorecard_reports (buyer_email);

ALTER TABLE public.scorecard_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorecard_reports ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated: only service role (bypasses RLS) reads/writes.
