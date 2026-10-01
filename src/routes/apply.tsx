import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Clock3, FileCheck2, Wallet } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { ServiceLeadForm } from "@/components/service-lead-form";
import { buildSeoMeta, breadcrumbLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/apply")({
  head: () => ({
    ...buildSeoMeta({
      title: "Apply for a Recovery Pilot | Melanated in Tech",
      description:
        "Apply for the 30-Day Recovery Pilot or a Workflow Opportunity Sprint. Tell us about your business and where revenue is leaking — we review every application personally.",
      url: "/apply",
    }),
    scripts: [
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Apply", path: "/apply" },
        ]),
      ),
    ],
  }),
  component: Apply,
});

function Apply() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Application · Reviewed personally"
        title="Apply for your recovery pilot."
        description="Tell us about your business and where revenue is leaking. We review every application personally and reply with a fit decision within two business days."
      />
      <section id="application-form" className="scroll-mt-24">
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
                      Icon: FileCheck2,
                      title: "Fit review",
                      body: "We read your application and reply within two business days. No unpaid interview gauntlet.",
                    },
                    {
                      Icon: Wallet,
                      title: "Fixed scope, fixed price",
                      body: "Qualified businesses get a fixed-scope proposal. You pay a 50% deposit only if approved.",
                    },
                    {
                      Icon: Clock3,
                      title: "Pilot in 30 days",
                      body: "One revenue leak, one location, one platform — live and monitored within 30 days.",
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
                <p className="text-sm text-background/60">30-Day Recovery Pilot</p>
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
              <div className="rounded-3xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">Workflow Opportunity Sprint</p>
                <p className="mt-1 font-display text-3xl font-semibold">$7,500–$15K</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  A fixed-scope engagement that maps your repeated work, handoffs, and systems —
                  ending with a written plan and a clear pilot go/no-go.
                </p>
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
              showDemoOnSuccess={false}
              submitLabel="Submit application"
              eventName="pilot_application_submitted"
              onSubmitted={() => setSubmitted(true)}
            />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
