-- Website Launch Checklist marketing-consent foundation.
-- Additive and backward-compatible: existing waitlist entries remain non-marketing
-- contacts unless a visitor explicitly opts in through a consented path.

ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS marketing_consent_source TEXT,
  ADD COLUMN IF NOT EXISTS marketing_consent_version TEXT;

-- A true marketing-consent flag must have a compact, auditable consent record.
-- The public insert path remains server-mediated; this migration adds no policy
-- and grants no new public read or write access.
DO $$
BEGIN
  ALTER TABLE public.waitlist_signups
    ADD CONSTRAINT waitlist_marketing_consent_evidence_check
    CHECK (
      marketing_consent = FALSE
      OR (
        marketing_consent_at IS NOT NULL
        AND char_length(marketing_consent_source) BETWEEN 1 AND 80
        AND char_length(marketing_consent_version) BETWEEN 1 AND 40
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS waitlist_signups_marketing_consent_created_at_idx
  ON public.waitlist_signups (created_at DESC)
  WHERE marketing_consent = TRUE;
