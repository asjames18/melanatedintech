-- ============================================================================
-- Social feed rebuild — evolves the flat discussion forum into a Twitter/X-style
-- social feed. Sectioned by phase so it's safe to apply in order.
-- All tables keep RLS on and follow the existing owner/authenticated/admin pattern.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PHASE 1 — Core feed: relax posts, nest replies, add media + counts
-- ----------------------------------------------------------------------------

-- discussion_posts: title becomes optional (short-form posts have no title),
-- body grows to 1000 chars, add media attachments + reply/reaction counters.
-- Existing rows keep their titles; only the constraint is dropped.
ALTER TABLE public.discussion_posts
  ALTER COLUMN title DROP NOT NULL;

-- Drop the 3-140 length CHECK so titles are optional (allow NULL or any length 0-140).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conrelid = 'public.discussion_posts'::regclass
       AND contype = 'c'
       AND pg_get_constraintdef(oid) LIKE '%length(title)%'
  ) THEN
    -- Constraint name is auto-generated; drop by finding it.
    ALTER TABLE public.discussion_posts
      DROP CONSTRAINT IF EXISTS discussion_posts_title_check,
      DROP CONSTRAINT IF EXISTS discussion_posts_title_length;
  END IF;
END$$;

-- Belt-and-suspenders: drop any CHECK on title length by pattern.
DO $$
DECLARE
  c text;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
     WHERE conrelid = 'public.discussion_posts'::regclass
       AND contype = 'c'
       AND pg_get_constraintdef(oid) ILIKE '%title%'
       AND pg_get_constraintdef(oid) ILIKE '%length%'
  LOOP
    EXECUTE format('ALTER TABLE public.discussion_posts DROP CONSTRAINT %I', c);
  END LOOP;
END$$;

-- Relax body max to 1000 chars (was 4000). Keep min 1.
DO $$
DECLARE
  c text;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
     WHERE conrelid = 'public.discussion_posts'::regclass
       AND contype = 'c'
       AND pg_get_constraintdef(oid) ILIKE '%body%'
       AND pg_get_constraintdef(oid) ILIKE '%length%'
  LOOP
    EXECUTE format('ALTER TABLE public.discussion_posts DROP CONSTRAINT %I', c);
  END LOOP;
END$$;

ALTER TABLE public.discussion_posts
  ADD CONSTRAINT discussion_posts_body_length
  CHECK (length(body) BETWEEN 1 AND 1000);

ALTER TABLE public.discussion_posts
  ADD COLUMN IF NOT EXISTS media_urls TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reply_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reaction_count JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS discussion_posts_created_idx
  ON public.discussion_posts (created_at DESC);

-- discussion_comments: rename intent to "replies", add nesting via parent_reply_id
-- and a materialized path for efficient tree fetch. Keep the table name so existing
-- rows/relationships survive.
ALTER TABLE public.discussion_comments
  ADD COLUMN IF NOT EXISTS parent_reply_id UUID
    REFERENCES public.discussion_comments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS path TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS depth INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reaction_count JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS discussion_comments_post_idx
  ON public.discussion_comments (post_id, created_at);
CREATE INDEX IF NOT EXISTS discussion_comments_parent_idx
  ON public.discussion_comments (parent_reply_id);
CREATE INDEX IF NOT EXISTS discussion_comments_path_idx
  ON public.discussion_comments (path);

-- Backfill reply_count from existing comment_count so old threads show counts.
UPDATE public.discussion_posts
   SET reply_count = comment_count
 WHERE reply_count = 0;

-- ----------------------------------------------------------------------------
-- Trigger: maintain reply_count + last_activity_at on the parent post.
-- Replaces the old bump_discussion_post_activity (kept for compatibility).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bump_discussion_post_activity()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  pid UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    pid := NEW.post_id;
    UPDATE public.discussion_posts
       SET reply_count = reply_count + 1,
           comment_count = comment_count + 1,
           last_activity_at = NEW.created_at
     WHERE id = pid;
  ELSIF TG_OP = 'DELETE' THEN
    pid := OLD.post_id;
    UPDATE public.discussion_posts
       SET reply_count = GREATEST(reply_count - 1, 0),
           comment_count = GREATEST(comment_count - 1, 0)
     WHERE id = pid;
  END IF;
  RETURN NULL;
END;
$$;

-- Drop & recreate the existing trigger (same name) to pick up the new body.
DROP TRIGGER IF EXISTS discussion_comments_bump_post ON public.discussion_comments;
CREATE TRIGGER discussion_comments_bump_post
  AFTER INSERT OR DELETE ON public.discussion_comments
  FOR EACH ROW EXECUTE FUNCTION public.bump_discussion_post_activity();

