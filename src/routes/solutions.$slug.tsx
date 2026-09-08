import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  MapPin,
  CheckCircle2,
  Sparkles,
  Layers,
  Clock,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Check,
  X,
} from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { SystemDemo } from "@/components/system-demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AiLeadModal } from "@/components/ai-tools/ai-lead-modal";
import { getServiceSystem, getSolution, type ServiceSystem } from "@/lib/service-systems";
import { getAiSolution, type AiSolution } from "@/lib/ai-tools-data";
import { buildSeoMeta, breadcrumbLd, faqLd, ldScript, serviceLd } from "@/lib/seo";

type LegacySolution = NonNullable<ReturnType<typeof getSolution>>;

type LoaderResult =
  | { type: "service-system"; solution: LegacySolution; system: ServiceSystem }
  | { type: "ai-solution"; aiSolution: AiSolution };

export const Route = createFileRoute("/solutions/$slug")({
  loader: ({ params }): LoaderResult => {
    // 1. Check if it's an AI Solution
    const aiSol = getAiSolution(params.slug);
    if (aiSol) {
      return { type: "ai-solution", aiSolution: aiSol };
    }

    // 2. Fall back to legacy service systems
    const solution = getSolution(params.slug);
    if (!solution) throw notFound();
    const system = getServiceSystem(solution.systemSlug)!;
    return { type: "service-system", solution, system };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};

    if (loaderData.type === "ai-solution") {
      const { aiSolution } = loaderData;
      return {
        ...buildSeoMeta({
          title: `${aiSolution.title} — AI Architecture & Recommended Stack | Melanated In Tech`,
          description: aiSolution.problem,
          url: `/solutions/${aiSolution.slug}`,
        }),
        scripts: [
          ldScript(
            breadcrumbLd([
              { name: "Home", path: "/" },
              { name: "Solutions", path: "/solutions" },
              { name: aiSolution.title, path: `/solutions/${aiSolution.slug}` },
            ]),
          ),
        ],
      };
    }

    const { solution, system } = loaderData;
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
            { name: "Solutions", path: "/solutions" },
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
  component: SolutionSlugPage,
});

function SolutionSlugPage() {
  const data = Route.useLoaderData();

  if (data.type === "ai-solution") {
    return <AiSolutionView sol={data.aiSolution} />;
  }

  return <LegacyServiceSystemView solution={data.solution} system={data.system} />;
}

