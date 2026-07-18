-- Keep the complete decision-framework article as the only indexable page for
-- choosing a first AI-agent workflow. The old row remains available for history;
-- the application permanently redirects its URL to the canonical article.

update public.articles
set
  published = true,
  status = 'published'::public.publish_status,
  scheduled_at = null,
  updated_at = now()
where slug = 'choose-your-first-agent-workflow';

update public.articles
set
  published = false,
  status = 'draft'::public.publish_status,
  scheduled_at = null,
  updated_at = now()
where slug = 'choosing-your-first-agent-workflow';
