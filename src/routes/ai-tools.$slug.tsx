import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Star,
  Sparkles,
  Layers,
  Code,
  Lock,
  Cpu,
  HelpCircle,
  Award,
} from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiLeadModal } from "@/components/ai-tools/ai-lead-modal";
import { getAiTool, AI_TOOLS, AI_COMPARISONS, AI_SOLUTIONS } from "@/lib/ai-tools-data";
import { buildSeoMeta, breadcrumbLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/ai-tools/$slug")({
  loader: ({ params }) => {
    const tool = getAiTool(params.slug);
    if (!tool) throw notFound();

    const relatedComparisons = AI_COMPARISONS.filter(
      (c) => c.toolA.slug === tool.slug || c.toolB.slug === tool.slug,
    );

    const relatedSolutions = AI_SOLUTIONS.filter((s) =>
      s.recommendedTools.some((rt) => rt.slug === tool.slug),
    );

    const sameCategoryTools = AI_TOOLS.filter(
      (t) => t.primaryCategory === tool.primaryCategory && t.slug !== tool.slug,
    ).slice(0, 3);

    return { tool, relatedComparisons, relatedSolutions, sameCategoryTools };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { tool } = loaderData;

    const softwareAppLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.name,
      headline: tool.tagline,
      description: tool.shortDescription,
      applicationCategory: tool.primaryCategory,
      operatingSystem: tool.supportedPlatforms.join(", "),
      offers: {
        "@type": "Offer",
        price: tool.startingPrice.replace(/[^0-9.]/g, "") || "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: (tool.mitRecommendationScore / 20).toFixed(1),
        bestRating: "5",
        ratingCount: "1",
      },
    };

    return {
      ...buildSeoMeta({
        title: `${tool.name} Review & Architecture Guide (${tool.lastVerified}) | Melanated In Tech`,
        description: `${tool.shortDescription} Explore pricing, security, integrations, and recommended stacks.`,
        url: `/ai-tools/${tool.slug}`,
      }),
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "AI Tools", path: "/ai-tools" },
            { name: tool.name, path: `/ai-tools/${tool.slug}` },
          ]),
        ),
        ldScript(softwareAppLd),
      ],
    };
  },
  component: ToolDetailPage,
});

