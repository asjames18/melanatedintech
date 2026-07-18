-- Recorded remotely as migration version 20260715182733.
-- Align the displayed reading time with the rewritten 1,663-word article.

update public.articles
set
  read_minutes = 9,
  updated_at = now()
where slug = 'ai-agent-cost-control-playbook';
