# Launch Ops Checklist - Melanated In Tech

Dashboard/secret steps a human must do before live payments work. Code is in
place; this is the configuration that lives outside the repo. Do these in order.

> Sandbox vs. live is driven by the `VITE_PAYMENTS_CLIENT_TOKEN` prefix
> (`pk_test_` -> sandbox, `pk_live_` -> live) plus the webhook `?env=` query param.
> Test everything in **sandbox** first, then flip the token to `pk_live_`.

---

## 1. Apply database migrations (in order)

Run every migration under `supabase/migrations/` against the live project. The
ones below must all be present; the last four are new in this round. Apply via
`supabase db push` (CLI) or the MCP `apply_migration` tool, oldest first.

Required / newest tail:

- `20260622220000_rate_limit_and_profile_privacy.sql`
- `20260622230000_content_expansion.sql`
- `20260623000000_content_expansion_v2.sql`
- `20260623010000_product_fulfillment.sql`
- `20260623020000_free_product_packs.sql`
- `20260623030000_agent_fulfillment.sql` - agent packs + columns + bucket
- `20260623040000_admin_message_status.sql` - `contact_messages.handled`
- `20260623050000_community_moderation.sql` - `discussion_posts.locked`
- `20260623060000_submission_image.sql` - `agent_submissions.image_url`

After applying, regenerate the Supabase TypeScript types when schema changes:
`supabase gen types typescript` -> `src/integrations/supabase/types.ts`.

## 2. Create Stripe LIVE prices

Create a one-time Price for each catalog item, with the **exact** `lookup_key`
below (the server resolves price by lookup_key - a mismatch breaks checkout).
Source of truth: `src/lib/premium-catalog.ts`.

| Item (kind / slug)                    | lookup_key                                    | Amount (USD) |
| ------------------------------------- | --------------------------------------------- | ------------ |
| agent / marketing-campaign-strategist | `agent_marketing_campaign_strategist_onetime` | $49.00       |
| agent / pa-inbox-zero                 | `agent_pa_inbox_zero_onetime`                 | $39.00       |
| agent / marketing-seo-researcher      | `agent_marketing_seo_researcher_onetime`      | $59.00       |
| product / agent-skill-pack-core       | `product_agent_skill_pack_core_onetime`       | $49.00       |
| product / workflow-templates-ops      | `product_workflow_templates_ops_onetime`      | $39.00       |

Currency USD, one-time (not recurring). The Product name is shown on the receipt.

## 3. Set production secrets

Server env (Cloudflare Worker/Pages environment variables):

- `SUPABASE_SERVICE_ROLE_KEY` - service-role key (server-only; never client).
- `STRIPE_LIVE_SECRET_KEY` - live secret key.
- `PAYMENTS_LIVE_WEBHOOK_SECRET` - from the webhook endpoint created in step 4.
- `VITE_PAYMENTS_CLIENT_TOKEN=pk_live_...` - flips the whole app to live.

(Already set: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`. Keep the sandbox
`STRIPE_SANDBOX_SECRET_KEY` / `PAYMENTS_SANDBOX_WEBHOOK_SECRET` for test runs.
Legacy `STRIPE_*_API_KEY` names still work, but Cloudflare should use the
`STRIPE_*_SECRET_KEY` names.)

For local Worker preview, copy `.env.example` to `.dev.vars` and fill in real
values. `.dev.vars`, `.env`, and `.cloudflare.env` are ignored because they can
contain secrets.

## 4. Point the live Stripe webhook

Create a webhook endpoint in the **live** Stripe dashboard:

- URL: `https://melanatedintech.com/api/public/payments/webhook?env=live`
- Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`
  (and `transaction.completed` if using the Lovable-normalized events).
- Copy its signing secret into `PAYMENTS_LIVE_WEBHOOK_SECRET` (step 3).

> The webhook is now only a backup - the checkout-return page self-heals the
> grant on landing. But configure it so async/edge cases still settle.

## 5. Claim the first admin

Sign in with the founder account, go to `/admin`, and click **Claim admin
access** (calls `claimFirstAdmin`; only works while zero admins exist).

## 6. Seed deliverables for any remaining paid items

All 5 Stripe-buyable items now ship a real pack via migrations. If you add more
premium agents/products later, set their `unlock_content` in the **admin UI**
(Agents tab -> edit -> "Unlock pack" field) - no SQL needed anymore. Items with no
deliverable correctly show "Coming soon" instead of a buy button.

## 7. Clear Supabase Advisors

Open Supabase -> Advisors and resolve security/performance findings (RLS,
function search_path, etc.). Re-check after the migrations land.

---

## Smoke test (sandbox, before going live)

1. With `VITE_PAYMENTS_CLIENT_TOKEN=pk_test_...`, buy **one of the 3 agents** end
   to end. On `/checkout/return` you should see "You're unlocked", then the pack
   renders on the agent page and downloads as `.md`.
2. Reload the return URL - still "unlocked", no duplicate entitlement row.
3. As a logged-out user, confirm the agent page shows the buy button (or "Coming
   soon" if you blank its pack) and never the pack content.
4. Flip the token to `pk_live_...`, repeat step 1 with a real card once.
