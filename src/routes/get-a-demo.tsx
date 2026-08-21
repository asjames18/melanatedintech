import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Check, Clock3, DollarSign, Workflow } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { ServiceLeadForm } from "@/components/service-lead-form";
import { serviceModelSchema } from "@/lib/service-leads.functions";
import { buildSeoMeta, breadcrumbLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/get-a-demo")({
  validateSearch: z.object({ system: serviceModelSchema.optional() }),
  head: () => ({
    ...buildSeoMeta({
      title: "Get a Service Business Recovery Demo | Melanated In Tech",
      description:
        "Tell us where revenue gets stuck and see the lead, estimate, route, or client recovery workflow that matches your business.",
      url: "/get-a-demo",
    }),
    scripts: [
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Get a Demo", path: "/get-a-demo" },
        ]),
      ),
    ],
  }),
  component: GetDemo,
});

function GetDemo() {
  const { system } = Route.useSearch();
  const [submitted, setSubmitted] = useState(false);
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Qualification + interactive demonstration"
        title="Show us where your revenue gets stuck."
        description="Share a few operating details to unlock the matching customer journey and a conservative recovery-opportunity estimate."
      />
      <section id="qualification-form" className="scroll-mt-24">
        <div
          className={`mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:px-8 ${submitted ? "grid-cols-1" : "lg:grid-cols-[0.65fr_1.35fr]"}`}
        >
          {!submitted ? (
            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-3xl border border-border bg-card p-6">
                <h2 className="font-display text-xl font-semibold">What happens next</h2>
                <div className="mt-5 space-y-4">
                  {[
                    {
                      Icon: Workflow,
                      title: "See the right demo",
                      body: "The workflow changes to match your service model.",
                    },
                    {
                      Icon: Clock3,
                      title: "Fit review",
                      body: "We reply within two business days; no unpaid interview process is required.",
                    },
                    {
                      Icon: DollarSign,
                      title: "Clear commercial step",
                      body: "Qualified projects receive a fixed-scope proposal and 50% deposit link.",
                    },
                  ].map(({ Icon, title, body }) => (
                    <div key={title} className="flex gap-3">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <p className="font-semibold">{title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl bg-foreground p-6 text-background">
                <p className="text-sm text-background/60">Recovery Pilot</p>
                <p className="mt-1 font-display text-3xl font-semibold">From $1,500</p>
                <ul className="mt-5 space-y-2 text-sm text-background/75">
                  {[
                    "One revenue leak",
                    "One location",
                    "One primary platform",
                    "30 days of monitoring",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check className="h-4 w-4 text-emerald-400" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-primary/30 bg-primary/10 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Fast-Track Paid Audit</p>
                  <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">$297</span>
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold">Revenue Leak Diagnostic</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Want an immediate 45-min bottleneck review before applying for a pilot? 100% credited toward your pilot deposit.
                </p>
                <a
                  href="/diagnostic"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow transition hover:opacity-90"
                >
                  Book $297 Diagnostic
                </a>
              </div>
            </aside>
          ) : null}
          <div
            className={
              submitted
                ? "min-w-0"
                : "min-w-0 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8"
            }
          >
            <ServiceLeadForm
              initialSystem={system ?? "route-retention"}
              onSubmitted={() => setSubmitted(true)}
            />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
