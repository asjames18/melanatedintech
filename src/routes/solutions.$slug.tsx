import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { SystemDemo } from "@/components/system-demo";
import { getServiceSystem, getSolution } from "@/lib/service-systems";
import { buildSeoMeta, breadcrumbLd, faqLd, ldScript, serviceLd } from "@/lib/seo";

export const Route = createFileRoute("/solutions/$slug")({
  loader: ({ params }) => {
    const solution = getSolution(params.slug);
    if (!solution) throw notFound();
    const system = getServiceSystem(solution.systemSlug)!;
    return { solution, system };
  },
  head: ({ loaderData }) => {
    const { solution, system } = loaderData!;
    const faqs = [
      {
        question: `Which system do you use for ${solution.title.toLowerCase()}?`,
        answer: `${system.title}. ${system.summary}`,
      },
      {
        question: "What does the 30-day pilot include?",
        answer:
          "One defined revenue leak, one location, one primary platform, a focused communication channel, implementation, testing, handoff, monitoring, and a completion report.",
      },
      {
        question: "Do we have to replace the software we already use?",
        answer:
          "Usually not. Native capabilities in your existing scheduling or CRM platform are configured first, and custom automation is used only for documented gaps.",
      },
      {
        question: "Do you guarantee revenue?",
        answer:
          "No. The system measures business events influenced by the workflow, but revenue depends on demand, pricing, staff follow-through, and other operating conditions.",
      },
    ];
    return {
      ...buildSeoMeta({
        title: `${solution.title} Automation Solutions | Melanated In Tech`,
        description: solution.description,
        url: `/solutions/${solution.slug}`,
      }),
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Solutions", path: "/systems" },
            { name: solution.title, path: `/solutions/${solution.slug}` },
          ]),
        ),
        ldScript(faqLd(faqs)),
        ldScript(
          serviceLd({
            name: `${solution.title} revenue recovery`,
            description: solution.description,
            url: `/solutions/${solution.slug}`,
            areaServed: ["Highlands County", "Florida", "United States"],
            priceFrom: 1500,
          }),
        ),
      ],
    };
  },
  component: SolutionDetail,
});

function SolutionDetail() {
  const { solution, system } = Route.useLoaderData();
  const isFloridaFocus = solution.slug === "recurring-property-services";
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Service-business solution"
        title={solution.title}
        description={solution.description}
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              to="/get-a-demo"
              search={{ system: system.slug }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Get a relevant demo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/systems/$slug"
              params={{ slug: system.slug }}
              className="inline-flex items-center rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold"
            >
              Explore {system.shortTitle}
            </Link>
          </div>
        }
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {isFloridaFocus && (
          <div className="mb-10 flex gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="font-display font-semibold">
                Florida-first expertise, nationwide availability
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Based in Sebring, we are concentrating initial outreach in Highlands County, Central
                Florida, and across the state—while accepting qualified service businesses
                throughout the United States.
              </p>
            </div>
          </div>
        )}
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Best fit</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Built for owner-led teams with 2–20 employees.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The strongest first projects have enough customer activity to expose a repeatable
              leak, but no internal automation team to solve it.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {system.industries.map((industry) => (
                <span
                  key={industry}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-sm"
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-7">
            <h3 className="font-display text-2xl font-semibold">Start with one operational leak</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {system.leaks.map((leak) => (
                <div key={leak} className="rounded-2xl bg-muted/50 p-4 text-sm font-medium">
                  {leak}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              We configure native platform features first, document the remaining gap, and add
              bounded automation only where it improves the customer or staff experience.
            </p>
          </div>
        </div>
      </section>
      <section className="border-y border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SystemDemo initialSystem={system.slug} />
        </div>
      </section>
    </SiteLayout>
  );
}
