
CREATE TYPE public.submission_status AS ENUM ('pending','approved','rejected');

CREATE TABLE public.agent_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  tagline text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  capabilities text[] NOT NULL DEFAULT '{}',
  website_url text,
  demo_url text,
  repo_url text,
  contact_email text NOT NULL,
  pricing_notes text,
  status public.submission_status NOT NULL DEFAULT 'pending',
  review_notes text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_submissions TO authenticated;
GRANT ALL ON public.agent_submissions TO service_role;

ALTER TABLE public.agent_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own submissions"
  ON public.agent_submissions FOR SELECT TO authenticated
  USING (auth.uid() = submitter_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Users create own submissions"
  ON public.agent_submissions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = submitter_id);

CREATE POLICY "Users update own pending submissions"
  ON public.agent_submissions FOR UPDATE TO authenticated
  USING (auth.uid() = submitter_id AND status = 'pending')
  WITH CHECK (auth.uid() = submitter_id);

CREATE POLICY "Admins manage all submissions"
  ON public.agent_submissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER update_agent_submissions_updated_at
  BEFORE UPDATE ON public.agent_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_agent_submissions_status ON public.agent_submissions(status, created_at DESC);
CREATE INDEX idx_agent_submissions_submitter ON public.agent_submissions(submitter_id, created_at DESC);
