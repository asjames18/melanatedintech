import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ClipboardList, ShieldAlert } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { funnelAttribution } from "@/components/funnel-attribution";
import {
  PLANNING_SIGNAL_DISCLAIMER,
  WORKFLOW_OPPORTUNITY_SPRINT as SPRINT,
} from "@/lib/workflow-opportunity-sprint";

export function WorkflowSprintClarity({ surface }: { surface: string }) {
  return (
    <section id={SPRINT.hash} className="scroll-mt-24 border-b border-border bg-muted/25">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            When the diagnostic is not enough
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{SPRINT.name}</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            A {SPRINT.duration} discovery for one costly, repeated workflow. You leave with a
            workflow map, a feasibility and risk review, an implementation-ready plan, and a written
            pilot go / no-go / revise—before anyone starts a build.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {SPRINT.planningSignalLabel}
                </p>
                <p className="mt-1 font-display text-4xl font-semibold">{SPRINT.planningSignal}</p>
              </div>
              <p className="max-w-sm text-sm text-muted-foreground">{SPRINT.duration}</p>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {PLANNING_SIGNAL_DISCLAIMER}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {SPRINT.deliverables.map((item) => (
                <div key={item.title} className="rounded-2xl border border-border bg-muted/30 p-4">
                  <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
            <Link
              to="/contact"
              search={{ topic: SPRINT.inquiryTopic }}
              className="mt-7 inline-flex items-center gap-1 text-sm font-semibold text-primary"
              onClick={() =>
                trackEvent("service_offer_cta_clicked", {
                  offer: "workflow_opportunity_sprint",
                  surface,
                  ...funnelAttribution(),
                })
              }
            >
              Ask about a {SPRINT.name} <ArrowRight className="h-4 w-4" />
            </Link>
          </article>

          <div className="grid gap-4">
            <article className="rounded-3xl border border-border bg-card p-6">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <CheckCircle2 className="h-4 w-4" /> What this is
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {SPRINT.is.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-3xl border border-border bg-card p-6">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <ShieldAlert className="h-4 w-4" /> What this is not
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {SPRINT.isNot.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-border bg-card p-6">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <ClipboardList className="h-4 w-4" /> {SPRINT.diagnosticName} is enough when
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {SPRINT.diagnosticEnough.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              search={{ topic: `${SPRINT.diagnosticName} inquiry` }}
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary"
              onClick={() =>
                trackEvent("service_offer_cta_clicked", {
                  offer: "workflow_diagnostic",
                  surface: `${surface}_diagnostic_enough`,
                  ...funnelAttribution(),
                })
              }
            >
              Discuss a {SPRINT.diagnosticPrice} diagnostic <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
          <article className="rounded-3xl border border-primary/25 bg-primary/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Escalate to a {SPRINT.name} when
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {SPRINT.escalateWhen.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
