import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Check, AlertCircle, Award, Shield } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AiLeadModal } from "@/components/ai-tools/ai-lead-modal";
import { getAiAlternativesFor, AI_ALTERNATIVES, type AiAlternativeIndex } from "@/lib/ai-tools-data";
import { buildSeoMeta, breadcrumbLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/alternatives/$tool")({
  loader: ({ params }) => {
    const alternative = getAiAlternativesFor(params.tool);
    if (!alternative) throw notFound();
    return { alternative };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { alternative } = loaderData;

    return {
      ...buildSeoMeta({
        title: `${alternative.headline} | Melanated In Tech`,
        description: alternative.intro,
        url: `/alternatives/${alternative.toolSlug}`,
      }),
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "AI Tools", path: "/ai-tools" },
            { name: `${alternative.toolName} Alternatives`, path: `/alternatives/${alternative.toolSlug}` },
          ]),
        ),
      ],
    };
  },
  component: AlternativesDetailPage,
});

function AlternativesDetailPage() {
  const { alternative } = Route.useLoaderData();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl py-10 px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/ai-tools" className="hover:text-foreground">AI Tools</Link>
          <span>/</span>
          <span className="font-semibold text-foreground">
            {alternative.toolName} Alternatives
          </span>
        </nav>

        {/* Hero Section */}
        <div className="space-y-4">
          <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30">
            Market Alternatives Guide
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            {alternative.headline}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed">
            {alternative.intro}
          </p>
        </div>

        {/* WHY USERS SWITCH */}
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            Why Teams Look for Alternatives to {alternative.toolName}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-muted-foreground">
            {alternative.whyUsersSwitch.map((reason: string) => (
              <li key={reason} className="flex items-start gap-2">
                <span className="text-destructive font-bold shrink-0">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* BEST BY CATEGORY SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-1">
            <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">
              Best Open-Source Option
            </span>
            <p className="font-bold text-sm text-foreground">{alternative.bestOpenSource}</p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Best Budget Option
            </span>
            <p className="font-bold text-sm text-foreground">{alternative.bestBudget}</p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-1">
            <span className="text-[11px] font-bold text-purple-500 uppercase tracking-wider">
              Best Enterprise Option
            </span>
            <p className="font-bold text-sm text-foreground">{alternative.bestEnterprise}</p>
          </div>
        </div>

        {/* TOP ALTERNATIVES LIST */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-foreground">
            Top Alternatives Ranked & Analyzed
          </h2>

          <div className="space-y-4">
            {alternative.topAlternatives.map((alt: AiAlternativeIndex["topAlternatives"][number], idx: number) => (
              <div
                key={alt.slug}
                className="rounded-2xl border border-border/80 bg-card p-6 space-y-3 transition-all hover:border-primary/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {idx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-foreground">{alt.name}</h3>
                  </div>

                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                    {alt.priceComparison}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Key Difference: </strong>
                  {alt.keyDifference}
                </p>

                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Best For: </strong>
                  {alt.bestFor}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-border/60 text-xs">
                  <Link
                    to="/ai-tools/$slug"
                    params={{ slug: alt.slug }}
                    className="font-bold text-primary inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Read full {alt.name} review</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MIT RECOMMENDATION VERDICT */}
        <div className="rounded-3xl border border-primary/40 bg-gradient-to-r from-primary/10 via-card to-emerald-500/10 p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Award className="h-4 w-4" />
            <span>Melanated In Tech Verdict</span>
          </div>
          <p className="text-sm sm:text-base font-semibold text-foreground leading-relaxed">
            {alternative.mitRecommendation}
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              to="/ai-stack-builder"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <span>Build My AI Stack</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <AiLeadModal
              buttonText="Need Help Migrating?"
              buttonVariant="outline"
              defaultProblem={`Migrating from ${alternative.toolName} to a modern AI architecture`}
            />
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
