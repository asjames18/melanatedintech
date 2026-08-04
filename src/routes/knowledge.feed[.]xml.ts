import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/integrations/supabase/env";
import type { Database } from "@/integrations/supabase/types";
import { SITE_URL, SITE } from "@/lib/site";
import { absoluteUrl, cdata, escapeXml, rfc822, xmlLines } from "@/lib/xml";

const FEED_PATH = "/knowledge/feed.xml";
/** Feed readers only need the newest slice; the sitemap covers the full archive. */
const MAX_ITEMS = 50;

export const Route = createFileRoute("/knowledge/feed.xml")({
  server: {
    handlers: {
      GET: async () => {
        const supabase = createClient<Database>(getSupabaseUrl()!, getSupabasePublishableKey()!, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });

        const now = new Date().toISOString();
        const publicStatus = `status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`;

        const { data, error } = await supabase
          .from("articles")
          .select("slug, title, excerpt, category, published_at, updated_at")
          .or(publicStatus)
          .order("published_at", { ascending: false })
          .limit(MAX_ITEMS);

        if (error) {
          return new Response(`<!-- feed unavailable -->`, {
            status: 503,
            headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
          });
        }

        const articles = data ?? [];
        const latest = articles[0];

        const items = articles.map((a) => {
          const url = absoluteUrl(`/knowledge/${a.slug}`);
          return xmlLines([
            `    <item>`,
            `      <title>${escapeXml(a.title)}</title>`,
            `      <link>${url}</link>`,
            `      <guid isPermaLink="true">${url}</guid>`,
            a.published_at ? `      <pubDate>${rfc822(a.published_at)}</pubDate>` : null,
            a.category ? `      <category>${escapeXml(a.category)}</category>` : null,
            a.excerpt ? `      <description>${cdata(a.excerpt)}</description>` : null,
            `    </item>`,
          ]);
        });

        const xml = xmlLines([
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
          `  <channel>`,
          `    <title>${escapeXml(`${SITE.name} — Knowledge Hub`)}</title>`,
          `    <link>${absoluteUrl("/knowledge")}</link>`,
          `    <atom:link href="${absoluteUrl(FEED_PATH)}" rel="self" type="application/rss+xml" />`,
          `    <language>en-us</language>`,
          `    <copyright>${escapeXml(`© ${new Date().getFullYear()} ${SITE.name}`)}</copyright>`,
          `    <description>${cdata("Practical AI agent playbooks, checklists, field guides, and operating templates for the people building, running, and securing agents.")}</description>`,
          latest?.updated_at
            ? `    <lastBuildDate>${rfc822(latest.updated_at)}</lastBuildDate>`
            : null,
          `    <generator>${escapeXml(SITE_URL)}</generator>`,
          ...items,
          `  </channel>`,
          `</rss>`,
        ]);

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=1800",
          },
        });
      },
    },
  },
});
