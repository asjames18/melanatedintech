-- Article audio players (approved 2026-10-02): every published article can carry
-- a narrated MP3. The article template renders a "Listen to this article" player
-- only when audio_url is set; existing rows are untouched (NULL = no player).

alter table public.articles
  add column if not exists audio_url text;

-- Public bucket for article narration MP3s.
insert into storage.buckets (id, name, public)
values ('blog-audio', 'blog-audio', true)
on conflict (id) do update set public = true;

-- Anyone can stream the audio (the player is public).
drop policy if exists "blog-audio public read" on storage.objects;
create policy "blog-audio public read"
  on storage.objects for select
  using (bucket_id = 'blog-audio');

-- The daily-blog pipeline uploads via its API key. service_role bypasses RLS;
-- this covers the anon-key case, scoped to this bucket only.
drop policy if exists "blog-audio pipeline upload" on storage.objects;
create policy "blog-audio pipeline upload"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'blog-audio');
