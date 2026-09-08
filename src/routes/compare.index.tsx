import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Scale, ArrowRight, Sparkles, CheckCircle2, Award } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AI_COMPARISONS, AI_TOOLS } from "@/lib/ai-tools-data";
import { buildSeoMeta, breadcrumbLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/compare/")({
  head: () => ({
    ...buildSeoMeta({
      title: "AI Tool Comparisons & Side-by-Side Benchmarks | Melanated In Tech",
      description:
        "Make informed software decisions. Unbiased, side-by-side technical comparisons of the top AI tools, automation engines, and foundation models.",
      url: "/compare",
    }),
    scripts: [
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
        ]),
      ),
    ],
  }),
  component: CompareIndexPage,
});

const POPULAR_MATCHUPS = [
  { label: "Cursor vs. Windsurf", toolA: "cursor", toolB: "windsurf" },
  { label: "ChatGPT vs. Claude", toolA: "openai", toolB: "claude" },
  { label: "Perplexity vs. ChatGPT", toolA: "perplexity", toolB: "openai" },
  { label: "n8n vs. Make", toolA: "n8n", toolB: "make" },
  { label: "Vapi vs. Bland AI", toolA: "vapi", toolB: "bland-ai" },
  { label: "CrewAI vs. AutoGen", toolA: "crewai", toolB: "autogen" },
  { label: "LangChain vs. LlamaIndex", toolA: "langchain", toolB: "llamaindex" },
  { label: "Supabase vs. Pinecone", toolA: "supabase", toolB: "pinecone" },
];

function CompareIndexPage() {
  const navigate = useNavigate();
  const [toolA, setToolA] = useState("cursor");
  const [toolB, setToolB] = useState("windsurf");

  // Alphabetize tools for easy selection in dropdowns
  const sortedTools = [...AI_TOOLS].sort((a, b) => a.name.localeCompare(b.name));
  const isSameTool = toolA === toolB;

  const handleLaunchComparison = () => {
    if (isSameTool) return;
    navigate({
      to: "/compare/$comparison",
      params: { comparison: `${toolA}-vs-${toolB}` },
    });
  };

  const handleSelectMatchup = (slugA: string, slugB: string) => {
    setToolA(slugA);
    setToolB(slugB);
    navigate({
      to: "/compare/$comparison",
      params: { comparison: `${slugA}-vs-${slugB}` },
    });
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <Scale className="h-3.5 w-3.5" />
            <span>Honest Technical Comparisons</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Head-to-Head AI Tool Comparisons
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Stop guessing between competing AI tools. Compare pricing, self-hosting capability, API flexibility, and real-world trade-offs across {AI_TOOLS.length} curated tools before locking into a software contract.
          </p>
        </div>

        {/* INTERACTIVE COMPARISON PICKER */}
        <div className="rounded-3xl border border-primary/40 bg-gradient-to-r from-primary/10 via-card to-emerald-500/10 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Pick Any Two Tools to Compare Side-by-Side
            </h2>
            <p className="text-xs text-muted-foreground">
              Compare any pair in our 60+ tool directory for pricing, hosting, enterprise security, and MIT score.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center max-w-2xl mx-auto">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">
                First Tool
              </label>
              <Select value={toolA} onValueChange={setToolA}>
                <SelectTrigger className="h-11 font-semibold text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {sortedTools.map((t) => (
                    <SelectItem key={t.slug} value={t.slug}>
                      <span className="font-semibold">{t.name}</span>{" "}
                      <span className="text-[11px] text-muted-foreground">({t.primaryCategory})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-center font-extrabold text-xs text-muted-foreground uppercase pt-4 sm:pt-0">
              VS
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">
                Second Tool
              </label>
              <Select value={toolB} onValueChange={setToolB}>
                <SelectTrigger className="h-11 font-semibold text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {sortedTools.map((t) => (
                    <SelectItem key={t.slug} value={t.slug}>
                      <span className="font-semibold">{t.name}</span>{" "}
                      <span className="text-[11px] text-muted-foreground">({t.primaryCategory})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isSameTool && (
            <p className="text-center text-xs font-semibold text-destructive">
              Please select two different tools to generate a side-by-side comparison.
            </p>
          )}

          <div className="text-center">
            <Button
              onClick={handleLaunchComparison}
              disabled={isSameTool}
              className="font-bold px-8 h-11 shadow-md"
            >
              <span>Compare Tools Now</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Quick Matchup Pills */}
          <div className="pt-4 border-t border-border/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center mb-3">
              Popular Head-to-Head Matchups
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_MATCHUPS.map((matchup) => (
                <button
                  key={matchup.label}
                  type="button"
                  onClick={() => handleSelectMatchup(matchup.toolA, matchup.toolB)}
                  className="rounded-full border border-border/80 bg-background/80 hover:bg-primary/10 hover:border-primary/50 hover:text-primary px-3 py-1 text-xs font-medium text-foreground transition-colors"
                >
                  {matchup.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* POPULAR COMPARISONS DIRECTORY */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-foreground">
              Featured Comparison Guides
            </h2>
            <span className="text-xs text-muted-foreground font-semibold">
              {AI_COMPARISONS.length} In-Depth Benchmarks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_COMPARISONS.map((comp) => (
              <Link
                key={comp.slug}
                to="/compare/$comparison"
                params={{ comparison: comp.slug }}
                className="group rounded-2xl border border-border/80 bg-card p-6 space-y-3 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30">
                    {comp.toolA.name} vs. {comp.toolB.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground group-hover:text-primary font-semibold inline-flex items-center gap-1">
                    Read verdict →
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {comp.headline}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {comp.summary}
                </p>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    MIT Editorial Verdict Included
                  </span>
                  <span>Side-by-Side Matrix</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
