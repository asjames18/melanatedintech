// Generates branded 1200x630 Open Graph images for every published article,
// agent, and product into public/og/{type}/{slug}.png, plus a manifest at
// src/lib/og-manifest.json that routes use to decide whether a per-page image
// exists (falling back to /og-default.png otherwise).
//
// Run before deploy: npm run generate:og
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { card, renderPng } from "./lib/brand-card.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// ── env (.env is not auto-loaded outside vite) ────────────────────────────────
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

// ── data ──────────────────────────────────────────────────────────────────────
const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const now = new Date().toISOString();
const publicStatus = `status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`;

const [articles, agents, products] = await Promise.all([
  sb.from("articles").select("slug,title,category").or(publicStatus),
  sb.from("agents").select("slug,name,category").or(publicStatus),
  sb.from("products").select("slug,name,category").or(publicStatus),
]);
for (const [label, res] of [
  ["articles", articles],
  ["agents", agents],
  ["products", products],
]) {
  if (res.error) {
    console.error(`Failed to fetch ${label}: ${res.error.message}`);
    process.exit(1);
  }
}

const jobs = [
  ...(articles.data ?? []).map((a) => ({
    dir: "knowledge",
    slug: a.slug,
    eyebrow: `Knowledge Hub - ${a.category}`,
    title: a.title,
    footer: "melanatedintech.com/knowledge",
  })),
  ...(agents.data ?? []).map((a) => ({
    dir: "agents",
    slug: a.slug,
    eyebrow: `AI Agent - ${a.category}`,
    title: a.name,
    footer: "melanatedintech.com/agents",
  })),
  ...(products.data ?? []).map((p) => ({
    dir: "products",
    slug: p.slug,
    eyebrow: `Digital Product - ${p.category}`,
    title: p.name,
    footer: "melanatedintech.com/products",
  })),
];

const manifest = { knowledge: [], agents: [], products: [] };
let done = 0;
for (const job of jobs) {
  await renderPng(join(root, "public", "og", job.dir, `${job.slug}.png`), card(job), {
    width: 1200,
    height: 630,
  });
  manifest[job.dir].push(job.slug);
  done++;
  if (done % 25 === 0) console.log(`  ${done}/${jobs.length}`);
}
for (const key of Object.keys(manifest)) manifest[key].sort();

writeFileSync(
  join(root, "src", "lib", "og-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(
  `Generated ${done} OG images (${manifest.knowledge.length} articles, ${manifest.agents.length} agents, ${manifest.products.length} products).`,
);
