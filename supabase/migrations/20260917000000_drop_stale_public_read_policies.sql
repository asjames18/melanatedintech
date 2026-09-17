-- Drop stale boolean-flag public-read policies left over from the publish_status
-- migration (20260622190649).
--
-- That migration introduced status-based visibility ("Public can read live
-- agents/articles/services", governed solely by `status`) but its DROP POLICY
-- statements targeted policy names that never existed ("Public can read active
-- agents", etc.), so the legacy policies below are still live. They grant
-- public reads on the old `active`/`published` boolean columns and must go:
-- visibility is governed solely by `status` now.
--
-- products is intentionally left alone: it was never migrated to the
-- publish_status enum, so "Active products are public" is still its live
-- public-read policy.

DROP POLICY IF EXISTS "Active agents are public" ON public.agents;
DROP POLICY IF EXISTS "Published articles are public" ON public.articles;
DROP POLICY IF EXISTS "Active services are public" ON public.services;
