-- Sprint 1 Marketplace Migration
-- Run this in Supabase SQL Editor or via: supabase db push

-- Products table
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  long_description text,
  price integer not null, -- in cents (e.g., 1900 = $19.00)
  category text not null check (category in ('prompt-pack', 'template', 'blueprint', 'guide', 'course')),
  file_url text,           -- Supabase Storage signed URL or path
  preview_url text,        -- Preview image
  tags text[] default '{}',
  status text not null default 'draft' check (status in ('draft', 'live', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete set null,
  customer_email text not null,
  stripe_session_id text unique,
  amount_paid integer not null, -- in cents
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  download_count integer default 0,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_orders_stripe_session on public.orders(stripe_session_id);
create index if not exists idx_orders_customer_email on public.orders(customer_email);

-- RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Anyone can read live products
create policy "Public can view live products"
  on public.products for select
  using (status = 'live');

-- No public order reads — admin uses service role which bypasses RLS
create policy "No public order reads"
  on public.orders for select
  using (false);

-- Seed initial products (update file_url after uploading to Supabase Storage)
insert into public.products (name, slug, description, price, category, status)
values
  (
    'Content Creation Prompt Pack',
    'content-creation-prompt-pack',
    '50 battle-tested Claude prompts for content creators. Blog posts, social captions, email newsletters, thread hooks — all written for real-world results.',
    1900,
    'prompt-pack',
    'live'
  ),
  (
    'Brand Kit Template',
    'brand-kit-template',
    'Complete brand identity template. Colors, fonts, voice guide, social media templates — everything you need to launch your brand with confidence.',
    1500,
    'template',
    'live'
  )
on conflict (slug) do nothing;
