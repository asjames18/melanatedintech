// Reports which published articles fail the internal-linking and sourcing gates
// in docs/content-seo-roadmap-2026-07-15.md, ranked worst-first, and suggests
// same-cluster link targets for each gap.
//
// Read-only: this never writes to the database. It produces the worklist; a
// human decides which links actually help the reader.
//
// Run: npm run audit:links
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  for (const file of [".env", ".env.local"]) {
    const path = join(root, file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=("?)(.*)\2$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[3];
    }
  }
}
loadEnv();

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase URL/key env vars.");
  process.exit(1);
}

const MIN_INTERNAL_LINKS = 3;
const MIN_EXTERNAL_LINKS = 2;
const MIN_WORDS = 800;

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const now = new Date().toISOString();
const { data, error } = await sb
  .from("articles")
  .select("slug, title, category, body, updated_at")
  .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`);

if (error) {
  console.error(`Failed to fetch articles: ${error.message}`);
  process.exit(1);
}

const articles = data ?? [];
const bySlug = new Map(articles.map((a) => [a.slug, a]));

/** Markdown links whose target is a site-relative path or a melanatedintech.com URL. */
function internalTargets(body) {
  const found = new Set();
  for (const m of body.matchAll(/\]\((\/[^)\s]*|https?:\/\/(?:www\.)?melanatedintech\.com[^)\s]*)\)/g)) {
    found.add(m[1].replace(/^https?:\/\/(?:www\.)?melanatedintech\.com/, "").split("#")[0]);
  }
  return [...found];
}

function externalCount(body) {
  return new Set(
    [...body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)]
      .map((m) => m[1])
      .filter((u) => !/(?:www\.)?melanatedintech\.com/.test(u)),
  ).size;
}

const rows = articles.map((a) => {
  const body = a.body ?? "";
  const internal = internalTargets(body);
  // A link pointing at an article slug that no longer exists is worse than a
  // missing link — flag those separately so they get fixed first.
  const broken = internal.filter(
    (t) => t.startsWith("/knowledge/") && !bySlug.has(t.replace("/knowledge/", "")),
  );
  return {
    slug: a.slug,
    title: a.title,
    category: a.category,
    words: body.split(/\s+/).filter(Boolean).length,
    internal: internal.length,
    external: externalCount(body),
    broken,
  };
});

const gapScore = (r) =>
  Math.max(0, MIN_INTERNAL_LINKS - r.internal) * 3 +
  Math.max(0, MIN_EXTERNAL_LINKS - r.external) * 2 +
  (r.words < MIN_WORDS ? 2 : 0) +
  r.broken.length * 5;

const ranked = rows.filter((r) => gapScore(r) > 0).sort((a, b) => gapScore(b) - gapScore(a));

const lines = [];
lines.push(`# Internal linking and sourcing audit`);
lines.push(``);
lines.push(`**Generated:** ${new Date().toISOString().slice(0, 10)}  `);
lines.push(`**Published articles:** ${rows.length}  `);
lines.push(
  `**Gates:** >=${MIN_INTERNAL_LINKS} internal links, >=${MIN_EXTERNAL_LINKS} external references, >=${MIN_WORDS} words`,
);
lines.push(``);
lines.push(`| Gate | Passing |`);
lines.push(`|---|---:|`);
lines.push(
  `| Internal links | ${rows.filter((r) => r.internal >= MIN_INTERNAL_LINKS).length} / ${rows.length} |`,
);
lines.push(
  `| External references | ${rows.filter((r) => r.external >= MIN_EXTERNAL_LINKS).length} / ${rows.length} |`,
);
lines.push(`| Word count | ${rows.filter((r) => r.words >= MIN_WORDS).length} / ${rows.length} |`);
lines.push(
  `| No broken internal links | ${rows.filter((r) => r.broken.length === 0).length} / ${rows.length} |`,
);
lines.push(``);
lines.push(`## Worklist (worst gap first)`);
lines.push(``);
lines.push(`| # | Article | Cluster | Words | Internal | External | Suggested same-cluster targets |`);
lines.push(`|---:|---|---|---:|---:|---:|---|`);

ranked.forEach((r, i) => {
  const suggestions = rows
    .filter((o) => o.slug !== r.slug && o.category === r.category)
    .sort((a, b) => b.internal - a.internal)
    .slice(0, 3)
    .map((o) => `/knowledge/${o.slug}`)
    .join("<br>");
  const flag = r.broken.length ? ` **${r.broken.length} broken**` : "";
  lines.push(
    `| ${i + 1} | [${r.title}](/knowledge/${r.slug})${flag} | ${r.category} | ${r.words} | ${r.internal} | ${r.external} | ${suggestions || "—"} |`,
  );
});

const brokenAll = rows.filter((r) => r.broken.length);
if (brokenAll.length) {
  lines.push(``);
  lines.push(`## Broken internal links (fix first)`);
  lines.push(``);
  for (const r of brokenAll) {
    lines.push(`- \`${r.slug}\` → ${r.broken.map((b) => `\`${b}\``).join(", ")}`);
  }
}
lines.push(``);

const out = join(root, "docs", "internal-link-audit.md");
writeFileSync(out, `${lines.join("\n")}\n`);
console.log(`${ranked.length} of ${rows.length} articles have at least one gap.`);
console.log(`Wrote ${out}`);
