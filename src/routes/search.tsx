import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import Fuse from "fuse.js";
import { Search as SearchIcon, X } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { ArticleCard, AgentCard, ProductCard } from "@/components/cards";
import { ListingPendingShell } from "@/components/listing-skeleton";
import { listArticles, listAgents, listProducts } from "@/lib/public.functions";
import { buildSeoMeta } from "@/lib/seo";

const articlesQO = queryOptions({ queryKey: ["articles"], queryFn: () => listArticles() });
const agentsQO = queryOptions({ queryKey: ["agents"], queryFn: () => listAgents() });
const productsQO = queryOptions({ queryKey: ["products"], queryFn: () => listProducts() });

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  type: fallback(z.enum(["all", "agents", "articles", "products"]), "all").default("all"),
});

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: buildSeoMeta({
      title: "Search — Melanated In Tech",
      description: "Search agents, knowledge, and digital products across Melanated In Tech.",
      url: "/search",
    }),
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(articlesQO),
      context.queryClient.ensureQueryData(agentsQO),
      context.queryClient.ensureQueryData(productsQO),
    ]);
    return null;
  },
  pendingComponent: () => (
    <SiteLayout>
      <ListingPendingShell variant="article" label="results" />
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="p-12 text-center text-sm text-muted-foreground">{error.message}</div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="p-12">Not found.</div>
    </SiteLayout>
  ),
  component: SearchPage,
});

const TYPE_LABELS = [
  { value: "all", label: "Everything" },
  { value: "agents", label: "Agents" },
  { value: "articles", label: "Knowledge" },
  { value: "products", label: "Products" },
] as const;

function SearchPage() {
  const { q, type } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: articles } = useSuspenseQuery(articlesQO);
  const { data: agents } = useSuspenseQuery(agentsQO);
  const { data: products } = useSuspenseQuery(productsQO);

  const articlesFuse = useMemo(
    () =>
      new Fuse(articles, {
        keys: ["title", "excerpt", "category"],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [articles],
  );
  const agentsFuse = useMemo(
    () =>
      new Fuse(agents, {
        keys: ["name", "tagline", "category", "capabilities"],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [agents],
  );
  const productsFuse = useMemo(
    () =>
      new Fuse(products, {
        keys: ["name", "tagline", "category"],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [products],
  );

  const needle = q.trim();
  const articleHits = needle
    ? articlesFuse.search(needle).map((r) => r.item)
    : articles.slice(0, 6);
  const agentHits = needle ? agentsFuse.search(needle).map((r) => r.item) : agents.slice(0, 6);
  const productHits = needle
    ? productsFuse.search(needle).map((r) => r.item)
    : products.slice(0, 6);

  const showAgents = type === "all" || type === "agents";
  const showArticles = type === "all" || type === "articles";
  const showProducts = type === "all" || type === "products";

  const totalHits =
    (showAgents ? agentHits.length : 0) +
    (showArticles ? articleHits.length : 0) +
    (showProducts ? productHits.length : 0);

  const setQ = (next: string) =>
    navigate({
      search: (prev: { q: string; type: typeof type }) => ({ ...prev, q: next }),
      replace: true,
    });
  const setType = (next: typeof type) =>
    navigate({
      search: (prev: { q: string; type: typeof type }) => ({ ...prev, type: next }),
      replace: true,
    });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Search"
        title="Find agents, knowledge, and products."
        description="One place to search across the marketplace, knowledge hub, and digital products."
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search agents, articles, products…"
              className="w-full rounded-lg border border-border bg-background py-3 pl-9 pr-9 text-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-primary/20"
              aria-label="Search"
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
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {TYPE_LABELS.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  type === t.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-muted-foreground" aria-live="polite">
              {needle ? `${totalHits} result${totalHits === 1 ? "" : "s"}` : "Showing recent items"}
            </span>
          </div>
        </div>

        {showAgents && agentHits.length > 0 && (
          <ResultGroup title="Agents" href="/agents">
            {agentHits.slice(0, 9).map((a) => (
              <AgentCard key={a.id} {...a} />
            ))}
          </ResultGroup>
        )}
        {showArticles && articleHits.length > 0 && (
          <ResultGroup title="Knowledge" href="/knowledge">
            {articleHits.slice(0, 9).map((a) => (
              <ArticleCard key={a.id} {...a} />
            ))}
          </ResultGroup>
        )}
        {showProducts && productHits.length > 0 && (
          <ResultGroup title="Products" href="/products">
            {productHits.slice(0, 9).map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </ResultGroup>
        )}

        {needle && totalHits === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-sm font-medium">No matches for "{needle}".</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a broader keyword or switch the type filter.
            </p>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function ResultGroup({
  title,
  href,
  children,
}: {
  title: string;
  href: "/agents" | "/knowledge" | "/products";
  children: React.ReactNode;
}) {
  return (
    <div className="mt-10">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <Link to={href} className="text-xs text-muted-foreground hover:text-foreground">
          Browse all →
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}
