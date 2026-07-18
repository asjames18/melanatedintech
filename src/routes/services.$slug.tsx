import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Markdown } from "@/components/markdown";
import { listServices } from "@/lib/public.functions";
import { FALLBACK_SERVICES, getServiceBySlug, ServiceItem } from "@/lib/services-data";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import {
  ArrowLeft,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Clock,
  Layers,
  ArrowRight,
  Cpu,
  Check,
  HelpCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareBar } from "@/components/share-bar";
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
            starting_price_cents: null, // Custom pricing across all services
            features: fallback?.features ?? [],
            process: fallback?.process ?? [],
            category: fallback?.category ?? "AI Service",
            faqs: fallback?.faqs ?? [],
          };
        }
      } catch (err) {
        console.warn("Failed to fetch service from Supabase, checking fallback data...", err);
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
      title: `${s.name} — AI Services | Melanated In Tech`,
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

  function scrollToInquiry() {
    trackEvent("service_inquiry_scroll", { service: service.slug });
    document.getElementById("inquiry-form")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <SiteLayout>
      <div className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> All Services
          </Link>
        </div>
      </div>

      <PageHeader
        eyebrow={service.category || "Done-With-You Engagement"}
        title={service.name}
        description={service.tagline}
      />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Main Content (Col-span 8) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Overview Card */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Service Overview & Scope
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                  <Markdown md={service.description} />
                </div>
              </CardContent>
            </Card>

            {/* Implementation Process Timeline */}
            {service.process && service.process.length > 0 && (
              <Card className="border border-border bg-card shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-xl font-bold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Implementation Roadmap & Process
                  </CardTitle>
                  <CardDescription>How we work with your team from kick-off to deployment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {service.process.map((step, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-border bg-muted/20 p-4 space-y-1.5"
                      >
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                          {step.title}
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tangible Deliverables & Outcomes */}
            {service.outcomes && service.outcomes.length > 0 && (
              <Card className="border border-border bg-card shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-xl font-bold flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Key Deliverables & Guaranteed Outcomes
                  </CardTitle>
                  <CardDescription>What your organization receives at project completion</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {service.outcomes.map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/10 p-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-medium text-foreground leading-snug">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Service FAQs */}
            {service.faqs && service.faqs.length > 0 && (
              <Card className="border border-border bg-card shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-xl font-bold flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {service.faqs.map((faq, idx) => (
                    <div key={idx} className="rounded-xl border border-border/80 bg-muted/10 p-4 space-y-1.5">
                      <h4 className="text-sm font-bold text-foreground">{faq.q}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Embedded Application / Inquiry Form */}
            <Card id="inquiry-form" className="border border-indigo-300 bg-card shadow-md scroll-mt-24">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <Send className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Request a Scope Quote for {service.name}
                </CardTitle>
                <CardDescription>
                  Tell us about your organization and workflow requirements. We reply within two business days.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ContactForm defaultTopic={`Service Inquiry: ${service.name}`} />
              </CardContent>
            </Card>
          </div>

          {/* Sticky Sidebar (Col-span 4) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Pricing & CTA Card */}
            <Card className="border border-indigo-200 bg-gradient-to-b from-indigo-50/50 to-card dark:border-indigo-900/50 dark:from-indigo-950/20 shadow-md sticky top-20">
              <CardHeader className="pb-3">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  Custom Engagement Pricing
                </span>
                <CardTitle className="font-display text-2xl font-bold text-foreground">
                  Custom Quote
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Pricing depends on workflow complexity, tool integrations, and organizational scope.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <Button
                  onClick={scrollToInquiry}
                  className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-sm"
                >
                  <Mail className="h-4 w-4" /> Request Custom Quote
                </Button>

                {/* Service Features Checklist */}
                {service.features && service.features.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-border">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                      Included Safeguards:
                    </span>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {service.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Secondary Actions */}
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" asChild className="w-full justify-between text-xs">
                    <Link to="/fit-finder">
                      <span>Take AI Fit Finder</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="w-full justify-between text-xs">
                    <Link to="/proof">
                      <span>View Implementation Proof</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>

                <div className="pt-2 flex justify-center">
                  <ShareBar title={service.name} text={service.tagline} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </SiteLayout>
  );
}
