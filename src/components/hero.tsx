import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, MapPin, ShieldCheck, TimerReset } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_18%_15%,color-mix(in_oklch,var(--color-accent)_52%,transparent),transparent_34%),linear-gradient(180deg,var(--color-background),color-mix(in_oklch,var(--color-background)_75%,var(--color-accent)_25%))]">
      <div className="bg-grid absolute inset-0 opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_84%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:py-28">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/70 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur">
            <MapPin className="h-3.5 w-3.5" /> Practical AI Education · Workbench · Marketplace · Implementation Systems
          </div>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Understand, build, and deploy AI Agents — from{" "}
            <span className="text-gradient-brand">practical learning to turnkey systems.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Melanated In Tech is an end-to-end AI operating platform. Learn agentic workflows, use free browser-based workbench tools, acquire pre-built marketplace agents, or deploy turnkey revenue-recovery automations for your business.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/tools"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Try Free Interactive Tools <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/diagnostic"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-semibold hover:bg-muted"
            >
              $297 Revenue Leak Diagnostic
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Free interactive tools & courses
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" /> Verified agent marketplace
            </span>
            <span className="inline-flex items-center gap-1.5">
              <TimerReset className="h-4 w-4 text-primary" /> Fixed-scope 30-day pilots
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            <div className="border-b border-border bg-muted/40 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                A recovery system in motion
              </p>
            </div>
            <div className="space-y-4 p-5 sm:p-7">
              {[
                [
                  "1",
                  "Customer signal",
                  "A missed call, open estimate, completed service, or unfilled appointment creates a follow-up opportunity.",
                ],
                [
                  "2",
                  "Bounded response",
                  "Approved rules and messages handle the routine next step while sensitive cases reach a person.",
                ],
                [
                  "3",
                  "Revenue event",
                  "The booking, accepted estimate, recurring plan, or repeat visit is recorded for reporting.",
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
