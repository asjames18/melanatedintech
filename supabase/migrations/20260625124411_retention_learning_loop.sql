alter table public.profiles
  add column if not exists fit_finder_result jsonb;

create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  audience text not null,
  difficulty text not null,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_path_items (
  id uuid primary key default gen_random_uuid(),
  path_id uuid not null references public.learning_paths(id) on delete cascade,
  item_type text not null check (item_type in ('article', 'agent', 'product', 'community_prompt')),
  item_slug text not null,
  title text,
  excerpt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (path_id, item_type, item_slug)
);

create table if not exists public.user_learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  path_id uuid not null references public.learning_paths(id) on delete cascade,
  current_item_id uuid references public.learning_path_items(id) on delete set null,
  completed_item_ids uuid[] not null default '{}',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, path_id)
);

create table if not exists public.builder_challenges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  prompt text not null,
  related_category text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_paths_published_sort_idx
  on public.learning_paths (published, sort_order, title);

create index if not exists learning_path_items_path_sort_idx
  on public.learning_path_items (path_id, sort_order);

create index if not exists user_learning_progress_user_updated_idx
  on public.user_learning_progress (user_id, updated_at desc);

create index if not exists builder_challenges_published_dates_idx
  on public.builder_challenges (published, starts_at desc, ends_at desc);

drop trigger if exists trg_learning_paths_updated_at on public.learning_paths;
create trigger trg_learning_paths_updated_at
before update on public.learning_paths
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_user_learning_progress_updated_at on public.user_learning_progress;
create trigger trg_user_learning_progress_updated_at
before update on public.user_learning_progress
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_builder_challenges_updated_at on public.builder_challenges;
create trigger trg_builder_challenges_updated_at
before update on public.builder_challenges
for each row execute function public.update_updated_at_column();

alter table public.learning_paths enable row level security;
alter table public.learning_path_items enable row level security;
alter table public.user_learning_progress enable row level security;
alter table public.builder_challenges enable row level security;

drop policy if exists "Published learning paths are readable" on public.learning_paths;
create policy "Published learning paths are readable"
on public.learning_paths for select
using (published = true);

drop policy if exists "Admins manage learning paths" on public.learning_paths;
create policy "Admins manage learning paths"
on public.learning_paths for all
using (public.has_role((select auth.uid()), 'admin'))
with check (public.has_role((select auth.uid()), 'admin'));

drop policy if exists "Published learning path items are readable" on public.learning_path_items;
create policy "Published learning path items are readable"
on public.learning_path_items for select
using (
  exists (
    select 1
    from public.learning_paths lp
    where lp.id = learning_path_items.path_id
      and lp.published = true
  )
);

drop policy if exists "Admins manage learning path items" on public.learning_path_items;
create policy "Admins manage learning path items"
on public.learning_path_items for all
using (public.has_role((select auth.uid()), 'admin'))
with check (public.has_role((select auth.uid()), 'admin'));

drop policy if exists "Users read their learning progress" on public.user_learning_progress;
create policy "Users read their learning progress"
on public.user_learning_progress for select
using ((select auth.uid()) = user_id);

drop policy if exists "Users create their learning progress" on public.user_learning_progress;
create policy "Users create their learning progress"
on public.user_learning_progress for insert
with check ((select auth.uid()) = user_id);

drop policy if exists "Users update their learning progress" on public.user_learning_progress;
create policy "Users update their learning progress"
on public.user_learning_progress for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete their learning progress" on public.user_learning_progress;
create policy "Users delete their learning progress"
on public.user_learning_progress for delete
using ((select auth.uid()) = user_id);

drop policy if exists "Published builder challenges are readable" on public.builder_challenges;
create policy "Published builder challenges are readable"
on public.builder_challenges for select
using (published = true);

drop policy if exists "Admins manage builder challenges" on public.builder_challenges;
create policy "Admins manage builder challenges"
on public.builder_challenges for all
using (public.has_role((select auth.uid()), 'admin'))
with check (public.has_role((select auth.uid()), 'admin'));

