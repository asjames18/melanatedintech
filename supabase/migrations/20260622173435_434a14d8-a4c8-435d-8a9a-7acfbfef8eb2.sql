
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist_signups;
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_messages;
REVOKE INSERT ON public.waitlist_signups FROM anon, authenticated;
REVOKE INSERT ON public.contact_messages FROM anon, authenticated;
