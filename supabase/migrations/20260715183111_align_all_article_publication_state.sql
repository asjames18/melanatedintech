-- Keep the legacy published boolean aligned with the canonical publish_status.
-- Public article queries use both fields in different parts of the application.

update public.articles
set
  published = true,
  published_at = coalesce(published_at, now()),
  updated_at = now()
where status = 'published'::public.publish_status
  and published is distinct from true;

update public.articles
set
  published = false,
  updated_at = now()
where status <> 'published'::public.publish_status
  and published is distinct from false;
