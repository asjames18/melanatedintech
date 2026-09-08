import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, GraduationCap, ShieldCheck, Workflow } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { breadcrumbLd, buildSeoMeta, ldScript, serviceLd } from "@/lib/seo";

const useCases = [
  [
    "Student service intake",
    "Classify requests, gather missing details, route cases, and prepare staff responses.",
  ],
  [
    "Policy and procedure search",
    "Help staff find current, source-linked answers across approved institutional knowledge.",
  ],
  [
    "Document-heavy administration",
    "Extract, validate, and route information while preserving human review for exceptions.",
  ],
  [
    "Cross-system follow-up",
    "Coordinate forms, email, CRM or SIS tasks, reminders, and status updates.",
  ],
] as const;

export const Route = createFileRoute("/industries/higher-education")({
  head: () => ({
    ...buildSeoMeta({
      title: "AI Automation & Integration for Higher Education | Melanated In Tech",
      description:
        "Practical AI workflow automation, document processing, knowledge systems, and integrations for colleges and universities—with governance and human approval built in.",
      url: "/industries/higher-education",
    }),
    scripts: [
      ldScript(
        serviceLd({
          name: "Higher Education AI Automation & Integration",
          description:
            "Controlled AI implementation for college and university administrative workflows.",
          url: "/industries/higher-education",
          areaServed: ["United States"],
        }),
      ),
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Higher Education", path: "/industries/higher-education" },
        ]),
      ),
    ],
  }),
  component: HigherEducation,
});

function HigherEducation() {
  return (
    <SiteLayout>
      <PageHeader
        title="Improve higher-education operations without automating away accountability."
        description="MIT helps colleges and universities reduce repetitive administrative work, connect fragmented systems, and give staff better access to trusted information."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/contact" search={{ topic: "Higher education workflow inquiry" }}>
                Tell us about the workflow <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/proof">Review the proof standard</Link>
            </Button>
          </div>
        }
      />

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <GraduationCap className="h-7 w-7 text-primary" />
            <h2 className="mt-4 font-display text-3xl font-semibold">
              Built for administrative reality.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Higher education work crosses policy, people, documents, legacy platforms, and
              sensitive data. Useful automation must respect all five.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {useCases.map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-border bg-card p-5">
                <Workflow className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Implementation principles
          </p>
          <h2 className="mt-2 max-w-3xl font-display text-3xl font-semibold">
            Governance belongs inside the workflow—not in a document nobody uses.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              [
                "Start with approved data",
                "Define authoritative sources, access boundaries, retention, and acceptable use before connecting AI.",
              ],
              [
                "Keep decisions human",
                "Admissions, aid, discipline, accommodations, and other consequential decisions remain with accountable staff.",
              ],
              [
                "Test before expansion",
                "Use representative cases, known exceptions, and measurable acceptance criteria before broader deployment.",
              ],
            ].map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-border bg-card p-6">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-foreground p-7 text-background sm:p-10">
            <h2 className="max-w-3xl font-display text-3xl font-semibold">
              Bring one workflow that costs staff time, delays service, or creates avoidable risk.
            </h2>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-background/70">
              {[
                "A named process owner",
                "A measurable pain point",
                "A responsible path to a pilot",
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent2" />
                  {item}
                </span>
              ))}
            </div>
            <Button asChild size="lg" variant="secondary" className="mt-7">
              <Link to="/contact" search={{ topic: "Higher education workflow inquiry" }}>
                Discuss the workflow <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
