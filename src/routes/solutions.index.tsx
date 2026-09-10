import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  DollarSign,
  Briefcase,
} from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AiLeadModal } from "@/components/ai-tools/ai-lead-modal";
import { AI_SOLUTIONS } from "@/lib/ai-tools-data";
import { SERVICE_SYSTEMS } from "@/lib/service-systems";
import { buildSeoMeta, breadcrumbLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/solutions/")({
  head: () => ({
    ...buildSeoMeta({
      title: "AI Solutions by Problem & Business Challenge | Melanated In Tech",
      description:
        "Don't start with tools. Browse solution blueprints designed for customer service, document processing, student services, and workflow automation.",
      url: "/solutions",
    }),
    scripts: [
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions" },
        ]),
      ),
    ],
  }),
  component: SolutionsIndexPage,
});

const SOLUTION_DEPARTMENTS = [
  "All Departments",
  "Customer Service",
  "Operations & Finance",
  "Sales & Marketing",
  "Education & Higher Ed",
  "Engineering & IT",
] as const;

function SolutionsIndexPage() {
  const [selectedDept, setSelectedDept] = useState<string>("All Departments");

  const filteredSolutions = useMemo(() => {
    if (selectedDept === "All Departments") return AI_SOLUTIONS;
    if (selectedDept === "Customer Service") {
      return AI_SOLUTIONS.filter(
        (s) => s.category === "Customer Service" || s.department.includes("Support"),
      );
    }
    if (selectedDept === "Operations & Finance") {
      return AI_SOLUTIONS.filter(
        (s) => s.category === "Document Processing" || s.department.includes("Operations") || s.department.includes("Finance"),
      );
    }
    if (selectedDept === "Sales & Marketing") {
      return AI_SOLUTIONS.filter(
        (s) => s.department.includes("Sales") || s.slug.includes("lead") || s.slug.includes("schedule"),
      );
    }
    if (selectedDept === "Education & Higher Ed") {
      return AI_SOLUTIONS.filter(
        (s) => s.category === "Education & Higher Ed" || s.targetIndustries.includes("Higher Education"),
      );
    }
    if (selectedDept === "Engineering & IT") {
      return AI_SOLUTIONS.filter(
        (s) => s.department.includes("Engineering") || s.department.includes("IT") || s.slug.includes("agent"),
      );
    }
    return AI_SOLUTIONS;
  }, [selectedDept]);

  return (
    <SiteLayout>
      {/* HERO SECTION */}
      <section className="border-b border-border/70 bg-gradient-to-b from-primary/10 via-background to-background py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <Layers className="h-4 w-4" />
            <span>Problem-First Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Find the Solution for What You’re Trying to Solve
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Skip the directory browsing. Discover pre-architected AI solution stacks mapped to real corporate and institutional friction points.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/ai-stack-builder"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span>Launch AI Stack Builder</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/solve"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted"
            >
              <span>Describe Your Custom Problem</span>
            </Link>
          </div>
        </div>
      </section>

      {/* DEPARTMENT FILTER PILLS */}
      <section className="border-b border-border/70 bg-muted/20 py-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SOLUTION_DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDept(dept)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDept === dept
                  ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                  : "border border-border/80 bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </section>

      {/* SOLUTIONS GRID */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
              Production Solution Blueprints
            </h2>
            <span className="text-xs text-muted-foreground font-semibold">
              Showing {filteredSolutions.length} blueprints
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSolutions.map((sol) => (
              <div
                key={sol.slug}
                className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30">
                      {sol.department}
                    </Badge>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {sol.estimatedComplexity}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {sol.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {sol.problem}
                  </p>

                  {/* What it Automates */}
                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                      What It Automates:
                    </p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {sol.whatAiCanAutomate.slice(0, 2).map((w) => (
                        <li key={w} className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Architecture Stack */}
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs space-y-1">
                    <p className="font-semibold text-foreground text-[11px]">
                      Recommended Stack:
                    </p>
                    <p className="text-muted-foreground font-medium truncate">
                      {sol.recommendedToolStack.model} + {sol.recommendedToolStack.orchestration} + {sol.recommendedToolStack.database}
                    </p>
                  </div>
                </div>

                <div className="pt-6 flex items-center justify-between border-t border-border/60 mt-6 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Software Cost</span>
                    <span className="font-bold text-foreground">{sol.estimatedMonthlyCost.split(" in")[0]}</span>
                  </div>

                  <Link
                    to="/solutions/$slug"
                    params={{ slug: sol.slug }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground shadow-2xs transition-all hover:bg-primary/90"
                  >
                    <span>View Architecture</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVENUE RECOVERY SYSTEMS (LEGACY SERVICE SYSTEMS CROSS-LINK) */}
      <section className="py-12 border-t border-border/70 bg-muted/20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30 mb-2">
              Turnkey Service Systems
            </Badge>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              Commercial Revenue-Recovery Systems
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Fixed-scope, 30-day piloted systems for home services and estimate-driven businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {SERVICE_SYSTEMS.map((sys) => (
              <Link
                key={sys.slug}
                to="/solutions/$slug"
                params={{ slug: sys.solutionSlug }}
                className="rounded-2xl border border-border/80 bg-card p-5 space-y-2 transition-all hover:border-primary/50 hover:shadow-sm"
              >
                <Badge variant="secondary" className="text-[10px] font-semibold">
                  {sys.eyebrow}
                </Badge>
                <h3 className="font-bold text-sm text-foreground">{sys.title}</h3>
                <p className="text-muted-foreground line-clamp-2">{sys.summary}</p>
                <span className="text-primary font-bold inline-flex items-center gap-1 pt-1">
                  <span>Explore system</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CONSULTING CTA */}
      <section className="border-t border-border/70 bg-gradient-to-r from-primary/15 via-card to-emerald-500/15 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Don&apos;t See Your Exact Challenge?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Describe your unique business process or institutional requirement. Melanated In Tech engineers bespoke automation blueprints tailored to your workflow.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/solve"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span>Describe What You Need</span>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