// ----------------------------------------------------------------------
// 1. AI SOLUTION VIEW
// ----------------------------------------------------------------------
function AiSolutionView({ sol }: { sol: AiSolution }) {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl py-10 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/solutions" className="hover:text-foreground">Solutions</Link>
          <span>/</span>
          <span className="font-semibold text-foreground">{sol.title}</span>
        </nav>

        {/* HERO HEADER */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-sm space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30">
                {sol.department}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {sol.category}
              </Badge>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                Complexity: {sol.estimatedComplexity}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              {sol.title}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {sol.problem}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/60 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/30">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="text-muted-foreground text-[10px] block">Timeline</span>
                <span className="font-bold text-foreground">{sol.estimatedComplexity}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/30">
              <DollarSign className="h-4 w-4 text-emerald-500 shrink-0" />
              <div>
                <span className="text-muted-foreground text-[10px] block">Est. Tool Cost</span>
                <span className="font-bold text-foreground">{sol.estimatedMonthlyCost}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/30">
              <Briefcase className="h-4 w-4 text-purple-500 shrink-0" />
              <div>
                <span className="text-muted-foreground text-[10px] block">DIY Suitability</span>
                <span className="font-bold text-foreground">{sol.diySuitability}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <AiLeadModal
              buttonText="Have MIT Build This Solution"
              buttonSize="lg"
              buttonClassName="font-bold shadow-md"
              defaultProblem={`Implementation of ${sol.title} architecture`}
              recommendedStackSummary={{
                solution: sol.title,
                stack: sol.recommendedToolStack,
                complexity: sol.estimatedComplexity,
                cost: sol.estimatedMonthlyCost,
              }}
            />

            <Link
              to="/ai-stack-builder"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-3 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted"
            >
              <span>Customize in Stack Builder</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* PAIN POINTS & WHAT AI CAN AUTOMATE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Common Friction & Pain Points
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              {sol.painPoints.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="text-destructive font-bold shrink-0">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-3">
            <h2 className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              What AI Automates in This Solution
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              {sol.whatAiCanAutomate.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RECOMMENDED TOOL STACK */}
        <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6">
          <div>
            <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30 mb-1">
              Component Layering
            </Badge>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              Recommended Production Stack
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              How the 4 core layers work together in this specific solution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-1">
              <span className="text-[11px] font-bold text-primary uppercase">1. Intelligence</span>
              <p className="font-bold text-sm text-foreground">{sol.recommendedToolStack.model}</p>
              <p className="text-muted-foreground">Zero-hallucination grounded reasoning</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-1">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">2. Orchestration</span>
              <p className="font-bold text-sm text-foreground">{sol.recommendedToolStack.orchestration}</p>
              <p className="text-muted-foreground">Coordinates triggers and CRM handoffs</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-1">
              <span className="text-[11px] font-bold text-blue-500 uppercase">3. Memory & Storage</span>
              <p className="font-bold text-sm text-foreground">{sol.recommendedToolStack.database}</p>
              <p className="text-muted-foreground">ACID relational data & vector embeddings</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-1">
              <span className="text-[11px] font-bold text-purple-500 uppercase">4. Frontline Interface</span>
              <p className="font-bold text-sm text-foreground">{sol.recommendedToolStack.interface}</p>
              <p className="text-muted-foreground">User-facing communication layer</p>
            </div>
          </div>
        </section>

        {/* ARCHITECTURE FLOW (STEP-BY-STEP) */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            End-to-End Architecture Workflow
          </h2>

          <div className="space-y-3">
            {sol.architectureFlow.map((step) => (
              <div
                key={step.stepNumber}
                className="flex items-start gap-4 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 transition-all hover:border-primary/40"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">
                  {step.stepNumber}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-sm font-bold text-foreground">{step.label}</h3>
                    <Badge variant="secondary" className="text-[10px] w-fit font-semibold">
                      Tool: {step.tool}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.component}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DIY VS HIRE MIT */}
        <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold text-foreground">
            Implementation Approach: DIY vs. MIT
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 space-y-2">
              <p className="font-bold text-foreground">If You Build It Internally (DIY):</p>
              <p className="text-muted-foreground leading-relaxed">{sol.diyProsAndCons.diy}</p>
            </div>

            <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5 space-y-2">
              <p className="font-bold text-primary">If MIT Builds & Deploys It:</p>
              <p className="text-foreground leading-relaxed font-medium">{sol.diyProsAndCons.withMit}</p>
            </div>
          </div>
        </section>

        {/* BOTTOM CONSULTING CONVERSION CTA */}
        <div className="rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/10 via-card to-emerald-500/10 p-6 sm:p-10 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Turnkey Solution Deployment</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Deploy {sol.title} in 14 Days
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Eliminate operational drag without draining internal engineering bandwidth. Antonio and the MIT technical team build, connect, test, and hand over the complete working system.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <AiLeadModal
              buttonText="Request MIT Implementation"
              buttonSize="lg"
              buttonClassName="font-bold px-8 shadow-md"
              defaultProblem={`Deploy ${sol.title} for our organization`}
            />

            <Link
              to="/ai-stack-builder"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline p-2"
            >
              <span>Explore full AI Stack Builder</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

// ----------------------------------------------------------------------
// 2. LEGACY SERVICE SYSTEM VIEW (Preserved 100% with zero regressions)
// ----------------------------------------------------------------------
function LegacyServiceSystemView({
  solution,
  system,
}: {
  solution: LegacySolution;
  system: ServiceSystem;
}) {
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
