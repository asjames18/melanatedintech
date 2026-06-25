-- ============================================================================
-- Admin community moderation — adds hashtag suppression + guards the parse
-- trigger so suppressed tags aren't indexed on new posts.
-- Idempotent; safe to re-run.
-- ============================================================================

ALTER TABLE public.hashtags
  ADD COLUMN IF NOT EXISTS suppressed BOOLEAN NOT NULL DEFAULT false;

-- Skip suppressed tags when indexing hashtags from a post body.
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

    -- Skip suppressed tags: they stay in the hashtags table (with suppressed=true)
    -- but won't get a post_hashtags join row, so they never surface in feeds/trending.
    CONTINUE WHEN EXISTS (
      SELECT 1 FROM public.hashtags
       WHERE tag = tag_text AND suppressed = true
    );

    INSERT INTO public.hashtags (tag) VALUES (tag_text)
      ON CONFLICT (tag) DO UPDATE SET usage_count = hashtags.usage_count + 1
      RETURNING id INTO tag_id;
    INSERT INTO public.post_hashtags (post_id, hashtag_id) VALUES (NEW.id, tag_id)
      ON CONFLICT DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$;
