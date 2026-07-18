import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { useEffect } from "react";
import { SiteLayout } from "@/components/site-layout";
import { Markdown } from "@/components/markdown";
import { listServices } from "@/lib/public.functions";
import { getServiceBySlug, ServiceItem } from "@/lib/services-data";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import {
  ArrowDown,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  Gauge,
  ShieldCheck,
  Users,
  Workflow,
  Sparkles,
  Cpu,
  Clock,
  HelpCircle,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";
import { trackEvent } from "@/lib/analytics";

const serviceBySlugQO = (slug: string) =>
  queryOptions({
    queryKey: ["service", slug],
    queryFn: async (): Promise<ServiceItem | null> => {
      try {
        const all = await listServices();
        const found = all.find((s) => s.slug === slug);
        if (found) {
          const fallback = getServiceBySlug(slug);
          return {
            id: found.id,
            slug: found.slug,
            name: found.name,
            tagline: found.tagline,
            description: found.description,
            outcomes: found.outcomes ?? fallback?.outcomes ?? [],
            starting_price_cents: null,
            features: fallback?.features ?? [],
            process: fallback?.process ?? [],
            category: fallback?.category ?? "AI Service",
            faqs: fallback?.faqs ?? [],
          };
        }
      } catch (err) {
        console.warn("Failed to fetch service from Supabase, returning fallback data...", err);
      }
      return getServiceBySlug(slug) ?? null;
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
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Services", path: "/services" },
            { name: s.name, path },
          ]),
        ),
      ],
    };
  },
  component: ServiceDetailPage,
});

function ServiceDetailPage() {
  const { service } = Route.useLoaderData();

  useEffect(() => {
    trackEvent("service_page_viewed", { slug: service.slug });
  }, [service.slug]);

  function scrollToApplication() {
    trackEvent("service_application_started", { service: service.slug });
    document.getElementById("application")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <SiteLayout>
      {/* Hero Header matching Strategy Sprint design */}
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="bg-grid absolute inset-0 opacity-35 [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {service.category || "AI Engagement Service"}
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-6xl text-foreground">
              {service.name}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {service.tagline}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={scrollToApplication} className="gap-2">
                Request Scope Quote <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/proof">Review our proof standard</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Custom scope pricing
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> 100% Code Ownership
              </span>
              <span className="inline-flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" /> Model-Agnostic Setup
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Dedicated Engineering Partner
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Overview & Scope Markdown */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Overview & Approach
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">
            How we partner with your team.
          </h2>
          <div className="mt-8 prose prose-sm dark:prose-invert max-w-none leading-relaxed text-muted-foreground">
            <Markdown md={service.description} />
          </div>
        </div>
      </section>

      {/* Deliverables Section */}
      {service.outcomes && service.outcomes.length > 0 && (
        <section className="border-b border-border bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Deliverables
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">
              Guaranteed outcomes for your organization.
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {service.outcomes.map((outcome, idx) => (
                <article key={idx} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-display text-base font-bold text-foreground leading-snug">{outcome}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Timeline & Ideal Fit Grid */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          {/* Process Steps */}
          {service.process && service.process.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Process</p>
              <h2 className="mt-2 font-display text-3xl font-semibold">Implementation Roadmap.</h2>
              <ol className="mt-7 space-y-4">
                {service.process.map((step, idx) => (
                  <li key={idx} className="grid grid-cols-[36px_1fr] gap-3 rounded-2xl border border-border bg-card p-4">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-base font-semibold text-foreground">{step.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Included Features & Safeguards */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Safeguards
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">Built-in Production Standards.</h2>
            <ul className="mt-7 space-y-3">
              {(service.features && service.features.length > 0
                ? service.features
                : [
                    "100% Source Code Ownership & Zero Vendor Lock-In",
                    "Model-Agnostic Architecture (Claude 3.5, OpenAI, Llama 3.3)",
                    "Strict Data Privacy & Zero Retention Setup",
                    "Interactive Admin Dashboard & Audit Logs",
                  ]
              ).map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm"
                >
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
              <p className="font-medium text-foreground">Need to diagnose your readiness first?</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Take our free 3-minute AI Fit Finder to evaluate your workflow and receive a personalized starter kit.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/fit-finder">Use the Fit Finder</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Proof Banner */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 rounded-3xl border border-primary/25 bg-primary/5 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Proof before build
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                See how our method handles real-world complexity.
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Review detailed higher-education and ministry/nonprofit reference workflows, including human approval gates and expected outcomes.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link to="/proof">View reference examples</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      {service.faqs && service.faqs.length > 0 && (
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">FAQs</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">
              Questions teams ask before engaging.
            </h2>
            <div className="mt-8 space-y-3">
              {service.faqs.map((faq, idx) => (
                <details key={idx} className="group rounded-2xl border border-border bg-muted/10 p-5">
                  <summary className="cursor-pointer list-none font-medium text-foreground">{faq.q}</summary>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Inquiry & Application Form Section */}
      <section id="application" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Application & Scope Inquiry
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">
              Tell us about your organization.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Share details about your workflow, team goals, and data requirements. We will reply within two business days with fit and next steps.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <ContactForm defaultTopic={`Service Inquiry: ${service.name}`} />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