-- ----------------------------------------------------------------------------
-- Trigger: compute materialized path + depth on reply insert.
-- path = parent.path || '.' || new.id  (root replies: just the id).
-- Depth = parent.depth + 1 (root: 0).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_reply_path()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.parent_reply_id IS NULL THEN
    NEW.depth := 0;
    NEW.path  := NEW.id::text;
  ELSE
    SELECT p.path, p.depth INTO NEW.path, NEW.depth
      FROM public.discussion_comments p
     WHERE p.id = NEW.parent_reply_id;
    IF NEW.path IS NULL THEN
      -- parent vanished mid-tx; treat as root to avoid orphan rows.
      NEW.depth := 0;
      NEW.path  := NEW.id::text;
    ELSE
      NEW.depth := COALESCE(NEW.depth, 0) + 1;
      NEW.path  := NEW.path || '.' || NEW.id::text;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS discussion_comments_set_path ON public.discussion_comments;
CREATE TRIGGER discussion_comments_set_path
  BEFORE INSERT ON public.discussion_comments
  FOR EACH ROW EXECUTE FUNCTION public.set_reply_path();

-- ----------------------------------------------------------------------------
-- Storage bucket for post media (private, like avatars — signed URLs).
-- Created via SQL so the migration is self-contained; safe to re-run.
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-media', 'post-media', false)
ON CONFLICT (id) DO NOTHING;

-- RLS on the bucket: owner can CRUD their own files (path-prefixed by user id).
-- Authenticated can read any post media (so feed viewers see images).
CREATE POLICY "Anyone can read post media"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'post-media');

CREATE POLICY "Authenticated can upload post media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-media');

CREATE POLICY "Owners update/delete their post media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'post-media' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'post-media' AND owner = auth.uid());

CREATE POLICY "Owners delete their post media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'post-media' AND owner = auth.uid());

GRANT ALL ON storage.objects TO service_role;

-- ----------------------------------------------------------------------------
-- PHASE 2 — Reactions (post + reply)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.post_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('like','love','celebrate','insight','funny')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_id, kind)
);

GRANT SELECT ON public.post_reactions TO anon;
GRANT SELECT, INSERT, DELETE ON public.post_reactions TO authenticated;
GRANT ALL ON public.post_reactions TO service_role;

ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read post reactions"
  ON public.post_reactions FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users create their own reactions"
  ON public.post_reactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete their own reactions"
  ON public.post_reactions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS post_reactions_post_idx ON public.post_reactions (post_id, kind);
CREATE INDEX IF NOT EXISTS post_reactions_user_idx ON public.post_reactions (user_id);

-- Mirror table for reply reactions.
CREATE TABLE IF NOT EXISTS public.reply_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reply_id UUID NOT NULL REFERENCES public.discussion_comments(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('like','love','celebrate','insight','funny')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, reply_id, kind)
);

GRANT SELECT ON public.reply_reactions TO anon;
GRANT SELECT, INSERT, DELETE ON public.reply_reactions TO authenticated;
GRANT ALL ON public.reply_reactions TO service_role;

ALTER TABLE public.reply_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reply reactions"
  ON public.reply_reactions FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users create their own reply reactions"
  ON public.reply_reactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete their own reply reactions"
  ON public.reply_reactions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS reply_reactions_reply_idx ON public.reply_reactions (reply_id, kind);
CREATE INDEX IF NOT EXISTS reply_reactions_user_idx ON public.reply_reactions (user_id);

-- Trigger: maintain discussion_posts.reaction_count as a JSONB tally per kind.
CREATE OR REPLACE FUNCTION public.sync_post_reaction_count()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  pid UUID;
BEGIN
  pid := COALESCE(NEW.post_id, OLD.post_id);
  IF pid IS NULL THEN RETURN NULL; END IF;
  UPDATE public.discussion_posts p
     SET reaction_count = (
       SELECT COALESCE(jsonb_object_agg(kind, cnt), '{}'::jsonb)
         FROM (
           SELECT kind, COUNT(*)::int AS cnt
             FROM public.post_reactions
            WHERE post_id = pid
            GROUP BY kind
         ) c
     )
   WHERE p.id = pid;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS post_reactions_sync_count ON public.post_reactions;
CREATE TRIGGER post_reactions_sync_count
  AFTER INSERT OR DELETE ON public.post_reactions
  FOR EACH ROW EXECUTE FUNCTION public.sync_post_reaction_count();

-- Trigger: maintain discussion_comments.reaction_count as a JSONB tally per kind.
CREATE OR REPLACE FUNCTION public.sync_reply_reaction_count()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  rid UUID;
BEGIN
  rid := COALESCE(NEW.reply_id, OLD.reply_id);
  IF rid IS NULL THEN RETURN NULL; END IF;
  UPDATE public.discussion_comments c
     SET reaction_count = (
       SELECT COALESCE(jsonb_object_agg(kind, cnt), '{}'::jsonb)
         FROM (
           SELECT kind, COUNT(*)::int AS cnt
             FROM public.reply_reactions
            WHERE reply_id = rid
            GROUP BY kind
         ) c
     )
   WHERE c.id = rid;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS reply_reactions_sync_count ON public.reply_reactions;
CREATE TRIGGER reply_reactions_sync_count
  AFTER INSERT OR DELETE ON public.reply_reactions
  FOR EACH ROW EXECUTE FUNCTION public.sync_reply_reaction_count();

-- ----------------------------------------------------------------------------
-- PHASE 3 — Social graph + discovery
-- ----------------------------------------------------------------------------

