-- Admin Product CRUD: add missing columns so admins and sellers can fully
-- manage products (status, scheduling, AI runtime, featured flag).

alter table public.products
  add column if not exists status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'published')),
  add column if not exists scheduled_at timestamptz,
  add column if not exists featured boolean not null default false,
  add column if not exists model text not null default 'gpt-4o-mini',
  add column if not exists system_prompt text,
  add column if not exists max_tokens integer not null default 1000,
  add column if not exists temperature numeric(3,2) not null default 0.7;

create index if not exists products_status_idx on public.products (status);
create index if not exists products_featured_idx on public.products (featured);
