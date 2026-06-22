## Melanated In Tech — MVP Build

An AI-agent-first platform where every pillar (marketplace, knowledge, products, services, community) orbits one identity: **AI agents**. Not generic AI education — a destination for people who build, deploy, and benefit from agents.

### Visual direction
- Clean modern tech: slate `#0F172A`, brand blue `#3B82F6`, emerald accent `#10B981`, light surface `#F8FAFC`
- Type: Space Grotesk (display) + Inter (body) via `@fontsource`
- Subtle grid background on hero, soft cards, rounded-2xl, refined tier badges
- Dark mode supported via existing `.dark` tokens

### Routes (file-based)
```text
/                Home — agent-first hero, featured agents, knowledge picks, pillar grid, waitlist
/about           Vision, mission, core belief — framed around agents
/agents          Marketplace: filter by category + tier
/agents/$slug    Agent detail (capabilities, description, save button, related)
/knowledge       Knowledge Hub index — filter by category
/knowledge/$slug Article detail (markdown body rendered)
/products        Digital Products (kits, blueprints, prompt libs, SOPs, MCP collections)
/services        Professional services (strategy sprint, custom build, ministry, workshop)
/community       Builder community teaser + waitlist
/contact         Contact form
/auth            Sign in / Sign up (email+password + Google)
/_authenticated/account  Profile + saved agents
```
Each route gets its own `head()` with unique title/description/og tags.

### Lovable Cloud (already enabled)
Tables (created with GRANTs + RLS + seed data):
- `agents` — slug, name, tagline, category, capabilities[], tier (free/premium/custom), price_cents, featured, active (public read)
- `articles` — slug, title, excerpt, body (markdown), category, read_minutes, published (public read)
- `products` — slug, name, tagline, category, tier, price_cents (public read)
- `services` — slug, name, tagline, description, outcomes[] (public read)
- `waitlist_signups` — email, source, interest (insert via server fn, admin read)
- `contact_messages` — name, email, organization, topic, message (insert via server fn, admin read)
- `profiles` — auto-created on signup, user-owned
- `user_roles` + `app_role` enum + `has_role()` security-definer (admin gating)
- `saved_agents` — user-owned

Seeded with 8 agents, 6 articles, 6 products, 4 services covering church/ministry, business, sales, creators, research, support, productivity, fundamentals, memory, MCP, multi-agent, local AI, skills.

Auth: email/password + Google (managed). `_authenticated/route.tsx` gates the account area.

### Server functions (`src/lib/*.functions.ts`)
- `listAgents`, `getAgent({slug})`, `listArticles`, `getArticle`, `listProducts`, `listServices` — public read via server publishable client
- `joinWaitlist`, `submitContact` — public POST, zod-validated, written via service-role inside handler
- `getMyProfile`, `listMySavedAgents`, `toggleSavedAgent` — `requireSupabaseAuth`

### Components
- `SiteHeader` (sticky, mobile menu, sign-in/account toggle)
- `SiteFooter` (links + footer waitlist)
- `Hero` (agent-first headline + dual CTA)
- `AgentCard`, `ArticleCard`, `ProductCard`, `ServiceCard`, `TierBadge`
- `WaitlistForm` (reusable: home, community, footer)
- `ContactForm`

### Design system
- `src/styles.css` updated with brand tokens, Space Grotesk/Inter, gradient utility, grid utility
- All tokens semantic — no hardcoded colors in components

### SEO
- Per-route `head()` with title/description/og:title/og:description
- Single H1 per page, semantic landmarks, alt text on icons via aria

### Out of scope (future)
- Payments / checkout
- Article authoring UI / admin dashboard
- Full community forum (threads, posts)
- Search, comments, ratings, downloads

Switch to build mode and I'll ship this end to end in one pass.
