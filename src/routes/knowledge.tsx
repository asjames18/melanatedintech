import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { ArticleCard } from "@/components/cards";
import { listArticles } from "@/lib/public.functions";

const qo = queryOptions({ queryKey: ["articles"], queryFn: () => listArticles() });

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Agent Knowledge Hub — Melanated In Tech" },
      { name: "description", content: "Guides, frameworks, and field notes on AI agents — memory, MCP, multi-agent systems, local AI, and more." },
      { property: "og:title", content: "AI Agent Knowledge Hub" },
      { property: "og:description", content: "Practical knowledge for people building AI agents." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  errorComponent: ({ error }) => <SiteLayout><div className="p-12 text-center text-sm text-muted-foreground">{error.message}</div></SiteLayout>,
  notFoundComponent: () => <SiteLayout><div className="p-12">Not found.</div></SiteLayout>,
  component: KnowledgeIndex,
});

function KnowledgeIndex() {
  const { data: articles } = useSuspenseQuery(qo);
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(articles.map((a) => a.category)))],
    [articles],
  );
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? articles : articles.filter((a) => a.category === cat);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Knowledge hub"
        title="Practical knowledge for AI agent builders."
        description="No hype. No 101 fluff. Just the frameworks, patterns, and field notes that hold up in production."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                cat === c
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <ArticleCard key={a.id} {...a} />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
