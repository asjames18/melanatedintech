import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/integrations/supabase/env";
import type { Database } from "@/integrations/supabase/types";
import { SITE_URL } from "@/lib/site";

const BASE_URL = SITE_URL;

const STATIC_PATHS = [
  { path: "/", changefreq: "weekly" as const, priority: "1.0" },
  { path: "/agents", changefreq: "daily" as const, priority: "0.9" },
  { path: "/paths", changefreq: "weekly" as const, priority: "0.9" },
  { path: "/knowledge", changefreq: "daily" as const, priority: "0.9" },
  { path: "/fit-finder", changefreq: "monthly" as const, priority: "0.8" },
  { path: "/challenges", changefreq: "weekly" as const, priority: "0.8" },
  { path: "/products", changefreq: "weekly" as const, priority: "0.8" },
  { path: "/services", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/proof", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/community", changefreq: "monthly" as const, priority: "0.6" },
  { path: "/search", changefreq: "weekly" as const, priority: "0.4" },
  { path: "/about", changefreq: "monthly" as const, priority: "0.5" },
  { path: "/contact", changefreq: "yearly" as const, priority: "0.4" },
];

type Entry = {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
};

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const supabase = createClient<Database>(getSupabaseUrl()!, getSupabasePublishableKey()!, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });

        const [agents, articles, products, paths, challenges, posts, authors] = await Promise.all([
          supabase.from("agents").select("slug, updated_at"),
          supabase.from("articles").select("slug, updated_at, published_at"),
          supabase.from("products").select("slug, updated_at").eq("active", true),
          supabase.from("learning_paths").select("slug, updated_at").eq("published", true),
          supabase.from("builder_challenges").select("slug, updated_at").eq("published", true),
          supabase.from("discussion_posts").select("id, updated_at").eq("locked", false),
          supabase.from("authors").select("slug, updated_at"),
        ]);

        const entries: Entry[] = [...STATIC_PATHS];

        for (const a of agents.data ?? []) {
          entries.push({
            path: `/agents/${a.slug}`,
            lastmod: a.updated_at ?? undefined,
            changefreq: "weekly",
            priority: "0.7",
          });
        }
        for (const a of articles.data ?? []) {
          entries.push({
            path: `/knowledge/${a.slug}`,
            lastmod: a.updated_at ?? a.published_at ?? undefined,
            changefreq: "monthly",
            priority: "0.7",
          });
        }
        for (const p of products.data ?? []) {
          entries.push({
            path: `/products/${p.slug}`,
            lastmod: p.updated_at ?? undefined,
            changefreq: "weekly",
            priority: "0.6",
          });
        }
        for (const path of paths.data ?? []) {
          entries.push({
            path: `/paths/${path.slug}`,
            lastmod: path.updated_at ?? undefined,
            changefreq: "weekly",
            priority: "0.7",
          });
        }
        for (const challenge of challenges.data ?? []) {
          entries.push({
            path: `/challenges/${challenge.slug}`,
            lastmod: challenge.updated_at ?? undefined,
            changefreq: "weekly",
            priority: "0.6",
          });
        }
        for (const post of posts.data ?? []) {
          entries.push({
            path: `/community/${post.id}`,
            lastmod: post.updated_at ?? undefined,
            changefreq: "weekly",
            priority: "0.5",
          });
        }
        for (const author of authors.data ?? []) {
          entries.push({
            path: `/authors/${author.slug}`,
            lastmod: author.updated_at ?? undefined,
            changefreq: "monthly",
            priority: "0.5",
          });
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
