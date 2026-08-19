-- Secure public invoice delivery.
-- Invoice numbers remain human-readable references, while this random token is
-- required by the server for every public read or mutation.

ALTER TABLE public.client_invoices
  ADD COLUMN IF NOT EXISTS public_access_token UUID;

UPDATE public.client_invoices
SET public_access_token = gen_random_uuid()
WHERE public_access_token IS NULL;

ALTER TABLE public.client_invoices
  ALTER COLUMN public_access_token SET DEFAULT gen_random_uuid(),
  ALTER COLUMN public_access_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS client_invoices_public_access_token_idx
  ON public.client_invoices (public_access_token);

DROP POLICY IF EXISTS "Public read non-draft invoices" ON public.client_invoices;
REVOKE ALL ON public.client_invoices FROM anon;
REVOKE ALL ON public.client_invoices FROM authenticated;

-- Authenticated administrators retain direct database access through RLS.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_invoices TO authenticated;

DROP POLICY IF EXISTS "Admins full access invoices" ON public.client_invoices;
CREATE POLICY "Admins full access invoices"
  ON public.client_invoices FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

GRANT ALL ON public.client_invoices TO service_role;

COMMENT ON COLUMN public.client_invoices.public_access_token IS
  'Random bearer token required for customer invoice reads, checkout, and add-on changes.';
