import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ClipboardCheck, Gauge, Settings2, Workflow } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { breadcrumbLd, buildSeoMeta, ldScript } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import { funnelAttribution } from "@/components/funnel-attribution";

const engagements = [
  {
    Icon: ClipboardCheck,
    title: "Workflow Opportunity & ROI Sprint",
    range: "$7.5K–$15K",
    body: "A focused discovery engagement that maps one costly workflow, establishes a baseline, and produces an implementation-ready plan.",
    includes: [
      "Current-state workflow map",
      "Opportunity, feasibility, and risk assessment",
      "ROI model and implementation roadmap",
    ],
    to: "/strategy-sprint" as const,
    cta: "Explore the Strategy Sprint",
  },
  {
    Icon: Workflow,
    title: "Controlled Automation Pilot",
    range: "$20K–$45K",
    body: "A working pilot for one bounded workflow, tested with real users and explicit human approval points.",
    includes: [
      "Focused implementation",
      "System connections and exception handling",
      "Acceptance testing and decision report",
    ],
    to: "/contact" as const,
    cta: "Discuss a pilot",
  },
  {
    Icon: Gauge,
    title: "Production AI Integration",
    range: "$35K–$90K",
    body: "Production implementation across approved systems, data sources, roles, and operating processes.",
    includes: [
      "Production integrations",
      "Security, monitoring, and evaluation",
      "Documentation and staff handoff",
    ],
    to: "/contact" as const,
    cta: "Request a project scope",
  },
  {
    Icon: Settings2,
    title: "Managed Automation Operations",
    range: "$2.5K–$8K/mo",
    body: "Ongoing monitoring, maintenance, evaluation, and workflow improvement after launch.",
    includes: [
      "Performance and failure monitoring",
      "Updates as tools and workflows change",
      "Monthly improvement priorities",
    ],
    to: "/contact" as const,
    cta: "Ask about managed support",
  },
] as const;

export const Route = createFileRoute("/work-with-us")({
  head: () => ({
    ...buildSeoMeta({
      title: "AI Consulting & Implementation Services | Melanated In Tech",
      description:
        "Strategy, pilots, production AI integrations, and managed automation operations for organizations solving costly workflow problems.",
      url: "/work-with-us",
    }),
    scripts: [
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/work-with-us" },
        ]),
      ),
    ],
  }),
  component: WorkWithUs,
});

function WorkWithUs() {
  useEffect(() => {
    trackEvent("work_with_us_viewed", { surface: "work_with_us", ...funnelAttribution() });
  }, []);

  return (
    <SiteLayout>
      <PageHeader
        title="Choose the next responsible step from problem to production."
        description="MIT scopes AI work around the workflow, business impact, systems, data, and people involved. Every engagement has a defined outcome, price, and decision point."
        actions={
          <Button asChild size="lg">
            <Link to="/contact" search={{ topic: "Business workflow inquiry" }}>
              Tell us what you&apos;re trying to solve <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />
      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Engagement path
          </p>
          <h2 className="mt-2 max-w-3xl font-display text-3xl font-semibold">
            Start small enough to learn. Build far enough to matter.
          </h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
            The ranges below are planning signals, not instant quotes. Final scope depends on
            workflow complexity, integrations, data sensitivity, stakeholder count, and
            implementation responsibility.
          </p>
          <div className="mt-9 grid gap-5 lg:grid-cols-2">
            {engagements.map(({ Icon, title, range, body, includes, to, cta }) => (
              <article
                key={title}
                className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-primary">{range}</span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={to}
                  search={to === "/contact" ? { topic: `${title} inquiry` } : undefined}
                  className="mt-7 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                  onClick={() =>
                    trackEvent("service_offer_cta_clicked", {
                      offer: title.toLowerCase().replaceAll(" ", "_"),
                      surface: "work_with_us",
                      ...funnelAttribution(),
                    })
                  }
                >
                  {cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-foreground p-7 text-background sm:p-10">
            <h2 className="max-w-3xl font-display text-3xl font-semibold">
              Not sure which engagement fits?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-background/70">
              Describe the workflow and the business result you need. We will recommend the smallest
              useful next step—even when that means you should not hire us yet.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-7">
              <Link to="/contact" search={{ topic: "Business workflow inquiry" }}>
                Start with the problem <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
