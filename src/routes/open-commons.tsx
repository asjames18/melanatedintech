import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Braces,
  CheckCircle2,
  GitPullRequest,
  HandHeart,
  ShieldCheck,
  UsersRound,
  Workflow,
} from "lucide-react";
import { PageHeader, SiteLayout } from "@/components/site-layout";
import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/open-commons")({
  head: () => ({
    ...buildSeoMeta({
      title: "Open Commons — Community-Built AI Infrastructure | Melanated In Tech",
      description:
        "Melanated In Tech Open Commons is where practical AI tools, examples, policy patterns, and community contributions become shared infrastructure.",
      url: "/open-commons",
    }),
  }),
  component: OpenCommons,
});

const contributionPaths = [
  {
    icon: Workflow,
    title: "Share a real workflow question",
    description:
      "Help us identify where a small business, nonprofit, or community team needs a clearer AI boundary, approval step, or handoff.",
    action: "Share a use case",
    to: "/contact" as const,
  },
  {
    icon: Braces,
    title: "Improve a practical tool",
    description:
      "Use the policy, workflow, evaluation, and schema tools. Report friction, improve a guide, or help shape a safer example.",
    action: "Explore the tools",
    to: "/tools" as const,
  },
  {
    icon: GitPullRequest,
    title: "Contribute to the assurance kit",
    description:
      "The first public project will invite documentation, test-fixture, accessibility, and code contributions—not only advanced engineering work.",
    action: "Read the contribution model",
    to: "/governance" as const,
  },
] as const;

const openAssets = [
  "Readable policy contracts that describe purpose, boundaries, approvals, and escalation paths.",
  "Safe synthetic test fixtures for bounded workflows such as lead intake, invoice support, and knowledge access.",
  "Examples and guides that help teams test a tool before they put it in front of a customer or colleague.",
  "Public learning notes, contributor credit, and decision records that explain how the project is evolving.",
] as const;

function OpenCommons() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Open Commons"
        title="Build practical AI infrastructure together."
        description="Open Commons is where Melanated In Tech turns reusable lessons from real-world work into public tools, examples, and practices that more people can understand, improve, and own."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Explore practical tools <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/governance"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold hover:border-primary/40"
            >
              How we govern the work
            </Link>
          </div>
        }
      />

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              A community commons, not a content feed
            </p>
            <h2 className="mt-2 max-w-3xl font-display text-3xl font-semibold sm:text-4xl">
              Real work. Real influence. Real credit.
            </h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
              Open source gives people a path from learning about AI to improving the shared tools and
              rules that shape how it is used. The goal is not to build a social feed. It is to make
              participation practical: ask a useful question, improve an example, test a boundary,
              document a lesson, or contribute code when you are ready.
            </p>
            <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
              Melanated In Tech will remain accountable for scope, security, and release quality. As
              trusted contributions grow, the project can share more stewardship in public and on
              purpose.
            </p>
          </div>

          <div className="rounded-3xl border border-primary/25 bg-card p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold">The first shared project</p>
                <p className="text-sm text-muted-foreground">Agent Tool Assurance Kit</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              A small open toolkit for declaring what an AI tool is allowed to do, testing what it
              must refuse, and producing portable evidence before deployment.
            </p>
            <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-4 text-sm">
              <p className="font-semibold">Version 0.1 is intentionally narrow.</p>
              <p className="mt-1 text-muted-foreground">
                It will begin with readable policy contracts, a lightweight verifier, synthetic
                examples, and contribution materials. It will not host customer data or execute real
                payments.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Contribution paths</p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              You do not have to be a senior engineer to help build the commons.
            </h2>
          </div>
          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            {contributionPaths.map(({ icon: Icon, title, description, action, to }) => (
              <Link
                key={title}
                to={to}
                className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/45 hover:shadow-sm"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  {action} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">What stays open</p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Shared infrastructure should be useful on its own.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The public commons will hold general tools and learning material that anyone can use,
              adapt, and improve. Paid implementation remains available for organizations that need
              custom workflows, integration, training, and accountable operating support.
            </p>
          </div>
          <div className="space-y-3">
            {openAssets.map((asset) => (
              <div key={asset} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-muted-foreground">{asset}</p>
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
                  <UsersRound className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wider">Build with us</p>
                </div>
                <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                  Bring the next useful problem into the open.
                </h2>
                <p className="mt-3 text-background/70">
                  Share a workflow where the right boundary, approval, or human handoff would make AI
                  more useful. The best public tools start with real needs and clear limits.
                </p>
              </div>
              <Link
                to="/contact"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-background px-6 text-sm font-semibold text-foreground hover:bg-background/90"
              >
                Share a use case <HandHeart className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
