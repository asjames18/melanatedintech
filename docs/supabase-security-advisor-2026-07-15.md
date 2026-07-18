# Supabase Security Advisor Baseline - July 15, 2026

This report records the security advisor results after the July 15 content, SEO, publication, and product migrations. Those migrations were data-only changes; the findings below predate or are independent of the content release.

## Remediation update

Migration `20260715185803_harden_privileged_function_execution.sql` is live. It fixed the search path on all seven reviewed functions, removed anonymous and authenticated execution from the four server-only email queue functions, and removed direct browser execution from the two trigger-only hashtag functions. The `has_role` helper now rejects attempts to check a different user unless the caller is the service role.

After remediation, the security advisor reports only three warnings:

- `has_role` remains executable by `anon` and `authenticated` because current RLS policies depend on it. Its inputs are now constrained to the current authenticated user, but moving it into a private schema remains the preferred longer-term cleanup.
- Leaked-password protection remains disabled and must be enabled through the Supabase Auth configuration workflow.

The email queue and hashtag warnings described below are retained as the before-remediation baseline.

## Priority 1: email queue functions are exposed too broadly

The following `SECURITY DEFINER` functions are executable by both `anon` and `authenticated` through the public API schema:

- `enqueue_email(queue_name text, payload jsonb)`
- `read_email_batch(queue_name text, batch_size integer, vt integer)`
- `delete_email(queue_name text, message_id bigint)`
- `move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)`

These functions also have mutable `search_path` settings. Before changing privileges, identify every server, worker, trigger, and Edge Function that calls them. Then move privileged queue operations out of the exposed `public` schema where practical, set a fixed safe search path, revoke default/public execution, and grant execution only to the backend role that needs it.

- [Mutable function search path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- [Anonymous access to SECURITY DEFINER functions](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
- [Authenticated access to SECURITY DEFINER functions](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)

## Priority 2: other privileged public functions

The advisor also reports public execution of:

- `has_role(_user_id uuid, _role public.app_role)`
- `index_post_hashtags()`
- `decrement_post_hashtags()`

Audit their callers and RLS dependencies before revoking privileges. Trigger-only functions should not remain callable as general RPC endpoints. Role-checking functions must not allow a caller to ask about arbitrary users unless that behavior is deliberately authorized.

## Priority 3: leaked-password protection

Supabase Auth leaked-password protection is disabled. Enable it in Auth settings after confirming the desired password policy and communicating any effect on new passwords or password changes.

- [Password strength and leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

## Recommended remediation order

1. Inventory function definitions, owners, grants, and application callers.
2. Add regression tests for email delivery, hashtag indexing, and role checks.
3. Create one narrowly scoped security migration for function search paths and execution grants.
4. Apply it in isolation and test backend jobs plus authenticated user flows.
5. Re-run the Supabase security advisor and retain the before/after results.
6. Enable leaked-password protection through the Auth configuration workflow.

Do not apply a blanket `REVOKE EXECUTE ON ALL FUNCTIONS` statement: existing RLS policies, triggers, or backend jobs may depend on specific functions.
