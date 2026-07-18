// Generates branded 1200x630 Open Graph images for every published article,
// agent, and product into public/og/{type}/{slug}.png, plus a manifest at
// src/lib/og-manifest.json that routes use to decide whether a per-page image
// exists (falling back to /og-default.png otherwise).
//
// Run before deploy: npm run generate:og
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { createClient } from "@supabase/supabase-js";

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

// ── fonts (satori supports woff, not woff2) ───────────────────────────────────
const font = (pkg, file) => readFileSync(join(root, "node_modules", "@fontsource", pkg, "files", file));
const fonts = [
  { name: "Space Grotesk", weight: 600, style: "normal", data: font("space-grotesk", "space-grotesk-latin-600-normal.woff") },
  { name: "Inter", weight: 400, style: "normal", data: font("inter", "inter-latin-400-normal.woff") },
  { name: "Inter", weight: 500, style: "normal", data: font("inter", "inter-latin-500-normal.woff") },
];

// ── brand template (hex approximations of the OKLCH tokens in styles.css) ─────
const BG = "#221a12"; // dark warm charcoal (--brand)
const SAND = "#e7d9c3"; // light sand (dark-mode --primary)
const TEAL = "#2b90a8"; // --accent2
const MUTED = "#a4937d";

// Satori misparses `children: []` on childless nodes — omit the key entirely.
const h = (type, props, ...children) => ({
  type,
  props: {
    ...props,
    ...(children.length > 0 ? { children: children.length === 1 ? children[0] : children } : {}),
  },
});

function card({ eyebrow, title, footer }) {
  const t = title.length > 110 ? `${title.slice(0, 107)}...` : title;
  const titleSize = t.length > 70 ? 52 : t.length > 40 ? 62 : 72;
  return h(
    "div",
    {
      style: {
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        backgroundColor: BG,
        backgroundImage:
          "radial-gradient(circle at 85% 8%, rgba(43,144,168,0.20), rgba(43,144,168,0) 42%), radial-gradient(circle at 8% 95%, rgba(231,217,195,0.12), rgba(231,217,195,0) 38%)",
        fontFamily: "Inter",
        color: SAND,
      },
    },
    h(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 14 } },
      h("div", { style: { width: 14, height: 14, borderRadius: 7, backgroundColor: TEAL } }),
      h(
        "div",
        { style: { fontSize: 26, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase", color: MUTED } },
        eyebrow,
      ),
    ),
    h(
      "div",
      {
        style: {
          fontFamily: "Space Grotesk",
          fontSize: titleSize,
          fontWeight: 600,
          lineHeight: 1.12,
          color: SAND,
          maxWidth: 1020,
        },
      },
      t,
    ),
    h(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
      h(
        "div",
        { style: { fontFamily: "Space Grotesk", fontSize: 32, fontWeight: 600, color: SAND } },
        "Melanated In Tech",
      ),
      h("div", { style: { fontSize: 26, color: MUTED } }, footer),
    ),
  );
}

async function render(outPath, props) {
  let svg;
  try {
    svg = await satori(card(props), { width: 1200, height: 630, fonts });
  } catch (e) {
    console.error(`satori failed for ${outPath}: ${String(e?.message ?? e).slice(0, 500)}`);
    process.exit(1);
  }
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, png);
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
for (const [label, res] of [["articles", articles], ["agents", agents], ["products", products]]) {
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
  await render(join(root, "public", "og", job.dir, `${job.slug}.png`), job);
  manifest[job.dir].push(job.slug);
  done++;
  if (done % 25 === 0) console.log(`  ${done}/${jobs.length}`);
}
for (const key of Object.keys(manifest)) manifest[key].sort();

writeFileSync(join(root, "src", "lib", "og-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `Generated ${done} OG images (${manifest.knowledge.length} articles, ${manifest.agents.length} agents, ${manifest.products.length} products).`,
);
