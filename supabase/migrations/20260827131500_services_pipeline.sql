-- Extend the existing protected contact inbox into a general services pipeline.
-- This stores no new public data and does not change RLS policies; public submissions
-- continue through the validated server function and admins access records server-side.

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS inquiry_type text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS lead_status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS assigned_owner text,
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS follow_up_at timestamptz,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.contact_messages
  DROP CONSTRAINT IF EXISTS contact_messages_inquiry_type_check,
  ADD CONSTRAINT contact_messages_inquiry_type_check CHECK (
    inquiry_type = ANY (ARRAY[
      'general',
      'ai_training',
      'workflow_diagnostic',
      'website_launch_sprint',
      'custom_ai_system',
      'custom_website_application',
      'presentation_support'
    ])
  ),
  DROP CONSTRAINT IF EXISTS contact_messages_lead_status_check,
  ADD CONSTRAINT contact_messages_lead_status_check CHECK (
    lead_status = ANY (ARRAY[
      'new',
      'reviewing',
      'qualified',
      'proposal_sent',
      'in_progress',
      'won',
      'lost'
    ])
  );

CREATE INDEX IF NOT EXISTS idx_contact_messages_pipeline
  ON public.contact_messages (lead_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_inquiry_type
  ON public.contact_messages (inquiry_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_follow_up
  ON public.contact_messages (follow_up_at)
  WHERE follow_up_at IS NOT NULL AND lead_status NOT IN ('won', 'lost');

-- Preserve existing inbox behavior while allowing public service inquiries to enter the pipeline.
UPDATE public.contact_messages
SET inquiry_type = 'general'
WHERE inquiry_type IS NULL;
