-- Recorded remotely as migration version 20260715182759.
-- Keep the legacy boolean and the newer publication status consistent for the
-- three canonical article consolidations.

update public.articles
set
  published = true,
  status = 'published'::public.publish_status,
  scheduled_at = null,
  updated_at = now()
where slug in (
  'ai-agent-cost-control-playbook',
  'evaluating-agents-evals',
  'ai-in-ministry-a-gentle-start'
);

update public.articles
set
  published = false,
  status = 'draft'::public.publish_status,
  scheduled_at = null,
  updated_at = now()
where slug in (
  'controlling-agent-costs',
  'measuring-if-your-agent-actually-works',
  'ai-agents-for-ministry'
);
