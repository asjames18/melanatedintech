-- Recorded remotely as migration version 20260715182753.
-- Align the displayed reading time with the rewritten 1,817-word pillar.

update public.articles
set
  read_minutes = 10,
  updated_at = now()
where slug = 'ai-in-ministry-a-gentle-start';
