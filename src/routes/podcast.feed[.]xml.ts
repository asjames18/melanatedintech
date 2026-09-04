import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_URL } from "@/lib/site";
import { PODCAST, RELEASED_EPISODES, itunesDuration } from "@/lib/podcast";
import { absoluteUrl as absolute, cdata, escapeXml, rfc822, xmlLines } from "@/lib/xml";

const FEED_PATH = "/podcast/feed.xml";

/**
 * The podcast section is retired: /podcast answers 302 -> /knowledge.
 *
 * Serving a 200 feed for a section that no longer exists keeps podcast
 * directories polling it and keeps existing subscribers receiving a channel
 * they cannot click through to. 410 Gone is the one status aggregators treat
 * as "stop asking" — 404 leaves most of them retrying for months.
 *
 * The episode data and the generator below are intact. Flip this to false to
 * bring the feed back when the section returns.
 */
const PODCAST_RETIRED = true;

export const Route = createFileRoute("/podcast/feed.xml")({
  server: {
    handlers: {
      GET: () => {
        if (PODCAST_RETIRED) {
          return new Response(
            "The Melanated In Tech podcast feed has been retired. Current writing lives at https://melanatedintech.com/knowledge",
            {
              status: 410,
              headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "public, max-age=86400",
              },
            },
          );
        }

        const episodes = [...RELEASED_EPISODES].sort((a, b) =>
          a.publishedAt === b.publishedAt
            ? b.episodeNumber - a.episodeNumber
            : b.publishedAt.localeCompare(a.publishedAt),
        );

        const explicit = PODCAST.explicit ? "true" : "false";
        const latest = episodes[0];

        const items = episodes.map((ep) => {
          return xmlLines([
            `    <item>`,
            `      <title>${escapeXml(ep.title)}</title>`,
            `      <link>${absolute("/podcast")}</link>`,
            `      <guid isPermaLink="false">${escapeXml(`${SITE_URL}/podcast#${ep.id}`)}</guid>`,
            `      <pubDate>${rfc822(ep.publishedAt)}</pubDate>`,
            `      <description>${cdata(ep.summary)}</description>`,
            `      <itunes:title>${escapeXml(ep.title)}</itunes:title>`,
            `      <itunes:subtitle>${escapeXml(ep.subtitle)}</itunes:subtitle>`,
            `      <itunes:summary>${cdata(ep.summary)}</itunes:summary>`,
            `      <itunes:author>${escapeXml(PODCAST.author)}</itunes:author>`,
            `      <itunes:episode>${ep.episodeNumber}</itunes:episode>`,
            `      <itunes:episodeType>full</itunes:episodeType>`,
            ep.durationSeconds
              ? `      <itunes:duration>${itunesDuration(ep.durationSeconds)}</itunes:duration>`
              : null,
            `      <itunes:explicit>${explicit}</itunes:explicit>`,
            `      <enclosure url="${escapeXml(absolute(ep.audioUrl))}" length="${ep.audioBytes ?? 0}" type="${ep.audioType ?? "audio/mp4"}" />`,
            `    </item>`,
          ]);
        });

        const xml = xmlLines([
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">`,
          `  <channel>`,
          `    <title>${escapeXml(PODCAST.title)}</title>`,
          `    <link>${absolute("/podcast")}</link>`,
          `    <atom:link href="${absolute(FEED_PATH)}" rel="self" type="application/rss+xml" />`,
          `    <language>${PODCAST.language}</language>`,
          `    <copyright>${escapeXml(PODCAST.copyright)}</copyright>`,
          `    <description>${cdata(PODCAST.description)}</description>`,
          latest ? `    <lastBuildDate>${rfc822(latest.publishedAt)}</lastBuildDate>` : null,
          `    <itunes:author>${escapeXml(PODCAST.author)}</itunes:author>`,
          `    <itunes:subtitle>${escapeXml(PODCAST.subtitle)}</itunes:subtitle>`,
          `    <itunes:summary>${cdata(PODCAST.description)}</itunes:summary>`,
          `    <itunes:type>episodic</itunes:type>`,
          `    <itunes:explicit>${explicit}</itunes:explicit>`,
          `    <itunes:image href="${absolute(PODCAST.image)}" />`,
          `    <itunes:category text="${escapeXml(PODCAST.category)}" />`,
          `    <itunes:owner>`,
          `      <itunes:name>${escapeXml(PODCAST.author)}</itunes:name>`,
          `      <itunes:email>${escapeXml(PODCAST.ownerEmail)}</itunes:email>`,
          `    </itunes:owner>`,
          ...items,
          `  </channel>`,
          `</rss>`,
        ]);

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
