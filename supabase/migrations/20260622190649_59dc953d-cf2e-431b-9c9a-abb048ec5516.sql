
-- Publication status enum used by agents, articles, services
CREATE TYPE public.publish_status AS ENUM ('draft', 'scheduled', 'published');

ALTER TABLE public.agents
  ADD COLUMN status public.publish_status NOT NULL DEFAULT 'draft',
  ADD COLUMN scheduled_at timestamptz;
ALTER TABLE public.articles
  ADD COLUMN status public.publish_status NOT NULL DEFAULT 'draft',
  ADD COLUMN scheduled_at timestamptz;
ALTER TABLE public.services
  ADD COLUMN status public.publish_status NOT NULL DEFAULT 'draft',
  ADD COLUMN scheduled_at timestamptz;

-- Backfill from existing booleans
UPDATE public.agents   SET status = CASE WHEN active    THEN 'published'::public.publish_status ELSE 'draft'::public.publish_status END;
UPDATE public.articles SET status = CASE WHEN published THEN 'published'::public.publish_status ELSE 'draft'::public.publish_status END;
UPDATE public.services SET status = CASE WHEN active    THEN 'published'::public.publish_status ELSE 'draft'::public.publish_status END;

-- Validation: scheduled rows must have a future scheduled_at on insert/update.
CREATE OR REPLACE FUNCTION public.validate_publish_schedule()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'scheduled' AND NEW.scheduled_at IS NULL THEN
    RAISE EXCEPTION 'scheduled_at is required when status is scheduled';
  END IF;
  IF NEW.status <> 'scheduled' THEN
    NEW.scheduled_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_agents_schedule   BEFORE INSERT OR UPDATE ON public.agents   FOR EACH ROW EXECUTE FUNCTION public.validate_publish_schedule();
CREATE TRIGGER validate_articles_schedule BEFORE INSERT OR UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.validate_publish_schedule();
CREATE TRIGGER validate_services_schedule BEFORE INSERT OR UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.validate_publish_schedule();

-- Update public RLS policies to surface a row when published, or scheduled in the past.
DROP POLICY IF EXISTS "Public can read active agents" ON public.agents;
DROP POLICY IF EXISTS "Public can read agents" ON public.agents;
CREATE POLICY "Public can read live agents" ON public.agents
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR (status = 'scheduled' AND scheduled_at <= now()));

DROP POLICY IF EXISTS "Public can read published articles" ON public.articles;
DROP POLICY IF EXISTS "Public can read articles" ON public.articles;
CREATE POLICY "Public can read live articles" ON public.articles
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR (status = 'scheduled' AND scheduled_at <= now()));

DROP POLICY IF EXISTS "Public can read active services" ON public.services;
DROP POLICY IF EXISTS "Public can read services" ON public.services;
CREATE POLICY "Public can read live services" ON public.services
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR (status = 'scheduled' AND scheduled_at <= now()));
