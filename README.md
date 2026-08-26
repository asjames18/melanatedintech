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

The public [Open Commons](https://melanatedintech.com/open-commons) page links to the independently reusable [Agent Tool Assurance Kit](https://github.com/asjames18/agent-tool-assurance), which has its own contribution model and MIT license.

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

Do not post security vulnerabilities, customer records, credentials, private prompts, payment data, or internal operational logs in public issues. Report a potential vulnerability privately to the repository owner through GitHub instead.

## Deployment

Deployments use the existing Cloudflare Worker and its configured bindings, static assets, domain, and DNS. An authorized maintainer can deploy a validated build with:

```bash
npm run deploy:cloudflare
```

Production secrets are configured outside this repository. Do not add secret values to `wrangler.jsonc`, tracked environment files, documentation, or Git history.

## Contributing

This repository is public for transparency and collaboration around the Melanated In Tech application. Before proposing a change, open or comment on an issue with the problem, the intended scope, and any user-facing or data-handling implications. Keep changes focused, add or update validation where practical, and run `npm run check` before requesting review.

The standalone [Agent Tool Assurance Kit](https://github.com/asjames18/agent-tool-assurance) is the recommended place for contributions to reusable policy contracts, synthetic fixtures, verification tools, and public governance materials.

## License and reuse

This repository is publicly viewable, but **no open-source reuse license has been selected for the application source, design assets, or operational materials**. Do not assume permission to copy, redistribute, or use this repository in another product until a license is added. The Agent Tool Assurance Kit is separately released under the MIT License.
