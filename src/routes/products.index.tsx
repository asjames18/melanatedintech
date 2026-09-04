import { createFileRoute, useNavigate, stripSearchParams } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { ProductCard } from "@/components/cards";
import { Pagination } from "@/components/pagination";
import { ListingPendingShell } from "@/components/listing-skeleton";
import { listProducts } from "@/lib/public.functions";
import { buildSeoMeta } from "@/lib/seo";

const PAGE_SIZE = 9;

const qo = queryOptions({ queryKey: ["products"], queryFn: () => listProducts() });

const searchSchema = z.object({
  page: fallback(z.number().int().min(1), 1).default(1),
  category: fallback(z.string(), "All").default("All"),
});

/** Mirrors the schema defaults above; both must stay in step. */
const SEARCH_DEFAULTS = { page: 1, category: "All" } as const;

export const Route = createFileRoute("/products/")({
  validateSearch: zodValidator(searchSchema),
  // Without this, a bare GET of this route answered 307 ->
  // ?page=1&category=All. The zod schema's .default() values make
  // validateSearch produce keys the URL does not carry, and the router
  // then rewrites the URL to match — a redirect on every request to one
  // of the site's most-linked pages, with a canonical tag pointing at the
  // URL that redirects away. Stripping defaults keeps the clean URL clean
  // while the component still reads fully-defaulted search params.
  search: { middlewares: [stripSearchParams(SEARCH_DEFAULTS)] },
  head: () => ({
    ...buildSeoMeta({
      title: "Agent Digital Products — Melanated In Tech",
      description:
        "Starter kits, blueprints, prompt libraries, SOPs, and memory systems for AI agent builders.",
      url: "/products",
    }),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  pendingMs: 0,
  pendingComponent: () => (
    <SiteLayout>
      <ListingPendingShell variant="product" label="products" />
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
  component: ProductsIndex,
});

function ProductsIndex() {
  const { data: products } = useSuspenseQuery(qo);
  const { page, category: urlCategory } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );
  const [cat, setCat] = useState(urlCategory ?? "All");
  const [tier, setTier] = useState("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (urlCategory && urlCategory !== cat) setCat(urlCategory);
  }, [urlCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = products.filter((p) => {
    const matchCat = cat === "All" || p.category === cat;
    const matchTier = tier === "All" || p.tier === tier;
    const needle = q.trim().toLowerCase();
    const matchQ =
      !needle || p.name.toLowerCase().includes(needle) || p.tagline.toLowerCase().includes(needle);
    return matchCat && matchTier && matchQ;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    navigate({
      search: (prev: { page: number; category: string }) => ({
        ...prev,
        page: 1,
        category: cat === "All" ? "All" : cat,
      }),
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, tier, q]);

  const setPage = (p: number) => {
    navigate({ search: (prev: { page: number; category: string }) => ({ ...prev, page: p }) });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasFilters = cat !== "All" || tier !== "All" || q.length > 0;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Digital products"
        title="Ship AI agents faster."
        description="Battle-tested kits, blueprints, and libraries — everything you need to build agents that actually work in production."
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-primary/20"
                aria-label="Search products"
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
              {filtered.length} {filtered.length === 1 ? "product" : "products"}
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
                {t === "custom" ? "bundle" : t}
              </button>
            ))}
            {hasFilters && (
              <button
                onClick={() => {
                  setCat("All");
                  setTier("All");
                  setQ("");
                }}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        <div
          key={safePage}
          className="mt-8 grid animate-fade-in gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {paged.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-sm font-medium">No products match this filter.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try clearing filters or searching a different keyword.
            </p>
          </div>
        )}

        <Pagination
          page={safePage}
          pageCount={pageCount}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          label="products"
          onChange={setPage}
        />
      </section>
    </SiteLayout>
  );
}
