# Melanated In Tech

> Practical AI-enabled operations, revenue-recovery systems, and learning tools for people and small organizations building useful economic power.

[Melanated In Tech](https://melanatedintech.com) is a production web application that brings together practical tools, service offerings, learning resources, and a marketplace for AI-enabled operating systems. This repository contains the application source code and supporting database migrations.

## What this repository includes

| Area | Purpose |
|---|---|
| Public website | Pages for services, tools, resources, products, and the Open Commons initiative. |
| Authenticated experiences | Account, submissions, seller, and administrative workflows. |
| Revenue operations | Payment, invoice-support, entitlement, and marketplace workflows. |
| Content and learning | Knowledge-library content, guides, and practical AI tools. |
| Data layer | Supabase schema migrations, row-level-security policy changes, and generated types. |

The public [Open Commons](https://melanatedintech.com/open-commons) page features our open-source companion repositories under the MIT License:
- [Ministry AI Skills](https://github.com/asjames18/ministry-ai-skills): Open-source, platform-agnostic AI skills, prompts, workflows, and guardrails for churches and Christian ministries.
- [Agent Tool Assurance Kit](https://github.com/asjames18/agent-tool-assurance): Reusable policy contracts, evaluation harnesses, and synthetic test fixtures for bounded agent systems.

## Technology

| Layer | Technology |
|---|---|
| Application | TanStack Start, React, and TanStack Router |
| Build and Worker runtime | Vite, Nitro, and Cloudflare Workers |
| Data and authentication | Supabase, Postgres, Row Level Security, and Supabase Auth |
| Payments | Stripe Checkout and seller-payout workflows |
| Email | Resend with a queue-backed delivery pipeline |
| User interface | Tailwind CSS, Radix primitives, and local UI components |

## Local development

Use a current Node.js LTS release. This repository does not contain production credentials.

```bash
git clone https://github.com/asjames18/melanatedintech.git
cd melanatedintech
npm install
cp .env.example .env
npm run dev
```

The development server is available at `http://localhost:3000`. Populate only the environment variables needed for the area you are developing, and **never commit** `.env`, `.dev.vars`, credentials, tokens, customer data, or production logs.

For a Cloudflare Worker preview, create a local `.dev.vars` file from `.env.example`, supply only non-production values, then run:

```bash
npm run build
npm run preview
```

## Quality checks

Run the full quality gate before opening a pull request or publishing a deployment:

```bash
npm run check
```

| Command | Purpose |
|---|---|
| `npm run dev` | Start the local Vite development server. |
| `npm run lint` | Check source-code style and lint rules. |
| `npm run typecheck` | Check TypeScript types without emitting files. |
| `npm run build` | Create the production Worker build and regenerate the route tree. |
| `npm run smoke` | Run the local Worker smoke checks. |
| `npm run check` | Run linting, type checking, production build, and smoke checks. |
| `npm run audit:links` | Produce an internal-link coverage report. |
| `npm run generate:og` | Generate Open Graph images for supported content. |
| `npm run deploy:cloudflare` | Run the full quality gate and deploy the prebuilt Worker. |

Continuous integration runs the relevant quality checks on changes to `main`.

## Repository layout

```text
src/routes/                 File-based pages, API routes, and authenticated flows
src/components/             Shared application and UI components
src/lib/                    Server functions, integration helpers, and domain logic
src/integrations/supabase/  Supabase clients, authentication middleware, and types
supabase/migrations/        Ordered SQL schema and policy migrations
docs/                       Product, launch, content, and technical documentation
scripts/                    Build, smoke-test, and maintenance scripts
```

## Security and data boundaries

The application uses a public Supabase client for browser-safe data and a server-only administrative client for privileged operations. Authorization checks belong in server functions; client-side route guards are not a security boundary.

Do not post security vulnerabilities, customer records, credentials, private prompts, payment data, or internal operational logs in public issues. Follow [SECURITY.md](SECURITY.md) to report a potential vulnerability privately.

## Deployment

Deployments use the existing Cloudflare Worker and its configured bindings, static assets, domain, and DNS. An authorized maintainer can deploy a validated build with:

```bash
npm run deploy:cloudflare
```

Production secrets are configured outside this repository. Do not add secret values to `wrangler.jsonc`, tracked environment files, documentation, or Git history.

## Contributing and community

This repository is public for transparency and collaboration around the Melanated In Tech application. Before proposing a change, open or comment on an issue with the problem, the intended scope, and any user-facing or data-handling implications. Keep changes focused, add or update validation where practical, and run `npm run check` before requesting review.

All participants are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md). Our standalone open-source companion projects—[Ministry AI Skills](https://github.com/asjames18/ministry-ai-skills) and [Agent Tool Assurance Kit](https://github.com/asjames18/agent-tool-assurance)—are open for contributions to modular skills, prompts, JSON schemas, policy contracts, synthetic fixtures, and public governance materials.

## Branding, trademarks, and forks

The [MIT License](LICENSE) applies to the repository's software code. It does **not** grant permission to present a fork or derivative as Melanated In Tech, use the Melanated In Tech name or logos as your own identity, use official domains or accounts, or imply endorsement or affiliation.

Before publicly deploying or marketing a fork, adopt a distinct name and replace all Melanated In Tech logos, favicons, social-preview artwork, site metadata, contact information, and official links. See [TRADEMARKS.md](TRADEMARKS.md), [BRAND_ASSETS.md](BRAND_ASSETS.md), and [NOTICE](NOTICE) for the full policy and a practical rebranding checklist.

## License

This repository is released under the [MIT License](LICENSE). [Ministry AI Skills](https://github.com/asjames18/ministry-ai-skills) and the [Agent Tool Assurance Kit](https://github.com/asjames18/agent-tool-assurance) are separately released under the MIT License.