-- user_follows
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, followee_id),
  CHECK (follower_id <> followee_id)
);

GRANT SELECT ON public.user_follows TO anon;
GRANT SELECT, INSERT, DELETE ON public.user_follows TO authenticated;
GRANT ALL ON public.user_follows TO service_role;

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read follows"
  ON public.user_follows FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users manage their own follows"
  ON public.user_follows FOR ALL TO authenticated
  USING (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

CREATE INDEX IF NOT EXISTS user_follows_follower_idx ON public.user_follows (follower_id);
CREATE INDEX IF NOT EXISTS user_follows_followee_idx ON public.user_follows (followee_id);

-- Counters on profiles (added idempotently).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS followers_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.sync_follow_counts()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET following_count = following_count + 1
     WHERE id = NEW.follower_id;
    UPDATE public.profiles SET followers_count = followers_count + 1
     WHERE id = NEW.followee_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET following_count = GREATEST(following_count - 1, 0)
     WHERE id = OLD.follower_id;
    UPDATE public.profiles SET followers_count = GREATEST(followers_count - 1, 0)
     WHERE id = OLD.followee_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS user_follows_sync_counts ON public.user_follows;
CREATE TRIGGER user_follows_sync_counts
  AFTER INSERT OR DELETE ON public.user_follows
  FOR EACH ROW EXECUTE FUNCTION public.sync_follow_counts();

-- Hashtags + post_hashtags
CREATE TABLE IF NOT EXISTS public.hashtags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tag TEXT NOT NULL UNIQUE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.post_hashtags (
  post_id UUID NOT NULL REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, hashtag_id)
);

GRANT SELECT ON public.hashtags TO anon, authenticated;
GRANT SELECT ON public.post_hashtags TO anon, authenticated;
GRANT ALL ON public.hashtags TO service_role;
GRANT ALL ON public.post_hashtags TO service_role;

ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read hashtags"
  ON public.hashtags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can read post hashtags"
  ON public.post_hashtags FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS hashtags_usage_idx ON public.hashtags (usage_count DESC);
CREATE INDEX IF NOT EXISTS post_hashtags_tag_idx ON public.post_hashtags (hashtag_id);

-- Trigger: parse #tags from a post body on insert, upsert hashtags + join rows.
-- Runs as SECURITY DEFINER so it can write to hashtags/post_hashtags regardless of caller.
CREATE OR REPLACE FUNCTION public.index_post_hashtags()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  tag_text TEXT;
  tag_id UUID;
BEGIN
  -- Clear prior join rows (in case of edit).
  DELETE FROM public.post_hashtags WHERE post_id = NEW.id;

  FOR tag_text IN
    SELECT DISTINCT lower(m[2])
      FROM regexp_matches(NEW.body, '(^|[^A-Za-z0-9_])#([A-Za-z0-9_]{1,40})', 'g') AS m
  LOOP
    IF tag_text IS NULL OR tag_text = '' THEN CONTINUE; END IF;
    INSERT INTO public.hashtags (tag) VALUES (tag_text)
      ON CONFLICT (tag) DO UPDATE SET usage_count = hashtags.usage_count + 1
      RETURNING id INTO tag_id;
    INSERT INTO public.post_hashtags (post_id, hashtag_id) VALUES (NEW.id, tag_id)
      ON CONFLICT DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS discussion_posts_index_tags ON public.discussion_posts;
CREATE TRIGGER discussion_posts_index_tags
  AFTER INSERT OR UPDATE OF body ON public.discussion_posts
  FOR EACH ROW EXECUTE FUNCTION public.index_post_hashtags();

-- On post delete, decrement usage_count for each tag it used.
CREATE OR REPLACE FUNCTION public.decrement_post_hashtags()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.hashtags h
     SET usage_count = GREATEST(usage_count - 1, 0)
   WHERE h.id IN (SELECT hashtag_id FROM public.post_hashtags WHERE post_id = OLD.id);
  DELETE FROM public.post_hashtags WHERE post_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS discussion_posts_decrement_tags ON public.discussion_posts;
CREATE TRIGGER discussion_posts_decrement_tags
  AFTER DELETE ON public.discussion_posts
  FOR EACH ROW EXECUTE FUNCTION public.decrement_post_hashtags();

-- ----------------------------------------------------------------------------
-- PHASE 4 — Realtime
-- Enable the default realtime publication on the feed tables so the browser
-- client can subscribe to postgres_changes. Safe to re-run.
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
     WHERE pubname = 'supabase_realtime'
       AND schemaname = 'public'
       AND tablename = 'discussion_posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_posts;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
     WHERE pubname = 'supabase_realtime'
       AND schemaname = 'public'
       AND tablename = 'discussion_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_comments;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
     WHERE pubname = 'supabase_realtime'
       AND schemaname = 'public'
       AND tablename = 'post_reactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.post_reactions;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Realtime publication may not exist in some setups; ignore so migration still applies.
  RAISE NOTICE 'Realtime publication update skipped: %', SQLERRM;
END$$;
