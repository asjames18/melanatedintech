import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { Markdown } from "@/components/markdown";
import { listServices } from "@/lib/public.functions";
import { buildSeoMeta } from "@/lib/seo";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareBar } from "@/components/share-bar";

const serviceBySlugQO = (slug: string) =>
  queryOptions({
    queryKey: ["service", slug],
    queryFn: async () => {
      const all = await listServices();
      return all.find((s) => s.slug === slug) ?? null;
    },
  });

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ context, params }) => {
    const service = await context.queryClient.ensureQueryData(serviceBySlugQO(params.slug));
    if (!service) throw notFound();
    return { service };
  },
  head: ({ params, loaderData }) => {
    const s = loaderData?.service;
    const path = `/services/${params.slug}`;
    if (!s) return { meta: [{ title: "Service — Melanated In Tech" }] };
    const seo = buildSeoMeta({
      title: `${s.name} — Service | Melanated In Tech`,
      description: s.tagline,
      url: path,
    });
    return { meta: seo.meta };
  },
  component: ServiceDetailPage,
});

function ServiceDetailPage() {
  const { service } = Route.useLoaderData();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link
          to="/services"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All services
        </Link>

        <div className="rounded-2xl border bg-card p-8">
          <h1 className="text-3xl font-bold">{service.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{service.tagline}</p>

          {service.starting_price_cents && (
            <p className="mt-4 text-sm font-medium text-primary">
              Starting at ${(service.starting_price_cents / 100).toFixed(2)}
            </p>
          )}

          <div className="mt-6 prose prose-sm dark:prose-invert max-w-none">
            <Markdown md={service.description} />
          </div>

          {service.outcomes.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold">What you get</h2>
              <ul className="mt-3 space-y-2">
                {service.outcomes.map((outcome, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span className="text-sm">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/contact" search={{ topic: `Service: ${service.name}` }}>
                <Mail className="mr-2 h-4 w-4" /> Start the conversation
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/services">View all services</Link>
            </Button>
            <ShareBar title={service.name} text={service.tagline} />
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