grant select on public.learning_paths to anon, authenticated;
grant select on public.learning_path_items to anon, authenticated;
grant select on public.builder_challenges to anon, authenticated;
grant select, insert, update, delete on public.user_learning_progress to authenticated;
grant execute on function public.has_role(uuid, public.app_role) to anon, authenticated;
grant all on public.learning_paths to service_role;
grant all on public.learning_path_items to service_role;
grant all on public.user_learning_progress to service_role;
grant all on public.builder_challenges to service_role;

insert into public.learning_paths (slug, title, excerpt, audience, difficulty, sort_order, published)
values
  ('start-your-first-agent', 'Start Your First Agent', 'Move from curiosity to a small, testable workflow with a clear agent brief and a realistic first win.', 'Founders, operators, creators', 'Beginner', 10, true),
  ('secure-your-agent', 'Secure Your Agent', 'Learn the practical safety moves that keep tool-using agents scoped, reviewable, and harder to misuse.', 'Builders shipping live workflows', 'Intermediate', 20, true),
  ('evaluate-your-agent', 'Evaluate Your Agent', 'Build the habit of measuring agent quality before you scale, sell, or hand it real responsibility.', 'Teams preparing for production', 'Intermediate', 30, true),
  ('build-for-ministry-nonprofit', 'Build For Ministry/Nonprofit', 'Use agents to support people-centered work without losing trust, context, or human care.', 'Ministry and nonprofit teams', 'Beginner', 40, true),
  ('launch-a-paid-agent-product', 'Launch A Paid Agent/Product', 'Package a useful workflow into a product or service offer people can understand, trust, and buy.', 'Creators and service providers', 'Advanced', 50, true)
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  audience = excluded.audience,
  difficulty = excluded.difficulty,
  sort_order = excluded.sort_order,
  published = excluded.published;

