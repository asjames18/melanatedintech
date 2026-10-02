-- Per-user agent memory for paid bundle redeemers.
--
-- NOT YET APPLIED — requires owner approval before running (the preview
-- worker shares this database with production; there is no separate preview
-- DB). The application code treats missing tables as "feature not provisioned"
-- and no-ops cleanly, so this migration can land independently of the deploy.
--
-- Design: agents distill durable facts about the user (name, business, goals,
-- preferences, decisions) into short notes. Notes default to scope 'shared'
-- (visible to all five of the user's agents) or are scoped to one agent slug
-- when the user asks to keep something between them and that agent.
-- agent_memory_state holds the per-user on/off toggle (default ON for paid
-- users) plus the last-distillation marker that throttles the background
-- distillation job.

create table if not exists public.agent_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null default 'shared',
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agent_memories_user_scope_idx
  on public.agent_memories (user_id, scope, updated_at desc);

drop trigger if exists agent_memories_updated_at on public.agent_memories;
create trigger agent_memories_updated_at
  before update on public.agent_memories
  for each row execute function public.update_updated_at_column();

create table if not exists public.agent_memory_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  memory_enabled boolean not null default true,
  last_distilled_at timestamptz,
  updated_at timestamptz not null default now()
);

drop trigger if exists agent_memory_state_updated_at on public.agent_memory_state;
create trigger agent_memory_state_updated_at
  before update on public.agent_memory_state
  for each row execute function public.update_updated_at_column();

alter table public.agent_memories enable row level security;
alter table public.agent_memory_state enable row level security;

-- Every row belongs to its owner; all operations restricted to auth.uid().
drop policy if exists "own memories select" on public.agent_memories;
create policy "own memories select"
  on public.agent_memories for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "own memories insert" on public.agent_memories;
create policy "own memories insert"
  on public.agent_memories for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "own memories update" on public.agent_memories;
create policy "own memories update"
  on public.agent_memories for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own memories delete" on public.agent_memories;
create policy "own memories delete"
  on public.agent_memories for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "own memory state select" on public.agent_memory_state;
create policy "own memory state select"
  on public.agent_memory_state for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "own memory state insert" on public.agent_memory_state;
create policy "own memory state insert"
  on public.agent_memory_state for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "own memory state update" on public.agent_memory_state;
create policy "own memory state update"
  on public.agent_memory_state for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own memory state delete" on public.agent_memory_state;
create policy "own memory state delete"
  on public.agent_memory_state for delete
  to authenticated
  using (auth.uid() = user_id);
