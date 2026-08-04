// Shared satori/resvg brand template used by generate-og.mjs (1200x630 social
// cards) and generate-podcast-art.mjs (square podcast artwork). Keeping one
// template means the OG cards and the podcast cover cannot drift apart.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// ── fonts (satori supports woff, not woff2) ───────────────────────────────────
const font = (pkg, file) =>
  readFileSync(join(root, "node_modules", "@fontsource", pkg, "files", file));

export const fonts = [
  {
    name: "Space Grotesk",
    weight: 600,
    style: "normal",
    data: font("space-grotesk", "space-grotesk-latin-600-normal.woff"),
  },
  {
    name: "Inter",
    weight: 400,
    style: "normal",
    data: font("inter", "inter-latin-400-normal.woff"),
  },
  {
    name: "Inter",
    weight: 500,
    style: "normal",
    data: font("inter", "inter-latin-500-normal.woff"),
  },
];

// ── brand template (hex approximations of the OKLCH tokens in styles.css) ─────
export const BG = "#221a12"; // dark warm charcoal (--brand)
export const SAND = "#e7d9c3"; // light sand (dark-mode --primary)
export const TEAL = "#2b90a8"; // --accent2
export const MUTED = "#a4937d";

// Satori misparses `children: []` on childless nodes — omit the key entirely.
export const h = (type, props, ...children) => ({
  type,
  props: {
    ...props,
    ...(children.length > 0 ? { children: children.length === 1 ? children[0] : children } : {}),
  },
});

const GRADIENT =
  "radial-gradient(circle at 85% 8%, rgba(43,144,168,0.20), rgba(43,144,168,0) 42%), radial-gradient(circle at 8% 95%, rgba(231,217,195,0.12), rgba(231,217,195,0) 38%)";

/** 1200x630 Open Graph / Twitter card. */
export function card({ eyebrow, title, footer }) {
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
        backgroundImage: GRADIENT,
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
        {
          style: {
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: MUTED,
          },
        },
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

/**
 * Square cover art. Apple Podcasts and Spotify both require square artwork
 * between 1400x1400 and 3000x3000, which the 1200x630 OG card cannot satisfy.
 */
export function squareCard({ eyebrow, title, footer, size = 1400 }) {
  const scale = size / 1400;
  const px = (n) => Math.round(n * scale);
  const t = title.length > 60 ? `${title.slice(0, 57)}...` : title;
  return h(
    "div",
    {
      style: {
        width: size,
        height: size,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: px(110),
        backgroundColor: BG,
        backgroundImage: GRADIENT,
        fontFamily: "Inter",
        color: SAND,
      },
    },
    h(
      "div",
      { style: { display: "flex", alignItems: "center", gap: px(20) } },
      h("div", {
        style: {
          width: px(22),
          height: px(22),
          borderRadius: px(11),
          backgroundColor: TEAL,
        },
      }),
      h(
        "div",
        {
          style: {
            fontSize: px(38),
            fontWeight: 500,
            letterSpacing: px(6),
            textTransform: "uppercase",
            color: MUTED,
          },
        },
        eyebrow,
      ),
    ),
    h(
      "div",
      {
        style: {
          display: "flex",
          fontFamily: "Space Grotesk",
          fontSize: t.length > 34 ? px(110) : px(140),
          fontWeight: 600,
          lineHeight: 1.05,
          color: SAND,
        },
      },
      t,
    ),
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: px(14) } },
      h(
        "div",
        { style: { fontFamily: "Space Grotesk", fontSize: px(52), fontWeight: 600, color: SAND } },
        "Melanated In Tech",
      ),
      h("div", { style: { fontSize: px(36), color: MUTED } }, footer),
    ),
  );
}

/** Renders a satori node tree to a PNG on disk. */
export async function renderPng(outPath, node, { width, height }) {
  let svg;
  try {
    svg = await satori(node, { width, height, fonts });
  } catch (e) {
    console.error(`satori failed for ${outPath}: ${String(e?.message ?? e).slice(0, 500)}`);
    process.exit(1);
  }
  const png = new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, png);
}

export { root };
