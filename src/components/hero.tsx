import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ShieldCheck, TimerReset } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_18%_15%,color-mix(in_oklch,var(--color-accent)_52%,transparent),transparent_34%),linear-gradient(180deg,var(--color-background),color-mix(in_oklch,var(--color-background)_75%,var(--color-accent)_25%))]">
      <div className="bg-grid absolute inset-0 opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_84%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:py-28">
        <div>
          <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Fix costly workflows with{" "}
            <span className="text-gradient-brand">practical AI systems.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Melanated In Tech designs and implements AI automation, integrations, and knowledge
            systems that reduce manual work while keeping people in control of the decisions that
            matter.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/contact"
              search={{ topic: "Business workflow inquiry" }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Tell us what you&apos;re trying to solve <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/strategy-sprint"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-semibold hover:bg-muted"
            >
              Explore the Strategy Sprint
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Workflow-first, not tool-first
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" /> Human boundaries where they matter
            </span>
            <span className="inline-flex items-center gap-1.5">
              <TimerReset className="h-4 w-4 text-primary" /> Fixed-scope discovery and pilots
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            <div className="border-b border-border bg-muted/40 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                From operational problem to working system
              </p>
            </div>
            <div className="space-y-4 p-5 sm:p-7">
              {[
                [
                  "1",
                  "Find the costly friction",
                  "Map the repeated work, delays, handoffs, and exceptions before choosing technology.",
                ],
                [
                  "2",
                  "Design the controlled workflow",
                  "Define integrations, data boundaries, human approvals, and a measurable target.",
                ],
                [
                  "3",
                  "Pilot, measure, and improve",
                  "Prove value on a focused scope, then expand only when the evidence supports it.",
                ],
              ].map(([number, title, body], index) => (
                <div key={number} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {number}
                    </span>
                    {index < 2 && <span className="mt-2 h-12 w-px bg-border" />}
                  </div>
                  <div className="pb-2">
                    <h2 className="font-display text-lg font-semibold">{title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border bg-emerald-500/5 p-5">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Measure the result that matters to the business.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                No fictional case-study numbers. Your baseline is established during the pilot.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
