import { useEffect } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ArrowDown,
  CalendarDays,
  CheckCircle2,
  Cpu,
  Database,
  FileSearch,
  Gauge,
  HelpCircle,
  Layers,
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

export const Route = createFileRoute("/services/custom-agent-build")({
  beforeLoad: () => {
    throw redirect({ to: "/work-with-us" });
  },
  head: () => {
    const path = "/services/custom-agent-build";
    const seo = buildSeoMeta({
      title: "Custom Autonomous Agent Build | Melanated In Tech",
      description:
        "End-to-end custom AI agent design, MCP server database integration, prompt guardrails, and production deployment.",
      url: path,
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Services", path: "/services" },
            { name: "Custom Agent Build", path },
          ]),
        ),
      ],
    };
  },
  component: CustomAgentBuildPage,
});

const DELIVERABLES = [
  [
    Cpu,
    "Custom Prompt Architecture",
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

const FAQS = [
  [
    "How is pricing structured?",
    "Pricing is completely custom based on workflow complexity, number of tool integrations (MCP servers), database scale, and security requirements. We provide a written scope, dependencies, exclusions, and fixed-price proposal before implementation begins.",
  ],
  [
    "Who owns the code and IP?",
    "Ownership and reuse rights for custom deliverables are defined in the written proposal. We provide a documented handoff of the agreed code, configurations, and operating materials.",
  ],
  [
    "How long does a custom build take?",
    "Typical custom agent builds take 3 to 6 weeks from kick-off to production deployment depending on tool integration complexity.",
  ],
  [
    "What AI models do you support?",
    "We build model-agnostic systems. You can use Anthropic Claude 3.5, OpenAI GPT-4o, Google Gemini 1.5, or open-weight Llama 3 models depending on your privacy requirements.",
  ],
  [
    "How is sensitive data protected?",
    "We define data boundaries, access controls, approved providers, and retention expectations in the project scope. No system should be treated as risk-free without the agreed safeguards and operational review.",
  ],
];

function CustomAgentBuildPage() {
  useEffect(() => {
    trackEvent("custom_agent_build_viewed", { ...funnelAttribution() });
  }, []);

  function scrollToApplication() {
    trackEvent("custom_agent_build_application_started", { surface: "hero", ...funnelAttribution() });
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

      {/* Deliverables Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Deliverables
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Everything engineered for production reliability.
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

      {/* Proof Banner */}
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

      {/* FAQs Section */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">FAQs</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Questions teams ask before building.
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
