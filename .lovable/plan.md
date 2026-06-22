# Remaining Work Plan

Grouped into 5 phases. Each phase is independently shippable. Emails stay parked.

## Phase A — Submissions polish

1. **User submission edit + resubmit.** New `/account` → "My submissions" tab listing the signed-in user's `agent_submissions` with status badge + review notes. Rejected/pending rows get an **Edit & resubmit** button opening the existing submission form pre-filled; submit sets status back to `pending` and clears `reviewed_at`/`reviewer_notes`.
2. **Status timeline.** On each submission row, show a 3-step timeline (Pending → Approved/Rejected) with timestamps and the reviewer's note when present.
3. **Auto-publish on approval.** When admin approves, insert a row into `public.agents` from the submission's fields (slug, name, summary, etc.), mark submission `published_agent_id`, and return that slug. Admin UI shows a "View live agent" link; users see the approved item appear on `/agents`.
4. **Autosave submission form.** Debounced localStorage autosave keyed by user id; restore on mount with a "Draft restored" toast + Discard button. Strengthen client-side zod validation (required fields, URL format, max lengths).

## Phase B — Personalization controls

5. **Interests settings page** at `/account/interests`: chips for categories + content types; saves to a new `user_interests` table (jsonb prefs) so it syncs across devices. Falls back to localStorage when signed out.
6. **Reset my recommendations** button on the interests page and on the account "Reading history" tab: clears `user_interests` row + localStorage interest store.
7. **Clickable reason chips.** "Because you're reading X" becomes a `<Link>` to the listing page with the matched `category`/`topic` pre-filtered.

## Phase C — Content depth

8. **Author profiles.** Add `public.authors` (name, slug, bio, avatar_url, links jsonb) + `articles.author_id` FK. New route `/authors/$slug` with bio + their articles. Author card on `/knowledge/$slug`.
9. **Reading progress + resume.** Scroll-based progress bar on article pages; persist `{slug, percent, updated_at}` to localStorage; "Continue reading" section on `/knowledge` showing last 3 in-progress articles.
10. **Per-article OG image generator.** New server route `/api/og/article/$slug.png` rendering a branded card (title, author, category) with `@vercel/og` or satori; cached. Wire `og:image`/`twitter:image` on `/knowledge/$slug`.

## Phase D — Product surface gaps

11. **Per-product waitlist form** on `/products/$slug` (uses existing `waitlist_signups` with a `product_slug` column added). Email field + zod validation + toast confirmation. Shows count of signups for social proof.

## Phase E — Analytics depth

12. **Admin seed-verification page** at `/admin/catalog`: counts of agent categories, knowledge content types, product types, service lines, with "missing" flags for empty buckets.
13. **Recommendation analytics deepening.** Add `dwell_time_ms` event (records time between recommendation click and next navigation/leave). Surface in `/admin/analytics` table.
14. **CSV export** from `/admin/analytics` (impressions/clicks/CTR by surface + by item).

## Skipped / parked

- **GA4/Segment forwarding** — keep server-side analytics; revisit if user wants external tooling.
- **A/B testing on reason copy** — needs a feature-flag setup; defer until traffic justifies.
- **Recommendation-weighting admin tuner** — defer; current heuristic works.
- **PDF export** — CSV covers stakeholder reporting; PDF is heavy for low value.
- **Transactional emails** — parked per your earlier call.

## Suggested order

A → D → B → C → E. A and D unblock real user flows; B and C deepen engagement; E is admin/insight polish.

## Technical notes

- New tables: `authors`, `user_interests`. Both follow the GRANT-then-RLS pattern. `articles.author_id` is a nullable FK so existing rows aren't broken.
- New columns: `agent_submissions.published_agent_id uuid`, `waitlist_signups.product_slug text`.
- New server fns: `getMySubmissions`, `resubmitSubmission`, `saveInterests`, `getInterests`, `resetInterests`, `joinProductWaitlist`, `recordDwell`, `exportAnalyticsCsv`. Approval flow extends existing `adminReviewSubmission` to write the agents row.
- OG image route uses satori + resvg (Worker-compatible). Cache headers `public, max-age=86400`.

Want me to start at Phase A, or reshuffle?
