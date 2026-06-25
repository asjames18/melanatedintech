import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Workflow, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_20%_18%,color-mix(in_oklch,var(--color-accent)_42%,transparent),transparent_34%),linear-gradient(180deg,var(--color-background),color-mix(in_oklch,var(--color-background)_72%,var(--color-accent)_28%))]">
      <div className="bg-grid absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      <div className="absolute left-1/2 top-12 h-56 w-56 -translate-x-1/2 rounded-full border border-primary/10" />
      <div className="absolute left-1/2 top-24 h-28 w-28 -translate-x-1/2 rounded-full border border-accent2/20" />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-semibold leading-tight sm:text-6xl lg:text-7xl">
            Build, deploy, and benefit from <span className="text-gradient-brand">AI agents.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Melanated In Tech is the marketplace, knowledge hub, and build partner for people
            putting AI agents to work - in businesses, ministries, creator studios, and beyond.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/agents"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Browse the agent marketplace <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/knowledge"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
            >
              Explore the knowledge hub
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent2" /> Production-ready agents
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" /> Ministry &amp; business ready
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Workflow className="h-3.5 w-3.5 text-accent2" /> Built by operators, not theorists
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
