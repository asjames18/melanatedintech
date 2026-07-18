# Supabase Migration Reconciliation - Completed July 15, 2026

## Connection

- **Workspace project reference:** `ldfolayhbayjsgsnlavx`
- **Connector project reference:** `ldfolayhbayjsgsnlavx`
- **Project state at review:** `ACTIVE_HEALTHY`
- **Initial review mode:** Read-only
- **Authorized execution:** The user later approved local corrections, migration-history reconciliation, and production migration application

## Completion result

- Local migration files: **67**
- Remote migration records: **67**
- Local versions missing remotely: **0**
- Remote versions missing locally: **0**
- Version/name mismatches: **0**
- July 2-8 effects were fingerprinted and marked applied without replaying their older content SQL.
- The July 15 truthfulness, article, consolidation, publication, and product migrations were applied individually and verified.
- The July 15 privileged-function hardening migration was applied and verified against the security advisor.
- Forty-four article rows are consistently public (`status = 'published'` and `published = true`).
- Four duplicate article rows are retained as unpublished drafts for editorial history.
- The primary AI-agent pillar and three flagship product pages return HTTP 200 with the expected production titles.
- The full production application build passes.

## Baseline before reconciliation

- 46 articles with `status = 'published'`
- 86 products with `status = 'published'`
- 29 agents with `status = 'published'`
- 5 learning paths
- 34 learning-path items
- RLS enabled on the public catalog and user-data tables returned by the connector

## Original drift finding

Supabase records 36 applied migrations. The workspace contains 63 SQL migration files. Twenty-eight local versions are not present in `supabase_migrations` history.

The missing-history set is not equivalent to "not applied." Live rows and tables prove that several migrations' effects already exist. Examples:

- The products table has 86 rows and includes the July 8 seeded products.
- Social/community tables created by the July 8 migration exist.
- The cost, evaluation, and ministry canonical articles contain the July 15 rewrites.
- The duplicate evaluation and ministry article rows are drafts.

Running all 28 local files would therefore be unsafe. Older July content migrations could overwrite newer July 15 rewrites, and duplicated schema/data operations could fail or create misleading history.

## Dashboard activity found in logs

Postgres logs show a Supabase Dashboard session attempted long July 15 statements around 17:57-17:59 UTC. Some statements completed and at least two failed with `unterminated dollar-quoted string`, indicating that only part of a long migration reached the SQL editor or query runner.

The affected SQL included:

- the cost-control article rewrite;
- the AI Agent Evaluation & Safety Kit fulfillment;
- additional statements that produced syntax errors.

The article rows show completed updates, while the evaluation product remains in its previous free/thin state. None of these direct dashboard statements created a migration-history entry.

## Resolved canonical publication mismatch

The earlier mismatch between `articles.status` and the legacy `articles.published` boolean is resolved. A dedicated migration aligned all article rows, and a follow-up migration suppressed the old `what-is-an-ai-agent` duplicate while keeping `ai-agents-in-plain-english` canonical.

## Reconciliation sequence used

The following ordered process was completed. It remains the required pattern for future production content batches.

### 1. Freeze ad hoc dashboard writes

Do not paste additional long migrations into the SQL editor while reconciliation is in progress. One writer and one ordered migration path should own the change set.

### 2. Fingerprint the ten older unrecorded July migrations

For each migration from `20260702151600` through `20260708124500`, compare its intended tables, columns, row slugs, and content fingerprints with live state.

If the complete intended effect is present, mark the version as applied without executing its SQL. If only part is present, write a new idempotent reconciliation migration rather than rerunning an old content expansion that can overwrite newer content.

### 3. Correct the pending product migration files

Before applying the flagship product work:

- change product `status` expressions to plain text because the live `products.status` column is `text`, not `publish_status`;
- rename the ministry product migration from invalid timestamp `20260715136000` to a valid later timestamp;
- validate every dollar-quote delimiter and SQL statement length;
- retain the exact Markdown delivery, setup exclusions, version, and license copy.

### 4. Record and apply the July 15 set in order

Use the Supabase migration connector rather than raw dashboard SQL. Apply one named migration at a time and verify its target rows before continuing. The content rewrites are idempotent updates, so reapplying their full statements through the migration API can both restore complete content and create an official migration record.

Recommended order:

1. Phase 1 truthfulness and attribution fixes
2. Beginner and technical article rewrites
3. Cost, evaluation, and ministry consolidations
4. Canonical publication-flag alignment
5. Flagship product and free-workbook migrations

### 5. Verify after every application batch

- Migration appears in Supabase history
- Target row count and slug match expectation
- Canonical article is published and duplicate is draft
- Fulfillment length and tier/price match the product specification
- Public queries do not expose premium `unlock_content`
- Learning-path references resolve
- Security and performance advisors are reviewed
- Production site route and checkout behavior are tested separately

## Website deployment result

The database changes and four permanent redirects are live and verified. A redirect-only release was isolated from the dirty worktree and deployed to Cloudflare Worker version `42098df6-0d9a-40b2-bee0-a8cb173f2235`. Each retired article URL returns HTTP 301 to its canonical article, and the homepage, canonical articles, and flagship product pages continue to return HTTP 200.
