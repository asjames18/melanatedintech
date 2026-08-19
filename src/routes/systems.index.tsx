import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import {
  CommercialTrust,
  EngagementProcess,
  PilotOffer,
  SystemsGrid,
} from "@/components/system-sections";
import { SystemDemo } from "@/components/system-demo";
import { buildSeoMeta, breadcrumbLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/systems/")({
  head: () => ({
    ...buildSeoMeta({
      title: "Revenue Recovery Systems for Service Businesses | Melanated In Tech",
      description:
        "Explore lead, estimate, route, and client recovery automation built around measurable service-business outcomes.",
      url: "/systems",
    }),
    scripts: [
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Systems", path: "/systems" },
        ]),
      ),
    ],
  }),
  component: SystemsPage,
});

function SystemsPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Revenue recovery systems"
        title="Recover more of the demand you already earned."
        description="Choose one measurable leak, prove the workflow in a fixed-scope pilot, and expand only when the numbers and operations support it."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              to="/get-a-demo"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Get a relevant demo <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold"
            >
              Try the interactive demo
            </a>
          </div>
        }
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="sr-only">Choose a revenue recovery system</h2>
        <SystemsGrid />
      </section>
      <section className="border-y border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <CommercialTrust />
        </div>
      </section>
      <section id="demo" className="scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Interactive scenarios
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">Follow each handoff.</h2>
          </div>
          <SystemDemo />
        </div>
      </section>
      <section className="border-y border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <PilotOffer />
        </div>
      </section>
      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold">A controlled path to production.</h2>
          <div className="mt-8">
            <EngagementProcess />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
