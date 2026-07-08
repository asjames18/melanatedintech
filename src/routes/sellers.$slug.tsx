import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { AgentCard, ProductCard, ServiceCard } from "@/components/cards";
import { getPublicSeller } from "@/lib/public.functions";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { ArrowLeft, Globe, Cpu, ShoppingBag, Wrench } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const qo = (slug: string) =>
  queryOptions({
    queryKey: ["public-seller", slug],
    queryFn: () => getPublicSeller({ data: { slug } }),
  });

export const Route = createFileRoute("/sellers/$slug")({
  loader: async ({ context, params }) => {
    const r = await context.queryClient.ensureQueryData(qo(params.slug));
    if (!r) throw notFound();
    return r;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Seller — Melanated In Tech" }] };
    const { seller } = loaderData;
    const path = `/sellers/${params.slug}`;
    const seo = buildSeoMeta({
      title: `${seller.display_name} — Creator Profile | Melanated In Tech`,
      description: seller.bio ?? `Explore AI agents, templates, and services by ${seller.display_name}.`,
      url: path,
      type: "profile",
      image: seller.avatar_url ?? null,
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript({
          "@context": "https://schema.org",
          "@type": "Person",
          name: seller.display_name,
          description: seller.bio ?? undefined,
          image: seller.avatar_url ?? undefined,
          url: path,
        }),
        ldScript(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Sellers", path: "#" },
            { name: seller.display_name, path },
          ]),
        ),
      ],
    };
  },
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="p-12 text-sm text-destructive">{error.message}</div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Seller not found</h1>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </SiteLayout>
  ),
  component: PublicSellerPage,
});

function PublicSellerPage() {
  const { slug } = Route.useParams();
  const data = useSuspenseQuery(qo(slug)).data!;
  const { seller, agents, products, services } = data;

  const [activeTab, setActiveTab] = useState(() => {
    if (agents.length > 0) return "agents";
    if (products.length > 0) return "products";
    if (services.length > 0) return "services";
    return "agents";
  });

  return (
    <SiteLayout>
      <div className="border-b border-border bg-muted/20">
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {seller.avatar_url ? (
                <img
                  src={seller.avatar_url}
                  alt=""
                  className="h-20 w-20 rounded-2xl object-cover ring-1 ring-border shadow-md"
                />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-2xl bg-primary/10 text-primary text-2xl font-bold ring-1 ring-border shadow-md">
                  {seller.display_name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {seller.display_name}
                </h1>
                {seller.bio && (
                  <p className="mt-2 max-w-xl text-base text-muted-foreground">{seller.bio}</p>
                )}
                {seller.website_url && (
                  <a
                    href={seller.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>Visit website</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
            <TabsTrigger
              value="agents"
              className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 rounded-none data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Cpu className="h-4 w-4" />
              <span>AI Agents ({agents.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 rounded-none data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Digital Products ({products.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 rounded-none data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Wrench className="h-4 w-4" />
              <span>Services ({services.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="mt-8 outline-none">
            {agents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
                No active AI agents published by this creator yet.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                  <AgentCard key={agent.id} {...agent} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="mt-8 outline-none">
            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
                No digital products published by this creator yet.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="services" className="mt-8 outline-none">
            {services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
                No services offered by this creator yet.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {services.map((service) => (
                  <Link
                    key={service.id}
                    to="/services/$slug"
                    params={{ slug: service.slug }}
                    className="group block transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <ServiceCard {...service} />
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
}
