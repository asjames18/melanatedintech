-- Seller marketplace: add seller_id to catalog tables and create seller_profiles
-- so creators can list and manage their own agents, products, articles, and services.

-- 1. seller_profiles: public-facing seller info and Stripe Connect account
create table if not exists public.seller_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  slug text not null unique,
  bio text,
  avatar_url text,
  website_url text,
  stripe_account_id text,
  stripe_account_status text not null default 'pending'
    check (stripe_account_status in ('pending', 'connected', 'disabled')),
  payout_enabled boolean not null default false,
  commission_rate numeric(5,2) not null default 10.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists seller_profiles_user_id_idx on public.seller_profiles (user_id);
create index if not exists seller_profiles_slug_idx on public.seller_profiles (slug);

drop trigger if exists seller_profiles_updated_at on public.seller_profiles;
create trigger seller_profiles_updated_at
  before update on public.seller_profiles
  for each row execute function public.update_updated_at_column();

alter table public.seller_profiles enable row level security;

drop policy if exists "Seller profiles are readable by authenticated" on public.seller_profiles;
create policy "Seller profiles are readable by authenticated"
  on public.seller_profiles for select
  to authenticated using (true);

drop policy if exists "Users manage their own seller profile" on public.seller_profiles;
create policy "Users manage their own seller profile"
  on public.seller_profiles for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select on public.seller_profiles to anon, authenticated;
grant all on public.seller_profiles to service_role;

-- 2. Add seller_id to agents
alter table public.agents
  add column if not exists seller_id uuid references public.seller_profiles(id) on delete set null;

create index if not exists agents_seller_id_idx on public.agents (seller_id);

-- Allow sellers to manage their own agents (in addition to admins)
drop policy if exists "Sellers manage their own agents" on public.agents;
create policy "Sellers manage their own agents"
  on public.agents for all
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or auth.uid() in (
      select sp.user_id from public.seller_profiles sp where sp.id = agents.seller_id
    )
  )
  with check (
    public.has_role(auth.uid(), 'admin')
    or auth.uid() in (
      select sp.user_id from public.seller_profiles sp where sp.id = agents.seller_id
    )
  );

-- 3. Add seller_id to products
alter table public.products
  add column if not exists seller_id uuid references public.seller_profiles(id) on delete set null;

create index if not exists products_seller_id_idx on public.products (seller_id);

drop policy if exists "Sellers manage their own products" on public.products;
create policy "Sellers manage their own products"
  on public.products for all
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or auth.uid() in (
      select sp.user_id from public.seller_profiles sp where sp.id = products.seller_id
    )
  )
  with check (
    public.has_role(auth.uid(), 'admin')
    or auth.uid() in (
      select sp.user_id from public.seller_profiles sp where sp.id = products.seller_id
    )
  );

-- 4. Add seller_id to articles
alter table public.articles
  add column if not exists seller_id uuid references public.seller_profiles(id) on delete set null;

create index if not exists articles_seller_id_idx on public.articles (seller_id);

drop policy if exists "Sellers manage their own articles" on public.articles;
create policy "Sellers manage their own articles"
  on public.articles for all
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or auth.uid() in (
      select sp.user_id from public.seller_profiles sp where sp.id = articles.seller_id
    )
  )
  with check (
    public.has_role(auth.uid(), 'admin')
    or auth.uid() in (
      select sp.user_id from public.seller_profiles sp where sp.id = articles.seller_id
    )
  );

-- 5. Add seller_id to services
alter table public.services
  add column if not exists seller_id uuid references public.seller_profiles(id) on delete set null;

create index if not exists services_seller_id_idx on public.services (seller_id);

drop policy if exists "Sellers manage their own services" on public.services;
create policy "Sellers manage their own services"
  on public.services for all
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or auth.uid() in (
      select sp.user_id from public.seller_profiles sp where sp.id = services.seller_id
    )
  )
  with check (
    public.has_role(auth.uid(), 'admin')
    or auth.uid() in (
      select sp.user_id from public.seller_profiles sp where sp.id = services.seller_id
    )
  );

-- 6. Track which seller a purchase revenue belongs to (for payouts)
alter table public.user_entitlements
  add column if not exists seller_id uuid references public.seller_profiles(id) on delete set null,
  add column if not exists commission_cents integer,
  add column if not exists seller_paid boolean not null default false;

create index if not exists user_entitlements_seller_id_idx on public.user_entitlements (seller_id);
