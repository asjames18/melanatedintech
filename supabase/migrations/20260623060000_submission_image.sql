-- Let submitters attach a screenshot/logo URL to an agent submission so admins
-- can see what it looks like, and so it carries through to the published agent.
ALTER TABLE public.agent_submissions
  ADD COLUMN IF NOT EXISTS image_url TEXT;
