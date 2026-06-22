# Project plan — Melanated In Tech

Ongoing log of features shipped. Most recent at top.

## Shipped — Submissions polish, Personalization, Content depth, Analytics & Product surface

- **Submissions edit & resubmit**: new `/submissions` list with status timeline; `/submissions/$id` editor; rejected submissions resubmit back to `pending` and clear reviewer state.
- **Auto-publish on approval**: admin approval inserts a row into `public.agents` (unique slug) and links via `agent_submissions.published_agent_id`. Admin sees a "Live agent" toast/link.
- **Autosave submission form**: debounced localStorage draft + restore toast + Discard. Stronger client-side zod-style validation with inline errors.
- **Interests page** at `/interests`: category + content-type chips, cross-device sync via new `user_interests` table; "Reset my recommendations" wipes server prefs and local history.
- **Clickable recommendation reasons** that deep-link the matching listing pre-filtered by category (`?category=...` now lives in URL for agents/knowledge/products).
- **Author profiles**: new `authors` table + `articles.author_id`; `/authors/$slug` route with bio + their articles; author card surfaces on each article page when set.
- **Reading progress bar + Continue reading** strip on `/knowledge` (localStorage-backed).
- **Per-product waitlist**: new `ProductWaitlist` component stores `product_slug` in `waitlist_signups`; shows signup count for social proof.
- **Admin catalog verification** at `/admin/catalog`: counts of agent categories, knowledge categories, product tiers, service lines with missing-bucket flags.
- **CSV export** of recommendation analytics from `/admin/analytics`.

## Skipped / deferred

- Per-article OG image generator — heavy to deploy on Workers; revisit when traffic justifies.
- Recommendation dwell-time, GA4/Segment forwarding, A/B testing on reason copy, recommendation weighting tuner, PDF export — defer.
- Transactional emails (waitlist welcome, contact auto-reply, purchase receipt) — parked per user.

## Schema added this turn

- `agent_submissions.published_agent_id` → `agents.id`
- `waitlist_signups.product_slug`
- `authors` (slug, name, bio, avatar_url, links jsonb)
- `articles.author_id` → `authors.id`
- `user_interests` (categories[], content_types[]) keyed by user id
