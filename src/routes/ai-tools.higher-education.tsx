import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  BookOpen,
  Users,
  Headphones,
  Award,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AiToolCard } from "@/components/ai-tools/ai-tool-card";
import { AiLeadModal } from "@/components/ai-tools/ai-lead-modal";
import {
  getHigherEdAiTools,
  AI_SOLUTIONS,
  AI_TOOLS,
} from "@/lib/ai-tools-data";
import { buildSeoMeta, breadcrumbLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/ai-tools/higher-education")({
  head: () => ({
    ...buildSeoMeta({
      title: "Higher Education AI Tools & Solutions (FERPA Compliant) | Melanated In Tech",
      description:
        "Curated AI tools and pre-engineered solutions for colleges and universities. Ethical, FERPA-compliant AI for admissions, student retention, financial aid, and institutional research.",
      url: "/ai-tools/higher-education",
    }),
    scripts: [
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "AI Tools", path: "/ai-tools" },
          { name: "Higher Education", path: "/ai-tools/higher-education" },
        ]),
      ),
    ],
  }),
  component: HigherEducationAiToolsPage,
});

const HIGHER_ED_CATEGORIES = [
  "All Higher Ed",
  "Admissions & Enrollment",
  "Student Services",
  "Faculty Productivity",
  "Document Processing",
  "IT & Help Desk",
  "AI Governance",
] as const;

export function HigherEducationAiToolsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All Higher Ed");
  const allHigherEdTools = useMemo(() => getHigherEdAiTools(), []);

  const filteredTools = useMemo(() => {
    if (activeCategory === "All Higher Ed") return allHigherEdTools;
    if (activeCategory === "Admissions & Enrollment") {
      return allHigherEdTools.filter((t) =>
        ["element451", "mainstay", "ocelot", "chatbase"].includes(t.slug),
      );
    }
    if (activeCategory === "Student Services") {
      return allHigherEdTools.filter((t) =>
        ["element451", "mainstay", "ocelot", "elevenlabs", "fireflies"].includes(t.slug),
      );
    }
    if (activeCategory === "Faculty Productivity") {
      return allHigherEdTools.filter((t) =>
        ["packback", "perplexity", "claude"].includes(t.slug),
      );
    }
    if (activeCategory === "Document Processing") {
      return allHigherEdTools.filter((t) =>
        ["llamaparse", "unstructured", "docuware", "claude"].includes(t.slug),
      );
    }
    if (activeCategory === "IT & Help Desk") {
      return allHigherEdTools.filter((t) =>
        ["n8n", "ollama", "supabase", "claude", "langfuse"].includes(t.slug),
      );
    }
    if (activeCategory === "AI Governance") {
      return allHigherEdTools.filter((t) =>
        ["ollama", "langfuse", "supabase"].includes(t.slug),
      );
    }
    return allHigherEdTools;
  }, [activeCategory, allHigherEdTools]);

  const higherEdSolutions = useMemo(
    () =>
      AI_SOLUTIONS.filter(
        (s) =>
          s.category === "Education & Higher Ed" ||
          s.targetIndustries.includes("Higher Education") ||
          s.slug.includes("student") ||
          s.slug.includes("admissions") ||
          s.slug.includes("help-desk"),
      ),
    [],
  );

  return (
    <SiteLayout>
      {/* HIGHER ED HERO */}
      <section className="border-b border-border/70 bg-gradient-to-b from-blue-500/10 via-background to-background py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
            <GraduationCap className="h-4 w-4" />
            <span>Colleges & Universities AI Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            FERPA-Compliant, Ethical AI for Higher Education
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Curated AI tools, conversational agents, and automated back-office architectures tested specifically for college admissions, student persistence, financial aid, and faculty productivity.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <AiLeadModal
              buttonText="Request Higher Ed Consultation"
              buttonSize="lg"
              buttonClassName="font-bold bg-blue-600 hover:bg-blue-700 text-white"
              defaultProblem="Higher education AI automation & governance initiative"
            />

            <Link
              to="/ai-stack-builder"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <span>Build Higher Ed AI Stack</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* HIGHER ED PRE-BUILT SOLUTIONS */}
      <section className="py-12 border-b border-border/70 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <Badge variant="outline" className="text-xs font-bold text-blue-600 dark:text-blue-400 border-blue-500/30 mb-2">
              Tested Blueprints
            </Badge>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              Higher Ed Solution Blueprints
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Ready-to-deploy architectures addressing real campus friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {higherEdSolutions.map((sol) => (
              <div
                key={sol.slug}
                className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 transition-all hover:border-blue-500/50 hover:shadow-md"
              >
                <Badge variant="secondary" className="text-[11px] font-semibold">
                  {sol.department}
                </Badge>
                <h3 className="text-base font-bold text-foreground">
                  {sol.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {sol.problem}
                </p>

                <div className="pt-2 border-t border-border/60 text-xs">
                  <span className="text-[11px] text-muted-foreground block">Campus Stack:</span>
                  <p className="font-semibold text-foreground truncate mt-0.5">
                    {sol.recommendedToolStack.model} + {sol.recommendedToolStack.orchestration}
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {sol.estimatedComplexity}
                  </span>
                  <Link
                    to="/solutions/$slug"
                    params={{ slug: sol.slug }}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 hover:underline"
                  >
                    <span>View Blueprint</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HIGHER ED TOOL DIRECTORY */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                Vetted Higher Education Tools
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing {filteredTools.length} tools certified for academic institutions
              </p>
            </div>

            {/* Department Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {HIGHER_ED_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-blue-600 text-white font-bold shadow-2xs"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => (
              <AiToolCard key={tool.id} tool={tool} featuredHighlight={tool.featured} />
            ))}
          </div>
        </div>
      </section>

      {/* COMPLIANCE & FERPA ETHICAL FRAMEWORK */}
      <section className="py-12 border-t border-border/70 bg-muted/20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>FERPA & Institutional Safeguards</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Institutional AI Without Regulatory Risk
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Melanated In Tech structures all higher education AI deployments with air-gapped data boundaries: zero training on student records, explicit FERPA and ADA (WCAG 2.1) compliance, and human-in-the-loop review for all critical student advising and appeals.
          </p>

          <div className="pt-4">
            <AiLeadModal
              buttonText="Speak with Antonio (Higher Ed AI Lead)"
              buttonVariant="default"
              buttonClassName="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              defaultProblem="Higher Education campus AI implementation discussion"
            />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
