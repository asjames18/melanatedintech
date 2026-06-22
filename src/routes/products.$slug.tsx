import { useEffect, useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { ProductCard, AgentCard, TierBadge } from "@/components/cards";
import { ProductWaitlist } from "@/components/product-waitlist";

import { ShareBar } from "@/components/share-bar";
import { UnlockButton } from "@/components/unlock-button";
import { getPremiumEntry } from "@/lib/premium-catalog";
import { RecommendationItem } from "@/components/recommendation-item";
import { getProduct, listProducts, listAgents } from "@/lib/public.functions";
import { useInterests } from "@/hooks/use-interests";
import { interestScore, topCategories, reasonFor } from "@/lib/recommendations";
import { buildSeoMeta } from "@/lib/seo";
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
  head: ({ params, loaderData }) => {
    const p = loaderData?.product;
    const path = `/products/${params.slug}`;
    if (!p) return { meta: [{ title: "Product — Melanated In Tech" }] };
    return {
      meta: [
        ...buildSeoMeta({
          title: `${p.name} — Digital Product | Melanated In Tech`,
          description: p.tagline,
          url: path,
          type: "product",
          image: p.image_url ?? null,
        }),
        { name: "twitter:label1", content: "Category" },
        { name: "twitter:data1", content: p.category },
        { name: "twitter:label2", content: "Price" },
        { name: "twitter:data2", content: formatPrice(p.price_cents, p.tier) },
      ],
      links: [{ rel: "canonical", href: path }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          description: p.tagline,
          category: p.category,
          image: p.image_url ?? undefined,
          brand: { "@type": "Organization", name: "Melanated In Tech" },
          offers: p.price_cents != null ? {
            "@type": "Offer",
            price: (p.price_cents / 100).toFixed(2),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: path,
          } : undefined,
        }),
      }],
    };
  },
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
  const { interests, recordVisit } = useInterests("product");
  const { interests: agentInterests } = useInterests("agent");

  useEffect(() => {
    if (product) recordVisit(product.slug, product.category);
  }, [product, recordVisit]);

  const { related, pairedAgents, personalized, topInterests } = useMemo(() => {
    if (!product) return { related: [], pairedAgents: [], personalized: false, topInterests: [] as string[] };
    const cats = interests.categories;
    const ag = agentInterests.categories;
    const hasHistory = Object.keys(cats).length + Object.keys(ag).length > 0;

    const related = allProducts
      .filter((p) => p.slug !== product.slug && !interests.recent.includes(p.slug))
      .map((p) => ({
        a: p,
        score:
          (p.category === product.category ? 5 : 0) +
          interestScore(cats, p.category) * 2 +
          interestScore(ag, p.category),
        reason: reasonFor({
          categories: { ...ag, ...cats },
          sourceCategory: product.category,
          itemCategory: p.category,
          activeVerb: "browsing",
          fallback: `More ${p.category}`,
        }),
      }))
      .sort((x, y) => y.score - x.score)
      .slice(0, 3);

    const pairedAgents = allAgents
      .map((a) => ({
        a,
        score:
          (a.category === product.category ? 4 : 0) +
          interestScore(ag, a.category) * 2 +
          interestScore(cats, a.category) +
          (a.featured ? 1 : 0),
        reason: reasonFor({
          categories: { ...ag, ...cats },
          sourceCategory: product.category,
          itemCategory: a.category,
          activeVerb: "browsing",
          fallback: a.featured ? "Featured pick from the team" : `Pairs with ${a.category}`,
        }),
      }))
      .sort((x, y) => y.score - x.score)
      .slice(0, 3);

    return {
      related,
      pairedAgents,
      personalized: hasHistory,
      topInterests: topCategories({ ...ag, ...cats }, 3),
    };
  }, [product, allProducts, allAgents, interests, agentInterests]);

  if (!product) return null;

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
          <ShareBar title={product.name} text={product.tagline} className="mt-6" />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="font-display text-xl font-semibold">About this product</h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{product.description}</p>
          </div>
          <aside className="md:col-span-1">
            <div className="sticky top-24 space-y-4">
              {product.tier === "premium" && getPremiumEntry("product", product.slug) && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <p className="text-sm font-medium">Buy this product</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    One-time purchase. Instant access after checkout.
                  </p>
                  <div className="mt-4">
                    <UnlockButton kind="product" slug={product.slug} itemName={product.name} />
                  </div>
                </div>
              )}
              <ProductWaitlist productSlug={product.slug} />
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  {personalized ? "Picked for you" : "Related"}
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold">
                  {personalized && topInterests.length > 0
                    ? `More for ${topInterests.slice(0, 2).join(" & ")}`
                    : `More ${product.category}`}
                </h2>
              </div>
              <Link to="/products" className="text-sm font-medium text-primary hover:underline">All products →</Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map(({ a, reason }, i) => (
                <RecommendationItem
                  key={a.id}
                  meta={{
                    surface: "product:related_products",
                    itemType: "product",
                    itemSlug: a.slug,
                    itemCategory: a.category,
                    reason,
                    position: i,
                    personalized,
                    sourceType: "product",
                    sourceSlug: product.slug,
                    sourceCategory: product.category,
                  }}
                >
                  <ProductCard {...a} />
                </RecommendationItem>
              ))}
            </div>
          </div>
        </section>
      )}

      {pairedAgents.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-accent2">
                  <Sparkles className="h-3 w-3" /> Paired agents
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold">Pair this with a ready-to-use agent</h2>
              </div>
              <Link to="/agents" className="text-sm font-medium text-primary hover:underline">Browse agents →</Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pairedAgents.map(({ a, reason }, i) => (
                <RecommendationItem
                  key={a.id}
                  meta={{
                    surface: "product:paired_agents",
                    itemType: "agent",
                    itemSlug: a.slug,
                    itemCategory: a.category,
                    reason,
                    position: i,
                    personalized,
                    sourceType: "product",
                    sourceSlug: product.slug,
                    sourceCategory: product.category,
                  }}
                >
                  <AgentCard {...a} capabilities={a.capabilities} />
                </RecommendationItem>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
