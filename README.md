# Melanated In Tech

Revenue recovery systems for local service businesses, plus an AI agent marketplace,
knowledge library, and a set of free interactive tools.

Production: <https://melanatedintech.com>

## Stack

| Layer | Technology |
| --- | --- |
| Framework | TanStack Start (React 19, TanStack Router file-based routing) |
| Build | Vite 8 + Nitro |
| Hosting | Cloudflare Workers (`wrangler.jsonc`) |
| Database / auth | Supabase (Postgres + RLS, Supabase Auth) |
| Payments | Stripe (Checkout, Connect for seller payouts) |
| Email | Resend, with a pgmq-backed queue for non-urgent sends |
| Styling | Tailwind CSS 4, Radix primitives, shadcn-style components in `src/components/ui` |

## Local setup

```bash
npm install
cp .env.example .env      # fill in real values
npm run dev               # http://localhost:3000
```

For a Cloudflare Worker preview that matches production more closely, copy
`.env.example` to `.dev.vars` instead, then:

```bash
npm run build
npm run preview
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build (also regenerates `src/routeTree.gen.ts`) |
| `npm run check` | `lint` + `typecheck` + `build` — the same gate CI runs |
| `npm run lint` / `npm run typecheck` | Run either gate on its own |
| `npm run format` | Prettier write |
| `npm run audit:links` | Internal-link coverage report → `docs/internal-link-audit.md` |
| `npm run generate:og` | Render per-article/agent/product OG images into `public/og` |
| `npm run deploy:cloudflare` | `npm run check` then `nitro deploy --prebuilt` |

CI (`.github/workflows/quality.yml`) runs `npm audit --audit-level=high`, `lint`,
`typecheck`, and `build` on every pull request and push to `main`.

## Project layout

```
src/routes/              File-based routes; `_authenticated/` is the signed-in tree
src/routes/api/public/   Unauthenticated HTTP endpoints (agent chat, Stripe webhook)
src/lib/*.functions.ts   TanStack server functions (zod-validated)
src/lib/*.server.ts      Server-only modules — never imported into client bundles
src/integrations/supabase/  Client factories, auth middleware, generated types
supabase/migrations/     Ordered SQL migrations
docs/                    Strategy, launch ops, content, and audit documents
```

### Two Supabase clients, deliberately

- `publicClient()` uses the **publishable** key and is subject to RLS. It ships in the
  client bundle, so anything it can read is effectively public.
- `supabaseAdmin` (`src/integrations/supabase/client.server.ts`) uses the **service-role**
  key, bypasses RLS, and is lazily imported so it never reaches the browser.

Paid deliverable columns (`agents.unlock_content`, `agents.system_prompt`,
`products.unlock_content`, and the `asset_path` storage keys) are revoked from `anon` and
`authenticated` at the column level by
`supabase/migrations/20260819120000_restrict_premium_columns.sql`. Read them only through
`supabaseAdmin`, behind an entitlement check.

### Authorization

The `_authenticated` route guard is client-side and cosmetic. The real boundary is
`requireSupabaseAuth` (`src/integrations/supabase/auth-middleware.ts`) plus a `user_roles`
lookup inside each privileged server function. Any new admin server function must do its
own check — do not rely on the route tree.

## Database migrations

Migrations are plain SQL, applied oldest-first:

```bash
supabase db push
```

After a schema change, regenerate types into `src/integrations/supabase/types.ts`:

```bash
supabase gen types typescript --project-id <id> > src/integrations/supabase/types.ts
```

## Environment variables

`.env.example` is the authoritative list. Server secrets are set as Cloudflare Worker
environment variables in production — `wrangler.jsonc` intentionally declares no `vars`
so no secret is ever committed.

Sandbox vs. live payments is driven by the `VITE_PAYMENTS_CLIENT_TOKEN` prefix
(`pk_test_` → sandbox, `pk_live_` → live) together with the webhook `?env=` query
parameter.

## Going live

`docs/launch-ops-checklist.md` is the ordered runbook for the dashboard and secret steps
that live outside this repo: applying migrations, creating Stripe live prices, setting
production secrets, pointing the webhook, claiming the first admin, and the sandbox smoke
test to run before flipping to live.
