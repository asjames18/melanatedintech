import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { ServiceCard } from "@/components/cards";
import { listServices } from "@/lib/public.functions";

const qo = queryOptions({ queryKey: ["services"], queryFn: () => listServices() });

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "AI Agent Services — Melanated In Tech" },
      { name: "description", content: "Strategy sprints, custom agent builds, ministry implementations, and workshops — done with you." },
      { property: "og:title", content: "AI Agent Services" },
      { property: "og:description", content: "We design, build, and deploy AI agents alongside your team." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  errorComponent: ({ error }) => <SiteLayout><div className="p-12 text-center text-sm text-muted-foreground">{error.message}</div></SiteLayout>,
  notFoundComponent: () => <SiteLayout><div className="p-12">Not found.</div></SiteLayout>,
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
          {services.map((s) => <ServiceCard key={s.id} {...s} />)}
        </div>
        <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-center">
          <p className="font-display text-lg font-semibold">Have an agent idea in mind?</p>
          <p className="mt-1 text-sm text-muted-foreground">Tell us about it — we'll respond within two business days.</p>
          <Link to="/contact" className="mt-4 inline-flex rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90">
            Start the conversation
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
