import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE, SITE_URL } from "@/lib/site";
import { absoluteUrl, cdata, escapeXml, rfc822, xmlLines } from "@/lib/xml";
import { fetchRadarForPage } from "@/lib/radar-store.functions";
import { RADAR_SIGNALS, RADAR_TRACKS } from "@/lib/radar";

const FEED_PATH = "/radar/feed.xml";

export const Route = createFileRoute("/radar/feed.xml")({
  server: {
    handlers: {
      GET: async () => {
        const feed = await fetchRadarForPage({ data: { limit: 50 } });

        if (feed.items.length === 0) {
          // Every source failed. A 503 tells readers to retry rather than
          // caching an empty channel as the current state of the world.
          return new Response(`<!-- radar feed unavailable -->`, {
            status: 503,
            headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
          });
        }

        const items = feed.items.map((item) => {
          const track = RADAR_TRACKS[item.track];
          const description = [
            `${RADAR_SIGNALS[item.signal].label} · ${track.label} · ${item.source}`,
            item.summary,
            `Next step on ${SITE.name}: ${track.nextStep.label} — ${absoluteUrl(track.nextStep.to)}`,
          ]
            .filter(Boolean)
            .join("\n\n");

          return xmlLines([
            `    <item>`,
            `      <title>${escapeXml(item.title)}</title>`,
            `      <link>${escapeXml(item.url)}</link>`,
            `      <guid isPermaLink="false">${escapeXml(item.id)}</guid>`,
            `      <pubDate>${rfc822(item.publishedAt)}</pubDate>`,
            `      <category>${escapeXml(track.label)}</category>`,
            `      <category>${escapeXml(RADAR_SIGNALS[item.signal].label)}</category>`,
            `      <source url="${absoluteUrl(FEED_PATH)}">${escapeXml(item.source)}</source>`,
            `      <description>${cdata(description)}</description>`,
            `    </item>`,
          ]);
        });

        const xml = xmlLines([
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
          `  <channel>`,
          `    <title>${escapeXml(`${SITE.name} — AI & Agent Radar`)}</title>`,
          `    <link>${absoluteUrl("/radar")}</link>`,
          `    <atom:link href="${absoluteUrl(FEED_PATH)}" rel="self" type="application/rss+xml" />`,
          `    <language>en-us</language>`,
          `    <copyright>${escapeXml(`© ${new Date().getFullYear()} ${SITE.name}`)}</copyright>`,
          `    <description>${cdata(
            "Model releases, open weights, agent tooling, security findings, and research preprints — sorted by how much each one should change your next build.",
          )}</description>`,
          `    <lastBuildDate>${rfc822(feed.lastUpdated)}</lastBuildDate>`,
          `    <generator>${escapeXml(SITE_URL)}</generator>`,
          ...items,
          `  </channel>`,
          `</rss>`,
        ]);

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=900",
          },
        });
      },
    },
  },
});
