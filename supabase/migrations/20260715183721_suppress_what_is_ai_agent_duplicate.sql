-- Keep the refreshed pillar as the only indexable "what is an AI agent" article.
-- The old slug is retained as an unpublished editorial row; the application route
-- provides the permanent redirect after deployment.

update public.articles
set
  published = true,
  status = 'published'::public.publish_status,
  scheduled_at = null,
  updated_at = now()
where slug = 'ai-agents-in-plain-english';

update public.articles
set
  published = false,
  status = 'draft'::public.publish_status,
  scheduled_at = null,
  updated_at = now()
where slug = 'what-is-an-ai-agent';
