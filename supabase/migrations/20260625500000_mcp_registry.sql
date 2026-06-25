-- MCP Server Registry: lets users browse, add, and connect to MCP servers
-- from any provider (Anthropic, OpenAI, custom). Admins moderate.

create table if not exists public.mcp_servers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  url text not null,
  provider text not null default 'custom' check (provider in ('anthropic', 'openai', 'custom')),
  category text not null default 'general',
  tags text[] not null default '{}',
  is_public boolean not null default false,
  is_approved boolean not null default false,
  submitted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: anyone can read public+approved servers. Only admins can approve.
-- Users can manage their own submissions.
alter table public.mcp_servers enable row level security;

create policy "mcp_read_public" on public.mcp_servers
  for select using (is_public and is_approved);

create policy "mcp_admin_all" on public.mcp_servers
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "mcp_insert_authenticated" on public.mcp_servers
  for insert with check (auth.uid() is not null);

create policy "mcp_update_owner" on public.mcp_servers
  for update using (submitted_by = auth.uid());

create policy "mcp_delete_owner" on public.mcp_servers
  for delete using (submitted_by = auth.uid());

-- Index for common filters.
create index if not exists mcp_servers_provider_idx on public.mcp_servers (provider);
create index if not exists mcp_servers_category_idx on public.mcp_servers (category);
create index if not exists mcp_servers_approved_idx on public.mcp_servers (is_approved, is_public);
