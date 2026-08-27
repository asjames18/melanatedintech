import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  GraduationCap,
  MonitorSmartphone,
  Presentation,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { buildSeoMeta, breadcrumbLd, ldScript } from "@/lib/seo";

const primaryOffers = [
  {
    Icon: GraduationCap,
    eyebrow: "Practical AI training",
    title: "AI Clarity Session",
    price: "$297",
    description:
      "A focused 90-minute working session for an owner and up to two teammates who want a practical, responsible starting point with AI.",
    includes: [
      "A short pre-session intake and plain-language walkthrough of useful AI workflows",
      "Live examples shaped around your work",
      "A starter prompt pack and one-page next-step summary; no custom build is included",
    ],
    topic: "AI Clarity Session inquiry",
    cta: "Ask about AI training",
  },
  {
    Icon: Workflow,
    eyebrow: "Workflow strategy",
    title: "AI Workflow Diagnostic",
    price: "$297",
    description:
      "A focused 90-minute diagnostic for one repeated task or customer journey, ending with an actionable implementation recommendation.",
    includes: [
      "A short pre-session intake and current-state workflow review",
      "One prioritized opportunity with human-approval boundaries",
      "Tool-fit guidance and a one-page implementation roadmap; no implementation is included",
    ],
    topic: "AI Workflow Diagnostic inquiry",
    cta: "Discuss a workflow",
  },
  {
    Icon: MonitorSmartphone,
    eyebrow: "Website development",
    title: "Website Launch Sprint",
    price: "$997",
    description:
      "A focused, mobile-first one-page website for a business that needs to look credible and make it easy for the right people to get in touch.",
    includes: [
      "One mobile-first landing page; additional pages and custom functionality are separately scoped",
      "Client-supplied final copy, logo, imagery, domain, and access needed for launch",
      "Inquiry form, basic metadata, one consolidated revision, and publish-ready handoff; third-party fees are not included",
    ],
    topic: "Website Launch Sprint inquiry",
    cta: "Ask about a launch sprint",
  },
] as const;

const scopedServices = [
  {
    Icon: Bot,
    title: "Custom AI systems",
    description:
      "For teams that need implementation, integrations, documented boundaries, testing, and staff handoff after a defined discovery process.",
    topic: "Custom AI system inquiry",
  },
  {
    Icon: MonitorSmartphone,
    title: "Custom websites and applications",
    description:
      "For projects involving multiple pages, brand systems, booking, payments, client portals, databases, or tailored integrations.",
    topic: "Custom website or application inquiry",
  },
  {
    Icon: Presentation,
    title: "Presentation support",
    description:
      "For training, sales, grant, and stakeholder decks where the scope depends on the story, source material, and delivery context.",
    topic: "Presentation support inquiry",
  },
] as const;

export const Route = createFileRoute("/work-with-us")({
  head: () => ({
    ...buildSeoMeta({
      title: "Work With Us | AI Training, Workflow Strategy & Websites | Melanated In Tech",
      description:
        "Start with practical AI training, a workflow diagnostic, or a focused website launch sprint. Melanated In Tech helps small organizations build useful systems with clear human boundaries.",
      url: "/work-with-us",
    }),
    scripts: [
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Work With Us", path: "/work-with-us" },
        ]),
      ),
    ],
  }),
  component: WorkWithUs,
});

function WorkWithUs() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Services for practical progress"
        title="Build the next useful thing for your business."
        description="Start with the level of support that matches where you are today: learn AI, improve a workflow, launch a website, or scope a more tailored build."
      />

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Start small. Build with intention.</p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Three clear ways to get moving.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              These fixed-scope offers are designed to create a useful next step without asking you to
              commit to a large, undefined project. If your work requires a deeper build, we will scope it
              clearly before implementation begins. Every custom project receives a written scope, timeline, and price before work begins.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {primaryOffers.map(({ Icon, eyebrow, title, price, description, includes, topic, cta }) => (
              <article key={title} className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">{price}</span>
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
                <ul className="mt-5 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  search={{ topic }}
                  className="mt-7 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                >
                  {cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">When the work is more complex</p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Scope the right build before we build it.</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Custom systems are valuable when they solve a real operational problem. We begin with your
              goals, dependencies, data boundaries, and approvals—not a generic promise or an undefined scope.
            </p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {scopedServices.map(({ Icon, title, description, topic }) => (
              <article key={title} className="rounded-2xl border border-border bg-muted/20 p-5">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                <Link
                  to="/contact"
                  search={{ topic }}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                >
                  Request a scope <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-foreground p-7 text-background sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-background/65">Already know your challenge?</p>
            <h2 className="mt-2 max-w-3xl font-display text-3xl font-semibold sm:text-4xl">
              Tell us what you are trying to make better.
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-background/75">
              We read every inquiry and reply within two business days. Revenue recovery remains available as a
              specialized service for businesses with a measurable follow-up or retention problem.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/contact"
                search={{ topic: "General services inquiry" }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-background px-6 text-sm font-semibold text-foreground"
              >
                Start a conversation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/diagnostic"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-background/30 px-6 text-sm font-semibold text-background hover:bg-background/10"
              >
                Explore revenue recovery
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
