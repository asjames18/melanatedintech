-- Retire the revenue-share machinery; keep contributor attribution.
--
-- seller_profiles was doing two unrelated jobs. Attribution — display_name,
-- slug, bio, avatar_url, website_url — powers /sellers/$slug and the byline on
-- every agent and product page. That is the contributor-credit system the open
-- library runs on, and it stays exactly as it is.
--
-- Revenue share — commission_rate, payout_enabled, stripe_account_id,
-- stripe_account_status, plus user_entitlements.commission_cents/seller_paid —
-- is now dead. Every pack is free, so there is nothing to split, and the payout
-- path never moved money anyway: it computed earnings from a
-- recordSellerEarnings() that nothing ever called, and created Stripe Connect
-- accounts whose onboarding returned to routes that do not exist.
--
-- The security half matters more than the cleanup. "Users manage their own
-- seller profile" is FOR ALL on auth.uid() = user_id, and `authenticated` held
-- UPDATE on every column — so a contributor could set their own commission_rate
-- and payout_enabled straight through PostgREST. Revoking column-level UPDATE
-- closes that regardless of what the policy allows.
--
-- Columns are left in place rather than dropped: this is reversible, and the
-- values are harmless once nothing reads or writes them. Server functions use
-- the service role and are unaffected by these grants.

-- NOTE: a column-level REVOKE cannot carve a hole in a table-level grant. Both
-- tables carry table-wide INSERT/UPDATE for these roles, so revoking specific
-- columns reports success and changes nothing. The table-level grant is what has
-- to go.
--
-- Every write to either table already runs through the service role
-- (updateSellerProfile, grantFromSession, claimFreePack, the admin functions), so
-- these roles need no write access at all. SELECT is untouched: listMyEntitlements
-- reads through the caller's own client under "Users view own entitlements", and
-- seller profiles stay readable for attribution.

revoke insert, update on public.seller_profiles from anon, authenticated;
revoke insert, update on public.user_entitlements from anon, authenticated;
