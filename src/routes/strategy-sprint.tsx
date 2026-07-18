import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
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
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";
import { buildSeoMeta } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import { funnelAttribution } from "@/components/funnel-attribution";

export const Route = createFileRoute("/strategy-sprint")({
  head: () => ({
    ...buildSeoMeta({
      title: "Agent Strategy Sprint | Melanated In Tech",
      description:
        "A focused strategy engagement that turns one important workflow into an implementation-ready AI agent plan.",
      url: "/strategy-sprint",
    }),
  }),
  component: StrategySprint,
});

const DELIVERABLES = [
  [
    FileSearch,
    "Workflow brief",
    "A current-state map with users, inputs, systems, bottlenecks, and edge cases.",
  ],
  [
    Workflow,
    "Agent blueprint",
    "The agent job, context sources, tools, memory, handoffs, and success criteria.",
  ],
  [
    ShieldCheck,
    "Approval & risk design",
    "Human gates, data boundaries, failure modes, and a practical escalation path.",
  ],
  [
    ClipboardCheck,
    "Evaluation plan",
    "A starter test set, quality rubric, and launch measures your team can own.",
  ],
  [
    Gauge,
    "Implementation roadmap",
    "A prioritized 30/60/90-day plan with scope, dependencies, and build options.",
  ],
  [
    Users,
    "Leadership readout",
    "A decision-ready session that aligns owners on whether, where, and how to proceed.",
  ],
] as const;

const FAQS = [
  [
    "How much does it cost?",
    "Pricing is custom based on organizational scope, team size, and workflow complexity. We provide a transparent scope quote upfront with zero hourly billing surprises.",
  ],
  [
    "Do we need a technical team?",
    "No. We work with the people who own the workflow and translate the result into a plan a technical partner—or our team—can implement.",
  ],
  [
    "Will you build the agent during the sprint?",
    "The sprint produces an implementation-ready design, not a production deployment. If a lightweight prototype is useful, we will scope it explicitly before work begins.",
  ],
  [
    "Can we bring more than one workflow?",
    "Bring your shortlist. We will use a value, feasibility, and risk screen to select one primary workflow for the sprint.",
  ],
  [
    "What happens after the sprint?",
    "You can implement internally, take the blueprint to another partner, or ask Melanated In Tech to scope a build. The deliverables are yours either way.",
  ],
  [
    "How is sensitive data handled?",
    "Discovery starts with process and representative examples. We define data boundaries before requesting access and avoid production data unless it is necessary and explicitly approved.",
  ],
];

function StrategySprint() {
  useEffect(() => {
    trackEvent("strategy_sprint_viewed", { ...funnelAttribution() });
  }, []);

  function scrollToApplication(surface: string) {
    trackEvent("strategy_sprint_application_started", { surface, ...funnelAttribution() });
    document.getElementById("application")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="bg-grid absolute inset-0 opacity-35 [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Agent Strategy Sprint
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-6xl">
              Turn one important workflow into a plan your team can actually approve and build.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              A focused two-week engagement for teams that see the opportunity in AI agents but need
              clarity on scope, risk, ownership, and expected value before they invest.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => scrollToApplication("hero")}>
                Apply for a sprint <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/proof">Review the proof standard</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Custom scope pricing
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" /> Two weeks
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> 2–5 stakeholder sessions
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Implementation-ready handoff
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
            Everything needed for a confident go/no-go decision.
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {DELIVERABLES.map(([Icon, title, body]) => (
              <article key={title} className="rounded-2xl border border-border bg-card p-6">
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
            <h2 className="mt-2 font-display text-3xl font-semibold">Two weeks, four decisions.</h2>
            <ol className="mt-7 space-y-4">
              {[
                ["Days 1–3", "Choose", "Align on the workflow, owner, users, and outcome."],
                [
                  "Days 3–6",
                  "Map",
                  "Document the current process, systems, data, and exception paths.",
                ],
                [
                  "Days 6–9",
                  "Design",
                  "Define the agent, human approvals, guardrails, and evaluation plan.",
                ],
                [
                  "Days 10–14",
                  "Decide",
                  "Review the roadmap, investment options, and recommended next move.",
                ],
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
              Ideal customer
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">This is a fit when…</h2>
            <ul className="mt-7 space-y-3">
              {[
                "A repeated workflow consumes meaningful staff time every week.",
                "The work crosses people, inboxes, documents, or systems.",
                "Leadership needs a credible plan before approving a build.",
                "Accuracy, privacy, trust, or human judgment matter.",
                "A named owner can participate and make scope decisions.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent2" /> {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
              <p className="font-medium">Not the right engagement yet?</p>
              <p className="mt-2 text-sm text-muted-foreground">
                If you are still choosing a first workflow, start with the free Fit Finder and
                personalized starter kit before applying.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <a href="/fit-finder">Use the Fit Finder</a>
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
                See how the method handles real-world complexity.
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Review detailed higher-education and ministry/nonprofit reference workflows,
                including current process, agent role, human approvals, and expected outcomes.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <a href="/proof">View reference examples</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">FAQs</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Questions teams ask before applying.
          </h2>
          <div className="mt-8 space-y-3">
            {FAQS.map(([question, answer]) => (
              <details
                key={question}
                className="group rounded-2xl border border-border bg-card p-5"
              >
                <summary className="cursor-pointer list-none font-medium">{question}</summary>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {answer}
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
              Application
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Tell us about the workflow.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Share the process, who owns it, where it slows down, and what a useful outcome would
              look like. We will respond within two business days with fit and next steps.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <ContactForm defaultTopic="Strategy Sprint application" />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
