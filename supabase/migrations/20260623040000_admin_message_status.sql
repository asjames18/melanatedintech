-- Let admins mark contact messages as handled (so the inbox can show what's
-- been dealt with). Defaults false so existing rows surface as open.
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS handled BOOLEAN NOT NULL DEFAULT false;
