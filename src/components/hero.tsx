import { Link } from "@tanstack/react-router";
import { ArrowRight, Bot, Sparkles, Workflow, MessagesSquare, Database, Zap } from "lucide-react";

const FLOATING = [
  { icon: Bot, label: "Sales agent", className: "left-[6%] top-[18%] hidden lg:flex", delay: "0s" },
  { icon: MessagesSquare, label: "Support agent", className: "right-[6%] top-[24%] hidden lg:flex", delay: "0.4s" },
  { icon: Workflow, label: "Ops agent", className: "left-[10%] bottom-[18%] hidden md:flex", delay: "0.8s" },
  { icon: Database, label: "Research agent", className: "right-[8%] bottom-[14%] hidden md:flex", delay: "1.2s" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="bg-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <div className="absolute left-1/2 top-1/3 -z-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      {FLOATING.map(({ icon: Icon, label, className, delay }) => (
        <div
          key={label}
          style={{ animationDelay: delay }}
          className={`pointer-events-none absolute z-10 animate-float items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur ${className}`}
        >
          <span className="grid h-5 w-5 place-items-center rounded-md bg-foreground text-background">
            <Icon className="h-3 w-3" />
          </span>
          {label}
        </div>
      ))}

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent2" />
            The home for AI agents
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Build, deploy, and benefit from{" "}
            <span className="text-gradient-brand">AI agents.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Melanated In Tech is the marketplace, knowledge hub, and build partner for people putting AI
            agents to work — in businesses, ministries, creator studios, and beyond.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/agents"
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Browse the agent marketplace <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/knowledge"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium hover:bg-muted"
            >
              Explore the knowledge hub
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-accent2" /> Production-ready agents</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Ministry &amp; business ready</span>
            <span className="inline-flex items-center gap-1.5"><Workflow className="h-3.5 w-3.5 text-accent2" /> Built by operators, not theorists</span>
          </div>
        </div>
      </div>
    </section>
  );
}
