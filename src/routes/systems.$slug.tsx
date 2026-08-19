import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { PilotOffer } from "@/components/system-sections";
import { SystemDemo } from "@/components/system-demo";
import { getServiceSystem, type ServiceSystemSlug } from "@/lib/service-systems";
import { buildSeoMeta, breadcrumbLd, faqLd, ldScript, serviceLd } from "@/lib/seo";

export const Route = createFileRoute("/systems/$slug")({
  loader: ({ params }) => {
    const system = getServiceSystem(params.slug);
    if (!system) throw notFound();
    return system;
  },
  head: ({ loaderData }) => {
    const system = loaderData!;
    const faqs = [
      {
        question: "What does the 30-day pilot include?",
        answer:
          "One defined revenue leak, one location, one primary platform, a focused communication channel, implementation, testing, handoff, monitoring, and a completion report.",
      },
      {
        question: "Do you guarantee revenue?",
        answer:
          "No. The system measures business events influenced by the workflow, but revenue depends on demand, pricing, staff follow-through, and other operating conditions.",
      },
      {
        question: "Will this replace our current software?",
        answer:
          "Usually not. Native capabilities in your existing platform are configured first, and custom automation is used only for documented gaps.",
      },
    ];
    return {
      ...buildSeoMeta({
        title: `${system.title} | Melanated In Tech`,
        description: system.summary,
        url: `/systems/${system.slug}`,
      }),
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Systems", path: "/systems" },
            { name: system.title, path: `/systems/${system.slug}` },
          ]),
        ),
        ldScript(faqLd(faqs)),
        ldScript(
          serviceLd({
            name: system.title,
            description: system.summary,
            url: `/systems/${system.slug}`,
            areaServed: ["Highlands County", "Florida", "United States"],
            priceFrom: 1500,
          }),
        ),
      ],
    };
  },
  component: SystemDetail,
});

function SystemDetail() {
  const system = Route.useLoaderData();
  return (
    <SiteLayout>
      <PageHeader
        eyebrow={system.eyebrow}
        title={system.title}
        description={system.summary}
        actions={
          <Link
            to="/get-a-demo"
            search={{ system: system.slug }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Get this demo <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-7">
          <h2 className="font-display text-2xl font-semibold">Revenue leaks addressed</h2>
          <ul className="mt-5 space-y-3">
            {system.leaks.map((item) => (
              <li key={item} className="flex gap-2 text-muted-foreground">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-border bg-card p-7">
          <h2 className="font-display text-2xl font-semibold">Events the pilot measures</h2>
          <ul className="mt-5 space-y-3">
            {system.outcomes.map((item) => (
              <li key={item} className="flex gap-2 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="border-y border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SystemDemo initialSystem={system.slug as ServiceSystemSlug} />
        </div>
      </section>
      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <PilotOffer />
        </div>
      </section>
      <section className="border-t border-border bg-muted/25">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-semibold">Important operating boundaries</h2>
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              Critical scheduling, pricing, consent, and escalation decisions follow approved rules.
              AI may classify, summarize, personalize, or draft within defined limits.
            </p>
            <p>
              Third-party platform and messaging costs are separate. Material scope changes,
              additional locations, complex integrations, and call-answering services are quoted
              separately.
            </p>
            <p>
              No production integration begins before the deposit and required account access are
              received.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
