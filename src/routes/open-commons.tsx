import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Braces,
  CheckCircle2,
  GitPullRequest,
  Github,
  HandHeart,
  MessageSquare,
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
    icon: MessageSquare,
    title: "Discuss in the Community Network",
    description:
      "Join the AI builder network to discuss open-source tools, share usage notes, and debate policy and safety standards.",
    action: "Join the conversation",
    to: "/community" as const,
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
              to="/community"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold hover:border-primary/40"
            >
              <MessageSquare className="h-4 w-4 text-primary" /> Community Feed
            </Link>
            <a
              href="https://github.com/asjames18/agent-tool-assurance"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold hover:border-primary/40"
            >
              <Github className="h-4 w-4" /> View the public kit
            </a>
          </div>
        }
      />

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              A community commons, not a content feed
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              We publish working tools, not just opinions about AI.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Most small teams do not need another viral demo. They need predictable boundaries, safe defaults, clear handoffs, and tool specifications that do not fail when an edge case appears.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The Open Commons collects patterns from live client and community systems, packages them into reusable assets, and opens them for review, criticism, and contribution.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-7 shadow-xs">
            <div className="flex items-center gap-2.5 text-primary">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="font-display text-lg font-bold">The Commons Principles</h3>
            </div>
            <ul className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span><strong>Boundaries first:</strong> Every agent system must declare what it cannot do alone.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span><strong>Open learning:</strong> Real failure modes are documented so teams avoid repeat mistakes.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span><strong>Human governance:</strong> Operational oversight stays with accountable professionals.</span>
              </li>
            </ul>
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
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {contributionPaths.map(({ icon: Icon, title, description, action, to }) => (
              <Link
                key={title}
                to={to}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/45 hover:shadow-sm"
              >
                <div>
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  {action} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
                  more useful. Join the community network to collaborate with other builders.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <Link
                  to="/community"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Join Community Discussion <MessageSquare className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-background px-6 text-sm font-semibold text-foreground hover:bg-background/90"
                >
                  Share a use case <HandHeart className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
