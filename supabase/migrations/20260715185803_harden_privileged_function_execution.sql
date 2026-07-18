-- Restrict privileged helpers to the callers that actually use them.
-- Email queue operations are server-only and use the service role.
-- Hashtag maintenance functions are invoked by database triggers.

ALTER FUNCTION public.enqueue_email(text, jsonb)
  SET search_path = '';
ALTER FUNCTION public.read_email_batch(text, integer, integer)
  SET search_path = '';
ALTER FUNCTION public.delete_email(text, bigint)
  SET search_path = '';
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb)
  SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;

ALTER FUNCTION public.index_post_hashtags()
  SET search_path = '';
ALTER FUNCTION public.decrement_post_hashtags()
  SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.index_post_hashtags()
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrement_post_hashtags()
  FROM PUBLIC, anon, authenticated;

-- RLS policies and two server-side admin checks rely on has_role. Keep the
-- required API grants, but prevent browser callers from probing another user.
CREATE OR REPLACE FUNCTION public.has_role(
  _user_id uuid,
  _role public.app_role
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT CASE
    WHEN (SELECT auth.role()) = 'service_role' THEN EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
    )
    WHEN _user_id IS NOT DISTINCT FROM (SELECT auth.uid()) THEN EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
    )
    ELSE false
  END
$function$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)
  TO anon, authenticated, service_role;
