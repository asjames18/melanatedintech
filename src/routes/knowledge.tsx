import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { ArticleCard } from "@/components/cards";
import { Pagination } from "@/components/pagination";
import { ListingPendingShell } from "@/components/listing-skeleton";
import { listArticles } from "@/lib/public.functions";

const PAGE_SIZE = 9;

const qo = queryOptions({ queryKey: ["articles"], queryFn: () => listArticles() });

const searchSchema = z.object({
  page: fallback(z.number().int().min(1), 1).default(1),
  category: fallback(z.string(), "All").default("All"),
});

type Length = "All" | "Quick" | "Medium" | "Deep";
const LENGTHS: Length[] = ["All", "Quick", "Medium", "Deep"];
const lengthOf = (m: number): Exclude<Length, "All"> =>
  m <= 5 ? "Quick" : m <= 9 ? "Medium" : "Deep";

export const Route = createFileRoute("/knowledge")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Agent Knowledge Hub — Melanated In Tech" },
      { name: "description", content: "Guides, frameworks, and field notes on AI agents — memory, MCP, multi-agent systems, local AI, and more." },
      { property: "og:title", content: "AI Agent Knowledge Hub" },
      { property: "og:description", content: "Practical knowledge for people building AI agents." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  pendingMs: 0,
  pendingComponent: () => <SiteLayout><ListingPendingShell variant="article" label="articles" /></SiteLayout>,
  errorComponent: ({ error }) => <SiteLayout><div className="p-12 text-center text-sm text-muted-foreground">{error.message}</div></SiteLayout>,
  notFoundComponent: () => <SiteLayout><div className="p-12">Not found.</div></SiteLayout>,
  component: KnowledgeIndex,
});

function KnowledgeIndex() {
  const { data: articles } = useSuspenseQuery(qo);
  const { page, category: urlCategory } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(articles.map((a) => a.category))).sort()],
    [articles],
  );
  const [cat, setCat] = useState(urlCategory ?? "All");
  const [len, setLen] = useState<Length>("All");
  const [q, setQ] = useState("");

  // Keep local state in sync when URL changes (e.g. clicking a reason chip).
  useEffect(() => { if (urlCategory && urlCategory !== cat) setCat(urlCategory); }, [urlCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = articles.filter((a) => {
    const matchCat = cat === "All" || a.category === cat;
    const matchLen = len === "All" || lengthOf(a.read_minutes ?? 0) === len;
    const needle = q.trim().toLowerCase();
    const matchQ =
      !needle ||
      a.title.toLowerCase().includes(needle) ||
      (a.excerpt ?? "").toLowerCase().includes(needle);
    return matchCat && matchLen && matchQ;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // When filter changes, reset page + reflect category in URL.
  useEffect(() => {
    navigate({
      search: (prev: { page: number; category: string }) => ({ ...prev, page: 1, category: cat === "All" ? "All" : cat }),
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, len, q]);

  const setPage = (p: number) => {
    navigate({ search: (prev: { page: number; category: string }) => ({ ...prev, page: p }) });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasFilters = cat !== "All" || len !== "All" || q.length > 0;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Knowledge hub"
        title="Practical knowledge for AI agent builders."
        description="No hype. No 101 fluff. Just the frameworks, patterns, and field notes that hold up in production."
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search articles, topics, frameworks…"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-primary/20"
                aria-label="Search articles"
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
              {filtered.length} {filtered.length === 1 ? "article" : "articles"}
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
            {LENGTHS.map((l) => (
              <button
                key={l}
                onClick={() => setLen(l)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  len === l
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
                title={l === "Quick" ? "≤ 5 min" : l === "Medium" ? "6–9 min" : l === "Deep" ? "10+ min" : "Any length"}
              >
                {l}
              </button>
            ))}
            {hasFilters && (
              <button
                onClick={() => { setCat("All"); setLen("All"); setQ(""); }}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        <div key={safePage} className="mt-8 grid animate-fade-in gap-5 md:grid-cols-2 lg:grid-cols-3">
          {paged.map((a) => (
            <ArticleCard key={a.id} {...a} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-sm font-medium">No articles match this filter.</p>
            <p className="mt-1 text-xs text-muted-foreground">Try clearing filters or searching a different keyword.</p>
          </div>
        )}

        <Pagination
          page={safePage}
          pageCount={pageCount}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          label="articles"
          onChange={setPage}
        />
      </section>
    </SiteLayout>
  );
}
