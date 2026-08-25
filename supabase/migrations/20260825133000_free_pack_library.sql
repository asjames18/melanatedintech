-- Open the pack library: every product pack becomes free, gated on an account
-- rather than a payment.
--
-- Rationale: in 90 days of live mode the 37 paid packs produced exactly two
-- successful charges, both from the founder's own accounts — $0 in external
-- revenue. The deliverable is markdown, so the paywall was never a moat. What
-- the price was nominally doing (producing a named person who wanted a specific
-- pack) is preserved and strengthened by requiring sign-in instead: a $39 wall
-- converted 0%, an email wall converts a large fraction, and each claim is a
-- qualified lead for the $297 diagnostic.
--
-- price_cents is deliberately NOT cleared. It stays as an anchor value the UI can
-- show ("normally $49"), and keeping it makes this migration reversible by
-- flipping tier back. resolvePremiumEntry gains a tier guard in the same change
-- so a free-tier product can never be sold through the DB pricing fallback.

update public.products
   set tier = 'free',
       updated_at = now()
 where tier = 'premium';

-- Agents are intentionally untouched. Their tier also gates which model
-- /api/public/agents/chat will run, so freeing them silently downgrades their
-- configured paid models to the free tier — a separate decision with a real
-- marginal cost, not a pricing change.
