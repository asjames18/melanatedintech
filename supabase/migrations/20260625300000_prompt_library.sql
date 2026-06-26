-- Prompt library: let users create, edit, and manage their own prompts.
-- Prompts can be used standalone or injected into agent contexts.

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  category text not null default 'General',
  tags text[] not null default '{}',
  is_public boolean not null default false,
  usage_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prompts_user_id_idx on public.prompts (user_id);
create index if not exists prompts_category_idx on public.prompts (category);
create index if not exists prompts_public_created_idx on public.prompts (is_public, created_at desc);

drop trigger if exists prompts_updated_at on public.prompts;
create trigger prompts_updated_at
  before update on public.prompts
  for each row execute function public.update_updated_at_column();

alter table public.prompts enable row level security;

-- Users can read their own prompts and all public prompts.
drop policy if exists "Users read own and public prompts" on public.prompts;
create policy "Users read own and public prompts"
  on public.prompts for select
  to authenticated
  using (auth.uid() = user_id or is_public = true);

-- Users can manage their own prompts.
drop policy if exists "Users manage their own prompts" on public.prompts;
create policy "Users manage their own prompts"
  on public.prompts for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.prompts to authenticated;
grant all on public.prompts to service_role;

-- Seed a few community prompts so the library isn't empty on first load.
insert into public.prompts (title, content, category, tags, is_public, usage_count)
values
  (
    'Agent Brief Template',
    'Define the agent in one paragraph: who it serves, what goal it pursues, what tools it can use, and what it must refuse to do. Then list three success criteria.',
    'Templates',
    ARRAY['agent', 'brief', 'starter'],
    true,
    12
  ),
  (
    'Prompt Injection Drill',
    'Write one plausible prompt injection attempt against your agent workflow. Then write the guardrail that would catch it. Share both for peer review.',
    'Security',
    ARRAY['security', 'injection', 'drill'],
    true,
    8
  ),
  (
    'Golden Set Evaluator',
    'List five inputs that should produce a correct answer from your agent. For each one, write the expected output in one sentence. Use this set to catch regressions after changes.',
    'Evaluation',
    ARRAY['eval', 'quality', 'testing'],
    true,
    5
  )
on conflict do nothing;
