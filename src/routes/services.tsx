import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { ServiceCard } from "@/components/cards";
import { listServices } from "@/lib/public.functions";
import { FALLBACK_SERVICES, ServiceItem } from "@/lib/services-data";
import { buildSeoMeta } from "@/lib/seo";

const qo = queryOptions({
  queryKey: ["services"],
  queryFn: async (): Promise<ServiceItem[]> => {
    try {
      const data = await listServices();
      if (data && data.length > 0) {
        // Merge Supabase services with fallback data metadata if missing
        return data.map((s) => {
          const fb = FALLBACK_SERVICES.find((f) => f.slug === s.slug);
          return {
            id: s.id,
            slug: s.slug,
            name: s.name,
            tagline: s.tagline,
            description: s.description,
            outcomes: s.outcomes ?? fb?.outcomes ?? [],
            starting_price_cents: s.starting_price_cents ?? fb?.starting_price_cents ?? null,
            features: fb?.features ?? [],
            process: fb?.process ?? [],
            category: fb?.category ?? "AI Service",
          };
        });
      }
    } catch (err) {
      console.warn("Failed to fetch services from Supabase, returning fallbacks...", err);
    }
    return FALLBACK_SERVICES;
  },
});

export const Route = createFileRoute("/services")({
  head: () => ({
    ...buildSeoMeta({
      title: "AI Agent Services — Melanated In Tech",
      description:
        "Strategy sprints, custom agent builds, ministry implementations, and governance audits — done with you.",
      url: "/services",
    }),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
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
  component: ServicesIndex,
});

function ServicesIndex() {
  const { data: services } = useSuspenseQuery(qo);
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Services"
        title="Done-with-you AI agent engagements."
        description="From a two-week strategy sprint to a fully deployed custom agent — we partner with teams ready to ship."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {services.map((s) => {
            const price = "Custom Quote (Scope-based)";
            return s.slug === "agent-strategy-sprint" ? (
              <Link key={s.id} to="/strategy-sprint" className="block">
                <ServiceCard {...s} price={price} />
              </Link>
            ) : (
              <Link key={s.id} to="/services/$slug" params={{ slug: s.slug }} className="block">
                <ServiceCard {...s} price={price} />
              </Link>
            );
          })}
        </div>
        <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-center">
          <p className="font-display text-lg font-semibold">Have an agent idea in mind?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us about it — we'll respond within two business days.
          </p>
          <Link
            to="/contact"
            className="mt-4 inline-flex rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity"
          >
            Start the conversation
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
