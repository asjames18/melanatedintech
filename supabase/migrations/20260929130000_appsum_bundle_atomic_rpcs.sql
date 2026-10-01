-- AppSumo bundle SKU: atomic redemption + weekly-allowance reservation.
--
-- Two race conditions the naive read-then-write code can't close:
--   1. Two requests redeeming (the same or different codes) at once could both
--      pass the checks and double-grant. Fixed by redeem_bundle_code(): the
--      code row is locked, claim + entitlement grants happen in one
--      transaction, and a partial unique index enforces one bundle per account.
--   2. Two chat requests at once could both count < 200 and both consume,
--      overshooting the weekly allowance. Fixed by
--      reserve_bundle_conversation(): a per-user advisory lock serializes the
--      count-and-insert, and a placeholder row holds the unit until the
--      response is known — finalized on a usable response, deleted on failure,
--      so only successful conversations consume allowance. Stale placeholders
--      (worker died mid-request) are reclaimed after 15 minutes.
--
-- Deploy order: apply this migration BEFORE deploying the code that calls
-- these RPCs. The server calls them with the service role key.

-- 1. One bundle per account, enforced by the database (not just app code).
create unique index if not exists redeem_codes_redeemed_by_unique
  on public.redeem_codes (redeemed_by)
  where redeemed_by is not null;

-- 2. Atomic bundle redemption: claim code + grant all five agents in one txn.
create or replace function public.redeem_bundle_code(p_code text, p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(p_code));
  v_redeemed_by uuid;
  v_slugs text[] := array[
    'personal-chief-of-staff',
    'pa-inbox-zero',
    'marketing-campaign-strategist',
    'marketing-seo-researcher',
    'customer-support-agent'
  ];
  v_slug text;
begin
  -- Lock the code row for the transaction: concurrent redeems of the same
  -- code serialize here instead of racing.
  select redeemed_by into v_redeemed_by
  from public.redeem_codes
  where code = v_code
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;
  if v_redeemed_by is not null then
    return jsonb_build_object('ok', false, 'error', 'already_redeemed');
  end if;
  if exists (select 1 from public.redeem_codes where redeemed_by = p_user_id) then
    return jsonb_build_object('ok', false, 'error', 'already_has_bundle');
  end if;

  -- Claim + grant atomically: all of it commits or none of it does.
  begin
    update public.redeem_codes
    set redeemed_by = p_user_id, redeemed_at = now()
    where code = v_code;
  exception when unique_violation then
    -- Lost a same-account race on a different code: the partial unique
    -- index above is the backstop the pre-check can't provide.
    return jsonb_build_object('ok', false, 'error', 'already_has_bundle');
  end;

  foreach v_slug in array v_slugs loop
    insert into public.user_entitlements (user_id, kind, slug, environment)
    values (p_user_id, 'agent', v_slug, 'live')
    on conflict (user_id, kind, slug, environment) do nothing;
  end loop;

  return jsonb_build_object('ok', true, 'agents', to_jsonb(v_slugs));
end;
$$;

revoke all on function public.redeem_bundle_code(text, uuid) from public;
grant execute on function public.redeem_bundle_code(text, uuid) to service_role;

-- 3. Atomic weekly-allowance reservation for bundle redeemers.
-- Returns {ok, allowed, reservation_id}. The reservation_id is a placeholder
-- row in agent_usage_log (model '__reserved__') that the caller must either
-- finalize with the real model/tokens or delete — it counts against the
-- allowance either way until resolved.
-- NOTE: the free-model exclusion list below is the single source of truth
-- for what counts against the weekly allowance; the app code no longer
-- duplicates it.
create or replace function public.reserve_bundle_conversation(
  p_user_id uuid,
  p_agent_slug text,
  p_limit int
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_week_start timestamptz;
  v_count int;
  v_reservation_id uuid;
begin
  -- Monday 00:00 America/New_York as an instant (DST-aware via the tz db).
  v_week_start :=
    (date_trunc('week', now() at time zone 'America/New_York')
      at time zone 'America/New_York');

  -- Serialize reservations per user: concurrent requests queue on this lock,
  -- so count-then-insert below can't overshoot the limit.
  perform pg_advisory_xact_lock(410729, hashtext('bundle_allowance:' || p_user_id::text));

  -- Reclaim stale reservations: a placeholder older than 15 minutes means
  -- the worker died between reserve and finalize — free it instead of
  -- permanently burning the user's allowance.
  delete from public.agent_usage_log
  where user_id = p_user_id
    and model = '__reserved__'
    and created_at < now() - interval '15 minutes';

  select count(*) into v_count
  from public.agent_usage_log
  where user_id = p_user_id
    and model not in ('openrouter/free', 'openrouter/openrouter/free')
    and created_at >= v_week_start;

  if v_count >= p_limit then
    return jsonb_build_object('ok', true, 'allowed', false);
  end if;

  insert into public.agent_usage_log (user_id, agent_slug, model)
  values (p_user_id, p_agent_slug, '__reserved__')
  returning id into v_reservation_id;

  return jsonb_build_object(
    'ok', true,
    'allowed', true,
    'reservation_id', v_reservation_id
  );
end;
$$;

revoke all on function public.reserve_bundle_conversation(uuid, text, int) from public;
grant execute on function public.reserve_bundle_conversation(uuid, text, int) to service_role;
