-- Qualified lead pipeline for revenue recovery systems.
CREATE TABLE IF NOT EXISTS public.service_system_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_name TEXT NOT NULL,
  website TEXT,
  industry TEXT NOT NULL,
  service_model TEXT NOT NULL CHECK (service_model IN ('revenue-recovery','estimate-recovery','route-retention','client-recovery')),
  team_size TEXT NOT NULL CHECK (team_size IN ('2-5','6-10','11-20','outside-range')),
  locations INTEGER NOT NULL DEFAULT 1 CHECK (locations BETWEEN 1 AND 100),
  current_tools TEXT,
  monthly_volume TEXT NOT NULL CHECK (monthly_volume IN ('under-50','50-149','150-499','500-plus','unsure')),
  primary_leak TEXT NOT NULL,
  desired_outcome TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('within-30-days','1-3-months','researching')),
  budget_range TEXT NOT NULL CHECK (budget_range IN ('1500-2499','2500-4999','5000-plus','not-sure')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewing','qualified','demo_sent','proposal_sent','deposit_pending','won','lost')),
  assigned_owner TEXT,
  admin_notes TEXT,
  invoice_number TEXT REFERENCES public.client_invoices(invoice_number) ON UPDATE CASCADE ON DELETE SET NULL,
  consent_at TIMESTAMPTZ NOT NULL,
  source TEXT,
  campaign TEXT,
  landing_path TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS service_system_leads_status_created_idx ON public.service_system_leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS service_system_leads_email_idx ON public.service_system_leads(lower(email));
CREATE INDEX IF NOT EXISTS service_system_leads_ip_created_idx ON public.service_system_leads(ip_hash, created_at DESC);
ALTER TABLE public.service_system_leads ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.service_system_leads TO service_role;
GRANT SELECT, UPDATE ON public.service_system_leads TO authenticated;
DROP POLICY IF EXISTS "Admins manage service system leads" ON public.service_system_leads;
CREATE POLICY "Admins manage service system leads" ON public.service_system_leads FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE TABLE IF NOT EXISTS public.service_system_lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.service_system_leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS service_system_lead_events_lead_idx ON public.service_system_lead_events(lead_id, created_at DESC);
ALTER TABLE public.service_system_lead_events ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.service_system_lead_events TO service_role;
GRANT SELECT ON public.service_system_lead_events TO authenticated;
DROP POLICY IF EXISTS "Admins read service system lead events" ON public.service_system_lead_events;
CREATE POLICY "Admins read service system lead events" ON public.service_system_lead_events FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
