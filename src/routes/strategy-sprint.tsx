import { useEffect } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";
import { buildSeoMeta } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import { funnelAttribution } from "@/components/funnel-attribution";
import {
  PLANNING_SIGNAL_DISCLAIMER,
  WORKFLOW_OPPORTUNITY_SPRINT as SPRINT,
} from "@/lib/workflow-opportunity-sprint";

export const Route = createFileRoute("/strategy-sprint")({
  beforeLoad: () => {
    throw redirect({
      to: "/work-with-us",
      hash: SPRINT.hash,
    });
  },
  head: () => ({
    ...buildSeoMeta({
      title: `${SPRINT.name} | Melanated in Tech`,
      description:
        `A ${SPRINT.duration} discovery for one costly, repeated workflow: map, feasibility and risk, implementation-ready plan, and a pilot go / no-go / revise. The $7,500–$15,000 range is a planning signal, not an instant quote or guaranteed ROI.`,
      url: "/strategy-sprint",
    }),
  }),
  component: StrategySprint,
});

function StrategySprint() {
  useEffect(() => {
    trackEvent("workflow_opportunity_sprint_viewed", {
      surface: "strategy_sprint",
      ...funnelAttribution(),
    });
  }, []);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={SPRINT.name}
        title="Turn one repeated workflow into a plan your team can approve."
        description={`A ${SPRINT.duration} discovery. You leave with a workflow map, feasibility and risk review, implementation-ready plan, and a written pilot go / no-go / revise. This is not the ${SPRINT.diagnosticName}, the ${SPRINT.websiteLaunchName}, or a Recovery Pilot.`}
        actions={
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link
                to="/work-with-us"
                hash={SPRINT.hash}
                onClick={() =>
                  trackEvent("workflow_opportunity_sprint_application_started", {
                    surface: "strategy_sprint_fallback",
                    ...funnelAttribution(),
                  })
                }
              >
                See Sprint details <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/start-small">Start small</Link>
            </Button>
          </div>
        }
      />
      <section id="application" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Inquiry
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Tell us about the workflow.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Share the process, who owns it, where it slows down, and what a useful outcome would
              look like. We will respond within two business days with fit and next steps.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">{PLANNING_SIGNAL_DISCLAIMER}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <ContactForm defaultTopic={SPRINT.inquiryTopic} />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
