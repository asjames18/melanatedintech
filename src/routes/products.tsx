import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { ProductCard } from "@/components/cards";
import { listProducts } from "@/lib/public.functions";

const qo = queryOptions({ queryKey: ["products"], queryFn: () => listProducts() });

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Agent Digital Products — Melanated In Tech" },
      { name: "description", content: "Starter kits, blueprints, prompt libraries, SOPs, and memory systems for AI agent builders." },
      { property: "og:title", content: "AI Agent Digital Products" },
      { property: "og:description", content: "Ship agents faster with battle-tested kits and blueprints." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  errorComponent: ({ error }) => <SiteLayout><div className="p-12 text-center text-sm text-muted-foreground">{error.message}</div></SiteLayout>,
  notFoundComponent: () => <SiteLayout><div className="p-12">Not found.</div></SiteLayout>,
  component: ProductsIndex,
});

function ProductsIndex() {
  const { data: products } = useSuspenseQuery(qo);
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Digital products"
        title="Ship AI agents faster."
        description="Battle-tested kits, blueprints, and libraries — everything you need to build agents that actually work in production."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      </section>
    </SiteLayout>
  );
}
