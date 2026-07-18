import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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

export const Route = createFileRoute("/services/ai-workshop")({
  head: () => {
    const path = "/services/ai-workshop";
    const seo = buildSeoMeta({
      title: "Hands-On Team AI & Agent Workshop | Melanated In Tech",
      description:
        "Interactive live training workshop equipping your leadership, developers, or staff to build and operate AI agents.",
      url: path,
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Services", path: "/services" },
            { name: "Team AI Workshop", path },
          ]),
        ),
      ],
    };
  },
  component: TeamAiWorkshopPage,
});

const DELIVERABLES = [
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

const FAQS = [
  [
    "How is pricing structured?",
    "Pricing is custom based on team size, session length (half-day vs. full-day), and level of curriculum customization. We provide transparent upfront proposals.",
  ],
  [
    "Can the workshop be conducted remotely or in-person?",
    "Workshops are available virtually via Zoom/Teams with hands-on breakout rooms, or in-person at your company's office location.",
  ],
  [
    "Do participants need programming experience?",
    "We offer non-technical tracks for business leaders and operations teams, as well as technical tracks for developers. No prior coding is required for business tracks.",
  ],
  [
    "What materials do participants receive?",
    "Every participant receives high-definition session recordings, slide decks, downloadable prompt templates, and operational SOP guidelines.",
  ],
];

function TeamAiWorkshopPage() {
  useEffect(() => {
    trackEvent("team_ai_workshop_viewed", { ...funnelAttribution() });
  }, []);

  function scrollToApplication() {
    trackEvent("team_ai_workshop_application_started", { surface: "hero", ...funnelAttribution() });
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

      {/* Deliverables Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Deliverables & Tracks
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Actionable skills for your entire team.
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

      {/* Proof Banner */}
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

      {/* FAQs Section */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">FAQs</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Questions teams ask before booking.
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
