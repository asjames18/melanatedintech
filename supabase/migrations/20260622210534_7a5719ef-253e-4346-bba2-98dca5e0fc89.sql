
-- ---------- saved_articles ----------
CREATE TABLE public.saved_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, article_id)
);

GRANT SELECT, INSERT, DELETE ON public.saved_articles TO authenticated;
GRANT ALL ON public.saved_articles TO service_role;

ALTER TABLE public.saved_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own saved articles"
  ON public.saved_articles FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX saved_articles_user_idx ON public.saved_articles (user_id, created_at DESC);

-- ---------- discussion_posts ----------
CREATE TABLE public.discussion_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 3 AND 140),
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  category TEXT NOT NULL DEFAULT 'general',
  comment_count INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.discussion_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discussion_posts TO authenticated;
GRANT ALL ON public.discussion_posts TO service_role;

ALTER TABLE public.discussion_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read discussion posts"
  ON public.discussion_posts FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Signed-in users create their own posts"
  ON public.discussion_posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Author or admin updates a post"
  ON public.discussion_posts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Author or admin deletes a post"
  ON public.discussion_posts FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX discussion_posts_activity_idx ON public.discussion_posts (last_activity_at DESC);
CREATE INDEX discussion_posts_category_idx ON public.discussion_posts (category);

CREATE TRIGGER discussion_posts_updated_at
  BEFORE UPDATE ON public.discussion_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- discussion_comments ----------
CREATE TABLE public.discussion_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.discussion_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discussion_comments TO authenticated;
GRANT ALL ON public.discussion_comments TO service_role;

ALTER TABLE public.discussion_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read discussion comments"
  ON public.discussion_comments FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Signed-in users create their own comments"
  ON public.discussion_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Author or admin updates a comment"
  ON public.discussion_comments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Author or admin deletes a comment"
  ON public.discussion_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX discussion_comments_post_idx ON public.discussion_comments (post_id, created_at);

CREATE TRIGGER discussion_comments_updated_at
  BEFORE UPDATE ON public.discussion_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Keep post counters / activity in sync.
CREATE OR REPLACE FUNCTION public.bump_discussion_post_activity()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.discussion_posts
       SET comment_count = comment_count + 1,
           last_activity_at = NEW.created_at
     WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.discussion_posts
       SET comment_count = GREATEST(comment_count - 1, 0)
     WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER discussion_comments_bump_post
  AFTER INSERT OR DELETE ON public.discussion_comments
  FOR EACH ROW EXECUTE FUNCTION public.bump_discussion_post_activity();
