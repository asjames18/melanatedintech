// Generates the podcast artwork that the RSS feed and the /podcast page need:
//
//   public/podcast/artwork-1400.png  — square cover art for Apple Podcasts and
//                                      Spotify, which reject anything under
//                                      1400x1400 or non-square.
//   public/og/podcast.png            — 1200x630 social card for /podcast, which
//                                      otherwise falls back to /og-default.png.
//
// Unlike generate:og this needs no database, so it runs without Supabase creds.
// Run: npm run generate:podcast-art
import { join } from "node:path";
import { card, squareCard, renderPng, root } from "./lib/brand-card.mjs";

const ARTWORK_SIZE = 1400;

await renderPng(
  join(root, "public", "podcast", `artwork-${ARTWORK_SIZE}.png`),
  squareCard({
    eyebrow: "Podcast",
    title: "Practical AI Agents in Plain English",
    footer: "melanatedintech.com/podcast",
    size: ARTWORK_SIZE,
  }),
  { width: ARTWORK_SIZE, height: ARTWORK_SIZE },
);

await renderPng(
  join(root, "public", "og", "podcast.png"),
  card({
    eyebrow: "Podcast",
    title: "Melanated in Tech Podcast",
    footer: "melanatedintech.com/podcast",
  }),
  { width: 1200, height: 630 },
);

console.log(
  `Generated podcast artwork: public/podcast/artwork-${ARTWORK_SIZE}.png (${ARTWORK_SIZE}x${ARTWORK_SIZE}) and public/og/podcast.png (1200x630).`,
);
