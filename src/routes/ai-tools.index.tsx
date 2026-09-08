import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  Layers,
  GraduationCap,
  Scale,
  Award,
  BookOpen,
} from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AiToolCard } from "@/components/ai-tools/ai-tool-card";
import { AiLeadModal } from "@/components/ai-tools/ai-lead-modal";
import {
  AI_TOOLS,
  AI_CATEGORIES,
  AI_COLLECTIONS,
  AI_COMPARISONS,
  AI_SOLUTIONS,
  type AiCategory,
  searchAiToolsQuery,
} from "@/lib/ai-tools-data";
import { buildSeoMeta, breadcrumbLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/ai-tools/")({
  head: () => ({
    ...buildSeoMeta({
      title: "AI Tool Library — Curation, Solution Stacks & Architecture | Melanated In Tech",
      description:
        "Discover the right AI tools for your actual business goals. Compare vetted options, explore complete AI architectures, and get implementation guidance from Melanated In Tech.",
      url: "/ai-tools",
    }),
    scripts: [
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "AI Tools", path: "/ai-tools" },
        ]),
      ),
    ],
  }),
  component: AiToolsIndexPage,
});

const QUICK_SEARCH_PROMPTS = [
  "Automate customer support",
  "Build an AI agent",
  "Analyze documents",
  "Automate student services",
  "Build internal knowledge base",
  "Open source self-hosted",
];

function AiToolsIndexPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AiCategory>("All");
  const [pricingFilter, setPricingFilter] = useState<"all" | "free" | "open-source" | "self-hosted">("all");
  const [enterpriseOnly, setEnterpriseOnly] = useState(false);

  const filteredTools = useMemo(() => {
    return searchAiToolsQuery({
      query: searchQuery,
      category: selectedCategory,
      pricing: pricingFilter,
      enterprise: enterpriseOnly,
    });
  }, [searchQuery, selectedCategory, pricingFilter, enterpriseOnly]);

  const featuredTools = useMemo(() => AI_TOOLS.filter((t) => t.featured).slice(0, 6), []);

  return (
    <SiteLayout>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-border/70 bg-gradient-to-b from-primary/10 via-background to-background py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Melanated In Tech AI Tool Library</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Find the Right AI Tools for What You’re Trying to Accomplish
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Explore curated AI tools, compare alternatives, discover complete solution architectures, and get recommendations tailored to your actual business problem.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/ai-stack-builder"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span>Find My AI Stack</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#tool-directory"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted"
            >
              <span>Browse AI Tools</span>
            </a>

            <Link
              to="/solve"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400 transition-all hover:bg-emerald-500/20"
            >
              <span>Tell Us What to Solve</span>
            </Link>
          </div>

          {/* LARGE INTELLIGENT SEARCH BAR */}
          <div className="mx-auto max-w-3xl pt-6">
            <div className="relative rounded-2xl border border-border/80 bg-card/90 p-2 shadow-xl backdrop-blur-md focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <div className="flex items-center gap-2 px-2">
                <Search className="h-5 w-5 text-primary shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are you trying to do? (e.g. automate customer support, build an AI agent, analyze documents...)"
                  className="w-full bg-transparent py-2 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-muted-foreground hover:text-foreground px-2"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* QUICK SUGGESTIONS */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Try asking:</span>
              {QUICK_SEARCH_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setSearchQuery(prompt)}
                  className="rounded-lg border border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] font-medium transition-colors hover:border-primary/50 hover:bg-muted hover:text-foreground"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STRATEGIC CAPABILITIES BANNER */}
      <section className="border-b border-border/70 bg-muted/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-6 text-xs sm:text-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-foreground">Curated & Tested</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Zero spam directories. Every tool is vetted for real-world reliability and accuracy.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-foreground">Complete Stacks</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Understand how tools connect (Model + Orchestration + Database + Interface).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-foreground">Honest Comparisons</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Side-by-side matrices dissecting pricing, self-hosting, and limitations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-foreground">MIT Implementation</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Get turnkey deployment support from experienced systems engineers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHER ED SPOTLIGHT BANNER */}
      <section className="border-b border-border/70 bg-gradient-to-r from-blue-500/10 via-card to-primary/10 py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm sm:text-base">
                Looking for Higher Education AI Solutions?
              </h3>
              <p className="text-xs text-muted-foreground">
                FERPA-compliant tools for admissions, financial aid counseling, student retention, and IT help desks.
              </p>
            </div>
          </div>

          <Link
            to="/ai-tools/higher-education"
            className="inline-flex items-center gap-1 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 transition-all hover:bg-blue-500/20"
          >
            <span>Visit Higher Ed Library</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* POPULAR COMPARISONS & SOLUTION ARCHITECTURES */}
      <section className="py-12 border-b border-border/70 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Badge variant="outline" className="mb-2 text-xs font-bold text-primary border-primary/30">
                Architectural Blueprints
              </Badge>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                Solution Stacks: Browse by Problem
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Don&apos;t start with tools. Start with the problem you are solving.
              </p>
            </div>

            <Link
              to="/solutions"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <span>View All 10+ Solutions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AI_SOLUTIONS.slice(0, 3).map((sol) => (
              <div
                key={sol.slug}
                className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <Badge variant="outline" className="text-[11px] font-semibold text-primary">
                  {sol.department}
                </Badge>
                <h3 className="text-base font-bold text-foreground">
                  {sol.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {sol.problem}
                </p>

                <div className="pt-2 border-t border-border/60 text-xs">
                  <span className="text-[11px] text-muted-foreground block">Recommended Stack:</span>
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
                    className="text-xs font-bold text-primary inline-flex items-center gap-1 hover:underline"
                  >
                    <span>View Architecture</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* HEAD-TO-HEAD COMPARISONS ROW */}
          <div className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-bold text-foreground">
                Popular Head-to-Head Comparisons
              </h3>
              <Link
                to="/compare"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View all comparisons →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {AI_COMPARISONS.slice(0, 4).map((comp) => (
                <Link
                  key={comp.slug}
                  to="/compare/$comparison"
                  params={{ comparison: comp.slug }}
                  className="rounded-xl border border-border/80 bg-card p-3 font-semibold text-foreground transition-colors hover:border-primary/60 hover:bg-muted/40 hover:text-primary"
                >
                  <span className="block truncate">{comp.toolA.name} vs. {comp.toolB.name}</span>
                  <span className="text-[10px] text-muted-foreground font-normal block mt-0.5">Compare specifications →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN TOOL DIRECTORY */}
      <section id="tool-directory" className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                Curated AI Tools Directory
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing {filteredTools.length} vetted, battle-tested tools
              </p>
            </div>

            {/* Filter Toggle Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setPricingFilter("all")}
                className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                  pricingFilter === "all"
                    ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                All Pricing
              </button>

              <button
                type="button"
                onClick={() => setPricingFilter("free")}
                className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                  pricingFilter === "free"
                    ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Free Plan
              </button>

              <button
                type="button"
                onClick={() => setPricingFilter("open-source")}
                className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                  pricingFilter === "open-source"
                    ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Open Source
              </button>

              <button
                type="button"
                onClick={() => setPricingFilter("self-hosted")}
                className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                  pricingFilter === "self-hosted"
                    ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Self-Hostable
              </button>

              <button
                type="button"
                onClick={() => setEnterpriseOnly(!enterpriseOnly)}
                className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                  enterpriseOnly
                    ? "bg-emerald-600 text-white font-bold shadow-2xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShieldCheck className="inline-block mr-1 h-3.5 w-3.5" />
                SOC 2 / HIPAA
              </button>
            </div>
          </div>

          {/* Category Horizontal Scroll Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {AI_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-foreground text-background shadow-xs"
                    : "border border-border/80 bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tool Cards Grid */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTools.map((tool) => (
                <AiToolCard key={tool.id} tool={tool} featuredHighlight={tool.featured} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
              <p className="text-sm font-semibold text-foreground">
                No tools matched your exact filter combination.
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try clearing your search query or switching to &ldquo;All Categories&rdquo; to explore available tools.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setPricingFilter("all");
                  setEnterpriseOnly(false);
                }}
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CURATED COLLECTIONS */}
      <section className="py-12 border-t border-border/70 bg-muted/20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30 mb-2">
              Curated Guides
            </Badge>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              Featured Tool Collections
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Hand-picked sets tailored to specific organization types and technical needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_COLLECTIONS.map((col) => (
              <div
                key={col.slug}
                className="rounded-2xl border border-border/80 bg-card p-5 space-y-2 transition-all hover:border-primary/50"
              >
                <h3 className="text-base font-bold text-foreground">{col.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {col.description}
                </p>
                <div className="pt-2 text-[11px] font-semibold text-primary">
                  {col.toolSlugs.length} vetted tools included →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL METHODOLOGY & TRUST SIGNALS */}
      <section className="py-12 border-t border-border/70 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
            <Award className="h-3.5 w-3.5 text-primary" />
            <span>Melanated In Tech Editorial Standards</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            How We Review & Rank AI Tools
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Melanated In Tech does not operate a pay-to-win directory. Our ratings reflect real-world engineering evaluations: token efficiency, data privacy guarantees, API reliability, vendor lock-in risk, and actual return on investment. Sponsored listings and affiliate partnerships are strictly disclosed and never alter our editorial scores.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Tested in Production Workflows
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Transparent Affiliate Disclosures
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Rigorous Data Sovereignty Audits
            </span>
          </div>
        </div>
      </section>

      {/* BOTTOM FLAGSHIP CTA */}
      <section className="border-t border-border/70 bg-gradient-to-br from-primary/10 via-card to-emerald-500/10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Ready to Build Your Custom AI Stack?
          </h2>

          <p className="mx-auto max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Answer a few quick questions about your business, current systems, and budget. Receive a complete architectural blueprint and let MIT handle implementation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/ai-stack-builder"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span>Launch AI Stack Builder</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <AiLeadModal
              buttonText="Request MIT Implementation"
              buttonVariant="outline"
              buttonClassName="px-5 py-3 text-sm font-semibold"
            />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
