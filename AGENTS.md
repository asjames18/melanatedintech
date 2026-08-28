# Agent Guidance for Melanated In Tech

## Repository scope

This repository contains the Melanated In Tech web application and its supporting public assets, server functions, Supabase migrations, and Cloudflare Worker deployment configuration. Preserve the existing product direction: practical AI tools, responsible automation, revenue-recovery systems, education, and open contribution.

Treat the application as a production system. Before changing behavior, identify the affected route, server function, database migration, external integration, and user-facing privacy or consent implications. Keep changes focused and avoid unrelated refactors.

## Development workflow

Use the repository's declared Node.js and package-manager setup. Install dependencies from the committed `bun.lock` when possible. The primary commands are:

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run smoke
npm run check
```

Run `npm run check` before requesting review or pushing a behavioral change. It runs lint, TypeScript validation, the production build, and the Worker smoke test. Existing lint warnings may remain, but new errors or warnings in changed files should be addressed. Use `npm run format:check` when formatting is part of the change and `npm run audit:links` when modifying routes or internal links.

Generated route metadata and build output may be rewritten by the build. Review `git status` after validation and do not commit generated churn unless the project workflow requires it for the change. Do not commit `node_modules`, local screenshots, temporary reports, `.env` files, API tokens, service-role credentials, or generated deployment credentials.

## Application and data boundaries

Use the existing TanStack Start/Router patterns, shared components, server functions, and Supabase access helpers. Keep authorization checks on the server and do not treat client-side visibility as permission enforcement. Database schema changes belong in timestamped Supabase migrations and must include the narrowest appropriate policies.

Do not expose personal information in analytics, logs, reports, or test artifacts. Prefer aggregate or category-level metrics. Never retrieve or retain subscriber addresses, email bodies, notification text, private profile information, payment data, access tokens, or secret values unless the task explicitly requires a controlled operation and the data can be handled securely.

Marketing and email behavior must remain consent-based. Do not email anonymous visitors. Preserve explicit opt-in, confirmation, unsubscribe, suppression, idempotency, and delivery-queue protections. Transactional checklist delivery and promotional nurture are separate behaviors; never enable promotional follow-up implicitly. Do not invent a business mailing address. Any commercial-email activation requires a genuine authorized postal address and explicit approval from the owner.

## Production deployment

The production application is deployed to the existing Cloudflare Worker through the repository workflow:

```bash
npm run deploy:cloudflare
```

Before deployment, confirm that the intended branch and commit are correct, run `npm run check`, and inspect the generated deployment configuration. Preserve existing Worker bindings, static assets, compatibility settings, observability, routes, domain configuration, invoice and revenue-recovery systems, and unrelated infrastructure. Do not change DNS or unrelated Cloudflare settings as part of an application release.

Use short-lived deployment credentials only through protected environment variables or secure secret bindings. Never place credentials in source files, shell history, commit messages, logs, screenshots, or documentation. Remove temporary credential files after deployment and verify the working tree is clean. After deployment, run public smoke checks for the affected routes and perform a redacted binding-continuity check when the release changes Worker configuration.

## Authenticated testing

Use a dedicated or owner-approved test account. Read-only testing is the default. Verify loading, authorization, navigation, empty states, forms, notifications, and responsive behavior without publishing posts, sending messages, submitting inquiries, changing settings, making purchases, or enabling campaigns unless the owner explicitly approves that exact action. Record findings without retaining user identity, private content, or secrets.

For mobile work, test at narrow phone widths as well as a standard phone and tablet breakpoint. Fixed navigation must reserve safe-area space, controls must remain readable and tappable, and desktop layouts must not regress.

## Security and public contribution

Report suspected vulnerabilities privately according to [`SECURITY.md`](SECURITY.md), not through public issues or pull requests. Follow [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) for community participation. Before proposing a substantial change, open or comment on an issue with the problem, intended scope, user impact, and data-handling implications.

The MIT License applies to the software code. It does not grant permission to use Melanated In Tech branding, official domains, logos, social-preview artwork, or an implication of endorsement. Forks and derivative deployments must adopt a distinct identity and follow [`TRADEMARKS.md`](TRADEMARKS.md), [`BRAND_ASSETS.md`](BRAND_ASSETS.md), and [`NOTICE`](NOTICE).

## Change checklist

Before opening a pull request or pushing directly to the protected main branch:

1. Confirm the change has a clear issue, request, or documented owner approval.
2. Review all affected routes, server functions, database policies, and integrations.
3. Preserve consent, privacy, suppression, authorization, and payment boundaries.
4. Run `npm run check` and any relevant route or link audit.
5. Test the affected public and authenticated paths without destructive actions.
6. Inspect `git diff` and `git status` for secrets, personal data, generated churn, and unrelated files.
7. Use a precise commit message and report validation results.
8. For deployment, confirm that DNS and unrelated Cloudflare configuration remain untouched.

## Related guidance

See [`README.md`](README.md) for product context and contributor expectations, [`SECURITY.md`](SECURITY.md) for vulnerability reporting, and [`docs/launch-ops-checklist.md`](docs/launch-ops-checklist.md) for launch operations.
