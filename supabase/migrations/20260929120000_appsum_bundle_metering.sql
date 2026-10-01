-- AppSumo bundle SKU: weekly usage metering + redeem codes (approved 2026-09-29).
--
-- Bundle terms: 200 agent conversations/week (Monday reset, America/New_York).
-- Over the allowance, bundle users ride the free tier until reset — never a hard wall.
-- The allowance applies ONLY to bundle redeemers (identified via redeem_codes);
-- direct one-time buyers keep the terms they purchased under.

-- 1. Per-request conversation log. One API call = one conversation unit.
-- The weekly allowance counts paid-model calls only (free-tier fallback calls
-- never consume the allowance).
create table if not exists public.agent_usage_log (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_slug text not null,
  model text not null,
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz not null default now()
);
create index if not exists agent_usage_log_user_created_idx
  on public.agent_usage_log (user_id, created_at desc);
alter table public.agent_usage_log enable row level security;
grant all on public.agent_usage_log to service_role;

-- 2. Single-use redeem codes. One code grants all five bundle agents as
-- kind='agent' entitlements; redeem_codes.redeemed_by marks bundle owners
-- for the weekly allowance (no change to the entitlements CHECK constraint).
create table if not exists public.redeem_codes (
  code text primary key,
  bundle_slug text not null default 'appsumo-bundle-5-agents',
  redeemed_by uuid references auth.users(id) on delete set null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.redeem_codes enable row level security;
grant all on public.redeem_codes to service_role;
