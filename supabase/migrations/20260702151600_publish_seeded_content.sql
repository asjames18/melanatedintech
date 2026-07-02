-- Publish all seeded articles, agents, and products to make them live on the platform
UPDATE public.articles SET status = 'published'::public.publish_status WHERE status = 'draft'::public.publish_status;
UPDATE public.agents   SET status = 'published'::public.publish_status WHERE status = 'draft'::public.publish_status;
UPDATE public.products SET status = 'published' WHERE status = 'draft';
