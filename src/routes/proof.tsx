import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ClipboardCheck, ShieldCheck } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/proof")({
  head: () => ({
    ...buildSeoMeta({
      title: "Agent Implementation Proof - Melanated In Tech",
      description:
        "Practical proof, risk checks, and field notes for trustworthy AI agent implementation.",
      url: "/proof",
    }),
  }),
  component: Proof,
});

function Proof() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Proof + trust"
        title="What good agent implementation looks like."
        description="A practical standard for deciding whether an agent is ready to touch real work, real people, or real money."
      />

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          <TrustPanel
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Clear job"
            items={[
              "One workflow, one owner, one measurable outcome.",
              "Known tools and data sources.",
              "A visible handoff when the agent is uncertain.",
            ]}
          />
          <TrustPanel
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Safe boundaries"
            items={[
              "Least-privilege tool access.",
              "Human approval for sensitive decisions.",
              "Misuse tests before public launch.",
            ]}
          />
          <TrustPanel
            icon={<ClipboardCheck className="h-5 w-5" />}
            title="Measured quality"
            items={[
              "Golden-set examples for expected behavior.",
              "Cost, latency, and failure tracking.",
              "Regular review of real user outcomes.",
            ]}
          />
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl font-semibold">
            Before you automate: risk checklist
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              "Could the agent expose private data?",
              "Could it spend money, change records, or contact people?",
              "Would a wrong answer damage trust?",
              "Is there a simple way for a human to review or reverse the action?",
              "Do you have examples of good and bad output?",
              "Can you explain the workflow to a non-technical stakeholder?",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl bg-muted/50 p-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Field note</p>
            <h2 className="mt-2 font-display text-xl font-semibold">
              Start with the boring workflow.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The best first agent is usually not the flashiest one. It is the repeated task where
              success is easy to recognize, failures are reversible, and the user already knows what
              good work looks like.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Service signal</p>
            <h2 className="mt-2 font-display text-xl font-semibold">Use proof before pitch.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A trusted implementation shows its evaluation plan, approval gates, and operating
              metrics before it asks anyone to believe the demo.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">
              Need help applying this to your team?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pair the checklist with a learning path, or bring the workflow into a strategy sprint.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/paths">View paths</Link>
            </Button>
            <Button asChild>
              <Link to="/services">View services</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function TrustPanel({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h2 className="mt-4 font-display text-xl font-semibold">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
