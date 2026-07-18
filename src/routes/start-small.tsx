import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Church,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { buildSeoMeta } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import { funnelAttribution } from "@/components/funnel-attribution";

export const Route = createFileRoute("/start-small")({
  head: () => ({
    ...buildSeoMeta({
      title: "Find Your First Useful AI Agent | Melanated In Tech",
      description:
        "Choose one useful workflow, get a practical recommendation, and leave with a personalized AI agent starter kit.",
      url: "/start-small",
    }),
  }),
  component: StartSmall,
});

const AUDIENCES = [
  {
    Icon: GraduationCap,
    title: "Higher education",
    body: "Enrollment, student services, advancement, academic operations, and administrative teams with repetitive intake and follow-up work.",
  },
  {
    Icon: Church,
    title: "Ministries & nonprofits",
    body: "Mission-driven teams that need to serve people consistently while keeping sensitive decisions and relationships human-led.",
  },
  {
    Icon: Building2,
    title: "Small teams & operators",
    body: "Founders, consultants, and business leaders who need leverage without creating an expensive automation project.",
  },
];

const EXAMPLES = [
  [
    "Student request triage",
    "Sort requests, draft replies, and route exceptions to the right staff member.",
  ],
  [
    "Volunteer follow-up",
    "Turn form responses into personalized drafts while a ministry leader approves every send.",
  ],
  [
    "Meeting-to-action workflow",
    "Summarize decisions, assign next steps, and prepare follow-up without replacing the owner.",
  ],
  [
    "Knowledge assistant",
    "Help staff find approved answers across policies, procedures, and internal documentation.",
  ],
];

function StartSmall() {
  useEffect(() => {
    trackEvent("start_small_viewed", { ...funnelAttribution() });
  }, []);

  const begin = (surface: string) =>
    trackEvent("fit_finder_started", { surface, ...funnelAttribution() });

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_18%_12%,color-mix(in_oklch,var(--color-accent)_45%,transparent),transparent_35%),linear-gradient(180deg,var(--color-background),color-mix(in_oklch,var(--color-background)_78%,var(--color-accent)_22%))]">
        <div className="bg-grid absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              The First Useful Agent
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Start with one workflow your team already understands.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              You do not need an AI transformation plan. You need one repeated task, a clear human
              owner, and a useful first result. The Fit Finder will help you choose it in about
              three minutes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/fit-finder" onClick={() => begin("start_small_hero")}>
                  Find my first useful agent <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/proof">See reference workflows</Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> No technical setup
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Personalized starter kit
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Human approvals included
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Who this helps
          </p>
          <h2 className="mt-2 max-w-3xl font-display text-3xl font-semibold">
            Teams with more good work than time—and too much judgment to automate blindly.
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {AUDIENCES.map(({ Icon, title, body }) => (
              <article key={title} className="rounded-2xl border border-border bg-card p-6">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              What counts
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">Useful beats impressive.</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              A strong first agent handles a narrow job, works from approved information, and knows
              exactly when to ask a person. It should save time in the first month and teach your
              team what to build next.
            </p>
            <div className="mt-6 rounded-2xl border border-primary/25 bg-primary/5 p-5">
              <p className="flex items-center gap-2 font-medium">
                <ShieldCheck className="h-5 w-5 text-primary" /> The rule
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                The agent prepares, organizes, or recommends. A named human approves sensitive
                messages, decisions, records, money, and policy exceptions.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {EXAMPLES.map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-border bg-card p-5">
                <Workflow className="h-5 w-5 text-accent2" />
                <h3 className="mt-3 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            [
              "1",
              "Answer five questions",
              "Tell us your role, first goal, risk level, tools, and timeline.",
            ],
            [
              "2",
              "See matched resources",
              "Get agents, articles, and a next step selected around your answers.",
            ],
            [
              "3",
              "Download your plan",
              "Receive a personalized starter kit you can use in your next team conversation.",
            ],
          ].map(([number, title, body]) => (
            <div key={number} className="rounded-2xl border border-border bg-card p-6">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-sm font-semibold text-background">
                {number}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-3xl bg-foreground px-6 py-10 text-background sm:px-10 sm:py-12">
          <Sparkles className="h-6 w-6 text-accent2" />
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-semibold">
            Leave with a better first move—not another list of AI tools.
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-background/70">
            The Fit Finder is free. If the workflow is complex or high-risk, we will also show you
            when an Agent Strategy Sprint is the safer next step.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-7">
            <Link to="/fit-finder" onClick={() => begin("start_small_final")}>
              Start the Fit Finder <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
