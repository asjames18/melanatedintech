import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Compass,
  PackageOpen,
  Rocket,
  ShieldCheck,
  Sparkles,
  Telescope,
} from "lucide-react";
import { PageHeader, SiteLayout } from "@/components/site-layout";
import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    ...buildSeoMeta({
      title: "Roadmap - Melanated in Tech",
      description:
        "What Melanated in Tech is bringing to business owners: practical tools, honest guides, and reusable systems — shaped by real work, not guesses.",
      url: "/roadmap",
    }),
  }),
  component: Roadmap,
});

const horizons = [
  {
    label: "Now",
    title: "Useful things you can use today",
    description:
      "Everything here is live right now. Each one came out of real workflow problems, not a brainstorm.",
    icon: Rocket,
    accent: "Available today",
    items: [
      "Revenue Recovery Scan — find where your business is leaking revenue in a few minutes, free.",
      "$1 Workflow Opportunity Scorecard — a one-dollar read on where AI could actually help your operations.",
      "Knowledge Hub — free field guides on AI agents, automation, and workflow design, written in plain language.",
      "Tools workbench — practical utilities you can use without creating an account.",
      "Premium AI agents — one-payment tools built from real workflow patterns, yours to keep.",
      "Agent Tool Assurance Kit — our open-source starter for declaring what an AI tool may and may not do.",
    ],
    note: "If it's listed here, it works today. We don't announce things that aren't ready.",
  },
  {
    label: "Next",
    title: "What we're working on",
    description:
      "In progress now. These ship when they're genuinely useful — not on a marketing calendar.",
    icon: Compass,
    accent: "In the works",
    items: [
      "More workflow playbooks drawn from real client engagements — the patterns that keep showing up.",
      "New agents built only from workflows that have proven themselves in practice first.",
      "Expanded open-source examples, test fixtures, and guides in the Agent Tool Assurance Kit.",
      "Deeper diagnostic tooling for owners who want a clearer picture before they spend anything.",
    ],
    note: "The order follows what real owners teach us. Useful things ship; guesses don't.",
  },
  {
    label: "Later",
    title: "Where this is headed",
    description:
      "The direction, stated honestly. No dates, no promises — just where the work is pointing.",
    icon: Telescope,
    accent: "On the horizon",
    items: [
      "A fuller library of reusable workflow systems any small team can pick up and run.",
      "More open tools and community-contributed examples in the Open Commons.",
      "Clearer paths from learning a concept to actually running it inside your business.",
    ],
    note: "We'll say more about each of these when there's something real to show.",
  },
] as const;

const guardrails = [
  "No hype promises — we won't claim revenue results or outcomes the evidence doesn't support.",
  "No customer data, payment activity, or private business details in public examples or open-source fixtures.",
  "No announced feature or launch date until the work behind it is real.",
  "No growth at the cost of trust: privacy, consent, and accessibility come before new surface area.",
] as const;

function Roadmap() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Roadmap"
        title="What we're building for you."
        description="A look at what Melanated in Tech is bringing to business owners: practical tools, honest guides, and reusable systems. It changes when real work teaches us something new."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Explore the tools <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/open-commons"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold hover:border-primary/40"
            >
              Explore Open Commons
            </Link>
          </div>
        }
      />

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">How we decide what to build</p>
            <h2 className="mt-2 max-w-3xl font-display text-3xl font-semibold sm:text-4xl">
              Built from real work, not brainstorms.
            </h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
              Everything public we make starts as a real problem inside a real business. We teach
              what we learn, test it in bounded experiments, deliver it as a focused service or
              tool, and share the reusable lessons back openly.
            </p>
            <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
              That means this roadmap is shaped by the people who use what we make. When owners show
              us something important, the plan changes — and that's the point.
            </p>
          </div>
          <div className="rounded-3xl border border-primary/25 bg-card p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <BookOpenCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold">The operating thesis</p>
                <p className="text-sm text-muted-foreground">Teach → test → serve → share</p>
              </div>
            </div>
            <div className="mt-6 space-y-4 text-sm">
              {[
                ["Teach", "Make responsible AI and workflow decisions easier to understand."],
                ["Test", "Use bounded experiments, synthetic examples, and human approval."],
                ["Serve", "Deliver focused outcomes with clear scope, price, and handoff."],
                ["Share", "Return reusable lessons to the Knowledge Hub and Open Commons."],
              ].map(([title, description]) => (
                <div key={title} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p>
                    <span className="font-semibold">{title}:</span>{" "}
                    <span className="text-muted-foreground">{description}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">The plan</p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Now, next, and later — no vaporware.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Three horizons, no fixed dates. What's under "Now" works today. What's under "Next"
              is being built. What's under "Later" is the honest direction. We'd rather
              under-promise than publish a wish list.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {horizons.map(({ icon: Icon, label, title, description, accent, items, note }) => (
              <article key={label} className="flex flex-col rounded-2xl border border-border bg-card p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">{label}</p>
                    <h3 className="mt-2 font-display text-2xl font-semibold">{title}</h3>
                  </div>
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-primary">{accent}</p>
                <ul className="mt-3 space-y-3">
                  {items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-border pt-4 mt-auto">
                  <p className="flex gap-2 text-sm">
                    <PackageOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{note}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">What we will not rush</p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Restraint is part of the roadmap.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              A good roadmap makes tradeoffs visible. These are the lines we don't cross, even when
              it would be faster or louder not to.
            </p>
          </div>
          <div className="space-y-3">
            {guardrails.map((guardrail) => (
              <div key={guardrail} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-muted-foreground">{guardrail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-foreground p-7 text-background sm:p-12">
            <div className="bg-grid absolute inset-0 opacity-10" />
            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-background/65">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wider">Help shape what's next</p>
                </div>
                <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                  Bring a real problem into the work.
                </h2>
                <p className="mt-3 text-background/70">
                  The roadmap is a living commitment to focus. It should change when real people teach us
                  something important — tell us what's actually slowing your business down.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-background px-6 text-sm font-semibold text-foreground hover:bg-background/90"
                >
                  Share a use case <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/community"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-background/30 px-6 text-sm font-semibold text-background hover:bg-background/10"
                >
                  Join the conversation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p className="font-semibold text-foreground">Why we work this way</p>
          <p className="mt-2 max-w-4xl leading-relaxed">
            The roadmap prioritizes skills, workflow fit, and responsible implementation because current
            SME research points to both the benefits and the adoption barriers of generative AI. Its open-source
            milestones reflect established community-health guidance, while its community milestones emphasize
            useful participation and measurement before heavier social mechanics.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            <a
              href="https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              OECD SME generative-AI research
            </a>
            <a
              href="https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              GitHub community-health guidance
            </a>
            <a
              href="https://www.jpmorganchase.com/institute/all-topics/business-growth-and-entrepreneurship/understanding-ai-use-by-small-businesses"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              JPMorganChase Institute small-business research
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
