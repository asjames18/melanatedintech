import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// TODO: replace with your project URL once a project name or custom domain is set.
const BASE_URL = "";

const STATIC_PATHS = [
  { path: "/", changefreq: "weekly" as const, priority: "1.0" },
  { path: "/agents", changefreq: "daily" as const, priority: "0.9" },
  { path: "/knowledge", changefreq: "daily" as const, priority: "0.9" },
  { path: "/products", changefreq: "weekly" as const, priority: "0.8" },
  { path: "/services", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/community", changefreq: "monthly" as const, priority: "0.6" },
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
        const supabase = createClient<Database>(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
        );

        const [agents, articles, products] = await Promise.all([
          supabase.from("agents").select("slug, updated_at"),
          supabase.from("articles").select("slug, updated_at, published_at"),
          supabase.from("products").select("slug, updated_at").eq("active", true),
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
