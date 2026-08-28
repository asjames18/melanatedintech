import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  CircleGauge,
  Code2,
  HandHeart,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { PageHeader, SiteLayout } from "@/components/site-layout";
import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    ...buildSeoMeta({
      title: "One-Year Roadmap - Melanated In Tech",
      description:
        "A focused one-year development roadmap for practical AI services, the Community, Open Commons, and responsible growth at Melanated In Tech.",
      url: "/roadmap",
    }),
  }),
  component: Roadmap,
});

const quarters = [
  {
    label: "Months 1–3",
    title: "Make the foundation repeatable",
    description:
      "Turn the current foundation into a dependable operating rhythm before adding more surface area.",
    icon: CircleGauge,
    accent: "Proof and operating discipline",
    priorities: [
      "Document repeatable delivery playbooks for AI Clarity Sessions, Workflow Diagnostics, and the Website Launch Sprint.",
      "Publish the first anonymized proof notes and tighten the inquiry-to-scope handoff.",
      "Run a consistent Community prompt rhythm and measure returning participation without collecting unnecessary personal data.",
      "Keep the Agent Tool Assurance Kit contributor-ready with clear issues, security guidance, and release notes.",
    ],
    outcome: "A small set of offers and workflows that can be explained, delivered, and improved consistently.",
  },
  {
    label: "Months 4–6",
    title: "Productize what people use",
    description:
      "Use real questions and delivery patterns to make the best ideas easier to learn, buy, and reuse.",
    icon: Sparkles,
    accent: "Useful tools and teaching",
    priorities: [
      "Refine a small collection of starter packs, workflow templates, and responsible-use guides around observed needs.",
      "Create a lightweight education rhythm: practical lessons, office hours, and Community prompts that lead to action.",
      "Release a meaningful Agent Tool Assurance Kit update with examples, synthetic fixtures, and contributor documentation.",
      "Improve privacy-preserving funnel measurement for qualified inquiries, confirmed checklist requests, and completed engagements.",
    ],
    outcome: "A clearer path from learning to a bounded service, reusable tool, or public contribution.",
  },
  {
    label: "Months 7–9",
    title: "Grow the Community flywheel",
    description:
      "Make the Community valuable because members learn, share, and find useful collaborators—not because it has more features.",
    icon: UsersRound,
    accent: "Participation and trust",
    priorities: [
      "Introduce recurring member-led prompts, small virtual sessions, and carefully chosen builder spotlights when participation supports them.",
      "Add contribution pathways for documentation, testing, accessibility, and workflow examples—not only advanced code.",
      "Develop a small partner and referral loop around organizations that need practical AI training or workflow clarity.",
      "Review moderation, reporting, privacy, and notification patterns using real usage evidence before expanding social mechanics.",
    ],
    outcome: "A healthier owned learning and collaboration channel with visible, respectful paths to participate.",
  },
  {
    label: "Months 10–12",
    title: "Scale selectively—or deepen",
    description:
      "Use the evidence from the first nine months to choose what deserves a larger investment in year two.",
    icon: Code2,
    accent: "Evidence-led expansion",
    priorities: [
      "Package the strongest recurring workflow or service pattern into a clearer implementation offer or reusable product.",
      "Publish a year-one review covering what was useful, what was paused, and what the Community helped reveal.",
      "Expand open-source stewardship only where maintainers, contributors, security practices, and documentation can support it.",
      "Choose a limited number of year-two bets; do not turn every promising idea into a permanent product commitment.",
    ],
    outcome: "A credible year-two investment case based on adoption, delivery quality, contribution, and trust—not guesses.",
  },
] as const;

const successMeasures = [
  {
    icon: HandHeart,
    label: "Business usefulness",
    measure: "Qualified inquiries, completed scopes, repeatable delivery, and client-reported next steps.",
  },
  {
    icon: UsersRound,
    label: "Community health",
    measure: "Returning members, useful discussions, prompt participation, and respectful moderation outcomes.",
  },
  {
    icon: Code2,
    label: "Open contribution",
    measure: "Resolved issues, reviewed pull requests, contributor onboarding, release notes, and reusable examples.",
  },
  {
    icon: ShieldCheck,
    label: "Trust and safety",
    measure: "Consent integrity, suppression handling, security response, accessibility, and privacy-preserving analytics.",
  },
] as const;

const guardrails = [
  "No anonymous marketing email, purchased lists, or campaign activation without explicit consent and a genuine mailing address.",
  "No broad platform expansion before the current services, Community, and Open Commons show sustained usefulness.",
  "No customer data, payment activity, or private member content in public examples or open-source fixtures.",
  "No promise of a feature, partnership, revenue result, or hiring outcome until the evidence and scope support it.",
] as const;

function Roadmap() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="One-year roadmap"
        title="Build what becomes more useful with time."
        description="This is a focused development path for Melanated In Tech: practical AI services, an owned Community, an open commons, and responsible systems that earn the right to grow."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              to="/community"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Visit the Community <ArrowRight className="h-4 w-4" />
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
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">The north star</p>
            <h2 className="mt-2 max-w-3xl font-display text-3xl font-semibold sm:text-4xl">
              One connected system, not a pile of disconnected features.
            </h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
              The next year should make Melanated In Tech easier to understand and more useful to
              return to. A business owner should be able to learn something practical, get help with a
              bounded problem, or bring a real workflow into a safer open conversation.
            </p>
            <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
              The sequence starts with repeatability, moves into productized learning, grows through
              participation, and ends with an evidence-based decision about what deserves deeper
              investment.
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
                ["Share", "Return reusable lessons to the Community and Open Commons."],
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
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">The sequence</p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Four quarters of deliberate progress.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Each quarter has a job. The priorities can change when evidence changes, but the order
              protects the business from scaling complexity before it has earned demand.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {quarters.map(({ icon: Icon, label, title, description, accent, priorities, outcome }) => (
              <article key={label} className="rounded-2xl border border-border bg-card p-6 sm:p-7">
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
                  {priorities.map((priority) => (
                    <li key={priority} className="flex gap-3 text-sm leading-relaxed">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{priority}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-border pt-4">
                  <p className="text-sm">
                    <span className="font-semibold">Quarter outcome:</span>{" "}
                    <span className="text-muted-foreground">{outcome}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">How we will know</p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Measure usefulness, not motion.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              These are working measures for decision-making, not promises of future results. They keep
              growth connected to the people served, the contributors welcomed, and the trust maintained.
            </p>
          </div>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {successMeasures.map(({ icon: Icon, label, measure }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-6">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-display text-xl font-semibold">{label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{measure}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">What we will not rush</p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Restraint is part of the roadmap.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              A good roadmap makes tradeoffs visible. These guardrails protect the focus of the product,
              the privacy of members, and the credibility of the services.
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
                  <p className="text-xs font-semibold uppercase tracking-wider">Help shape the next useful thing</p>
                </div>
                <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                  Bring a real problem, lesson, or contribution into the work.
                </h2>
                <p className="mt-3 text-background/70">
                  The roadmap is a living commitment to focus. It should change when real people teach us
                  something important, while keeping the boundaries that make the work trustworthy.
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
          <p className="font-semibold text-foreground">Research behind the sequence</p>
          <p className="mt-2 max-w-4xl leading-relaxed">
            The roadmap prioritizes skills, workflow fit, and responsible implementation because current
            SME research points to both the benefits and the adoption barriers of generative AI. Its open-source
            milestones reflect established community-health guidance, while its Community milestones emphasize
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
