import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Scale, ArrowRight, Sparkles, Award } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Badge } from "@/components/ui/badge";
import { AiComparisonTable } from "@/components/ai-tools/ai-comparison-table";
import { getAiComparison, AI_COMPARISONS } from "@/lib/ai-tools-data";
import { buildSeoMeta, breadcrumbLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/compare/$comparison")({
  loader: ({ params }) => {
    const comparison = getAiComparison(params.comparison);
    if (!comparison) throw notFound();
    return { comparison };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { comparison } = loaderData;

    return {
      ...buildSeoMeta({
        title: `${comparison.toolA.name} vs. ${comparison.toolB.name} (${comparison.headline}) | Melanated In Tech`,
        description: comparison.summary,
        url: `/compare/${comparison.slug}`,
      }),
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
            { name: `${comparison.toolA.name} vs ${comparison.toolB.name}`, path: `/compare/${comparison.slug}` },
          ]),
        ),
      ],
    };
  },
  component: ComparisonDetailPage,
});

function ComparisonDetailPage() {
  const { comparison } = Route.useLoaderData();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl py-10 px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/compare" className="hover:text-foreground">Compare</Link>
          <span>/</span>
          <span className="font-semibold text-foreground">
            {comparison.toolA.name} vs. {comparison.toolB.name}
          </span>
        </nav>

        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <Scale className="h-3.5 w-3.5" />
            <span>Technical Comparison & Benchmark</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            {comparison.headline}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
            {comparison.summary}
          </p>
        </div>

        {/* The Detailed Comparison Matrix Component */}
        <AiComparisonTable comparison={comparison} />
      </div>
    </SiteLayout>
  );
}
