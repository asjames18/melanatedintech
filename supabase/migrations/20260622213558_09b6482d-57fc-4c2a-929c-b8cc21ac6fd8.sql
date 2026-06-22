
-- 1. agent_submissions.published_agent_id
ALTER TABLE public.agent_submissions
  ADD COLUMN IF NOT EXISTS published_agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL;

-- 2. waitlist_signups.product_slug
ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS product_slug text;

CREATE INDEX IF NOT EXISTS waitlist_signups_product_slug_idx
  ON public.waitlist_signups(product_slug);

-- 3. authors table
CREATE TABLE IF NOT EXISTS public.authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  bio text,
  avatar_url text,
  links jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.authors TO anon, authenticated;
GRANT ALL ON public.authors TO service_role;

ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors are publicly readable"
  ON public.authors FOR SELECT
  USING (true);

CREATE POLICY "Admins manage authors"
  ON public.authors FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER authors_set_updated_at
  BEFORE UPDATE ON public.authors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. articles.author_id
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES public.authors(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS articles_author_id_idx ON public.articles(author_id);

-- 5. user_interests
CREATE TABLE IF NOT EXISTS public.user_interests (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  categories text[] NOT NULL DEFAULT ARRAY[]::text[],
  content_types text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_interests TO authenticated;
GRANT ALL ON public.user_interests TO service_role;

ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own interests"
  ON public.user_interests FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER user_interests_set_updated_at
  BEFORE UPDATE ON public.user_interests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
