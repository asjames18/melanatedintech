import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import type { CommercialService } from "@/lib/commercial-services";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";

export function CommercialServicePage({ service }: { service: CommercialService }) {
  const topic = `${service.name} inquiry`;

  return (
    <SiteLayout>
      <PageHeader
        title={service.promise}
        description={service.description}
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/contact" search={{ topic }}>
                Tell us what you&apos;re trying to solve <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/strategy-sprint">Start with a Strategy Sprint</Link>
            </Button>
          </div>
        }
      />

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              When this helps
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              The problem usually shows up before the technology.
            </h2>
          </div>
          <ul className="space-y-3">
            {service.problems.map((problem) => (
              <li
                key={problem}
                className="flex gap-3 rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>{problem}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            What MIT delivers
          </p>
          <h2 className="mt-2 max-w-3xl font-display text-3xl font-semibold">
            A working, controlled system—not a slide deck or disconnected demo.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {service.deliverables.map((deliverable, index) => (
              <div
                key={deliverable}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm font-medium">{deliverable}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Typical outcomes
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {service.outcomes.map((outcome) => (
                <span
                  key={outcome}
                  className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium"
                >
                  {outcome}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Common use cases
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {service.examples.map((example) => (
                <div
                  key={example}
                  className="rounded-xl border border-border p-4 text-sm font-medium"
                >
                  {example}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-foreground p-7 text-background sm:p-10">
            <ShieldCheck className="h-6 w-6 text-accent2" />
            <h2 className="mt-4 max-w-3xl font-display text-3xl font-semibold">
              Start with the workflow, the owner, and the result you need.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-background/70">
              We will tell you whether the problem is a fit, what we would need to learn, and the
              smallest responsible next step.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-7">
              <Link to="/contact" search={{ topic }}>
                Tell us about the problem <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
