-- Paid Diagnostic Funnel
-- Run this in Supabase SQL Editor or via: supabase db push
-- This table has no public policies. Server-side routes use the service-role client.

create table if not exists public.diagnostic_leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  contact_name text not null check (char_length(contact_name) between 2 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (phone is null or char_length(phone) <= 40),
  business_name text not null check (char_length(business_name) between 2 and 160),
  website text check (website is null or char_length(website) <= 2_048),
  industry text not null check (industry in ('HVAC', 'Plumbing', 'Electrical', 'Other')),
  current_platform text check (current_platform is null or char_length(current_platform) <= 160),
  monthly_volume text not null check (monthly_volume in ('Under 50', '50–149', '150–499', '500+', 'Not sure')),
  primary_leak text not null check (char_length(primary_leak) between 10 and 1_500),
  desired_outcome text check (desired_outcome is null or char_length(desired_outcome) <= 1_500),
  consent_at timestamptz not null,
  source text check (source is null or char_length(source) <= 120),
  utm_source text check (utm_source is null or char_length(utm_source) <= 120),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 120),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 120),
  stripe_session_id text unique,
  payment_status text not null default 'initiated'
    check (payment_status in ('initiated', 'paid', 'failed', 'refunded')),
  confirmation_sent_at timestamptz,
  booking_clicked_at timestamptz,
  scheduled_at timestamptz,
  completed_at timestamptz,
  sales_disposition text not null default 'new'
    check (sales_disposition in ('new', 'scheduled', 'completed', 'pilot_proposed', 'pilot_won', 'not_a_fit', 'closed_lost')),
  internal_notes text check (internal_notes is null or char_length(internal_notes) <= 5_000)
);

create index if not exists idx_diagnostic_leads_email_created
  on public.diagnostic_leads (email, created_at desc);

create index if not exists idx_diagnostic_leads_payment_status_created
  on public.diagnostic_leads (payment_status, created_at desc);

create index if not exists idx_diagnostic_leads_disposition_created
  on public.diagnostic_leads (sales_disposition, created_at desc);

alter table public.diagnostic_leads enable row level security;

-- No policies are intentionally created. Public clients cannot read or write
-- diagnostic lead data; the trusted server and Stripe webhook use the service role.
