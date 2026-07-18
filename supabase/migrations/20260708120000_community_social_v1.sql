-- Community Social Platform V1
-- Add persisted engagement, notifications, profile polish, and AI-agent categories.

do $$
declare
  c text;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.discussion_posts'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%category%'
  loop
    execute format('alter table public.discussion_posts drop constraint %I', c);
  end loop;
end$$;

alter table public.discussion_posts
  add constraint discussion_posts_category_check
  check (category in ('general','questions','show-and-tell','agent-showcase','resources','hiring','feedback'));

alter table public.profiles
  add column if not exists cover_url text,
  add column if not exists pinned_post_id uuid references public.discussion_posts(id) on delete set null,
  add column if not exists builder_focus_tags text[] not null default '{}';

create table if not exists public.post_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.discussion_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create table if not exists public.post_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  post_id uuid not null references public.discussion_posts(id) on delete cascade,
  channel text not null default 'copy',
  created_at timestamptz not null default now()
);

create table if not exists public.post_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.discussion_posts(id) on delete cascade,
  reason text not null default 'other',
  note text,
  status text not null default 'open' check (status in ('open','reviewed','dismissed','actioned')),
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('reply','reaction','follow','mention','moderation')),
  post_id uuid references public.discussion_posts(id) on delete cascade,
  reply_id uuid references public.discussion_comments(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.profile_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  created_at timestamptz not null default now(),
  unique (user_id, label)
);

create table if not exists public.profile_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists post_bookmarks_user_idx on public.post_bookmarks (user_id, created_at desc);
create index if not exists post_bookmarks_post_idx on public.post_bookmarks (post_id);
create index if not exists post_shares_post_idx on public.post_shares (post_id);
create index if not exists post_reports_status_idx on public.post_reports (status, created_at desc);
create index if not exists notifications_user_idx on public.notifications (user_id, read_at, created_at desc);
create index if not exists profile_badges_user_idx on public.profile_badges (user_id);
create index if not exists profile_links_user_idx on public.profile_links (user_id, sort_order);

alter table public.post_bookmarks enable row level security;
alter table public.post_shares enable row level security;
alter table public.post_reports enable row level security;
alter table public.notifications enable row level security;
alter table public.profile_badges enable row level security;
alter table public.profile_links enable row level security;

grant select, insert, delete on public.post_bookmarks to authenticated;
grant select, insert on public.post_shares to authenticated;
grant select, insert on public.post_reports to authenticated;
grant select, update, delete on public.notifications to authenticated;
grant select on public.profile_badges to anon, authenticated;
grant select on public.profile_links to anon, authenticated;
grant insert, update, delete on public.profile_links to authenticated;
grant all on public.post_bookmarks, public.post_shares, public.post_reports, public.notifications, public.profile_badges, public.profile_links to service_role;

drop policy if exists "Users manage their bookmarks" on public.post_bookmarks;
create policy "Users manage their bookmarks"
  on public.post_bookmarks for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users create shares" on public.post_shares;
create policy "Users create shares"
  on public.post_shares for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users read their own shares" on public.post_shares;
create policy "Users read their own shares"
  on public.post_shares for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users create reports" on public.post_reports;
create policy "Users create reports"
  on public.post_reports for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users read their own reports" on public.post_reports;
create policy "Users read their own reports"
  on public.post_reports for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users manage their notifications" on public.notifications;
create policy "Users manage their notifications"
  on public.notifications for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Badges are readable" on public.profile_badges;
create policy "Badges are readable"
  on public.profile_badges for select to anon, authenticated
  using (true);

drop policy if exists "Profile links are readable" on public.profile_links;
create policy "Profile links are readable"
  on public.profile_links for select to anon, authenticated
  using (true);

drop policy if exists "Users manage their profile links" on public.profile_links;
create policy "Users manage their profile links"
  on public.profile_links for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
