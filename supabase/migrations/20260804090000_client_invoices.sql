-- Migration: client_invoices table for custom project invoicing (50% deposit & 50% final balance)
-- Updated with original_total_cents, discount_cents, add_ons, and selected_add_ons fields

CREATE TABLE IF NOT EXISTS public.client_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_organization TEXT,
  service_type TEXT NOT NULL, -- 'Web Design', 'AI Agent Development', 'Marketing & SEO', 'Automation & Workflow', 'Custom Strategy'
  title TEXT NOT NULL,
  description TEXT,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { description: string, amount_cents: number }
  original_total_cents INTEGER,
  discount_cents INTEGER,
  add_ons JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { name: string, standard_price: string, community_price: string, description?: string }
  selected_add_ons JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of selected add-on names or objects selected by client
  total_cents INTEGER NOT NULL CHECK (total_cents > 0),
  deposit_cents INTEGER NOT NULL CHECK (deposit_cents > 0),
  final_cents INTEGER NOT NULL CHECK (final_cents > 0),
  status TEXT NOT NULL DEFAULT 'deposit_pending' CHECK (status IN ('draft', 'deposit_pending', 'deposit_paid', 'fully_paid', 'cancelled')),
  stripe_deposit_session_id TEXT,
  stripe_final_session_id TEXT,
  deposit_paid_at TIMESTAMPTZ,
  final_paid_at TIMESTAMPTZ,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Idempotent column additions for existing tables
ALTER TABLE public.client_invoices ADD COLUMN IF NOT EXISTS original_total_cents INTEGER;
ALTER TABLE public.client_invoices ADD COLUMN IF NOT EXISTS discount_cents INTEGER;
ALTER TABLE public.client_invoices ADD COLUMN IF NOT EXISTS add_ons JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.client_invoices ADD COLUMN IF NOT EXISTS selected_add_ons JSONB DEFAULT '[]'::jsonb;

-- Index for quick lookups by invoice_number and status
CREATE INDEX IF NOT EXISTS client_invoices_number_idx ON public.client_invoices (invoice_number);
CREATE INDEX IF NOT EXISTS client_invoices_status_idx ON public.client_invoices (status);
CREATE INDEX IF NOT EXISTS client_invoices_created_at_idx ON public.client_invoices (created_at DESC);

-- Enable RLS
ALTER TABLE public.client_invoices ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT ON public.client_invoices TO anon, authenticated;
GRANT ALL ON public.client_invoices TO service_role;

-- Policies
DROP POLICY IF EXISTS "Public read non-draft invoices" ON public.client_invoices;
CREATE POLICY "Public read non-draft invoices"
  ON public.client_invoices FOR SELECT
  TO anon, authenticated
  USING (status != 'draft');

DROP POLICY IF EXISTS "Admins full access invoices" ON public.client_invoices;
CREATE POLICY "Admins full access invoices"
  ON public.client_invoices FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );
