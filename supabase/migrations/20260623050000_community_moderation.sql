-- Lightweight community moderation: admins can lock a thread (no new replies).
-- Defaults false so existing threads stay open.
ALTER TABLE public.discussion_posts
  ADD COLUMN IF NOT EXISTS locked BOOLEAN NOT NULL DEFAULT false;