function ToolDetailPage() {
  const { tool, relatedComparisons, relatedSolutions, sameCategoryTools } = Route.useLoaderData();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl py-10 px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/ai-tools" className="hover:text-foreground">AI Tools</Link>
          <span>/</span>
          <span className="font-semibold text-foreground">{tool.name}</span>
        </nav>

        {/* HERO HEADER */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30">
                  {tool.primaryCategory}
                </Badge>

                {tool.openSource && (
                  <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    Open Source
                  </Badge>
                )}

                {tool.selfHosted && (
                  <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    Self-Hostable
                  </Badge>
                )}

                <span className="text-xs text-muted-foreground">
                  Verified: {tool.lastVerified}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {tool.name}
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                {tool.tagline}
              </p>
            </div>

            {/* MIT Score Badge Card */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center shrink-0 min-w-[150px]">
              <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Star className="h-5 w-5 fill-emerald-500 text-emerald-500" />
                <span className="text-2xl font-black">{tool.mitRecommendationScore}%</span>
              </div>
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mt-1">
                MIT Recommendation
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Vetted in production
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60">
            <a
              href={tool.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              <span>Visit Official Website</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <Link
              to="/alternatives/$tool"
              params={{ tool: tool.slug }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-xs sm:text-sm font-semibold text-foreground transition-all hover:bg-muted"
            >
              <span>See Alternatives</span>
            </Link>

            <AiLeadModal
              buttonText="Need Help Implementing This?"
              buttonVariant="outline"
              defaultProblem={`Implement ${tool.name} for our organization`}
            />
          </div>
        </div>

        {/* OVERVIEW & WHAT IT DOES */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Overview & What It Does
          </h2>
          <div className="rounded-2xl border border-border/80 bg-card p-6 text-sm sm:text-base leading-relaxed text-muted-foreground space-y-4">
            <p>{tool.fullDescription}</p>
            <p className="font-medium text-foreground">
              {tool.shortDescription}
            </p>
          </div>
        </section>

        {/* MIT EDITORIAL NOTES */}
        <section className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-emerald-500/10 p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Award className="h-4 w-4" />
            <span>MIT Editorial Analysis</span>
          </div>
          <p className="text-sm sm:text-base font-semibold text-foreground leading-relaxed">
            &ldquo;{tool.mitEditorialNotes}&rdquo;
          </p>
        </section>

        {/* PROS & CONS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-3">
            <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Check className="h-4 w-4" />
              Strengths & Advantages
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              {tool.strengths.map((str) => (
                <li key={str} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-3">
            <h3 className="text-base font-bold text-destructive flex items-center gap-2">
              <X className="h-4 w-4" />
              Limitations & Weaknesses
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              {tool.weaknesses.map((weak) => (
                <li key={weak} className="flex items-start gap-2">
                  <span className="text-destructive font-bold shrink-0">✕</span>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* WHO SHOULD USE IT VS WHO SHOULD AVOID IT */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-2">
            <h3 className="text-sm font-bold text-foreground">Who Should Use It:</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {tool.bestFor}
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-muted/20 p-6 space-y-2">
            <h3 className="text-sm font-bold text-foreground">Who Should Avoid It:</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {tool.notBestFor}
            </p>
          </div>
        </section>

        {/* KEY FEATURES & PRICING DETAILS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Key Features */}
          <div className="md:col-span-2 rounded-2xl border border-border/80 bg-card p-6 space-y-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Key Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-muted-foreground">
              {tool.keyFeatures.map((feat) => (
                <div key={feat} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-3">
            <h3 className="text-base font-bold text-foreground">
              Pricing Overview
            </h3>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Starting Price</span>
              <p className="text-xl font-extrabold text-foreground">{tool.startingPrice}</p>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border/60">
              <div className="flex justify-between">
                <span>Free Plan:</span>
                <span className="font-semibold text-foreground">{tool.freePlan ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span>Free Trial:</span>
                <span className="font-semibold text-foreground">{tool.freeTrial ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span>Pricing Model:</span>
                <span className="font-semibold text-foreground">{tool.pricingModel}</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY, PRIVACY & COMPLIANCE */}
        <section className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Security, Privacy & Enterprise Readiness
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-center">
              <span className="text-muted-foreground block text-[11px]">SOC 2 Status</span>
              <span className="font-bold text-foreground mt-0.5 block">{tool.enterpriseReadiness.soc2Status}</span>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-center">
              <span className="text-muted-foreground block text-[11px]">HIPAA Support</span>
              <span className="font-bold text-foreground mt-0.5 block">
                {tool.enterpriseReadiness.hipaaSupport ? "Available (BAA)" : "No BAA"}
              </span>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-center">
              <span className="text-muted-foreground block text-[11px]">GDPR Ready</span>
              <span className="font-bold text-foreground mt-0.5 block">
                {tool.enterpriseReadiness.gdprSupport ? "Compliant" : "No"}
              </span>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-center">
              <span className="text-muted-foreground block text-[11px]">SSO / SAML</span>
              <span className="font-bold text-foreground mt-0.5 block">
                {tool.enterpriseReadiness.ssoSupport ? "Enterprise Tier" : "Not Supported"}
              </span>
            </div>
          </div>

          {tool.securityNotes && (
            <p className="text-xs text-muted-foreground leading-relaxed pt-2">
              <span className="font-semibold text-foreground">Compliance Notes: </span>
              {tool.securityNotes}
            </p>
          )}
        </section>

        {/* RELATED COMPARISONS & ALTERNATIVES */}
        {relatedComparisons.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-base font-bold text-foreground">
              Direct Comparisons Featuring {tool.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedComparisons.map((comp) => (
                <Link
                  key={comp.slug}
                  to="/compare/$comparison"
                  params={{ comparison: comp.slug }}
                  className="rounded-xl border border-border/80 bg-card p-4 font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-muted/40"
                >
                  <p className="text-sm text-primary">{comp.toolA.name} vs. {comp.toolB.name}</p>
                  <p className="text-xs text-muted-foreground font-normal mt-1 line-clamp-1">
                    {comp.summary}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* BOTTOM IMPLEMENTATION CTA */}
        <section className="rounded-3xl border border-primary/40 bg-gradient-to-r from-primary/15 via-card to-emerald-500/15 p-6 sm:p-10 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Want MIT to implement {tool.name} for your organization?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Avoid costly setup mistakes and configuration traps. Antonio and the MIT technical team design, integrate, and deploy custom workflows around {tool.name}.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <AiLeadModal
              buttonText="Talk to MIT"
              buttonSize="lg"
              buttonClassName="px-8 font-bold"
              defaultProblem={`Integrate and deploy ${tool.name} for our workflows`}
            />

            <Link
              to="/ai-stack-builder"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline p-2"
            >
              <span>See how {tool.name} fits in an AI Stack</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
