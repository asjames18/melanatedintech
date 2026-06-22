import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { AgentCard } from "@/components/cards";
import { listAgents } from "@/lib/public.functions";

const qo = queryOptions({ queryKey: ["agents"], queryFn: () => listAgents() });

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agent Marketplace — Melanated In Tech" },
      { name: "description", content: "Browse production-ready AI agents for ministries, businesses, sales, support, research, and creators." },
      { property: "og:title", content: "AI Agent Marketplace" },
      { property: "og:description", content: "Discover AI agents that ship real outcomes — not demos." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  errorComponent: ({ error }) => <SiteLayout><div className="p-12 text-center text-sm text-muted-foreground">{error.message}</div></SiteLayout>,
  notFoundComponent: () => <SiteLayout><div className="p-12">Not found.</div></SiteLayout>,
  component: AgentsIndex,
});

function AgentsIndex() {
  const { data: agents } = useSuspenseQuery(qo);
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(agents.map((a) => a.category)))],
    [agents],
  );
  const [cat, setCat] = useState<string>("All");
  const [tier, setTier] = useState<string>("All");

  const filtered = agents.filter(
    (a) => (cat === "All" || a.category === cat) && (tier === "All" || a.tier === tier),
  );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Marketplace"
        title="AI agents that ship outcomes."
        description="Every agent here is built around a real workflow. Filter by use case or tier to find what fits."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
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
          <span className="mx-2 h-5 w-px bg-border" />
          {["All", "free", "premium", "custom"].map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={`rounded-full border px-3 py-1.5 text-sm capitalize transition-colors ${
                tier === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <AgentCard key={a.id} {...a} capabilities={a.capabilities} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-12 text-center text-sm text-muted-foreground">No agents match this filter yet.</p>
        )}
      </section>
    </SiteLayout>
  );
}
