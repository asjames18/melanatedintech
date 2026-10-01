-- Saved agent chat history for entitled (paid) users.
-- Free and anonymous chats are never persisted: the client only writes here
-- when the signed-in user owns the agent, and RLS restricts every row to its
-- owner regardless of what the client sends.

create table if not exists public.agent_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_slug text not null,
  title text not null default '',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agent_conversations_user_agent_idx
  on public.agent_conversations (user_id, agent_slug, updated_at desc);

drop trigger if exists agent_conversations_updated_at on public.agent_conversations;
create trigger agent_conversations_updated_at
  before update on public.agent_conversations
  for each row execute function public.update_updated_at_column();

alter table public.agent_conversations enable row level security;

drop policy if exists "Users read their own conversations" on public.agent_conversations;
drop policy if exists "own conversations select" on public.agent_conversations;
create policy "own conversations select"
  on public.agent_conversations for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users create their own conversations" on public.agent_conversations;
drop policy if exists "own conversations insert" on public.agent_conversations;
create policy "own conversations insert"
  on public.agent_conversations for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update their own conversations" on public.agent_conversations;
drop policy if exists "own conversations update" on public.agent_conversations;
create policy "own conversations update"
  on public.agent_conversations for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete their own conversations" on public.agent_conversations;
drop policy if exists "own conversations delete" on public.agent_conversations;
create policy "own conversations delete"
  on public.agent_conversations for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.agent_conversations to authenticated;
grant all on public.agent_conversations to service_role;
