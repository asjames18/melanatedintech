import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDown,
  CalendarDays,
  CheckCircle2,
  Heart,
  HelpCircle,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import { funnelAttribution } from "@/components/funnel-attribution";

export const Route = createFileRoute("/services/ministry-ai-implementation")({
  head: () => {
    const path = "/services/ministry-ai-implementation";
    const seo = buildSeoMeta({
      title: "Ministry & Non-Profit AI Implementation | Melanated In Tech",
      description:
        "Welcoming, high-trust AI agent workflows designed specifically for volunteer intake, donor care, and community outreach.",
      url: path,
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Services", path: "/services" },
            { name: "Ministry AI Implementation", path },
          ]),
        ),
      ],
    };
  },
  component: MinistryAiImplementationPage,
});

const DELIVERABLES = [
  [
    Users,
    "Volunteer Pathway Coordinator",
    "Automated volunteer intake, interest profiling, and human-in-the-loop placement routing.",
  ],
  [
    Heart,
    "Donor Care & Appreciation Workflow",
    "Warm, personal donor appreciation draft generation and event follow-up notifications.",
  ],
  [
    ShieldCheck,
    "Ethical Ministry AI Policy",
    "Custom acceptable use framework ensuring AI tone, warmth, and boundaries align with ministry values.",
  ],
  [
    Lock,
    "Privacy & Safeguarding Boundaries",
    "Strict data privacy protocols protecting sensitive pastoral care, counseling, and financial records.",
  ],
  [
    Workflow,
    "Staff Human-in-the-Loop Safeguards",
    "Approval dashboards ensuring all public-facing or ministry messages are reviewed before sending.",
  ],
  [
    Sparkles,
    "Leadership & Volunteer Onboarding Workshop",
    "Hands-on training equipping non-technical leaders and volunteers to comfortably operate the system.",
  ],
] as const;

const FAQS = [
  [
    "How is pricing structured?",
    "Pricing is custom based on ministry size, volunteer volume, and community workflow scope. We offer non-profit friendly engagement terms with zero hidden fees.",
  ],
  [
    "How is sensitive pastoral data protected?",
    "We enforce strict data isolation boundaries. Sensitive pastoral care, counseling notes, and personal safeguarding data bypass AI processing completely.",
  ],
  [
    "Does the AI agent replace human ministry leadership?",
    "No. The agent handles routine administrative intake, categorization, and drafting so ministry leaders can spend more quality time in direct personal relationships.",
  ],
  [
    "Do our staff need technical skills?",
    "No technical background is required. We design simple, welcoming interfaces and provide full staff onboarding.",
  ],
];

function MinistryAiImplementationPage() {
  useEffect(() => {
    trackEvent("ministry_ai_implementation_viewed", { ...funnelAttribution() });
  }, []);

  function scrollToApplication() {
    trackEvent("ministry_ai_application_started", { surface: "hero", ...funnelAttribution() });
    document.getElementById("application")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="bg-grid absolute inset-0 opacity-35 [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Community & Faith Engagement
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-6xl text-foreground">
              Ministry & Non-Profit AI Implementation
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Welcoming, high-trust AI agent workflows designed specifically for volunteer intake, donor appreciation, and community outreach while maintaining human warmth and ethical standards.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={scrollToApplication} className="gap-2">
                Request Scope Quote <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/proof">Review non-profit proof examples</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Custom scope pricing
              </span>
              <span className="inline-flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" /> Warm & Ethical Tone Safeguards
              </span>
              <span className="inline-flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" /> Privacy-First Data Protection
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Non-Technical Staff Friendly
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Deliverables Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Deliverables
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Purpose-built for community care and operational efficiency.
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {DELIVERABLES.map(([Icon, title, body]) => (
              <article key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Process & Ideal Fit Grid */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Process</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">3-Phase Implementation.</h2>
            <ol className="mt-7 space-y-4">
              {[
                ["Phase 1", "Community Mapping", "Understand your mission, communication standards, volunteer pathways, and safeguarding needs."],
                ["Phase 2", "Ethical Agent Build", "Construct agent workflows with strict warmth, tone guardrails, and human approval gates."],
                ["Phase 3", "Staff Onboarding & Launch", "Train leaders and staff on reviewing drafts, managing approvals, and auditing performance."],
              ].map(([time, title, body]) => (
                <li
                  key={time}
                  className="grid grid-cols-[84px_1fr] gap-4 rounded-2xl border border-border bg-card p-4"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {time}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Ideal Fit
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">This engagement is a fit when…</h2>
            <ul className="mt-7 space-y-3">
              {[
                "Your ministry or non-profit needs to streamline volunteer intake without losing human warmth.",
                "Donor follow-up and appreciation communication is getting delayed by administrative overhead.",
                "Leadership needs clear ethical AI guardrails aligned with non-profit standards.",
                "Staff and volunteers require simple, non-technical interfaces.",
                "Community trust, privacy, and data safeguarding are top priorities.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
              <p className="font-medium text-foreground">Evaluating workflow readiness first?</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Use our free AI Fit Finder to assess your non-profit workflows and receive a tailored recommendation.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/fit-finder">Use the Fit Finder</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Proof Banner */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 rounded-3xl border border-primary/25 bg-primary/5 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Ministry Proof Reference
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                See a real-world ministry volunteer intake workflow in action.
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Review complete reference workflows showing human approval boundaries, safeguarding rules, and expected outcomes.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link to="/proof">View reference examples</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">FAQs</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Questions non-profit leaders ask.
          </h2>
          <div className="mt-8 space-y-3">
            {FAQS.map(([question, answer]) => (
              <details
                key={question}
                className="group rounded-2xl border border-border bg-card p-5"
              >
                <summary className="cursor-pointer list-none font-medium text-foreground">{question}</summary>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Application / Quote Request Section */}
      <section id="application" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Application & Scope Quote
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Tell us about your ministry or non-profit.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Share details about your volunteer pathways, donor communication goals, and staff needs. We reply within two business days with fit and next steps.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <ContactForm defaultTopic="Ministry AI Implementation inquiry" />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
