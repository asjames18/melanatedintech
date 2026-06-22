import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { ProductCard, AgentCard, TierBadge } from "@/components/cards";
import { WaitlistForm } from "@/components/waitlist-form";
import { getProduct, listProducts, listAgents } from "@/lib/public.functions";
import { ArrowLeft, Package, Sparkles, Tag, Wallet } from "lucide-react";

const productQO = (slug: string) =>
  queryOptions({ queryKey: ["product", slug], queryFn: () => getProduct({ data: { slug } }) });
const allProductsQO = queryOptions({ queryKey: ["products"], queryFn: () => listProducts() });
const allAgentsQO = queryOptions({ queryKey: ["agents"], queryFn: () => listAgents() });

function formatPrice(cents: number | null | undefined, tier: string) {
  if (tier === "free") return "Free";
  if (tier === "custom") return "Bundle";
  if (!cents) return "—";
  return `$${(cents / 100).toFixed(0)}`;
}

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ context, params }) => {
    const [product] = await Promise.all([
      context.queryClient.ensureQueryData(productQO(params.slug)),
      context.queryClient.ensureQueryData(allProductsQO),
      context.queryClient.ensureQueryData(allAgentsQO),
    ]);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.product
      ? [
          { title: `${loaderData.product.name} — Digital Product | Melanated In Tech` },
          { name: "description", content: loaderData.product.tagline },
          { property: "og:title", content: loaderData.product.name },
          { property: "og:description", content: loaderData.product.tagline },
        ]
      : [{ title: "Product — Melanated In Tech" }],
  }),
  errorComponent: ({ error }) => <SiteLayout><div className="p-12 text-center text-sm text-muted-foreground">{error.message}</div></SiteLayout>,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Product not found</h1>
        <Link to="/products" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>
      </div>
    </SiteLayout>
  ),
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQO(slug));
  const { data: allProducts } = useSuspenseQuery(allProductsQO);
  const { data: allAgents } = useSuspenseQuery(allAgentsQO);
  if (!product) return null;

  const related = allProducts.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, 3);
  const featuredAgents = allAgents.filter((a) => a.featured).slice(0, 3);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All products
          </Link>
          <div className="mt-6 flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent2/15 text-accent2">
              <Package className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-primary">{product.category}</p>
              <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{product.name}</h1>
              <p className="mt-2 text-lg text-muted-foreground">{product.tagline}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <TierBadge tier={product.tier as "free" | "premium" | "custom"} />
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-xs">
                  <Wallet className="h-3 w-3" /> {formatPrice(product.price_cents, product.tier)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-xs">
                  <Tag className="h-3 w-3" /> {product.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="font-display text-xl font-semibold">About this product</h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{product.description}</p>
          </div>
          <aside className="md:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-medium">Get notified at launch</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {product.name} is rolling out to early users. Join the list for access.
              </p>
              <div className="mt-4">
                <WaitlistForm source={`product:${product.slug}`} interest={product.name} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-primary">Related</p>
                <h2 className="mt-1 font-display text-2xl font-semibold">More {product.category}</h2>
              </div>
              <Link to="/products" className="text-sm font-medium text-primary hover:underline">All products →</Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <ProductCard key={p.id} {...p} />)}
            </div>
          </div>
        </section>
      )}

      {featuredAgents.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-accent2">
                  <Sparkles className="h-3 w-3" /> Featured agents
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold">Pair this with a ready-to-use agent</h2>
              </div>
              <Link to="/agents" className="text-sm font-medium text-primary hover:underline">Browse agents →</Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredAgents.map((a) => (
                <AgentCard key={a.id} {...a} capabilities={a.capabilities} />
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