with rows(path_slug, item_type, item_slug, title, excerpt, sort_order) as (
  values
    ('start-your-first-agent', 'article', 'ai-agents-in-plain-english', null, null, 10),
    ('start-your-first-agent', 'article', 'your-first-30-minutes-with-an-agent', null, null, 20),
    ('start-your-first-agent', 'article', 'choosing-your-first-agent-workflow', null, null, 30),
    ('start-your-first-agent', 'agent', 'customer-research-agent', null, null, 40),
    ('start-your-first-agent', 'product', 'agent-launch-planner', null, null, 50),
    ('start-your-first-agent', 'community_prompt', 'first-agent-intro', 'Post your first workflow candidate', 'Share the repetitive task you want an agent to help with, what tools it can touch, and what a good result would look like.', 60),

    ('secure-your-agent', 'article', 'prompt-injection-in-everyday-language', null, null, 10),
    ('secure-your-agent', 'article', 'keeping-an-agent-safe-in-production', null, null, 20),
    ('secure-your-agent', 'article', 'mcp-security-checklist-non-security-teams', null, null, 30),
    ('secure-your-agent', 'article', 'human-in-the-loop-patterns-for-agents', null, null, 40),
    ('secure-your-agent', 'agent', 'compliance-ops-agent', null, null, 50),
    ('secure-your-agent', 'product', 'prompt-injection-drill-cards', null, null, 60),
    ('secure-your-agent', 'community_prompt', 'approval-gates', 'Ask for review on an approval gate', 'Describe one decision your agent should never make alone and ask the community how they would route human review.', 70),

    ('evaluate-your-agent', 'article', 'agent-evaluation-golden-set', null, null, 10),
    ('evaluate-your-agent', 'article', 'measuring-if-your-agent-actually-works', null, null, 20),
    ('evaluate-your-agent', 'article', 'what-to-measure-after-agent-launch', null, null, 30),
    ('evaluate-your-agent', 'article', 'ai-agent-cost-control-playbook', null, null, 40),
    ('evaluate-your-agent', 'agent', 'research-agent', null, null, 50),
    ('evaluate-your-agent', 'product', 'agent-eval-harness', null, null, 60),
    ('evaluate-your-agent', 'community_prompt', 'golden-set-review', 'Share three golden-set examples', 'Post three examples your agent should handle well and invite feedback on edge cases you may be missing.', 70),

    ('build-for-ministry-nonprofit', 'article', 'ai-in-ministry-a-gentle-start', null, null, 10),
    ('build-for-ministry-nonprofit', 'article', 'community-flywheel-for-ai-builders', null, null, 20),
    ('build-for-ministry-nonprofit', 'article', 'human-in-the-loop-patterns-for-agents', null, null, 30),
    ('build-for-ministry-nonprofit', 'agent', 'volunteer-coordinator-agent', null, null, 40),
    ('build-for-ministry-nonprofit', 'agent', 'community-manager-agent', null, null, 50),
    ('build-for-ministry-nonprofit', 'product', 'ministry-ai-starter-kit', null, null, 60),
    ('build-for-ministry-nonprofit', 'community_prompt', 'people-centered-agent', 'Name the person this workflow protects', 'Share who benefits from your workflow, where human care must stay visible, and where automation should stay in the background.', 70),

    ('launch-a-paid-agent-product', 'article', 'from-spreadsheet-to-agent-tool', null, null, 10),
    ('launch-a-paid-agent-product', 'article', 'ai-agent-cost-control-playbook', null, null, 20),
    ('launch-a-paid-agent-product', 'article', 'what-to-measure-after-agent-launch', null, null, 30),
    ('launch-a-paid-agent-product', 'agent', 'proposal-builder-agent', null, null, 40),
    ('launch-a-paid-agent-product', 'agent', 'podcast-producer-agent', null, null, 50),
    ('launch-a-paid-agent-product', 'product', 'proposal-builder-template', null, null, 60),
    ('launch-a-paid-agent-product', 'community_prompt', 'paid-offer-feedback', 'Ask for offer clarity feedback', 'Post the problem, buyer, promise, and proof for your paid agent/product idea, then ask what still feels unclear.', 70)
)
insert into public.learning_path_items (path_id, item_type, item_slug, title, excerpt, sort_order)
select lp.id, rows.item_type, rows.item_slug, rows.title, rows.excerpt, rows.sort_order
from rows
join public.learning_paths lp on lp.slug = rows.path_slug
on conflict (path_id, item_type, item_slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  sort_order = excluded.sort_order;

insert into public.builder_challenges (
  slug,
  title,
  excerpt,
  prompt,
  related_category,
  starts_at,
  ends_at,
  published
)
values
  (
    'first-agent-brief-sprint',
    'First Agent Brief Sprint',
    'Turn one repetitive workflow into a crisp agent brief the community can help sharpen.',
    'Pick one workflow you repeat every week. Write the user, goal, allowed tools, success criteria, and one thing the agent must ask a human to approve. Post the brief and ask: what is still too vague?',
    'Getting Started',
    '2026-06-22 00:00:00+00',
    '2026-06-29 00:00:00+00',
    true
  ),
  (
    'prompt-injection-drill',
    'Prompt Injection Drill',
    'Stress-test one agent workflow with a realistic misuse attempt before it reaches users.',
    'Write one prompt injection attempt against your agent, then describe the guardrail you would add. Post both and ask the community for a stronger test.',
    'Agent Security',
    '2026-06-29 00:00:00+00',
    '2026-07-06 00:00:00+00',
    true
  ),
  (
    'golden-set-week',
    'Golden Set Week',
    'Create five examples that prove whether your agent is getting better or just sounding confident.',
    'Bring five real examples: two easy, two messy, and one edge case. Define the ideal answer for each and post the scoring rubric you would use.',
    'Evaluation',
    '2026-07-06 00:00:00+00',
    '2026-07-13 00:00:00+00',
    true
  ),
  (
    'community-flywheel-sprint',
    'Community Flywheel Sprint',
    'Convert one repeated community question into an article, agent idea, or downloadable product.',
    'Find a question your audience asks more than once. Draft a small resource that answers it, then post the question and your proposed resource format.',
    'Community',
    '2026-07-13 00:00:00+00',
    '2026-07-20 00:00:00+00',
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  prompt = excluded.prompt,
  related_category = excluded.related_category,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  published = excluded.published;
