-- Wrap auth.uid()/auth.jwt()/auth.role() in a scalar subquery inside every RLS
-- policy that calls one directly.
--
-- Postgres re-evaluates a bare function call in a policy predicate once per
-- row. Wrapping it as (select auth.uid()) turns it into an InitPlan evaluated
-- once per query. These functions are STABLE within a statement, so the value
-- is identical: this changes performance, not semantics and not who can read
-- what. It is the fix Supabase's `auth_rls_initplan` advisor asks for, and it
-- covered 61 findings across 42 tables here.
--
-- The statements are generated from Postgres's own rendering of each policy
-- rather than transcribed by hand, and materialised into an array before any
-- ALTER runs, so the catalog is not modified while it is being read.
--
-- Two details worth keeping if this is ever adapted:
--
--   * The "already wrapped?" guard must be case-insensitive (~*). Postgres
--     renders the keyword as uppercase SELECT, so a case-sensitive check
--     matches nothing and happily wraps correct policies a second time.
--   * Re-running is safe. The guard skips anything already wrapped, so this is
--     idempotent against a database where it has already been applied.

do $$
declare
  stmts text[];
  s text;
begin
  select array_agg(
           format('alter policy %I on %I.%I', p.policyname, p.schemaname, p.tablename)
           || case when p.qual is not null
                then format(' using (%s)',
                       regexp_replace(p.qual, 'auth\.(uid|jwt|role)\(\)', '(select auth.\1())', 'g'))
                else '' end
           || case when p.with_check is not null
                then format(' with check (%s)',
                       regexp_replace(p.with_check, 'auth\.(uid|jwt|role)\(\)', '(select auth.\1())', 'g'))
                else '' end
         )
    into stmts
    from pg_policies p
   where p.schemaname = 'public'
     and ((p.qual ~ 'auth\.(uid|jwt|role)\(\)' and p.qual !~* 'select\s+auth\.')
       or (p.with_check ~ 'auth\.(uid|jwt|role)\(\)' and p.with_check !~* 'select\s+auth\.'));

  foreach s in array coalesce(stmts, '{}'::text[]) loop
    execute s;
  end loop;
end
$$;

-- Safety net: collapse any double wrap, whatever produced it. The live database
-- needed this once, after the guard above was applied case-sensitively.
do $$
declare
  stmts text[];
  s text;
begin
  select array_agg(
           format('alter policy %I on %I.%I', p.policyname, p.schemaname, p.tablename)
           || case when p.qual is not null
                then format(' using (%s)',
                       regexp_replace(p.qual,
                         '\(\s*SELECT\s+\(\s*SELECT\s+auth\.(uid|jwt|role)\(\)\s+AS\s+\w+\)\s+AS\s+\w+\)',
                         '(select auth.\1())', 'gi'))
                else '' end
           || case when p.with_check is not null
                then format(' with check (%s)',
                       regexp_replace(p.with_check,
                         '\(\s*SELECT\s+\(\s*SELECT\s+auth\.(uid|jwt|role)\(\)\s+AS\s+\w+\)\s+AS\s+\w+\)',
                         '(select auth.\1())', 'gi'))
                else '' end
         )
    into stmts
    from pg_policies p
   where p.schemaname = 'public'
     and (p.qual ~* '\(\s*select\s+\(\s*select\s+auth\.'
       or p.with_check ~* '\(\s*select\s+\(\s*select\s+auth\.');

  foreach s in array coalesce(stmts, '{}'::text[]) loop
    execute s;
  end loop;
end
$$;
