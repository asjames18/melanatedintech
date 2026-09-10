import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Star } from "lucide-react";
import type { AiTool } from "@/lib/ai-tools-data";
import { Badge } from "@/components/ui/badge";

interface AiToolCardProps {
  tool: AiTool;
  featuredHighlight?: boolean;
}

export function AiToolCard({ tool, featuredHighlight = false }: AiToolCardProps) {
  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg ${
        featuredHighlight
          ? "border-primary/40 bg-gradient-to-b from-primary/5 via-card to-card ring-1 ring-primary/20"
          : "border-border/80"
      }`}
    >
      <div>
        {/* Header Row: Category Badge & MIT Recommendation Score */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="border-border/70 bg-muted/60 text-xs font-semibold text-foreground/80">
            {tool.primaryCategory}
          </Badge>

          <div
            className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"
            title="Melanated In Tech Recommendation Score"
          >
            <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" />
            <span>MIT {tool.mitRecommendationScore}%</span>
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="mt-3">
          <Link
            to="/ai-tools/$slug"
            params={{ slug: tool.slug }}
            className="group-hover:text-primary transition-colors"
          >
            <h3 className="text-lg font-bold text-foreground tracking-tight">
              {tool.name}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {tool.tagline}
          </p>
        </div>

        {/* Badges: Open Source / Self-Hosted / Free */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
          {tool.openSource && (
            <span className="rounded-md bg-blue-500/10 px-2 py-0.5 font-medium text-blue-600 dark:text-blue-400">
              Open Source
            </span>
          )}
          {tool.selfHosted && (
            <span className="rounded-md bg-purple-500/10 px-2 py-0.5 font-medium text-purple-600 dark:text-purple-400">
              Self-Hostable
            </span>
          )}
          {tool.freePlan && (
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
              Free Plan
            </span>
          )}
          {tool.enterpriseReadiness.soc2Status !== "None" && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 font-medium text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-primary" />
              {tool.enterpriseReadiness.soc2Status}
            </span>
          )}
        </div>

        {/* Key Features / Best For */}
        <div className="mt-3.5 border-t border-border/50 pt-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Best for: </span>
            {tool.bestFor}
          </p>
        </div>
      </div>

      {/* Footer CTA & Pricing */}
      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs">
        <div>
          <span className="text-[11px] text-muted-foreground block">Starting</span>
          <span className="font-semibold text-foreground">{tool.startingPrice}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/ai-tools/$slug"
            params={{ slug: tool.slug }}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 font-semibold text-foreground shadow-2xs transition-all hover:bg-muted hover:text-primary active:scale-[0.98]"
          >
            <span>Details</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
