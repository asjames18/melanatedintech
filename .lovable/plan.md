# Melanated In Tech — Full Development Plan

You're right that recent work has been scattered (detail pages → share bar → OG tags → personalization → reasons → tracking). Here is a single roadmap that organizes everything already shipped and everything still to build, in the order that will keep momentum without rework.

## Where we are today

Shipped:
- Routes: home, about, agents (list + detail), knowledge (list + detail), products (list + detail), services, community, contact, auth, account.
- Backend: agents, articles, products, services, waitlist, contact, profiles, user_roles, saved_agents — RLS + GRANTs + seed.
- Knowledge detail: share/copy buttons, dynamic OG/Twitter tags, personalized "Related reading" + "Featured agents", "Because you're reading…" reasons, impression + click analytics.

Gaps causing the "all over the place" feeling:
- Personalization + analytics only exist on `/knowledge/$slug`. Agents and Products detail pages are inconsistent.
- No shared recommendation / share / SEO primitives — logic is inlined per page.
- Analytics events go to localStorage only; no way to actually read them.
- Auth, account, and admin areas are thin.
- No search, no pagination on long lists, no sitemap.

## Phase 1 — Consolidate what exists (1–2 days)

Goal: stop one-off page work; extract shared primitives so the next features land everywhere at once.

1. Shared components in `src/components/`:
   - `share-bar.tsx` — already exists; generalize props (`title`, `url`, `summary`) so agents/products can reuse.
   - `seo-head.ts` helper — single function returning the `meta` array for `head()` from `{ title, description, image, url, type }`.
   - `recommendation-grid.tsx` — wraps the impression/click `RecommendationItem` pattern, takes `items`, `surface`, `renderCard`, `reasonFor`.
2. Shared hooks/lib:
   - Move `reasonFor` out of `knowledge.$slug.tsx` into `src/lib/recommendations.ts` alongside `interestScore` / `topCategories`.
   - Extend `use-reading-interests` → `use-interests` covering articles, agents, products (one keyed store per kind).
3. Apply to `/agents/$slug` and `/products/$slug`:
   - Dynamic OG/Twitter tags via `seo-head`.
   - Share bar.
   - Personalized "Related agents" / "Related products" + "Recommended reading" using shared recommendation grid.
   - Impression + click tracking on every recommendation surface.

## Phase 2 — Make analytics usable ✅

Shipped:
- `analytics_events` table (RLS, GRANTs, GIN index on `props`).
- `recordEvents` server function + debounced flush from `src/lib/analytics.ts` (session id, batch ≤50, retry on failure, flush on `pagehide`/`visibilitychange`).
- `adminAnalyticsSummary` server function aggregating impressions, clicks, CTR by surface / item / reason.
- Admin route `/admin/analytics` with totals + tables, gated by `has_role(uid,'admin')`.

## Phase 3 — Content discovery ✅

Shipped:
- `/search` route with `fuse.js` fuzzy search across agents, articles, products; type filter + `q` in URL search params.
- Search icon in header (desktop) + Search link in mobile menu.
- `src/routes/sitemap[.]xml.ts` server route enumerating static routes + every agent/article/product slug from the DB.
- `public/robots.txt` allowing crawl, disallowing `/account`, `/admin`, `/auth`, `/api/`, pointing to the sitemap.
- JSON-LD: `Organization` schema on root, `Article` schema on knowledge detail, `Product` schema on products + agents detail.
- Pagination + listing filters: existing `Pagination` already wires `page` to URL search params; non-page filters stay local (revisit in Phase 4 if needed).

## Phase 4 — Account + community depth ✅

Shipped:
- Tables: `saved_articles`, `discussion_posts`, `discussion_comments` (RLS + GRANTs, author/admin update + delete policies, trigger to keep `last_activity_at` + `comment_count` in sync).
- Account page expanded to 4 tabs: Saved agents · Saved articles · Reading history (recently-read articles + recently-viewed agents from `useInterests`, with per-list Clear) · Profile.
- `SaveArticleButton` on knowledge detail next to the share bar.
- Community rewritten: `/community` lists threads; `/community/$id` is the thread view with replies, author display, and self-delete; new-thread dialog gated on auth.
- Submissions admin tab: list every `agent_submissions` row with one-click Approve / Reject / Mark pending plus internal notes (`adminListSubmissions`, `adminReviewSubmission`).
- Profile editor avatar upload already shipped — left as-is.

## Phase 5 — Monetization + launch (in progress)

Shipped:
- Built-in payments enabled (Lovable's Stripe). Test env live in preview with card `4242 4242 4242 4242`.
- Stripe products + prices created for 5 premium items (3 agents, 2 products) via `batch_create_product` and mapped in `src/lib/premium-catalog.ts`.
- `user_entitlements` table (RLS: users read own, service role writes; unique on `(user_id, kind, slug, environment)` and on `stripe_session_id`).
- Server functions in `src/lib/payments.functions.ts`: `createUnlockCheckout` (auth-gated, creates Stripe Customer with `metadata.userId`, embedded checkout session, stamps `unlock_kind`/`unlock_slug`/`price_id` in metadata) and `listMyEntitlements`.
- Webhook handler at `/api/public/payments/webhook` — verifies signature, handles `checkout.session.completed` + `transaction.completed`, upserts entitlement row keyed by session id (idempotent).
- `UnlockButton` component (embedded checkout in a Dialog) wired into `/agents/$slug` and `/products/$slug` for premium items in the catalog.
- `/checkout/return` page, `<PaymentTestModeBanner />` on every page, "Unlocked" tab on `/account`.

Remaining:
1. Transactional email via Lovable Email: waitlist welcome, contact auto-reply, purchase receipt (domain `melanatedintech.com` — setup dialog).
2. Premium-content gating for full agent details (currently entitlement only surfaces "Unlocked" state — actual gated content like deployment links can be added per agent as content arrives).
3. Launch checklist: per-route OG image fallbacks, favicon set, image lazy-loading audit, publish.
