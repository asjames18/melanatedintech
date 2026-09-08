import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Building2,
  CheckCircle2,
  FileText,
  GraduationCap,
  Network,
  PackageOpen,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Hero } from "@/components/hero";
import { SiteLayout } from "@/components/site-layout";
import { listAgents, listArticles, listProducts } from "@/lib/public.functions";
import { buildSeoMeta, ldScript, organizationLd, websiteLd } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";

const agentsQO = queryOptions({ queryKey: ["agents"], queryFn: () => listAgents() });
const articlesQO = queryOptions({ queryKey: ["articles"], queryFn: () => listArticles() });
const productsQO = queryOptions({ queryKey: ["products"], queryFn: () => listProducts() });

const services = [
  {
    Icon: Workflow,
    title: "AI workflow automation",
    body: "Reduce repeated tasks, manual handoffs, follow-up, and status chasing.",
    to: "/services/workflow-automation" as const,
  },
  {
    Icon: Network,
    title: "AI and software integrations",
    body: "Connect AI to the systems, data, and actions your team already relies on.",
    to: "/services/ai-integrations" as const,
  },
  {
    Icon: FileText,
    title: "Document and intake automation",
    body: "Classify, extract, validate, and route information with human review for exceptions.",
    to: "/services/document-intake-automation" as const,
  },
  {
    Icon: Bot,
    title: "AI agent development",
    body: "Build focused agents with approved context, useful tools, tests, and clear boundaries.",
    to: "/services/ai-agents" as const,
  },
  {
    Icon: BookOpen,
    title: "Internal knowledge systems",
    body: "Give staff source-aware answers across policies, procedures, and internal documents.",
    to: "/services/internal-knowledge-systems" as const,
  },
];

export const Route = createFileRoute("/")({
  head: () => {
    const seo = buildSeoMeta({
      title: "AI Workflow Automation & Integration Services | Melanated In Tech",
      description:
        "Melanated In Tech designs and implements controlled AI automation, software integrations, document workflows, agents, and internal knowledge systems.",
      url: "/",
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [ldScript(organizationLd()), ldScript(websiteLd())],
    };
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(agentsQO),
      context.queryClient.ensureQueryData(articlesQO),
      context.queryClient.ensureQueryData(productsQO),
    ]);
  },
  component: Home,
});

function Home() {
  const { data: agents } = useSuspenseQuery(agentsQO);
  const { data: articles } = useSuspenseQuery(articlesQO);
  const { data: products } = useSuspenseQuery(productsQO);

  useEffect(() => {
    trackEvent("homepage_viewed");
  }, []);

  return (
    <SiteLayout>
      <Hero />
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              What we solve
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              The expensive work hiding between your systems.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              MIT is a fit when a repeated process consumes staff time, delays customers or
              students, creates preventable errors, or depends on knowledge that is hard to find.
            </p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              [
                "Manual handoffs",
                "Work moves through inboxes, spreadsheets, and memory instead of a clear operating flow.",
              ],
              [
                "Disconnected systems",
                "People copy information between tools because the systems do not coordinate.",
              ],
              [
                "Document bottlenecks",
                "Forms, PDFs, and attachments require slow review, re-entry, and routing.",
              ],
              [
                "Knowledge friction",
                "Staff spend too long finding the current policy, procedure, or approved answer.",
              ],
            ].map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Implementation services
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                A focused path from problem to production.
              </h2>
            </div>
            <Link
              to="/work-with-us"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              View engagement options <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map(({ Icon, title, body, to }) => (
              <Link
                key={to}
                to={to}
                className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/45 hover:shadow-sm"
              >
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Explore this service{" "}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="rounded-3xl border border-primary/25 bg-primary/5 p-7 sm:p-9">
            <GraduationCap className="h-7 w-7 text-primary" />
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-primary">
              Flagship industry
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Higher education operations need practical AI, not another innovation theater project.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We focus on administrative workflows where policy, sensitive data, legacy systems, and
              human judgment all matter—from student-service intake to internal knowledge and
              document processing.
            </p>
            <Link
              to="/industries/higher-education"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              Explore higher-education solutions <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-3xl border border-border bg-card p-7 sm:p-9">
            <Building2 className="h-7 w-7 text-primary" />
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-primary">
              Also built for
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Small organizations with real operational friction.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Service businesses, nonprofits, community organizations, and expert teams can use the
              same workflow-first method without becoming an AI company themselves.
            </p>
            <Link
              to="/work-with-us"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              See how engagements work <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">How we work</p>
          <h2 className="mt-2 max-w-3xl font-display text-3xl font-semibold sm:text-4xl">
            Buy the next responsible step—not an undefined transformation.
          </h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              [
                "1",
                "Strategy Sprint",
                "Map one workflow, quantify the opportunity, and define the implementation path.",
              ],
              [
                "2",
                "Controlled pilot",
                "Build a focused version with real users, clear boundaries, and acceptance criteria.",
              ],
              [
                "3",
                "Production integration",
                "Connect the workflow to approved systems, data, monitoring, and operating ownership.",
              ],
              [
                "4",
                "Managed improvement",
                "Measure performance, handle changes, and improve the system after launch.",
              ],
            ].map(([number, title, body]) => (
              <article key={number} className="rounded-2xl border border-border bg-card p-6">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-sm font-semibold text-background">
                  {number}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
          <Link
            to="/strategy-sprint"
            className="mt-7 inline-flex items-center gap-1 text-sm font-semibold text-primary"
          >
            Explore the Strategy Sprint <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <ShieldCheck className="h-7 w-7 text-primary" />
            <h2 className="mt-4 font-display text-3xl font-semibold">
              Proof should be specific, sourced, and honest.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              MIT distinguishes client-verified results, anonymized work, reference designs, and
              demonstrations. We do not turn assumptions into case-study claims.
            </p>
            <Link
              to="/proof"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              Review our proof standard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              "Human approval for consequential decisions",
              "Defined data and system boundaries",
              "Evaluation before expansion",
              "Documentation and ownership after handoff",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-medium"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Resources
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                Explore MIT&apos;s practical AI library.
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                The workbench, field guides, agents, and products remain available as supporting
                resources—not as a substitute for a clear implementation path.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/knowledge"
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold"
              >
                {articles.length} field guides
              </Link>
              <Link
                to="/agents"
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold"
              >
                {agents.length} AI agents
              </Link>
              <Link
                to="/products"
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold"
              >
                <PackageOpen className="mr-2 inline h-4 w-4 text-primary" />
                {products.length} products
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-foreground p-7 text-background sm:p-12">
            <div className="bg-grid absolute inset-0 opacity-10" />
            <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
              <div>
                <h2 className="max-w-3xl font-display text-3xl font-semibold sm:text-4xl">
                  Tell us what you&apos;re trying to solve.
                </h2>
                <p className="mt-3 max-w-2xl text-background/70">
                  Describe the workflow, where it breaks down, and what a useful result would look
                  like. We will reply with fit and the smallest sensible next step.
                </p>
              </div>
              <Link
                to="/contact"
                search={{ topic: "Business workflow inquiry" }}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-background px-6 text-sm font-semibold text-foreground"
              >
                Start with the problem <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
