-- Migration: 20260908180000_ai_tool_library.sql
-- Production schema for Melanated In Tech (MIT) AI Tool Library & Lead Funnel

-- 1. AI Tools Directory Table
CREATE TABLE IF NOT EXISTS public.ai_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  affiliate_url TEXT,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  primary_category TEXT NOT NULL,
  secondary_categories TEXT[] NOT NULL DEFAULT '{}',
  use_cases TEXT[] NOT NULL DEFAULT '{}',
  target_users TEXT[] NOT NULL DEFAULT '{}',
  industries TEXT[] NOT NULL DEFAULT '{}',
  pricing_model TEXT NOT NULL,
  starting_price TEXT,
  free_plan BOOLEAN NOT NULL DEFAULT false,
  free_trial BOOLEAN NOT NULL DEFAULT false,
  open_source BOOLEAN NOT NULL DEFAULT false,
  self_hosted BOOLEAN NOT NULL DEFAULT false,
  api_available BOOLEAN NOT NULL DEFAULT false,
  integrations TEXT[] NOT NULL DEFAULT '{}',
  supported_platforms TEXT[] NOT NULL DEFAULT '{}',
  key_features TEXT[] NOT NULL DEFAULT '{}',
  strengths TEXT[] NOT NULL DEFAULT '{}',
  weaknesses TEXT[] NOT NULL DEFAULT '{}',
  best_for TEXT NOT NULL,
  not_best_for TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,
  implementation_complexity TEXT NOT NULL,
  mit_recommendation_score INTEGER NOT NULL CHECK (mit_recommendation_score BETWEEN 1 AND 100),
  mit_editorial_notes TEXT NOT NULL,
  security_notes TEXT,
  privacy_notes TEXT,
  hipaa_support BOOLEAN NOT NULL DEFAULT false,
  soc2_status TEXT NOT NULL DEFAULT 'None',
  gdpr_support BOOLEAN NOT NULL DEFAULT false,
  sso_support BOOLEAN NOT NULL DEFAULT false,
  api_documentation_url TEXT,
  github_url TEXT,
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  tool_status TEXT NOT NULL DEFAULT 'published' CHECK (tool_status IN ('published', 'draft', 'archived')),
  featured BOOLEAN NOT NULL DEFAULT false,
  trending BOOLEAN NOT NULL DEFAULT false,
  sponsored BOOLEAN NOT NULL DEFAULT false,
  affiliate_partner BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_tools_slug_idx ON public.ai_tools(slug);
CREATE INDEX IF NOT EXISTS ai_tools_status_category_idx ON public.ai_tools(tool_status, primary_category);
CREATE INDEX IF NOT EXISTS ai_tools_featured_score_idx ON public.ai_tools(featured DESC, mit_recommendation_score DESC);

ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.ai_tools TO service_role;
GRANT SELECT ON public.ai_tools TO anon, authenticated;

DROP POLICY IF EXISTS "Public can view published ai tools" ON public.ai_tools;
CREATE POLICY "Public can view published ai tools" ON public.ai_tools
  FOR SELECT TO anon, authenticated
  USING (tool_status = 'published');

DROP POLICY IF EXISTS "Admins manage all ai tools" ON public.ai_tools;
CREATE POLICY "Admins manage all ai tools" ON public.ai_tools
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- 2. AI Stack Leads & Consulting Inquiries
CREATE TABLE IF NOT EXISTS public.ai_stack_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  organization_type TEXT NOT NULL,
  company_size TEXT NOT NULL,
  industry TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  current_systems TEXT,
  monthly_software_budget TEXT,
  implementation_budget TEXT NOT NULL,
  timeline TEXT NOT NULL,
  technical_skill_level TEXT,
  architecture_preference TEXT,
  compliance_requirements TEXT[] NOT NULL DEFAULT '{}',
  recommended_stack JSONB NOT NULL DEFAULT '{}'::jsonb,
  qualification_tier TEXT NOT NULL CHECK (qualification_tier IN ('low_priority', 'qualified', 'high_priority', 'enterprise_opportunity')),
  qualification_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost')),
  admin_notes TEXT,
  consent_at TIMESTAMPTZ NOT NULL,
  source TEXT,
  campaign TEXT,
  landing_path TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_stack_leads_status_created_idx ON public.ai_stack_leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS ai_stack_leads_tier_idx ON public.ai_stack_leads(qualification_tier, created_at DESC);
CREATE INDEX IF NOT EXISTS ai_stack_leads_email_idx ON public.ai_stack_leads(lower(email));
CREATE INDEX IF NOT EXISTS ai_stack_leads_ip_created_idx ON public.ai_stack_leads(ip_hash, created_at DESC);

ALTER TABLE public.ai_stack_leads ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.ai_stack_leads TO service_role;
GRANT SELECT, UPDATE ON public.ai_stack_leads TO authenticated;

DROP POLICY IF EXISTS "Admins manage ai stack leads" ON public.ai_stack_leads;
CREATE POLICY "Admins manage ai stack leads" ON public.ai_stack_leads
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- 3. Anonymous Tool Click Attribution (for privacy-respecting link tracking)
CREATE TABLE IF NOT EXISTS public.ai_tool_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_slug TEXT NOT NULL,
  click_type TEXT NOT NULL CHECK (click_type IN ('website', 'affiliate', 'docs', 'github')),
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_tool_clicks_slug_idx ON public.ai_tool_clicks(tool_slug, created_at DESC);
ALTER TABLE public.ai_tool_clicks ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.ai_tool_clicks TO service_role;
