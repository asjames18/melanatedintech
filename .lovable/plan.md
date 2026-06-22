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

## Phase 4 — Account + community depth (2–3 days)

1. Account: saved agents (exists) + saved articles + reading history surfaced from `use-interests`.
2. Profile editor polish (avatar upload via Storage bucket `avatars`).
3. Community: gated discussion stub — `posts` + `comments` tables, RLS by `auth.uid()`, basic thread view. Keep scope tight: list + create + reply, no moderation UI yet.
4. Submit-agent flow (route already exists): move to a proper multi-step form, admin review queue in `/_authenticated/admin`.

## Phase 5 — Monetization + launch (3–5 days)

1. Stripe via Lovable's Stripe connector: paid product checkout for `products` with `tier = premium`, and "premium agent unlock" on agents.
2. Entitlements table `user_entitlements (user_id, sku, granted_at)` written by Stripe webhook in `src/routes/api/public/stripe-webhook.ts` (signature-verified).
3. Gate premium content + downloads on entitlements.
4. Transactional email via Lovable Email: waitlist welcome, contact auto-reply, purchase receipt.
5. Launch checklist: OG image per route, favicon set, performance pass (image sizes, lazy loading), publish.

## Technical notes

- Keep all colors/typography on semantic tokens already defined in `src/styles.css`. No new hardcoded hex.
- All app-internal server logic stays in `createServerFn` under `src/lib/*.functions.ts`. Webhooks/sitemap go under `src/routes/api/public/`.
- New tables: each migration MUST include `GRANT` + `ENABLE ROW LEVEL SECURITY` + policies, per project rules.
- Recommendation logic should be deterministic on the server-rendered pass so OG/preview tools don't see empty grids; personalization layer hydrates on the client.

## What I'd build next (recommend Phase 1)

Phase 1 directly addresses the "all over the place" feeling — it converts the knowledge-page features into reusable primitives and applies them uniformly to agents and products. Approve and I'll start there; otherwise tell me which phase to lead with.
