import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
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
  const [q, setQ] = useState("");

  const filtered = agents.filter((a) => {
    const matchCat = cat === "All" || a.category === cat;
    const matchTier = tier === "All" || a.tier === tier;
    const needle = q.trim().toLowerCase();
    const matchQ =
      !needle ||
      a.name.toLowerCase().includes(needle) ||
      a.tagline.toLowerCase().includes(needle) ||
      (a.capabilities ?? []).some((c) => c.toLowerCase().includes(needle));
    return matchCat && matchTier && matchQ;
  });

  const hasFilters = cat !== "All" || tier !== "All" || q.length > 0;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Marketplace"
        title="AI agents that ship outcomes."
        description="Every agent here is built around a real workflow. Filter by use case or tier to find what fits."
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search agents, capabilities, use cases…"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-primary/20"
                aria-label="Search agents"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {filtered.length} {filtered.length === 1 ? "agent" : "agents"}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  cat === c
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
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
                className={`rounded-full border px-3 py-1.5 text-xs capitalize transition-colors ${
                  tier === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
            {hasFilters && (
              <button
                onClick={() => { setCat("All"); setTier("All"); setQ(""); }}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <AgentCard key={a.id} {...a} capabilities={a.capabilities} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-sm font-medium">No agents match this filter.</p>
            <p className="mt-1 text-xs text-muted-foreground">Try clearing filters or searching a different keyword.</p>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
