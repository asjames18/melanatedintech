import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/integrations/supabase/env";
import type { Database } from "@/integrations/supabase/types";
import { SITE_URL } from "@/lib/site";
import { NICHES } from "@/lib/playbook-data";

const BASE_URL = SITE_URL;

/**
 * Niche playbook pages enter the sitemap only once they carry niche-specific
 * FAQs — the uniqueness gate from docs/content-seo-roadmap-2026-07-15.md. Pages
 * that are still just the shared prompt list with a swapped noun stay out, so
 * they cannot be read as doorway pages.
 */
const INDEXABLE_NICHES = NICHES.filter((n) => (n.faqs?.length ?? 0) > 0);

const STATIC_PATHS = [
  { path: "/", changefreq: "weekly" as const, priority: "1.0" },
  { path: "/agents", changefreq: "daily" as const, priority: "0.9" },
  { path: "/systems", changefreq: "monthly" as const, priority: "0.9" },
  { path: "/systems/revenue-recovery", changefreq: "monthly" as const, priority: "0.8" },
  { path: "/systems/estimate-recovery", changefreq: "monthly" as const, priority: "0.8" },
  { path: "/systems/route-retention", changefreq: "monthly" as const, priority: "0.9" },
  { path: "/systems/client-recovery", changefreq: "monthly" as const, priority: "0.8" },
  { path: "/solutions/home-field-services", changefreq: "monthly" as const, priority: "0.8" },
  {
    path: "/solutions/project-estimate-businesses",
    changefreq: "monthly" as const,
    priority: "0.8",
  },
  {
    path: "/solutions/recurring-property-services",
    changefreq: "monthly" as const,
    priority: "0.9",
  },
  { path: "/solutions/beauty-personal-care", changefreq: "monthly" as const, priority: "0.8" },
  { path: "/get-a-demo", changefreq: "monthly" as const, priority: "0.9" },
  { path: "/paths", changefreq: "weekly" as const, priority: "0.9" },
  { path: "/knowledge", changefreq: "daily" as const, priority: "0.9" },
  { path: "/start-small", changefreq: "monthly" as const, priority: "0.9" },
  { path: "/strategy-sprint", changefreq: "monthly" as const, priority: "0.8" },
  { path: "/fit-finder", changefreq: "monthly" as const, priority: "0.8" },
  { path: "/diagnostic", changefreq: "weekly" as const, priority: "0.9" },
  // Tools hub + every interactive tool page
  { path: "/tools", changefreq: "monthly" as const, priority: "0.8" },
  { path: "/tools/prompt-pilot", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/tools/gpt-trainer", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/tools/model-playground", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/tools/agent-architect", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/tools/ai-playbook", changefreq: "monthly" as const, priority: "0.8" },
  { path: "/tools/mcp-builder", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/tools/eval-studio", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/tools/roi-calculator", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/tools/token-cost-calculator", changefreq: "monthly" as const, priority: "0.8" },
  { path: "/tools/revenue-leak-calculator", changefreq: "monthly" as const, priority: "0.8" },
  { path: "/tools/ai-readiness-assessment", changefreq: "monthly" as const, priority: "0.8" },
  { path: "/tools/json-schema-studio", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/tools/multi-agent-calculator", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/tools/prompt-guard-auditor", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/tools/workflow-spec-builder", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/tools/agent-sandbox", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/tools/sop-generator", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/tools/policy-generator", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/tools/ab-tester", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/tools/rag-chunker", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/tools/voice-agent-builder", changefreq: "monthly" as const, priority: "0.7" },
  // Free starter packs
  { path: "/starter-packs", changefreq: "monthly" as const, priority: "0.8" },
  { path: "/starter-packs/service-recovery-pack", changefreq: "monthly" as const, priority: "0.7" },
  {
    path: "/starter-packs/ministry-nonprofit-pack",
    changefreq: "monthly" as const,
    priority: "0.7",
  },
  { path: "/starter-packs/tech-freelancer-pack", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/starter-packs/education-it-pack", changefreq: "monthly" as const, priority: "0.7" },
  // Marketplace & content
  { path: "/challenges", changefreq: "weekly" as const, priority: "0.8" },
  { path: "/products", changefreq: "weekly" as const, priority: "0.8" },
  // Services hub + detail pages
  { path: "/services", changefreq: "monthly" as const, priority: "0.8" },
  { path: "/services/custom-agent-build", changefreq: "monthly" as const, priority: "0.8" },
  { path: "/services/ministry-ai-implementation", changefreq: "monthly" as const, priority: "0.8" },
  { path: "/services/ai-workshop", changefreq: "monthly" as const, priority: "0.8" },
  // Trust, community, tools & public assets
  { path: "/prompts", changefreq: "weekly" as const, priority: "0.8" },
  { path: "/mcp", changefreq: "weekly" as const, priority: "0.8" },
  { path: "/seller", changefreq: "monthly" as const, priority: "0.6" },
  { path: "/submit-agent", changefreq: "monthly" as const, priority: "0.6" },
  { path: "/interests", changefreq: "monthly" as const, priority: "0.5" },
  { path: "/proof", changefreq: "monthly" as const, priority: "0.7" },
  { path: "/community", changefreq: "monthly" as const, priority: "0.6" },
  { path: "/about", changefreq: "monthly" as const, priority: "0.5" },
  { path: "/contact", changefreq: "yearly" as const, priority: "0.4" },
  // /search is intentionally absent: the route sets `noindex, follow`, and
  // submitting a noindexed URL in the sitemap trips Search Console's
  // "Submitted URL marked 'noindex'" error and wastes crawl budget.
  { path: "/privacy", changefreq: "yearly" as const, priority: "0.2" },
  { path: "/terms", changefreq: "yearly" as const, priority: "0.2" },
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

        const now = new Date().toISOString();
        const publicStatus = `status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`;

        const [agents, articles, products, services, paths, challenges, authors] =
          await Promise.all([
            supabase.from("agents").select("slug, updated_at").or(publicStatus),
            supabase.from("articles").select("slug, updated_at, published_at").or(publicStatus),
            supabase.from("products").select("slug, updated_at").or(publicStatus),
            supabase.from("services").select("slug, updated_at").or(publicStatus),
            supabase.from("learning_paths").select("slug, updated_at").eq("published", true),
            supabase.from("builder_challenges").select("slug, updated_at").eq("published", true),
            supabase.from("authors").select("slug, updated_at"),
          ]);

        const entries: Entry[] = [...STATIC_PATHS];

        for (const niche of INDEXABLE_NICHES) {
          entries.push({
            path: `/ai-playbook-for/${niche.slug}`,
            changefreq: "monthly",
            priority: "0.6",
          });
        }

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
        for (const service of services.data ?? []) {
          entries.push({
            path: `/services/${service.slug}`,
            lastmod: service.updated_at ?? undefined,
            changefreq: "monthly",
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
