import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
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
  Cpu,
  Database,
  FileSearch,
  Gauge,
  Heart,
  HelpCircle,
  Layers,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";
import { trackEvent } from "@/lib/analytics";
import { funnelAttribution } from "@/components/funnel-attribution";

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
  beforeLoad: () => {
    throw redirect({ to: "/work-with-us" });
  },
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

  useEffect(() => {
    trackEvent("service_page_viewed", { slug: service.slug });
  }, [service.slug]);

  if (service.slug === "custom-agent-build") {
    return <CustomAgentBuildView service={service} />;
  }

  if (service.slug === "ministry-ai-implementation" || service.slug === "ministry-nonprofit-ai") {
    return <MinistryAiImplementationView service={service} />;
  }

  if (service.slug === "ai-workshop" || service.slug === "team-ai-workshop") {
    return <TeamAiWorkshopView service={service} />;
  }

  return <GenericServiceView service={service} />;
}

/* =========================================================================
   1. CUSTOM AGENT BUILD VIEW (http://localhost:8080/services/custom-agent-build)
   ========================================================================= */
function CustomAgentBuildView({ service }: { service: ServiceItem }) {
  function scrollToApplication() {
    trackEvent("custom_agent_build_application_started", { surface: "hero", ...funnelAttribution() });
    document.getElementById("application")?.scrollIntoView({ behavior: "smooth" });
  }

  const deliverables = [
    [
      Cpu,
      "Custom System Prompt Architecture",
      "Domain-aware prompt architecture, documented boundaries, and review steps designed to reduce avoidable errors and escalation risk.",
    ],
    [
      Database,
      "MCP Server & API Integration",
      "Model Context Protocol (MCP) servers securely connecting your agent to PostgreSQL, Supabase, Stripe, or REST APIs.",
    ],
    [
      FileSearch,
      "Vector Knowledge Base (RAG)",
      "Clean document chunking, embedding, and vector indexing for your private docs, FAQs, and operational manuals.",
    ],
    [
      ShieldCheck,
      "Eval Studio Safety Scorecard",
      "Automated stress testing against prompt injection, data leakage, and unauthorized function execution.",
    ],
    [
      Layers,
      "Clear Code & IP Handoff",
      "A documented handoff of the agreed source code, prompt configurations, integration code, and operational materials.",
    ],
    [
      Users,
      "Team Training & Post-Launch Support",
      "Hands-on staff training session, operational SOP documentation, and 30 days of direct engineering support.",
    ],
  ] as const;

  const faqs = service.faqs && service.faqs.length > 0 ? service.faqs : [
    {
      q: "How is pricing structured?",
      a: "Pricing is completely custom based on workflow complexity, number of tool integrations (MCP servers), database scale, and security requirements. We provide a written scope, dependencies, exclusions, and fixed-price proposal before implementation begins.",
    },
    {
      q: "Who owns the code and IP?",
      a: "Ownership and reuse rights for custom deliverables are defined in the written proposal. We provide a documented handoff of the agreed code, configurations, and operating materials.",
    },
    {
      q: "How long does a custom build take?",
      a: "Typical custom agent builds take 3 to 6 weeks from kick-off to production deployment depending on tool integration complexity.",
    },
  ];

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="bg-grid absolute inset-0 opacity-35 [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Full Engineering Service
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-6xl text-foreground">
              Custom Autonomous Agent Build
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              We partner with your leadership and engineering teams to design, engineer, test, and deploy bespoke AI agent systems tailored to your exact business stack and database workflows.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={scrollToApplication} className="gap-2">
                Request Custom Quote <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/proof">Review the proof standard</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Custom scope pricing
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Clear code and IP handoff
              </span>
              <span className="inline-flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" /> Custom MCP Server Integration
              </span>
              <span className="inline-flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" /> Defined data and retention boundaries
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Deliverables
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Everything engineered for production reliability.
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {deliverables.map(([Icon, title, body]) => (
              <article key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Timeline</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">4-Step Engineering Lifecycle.</h2>
            <ol className="mt-7 space-y-4">
              {[
                ["Phase 1", "Scope & Architecture", "Define workflow boundaries, API connections, model selection, and security rules."],
                ["Phase 2", "MCP & Tool Engineering", "Build custom system prompts, vector indexes, and database MCP server adapters."],
                ["Phase 3", "Stress Testing & Guardrails", "Run prompt-injection and boundary test drills, document findings, and refine safeguards before launch."],
                ["Phase 4", "Deployment & Training", "Deploy agent to production infrastructure, hand over complete codebase, and train your staff."],
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
                "You need an autonomous agent connected directly to private databases or internal APIs.",
                "Off-the-shelf wrappers lack the security, custom logic, or data privacy your business demands.",
                "Your workflow requires complex tool calling, multi-step reasoning, or human approval gates.",
                "You need clear ownership, reuse, and handoff terms for custom deliverables.",
                "Data boundaries, retention expectations, and access controls need to be defined before implementation.",
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
              <p className="font-medium text-foreground">Need a strategy sprint before building?</p>
              <p className="mt-2 text-sm text-muted-foreground">
                If your team needs to map workflows and calculate financial ROI first, explore our 2-Week Strategy Sprint.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/strategy-sprint">Explore Strategy Sprint</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
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
                Review detailed reference architecture examples, including agent tool definitions, human approval gates, and security scorecards.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link to="/proof">View reference examples</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">FAQs</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Questions teams ask before building.
          </h2>
          <div className="mt-8 space-y-3">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group rounded-2xl border border-border bg-card p-5">
                <summary className="cursor-pointer list-none font-medium text-foreground">{faq.q}</summary>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="application" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Application & Scope Quote
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Tell us about your agent project.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Share details about your target workflow, internal database integrations, and team goals. We will review your submission and reply within two business days with fit and next steps.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <ContactForm defaultTopic="Custom Agent Build inquiry" />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

/* =========================================================================
   2. MINISTRY AI IMPLEMENTATION VIEW (http://localhost:8080/services/ministry-ai-implementation)
   ========================================================================= */
function MinistryAiImplementationView({ service }: { service: ServiceItem }) {
  function scrollToApplication() {
    trackEvent("ministry_ai_application_started", { surface: "hero", ...funnelAttribution() });
    document.getElementById("application")?.scrollIntoView({ behavior: "smooth" });
  }

  const deliverables = [
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

  const faqs = service.faqs && service.faqs.length > 0 ? service.faqs : [
    {
      q: "How is pricing structured?",
      a: "Pricing is custom based on ministry size, volunteer volume, and community workflow scope. We offer non-profit friendly engagement terms with zero hidden fees.",
    },
    {
      q: "How is sensitive pastoral data protected?",
      a: "We enforce strict data isolation boundaries. Sensitive pastoral care, counseling notes, and personal safeguarding data bypass AI processing completely.",
    },
    {
      q: "Does the AI agent replace human ministry leadership?",
      a: "No. The agent handles routine administrative intake, categorization, and drafting so ministry leaders can spend more quality time in direct personal relationships.",
    },
  ];

  return (
    <SiteLayout>
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

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Deliverables
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Purpose-built for community care and operational efficiency.
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {deliverables.map(([Icon, title, body]) => (
              <article key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

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

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">FAQs</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Questions non-profit leaders ask.
          </h2>
          <div className="mt-8 space-y-3">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group rounded-2xl border border-border bg-card p-5">
                <summary className="cursor-pointer list-none font-medium text-foreground">{faq.q}</summary>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

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

/* =========================================================================
   3. TEAM AI WORKSHOP VIEW (http://localhost:8080/services/ai-workshop)
   ========================================================================= */
function TeamAiWorkshopView({ service }: { service: ServiceItem }) {
  function scrollToApplication() {
    trackEvent("team_ai_workshop_application_started", { surface: "hero", ...funnelAttribution() });
    document.getElementById("application")?.scrollIntoView({ behavior: "smooth" });
  }

  const deliverables = [
    [
      Sparkles,
      "Customized Workshop Curriculum",
      "Tailored live session covering prompt engineering, custom GPTs, MCP servers, and agent governance specific to your stack.",
    ],
    [
      Workflow,
      "Executive Leadership Strategy Track",
      "AI agent feasibility screening, financial ROI calculation, risk management, and governance policy design.",
    ],
    [
      Cpu,
      "Operations & Business Track",
      "Hands-on masterclass on Prompt Pilot, AI Playbook prompt customization, and task automation.",
    ],
    [
      Database,
      "Engineering & IT Track",
      "Deep-dive into MCP server adapter development, RAG document indexing, and Eval Studio stress testing.",
    ],
    [
      FileSearch,
      "Custom Prompt & SOP Template Pack",
      "Complete handover of custom prompt libraries, operational SOP templates, and session video recordings.",
    ],
    [
      Users,
      "30-Day Direct Q&A Follow-Up",
      "30 days of direct asynchronous Q&A support to assist your team as they implement session concepts.",
    ],
  ] as const;

  const faqs = service.faqs && service.faqs.length > 0 ? service.faqs : [
    {
      q: "How is pricing structured?",
      a: "Pricing is custom based on team size, session length (half-day vs. full-day), and level of curriculum customization. We provide transparent upfront proposals.",
    },
    {
      q: "Can the workshop be conducted remotely or in-person?",
      a: "Workshops are available virtually via Zoom/Teams with hands-on breakout rooms, or in-person at your company's office location.",
    },
  ];

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="bg-grid absolute inset-0 opacity-35 [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Training & Executive Education
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-6xl text-foreground">
              Hands-On Team AI & Agent Workshop
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Equip your leadership, developers, or staff with practical, real-world AI agent skills. In this live interactive workshop, your team learns to engineer system prompts, build tools, and operate AI safely.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={scrollToApplication} className="gap-2">
                Request Workshop Proposal <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/tools">Explore Interactive Tools</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Custom scope pricing
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Virtual or In-Person Live
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Hands-On Building Drills
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> 30-Day Follow-Up Support
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Deliverables & Tracks
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Actionable skills for your entire team.
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {deliverables.map(([Icon, title, body]) => (
              <article key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Journey</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">3-Stage Workshop Experience.</h2>
            <ol className="mt-7 space-y-4">
              {[
                ["Stage 1", "Curriculum Customization", "We survey your team's tech stack and goals to tailor live building exercises."],
                ["Stage 2", "Live Interactive Workshop", "Hands-on instruction, prompt engineering drills, and real-time agent building."],
                ["Stage 3", "Resource & SOP Handoff", "Deliver prompt libraries, recordings, templates, and start your 30-day Q&A access."],
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
            <h2 className="mt-2 font-display text-3xl font-semibold">This workshop is a fit when…</h2>
            <ul className="mt-7 space-y-3">
              {[
                "Your organization wants to move from basic chat prompts to structured agent workflows.",
                "Leadership needs a clear understanding of AI security, privacy boundaries, and ROI.",
                "Developers need practical guidance on Model Context Protocol (MCP) and RAG vector search.",
                "Operations teams need reliable prompt libraries and standardized AI SOPs.",
                "You want interactive, hands-on training rather than passive webinar slides.",
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
              <p className="font-medium text-foreground">Want to test interactive tools right now?</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try our free interactive suite including Agent Architect, Prompt Pilot, and MCP Builder.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/tools">Launch AI Tools</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 rounded-3xl border border-primary/25 bg-primary/5 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Reference Standards
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                Explore real implementation blueprints taught in our workshop.
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Review higher-education and non-profit workflow standards, human-in-the-loop gates, and quality rubrics.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link to="/proof">View reference examples</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">FAQs</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Questions teams ask before booking.
          </h2>
          <div className="mt-8 space-y-3">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group rounded-2xl border border-border bg-card p-5">
                <summary className="cursor-pointer list-none font-medium text-foreground">{faq.q}</summary>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="application" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Workshop Proposal Request
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Tell us about your team.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Share details about your team size, current AI skill level, and target workshop outcomes. We reply within two business days with fit and custom proposal options.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <ContactForm defaultTopic="Team AI Workshop inquiry" />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

/* =========================================================================
   4. GENERIC SERVICE VIEW (Fallback for any other service)
   ========================================================================= */
function GenericServiceView({ service }: { service: ServiceItem }) {
  function scrollToApplication() {
    document.getElementById("application")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="bg-grid absolute inset-0 opacity-35 [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {service.category || "AI Service"}
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
                <Link to="/proof">Review proof standard</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Custom scope pricing
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Defined code and IP handoff
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
            <Markdown md={service.description} />
          </div>
        </div>
      </section>

      {service.outcomes && service.outcomes.length > 0 && (
        <section className="border-b border-border bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Deliverables</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">Key Deliverables & Outcomes.</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {service.outcomes.map((outcome, idx) => (
                <article key={idx} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <p className="mt-3 text-sm font-medium text-foreground">{outcome}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="application" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Application</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">Tell us about your project.</h2>
            <p className="mt-4 text-muted-foreground">
              Share details about your team and goals. We reply within two business days.
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
