import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  Briefcase,
  HelpCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiLeadModal } from "@/components/ai-tools/ai-lead-modal";
import { buildSeoMeta, breadcrumbLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/solve")({
  head: () => ({
    ...buildSeoMeta({
      title: "Tell Us What You’re Trying to Solve | Melanated In Tech",
      description:
        "Describe your business bottleneck or repetitive workflow. Receive an automated solution diagnosis, suggested AI tool stack, and implementation options.",
      url: "/solve",
    }),
    scripts: [
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Solve My Problem", path: "/solve" },
        ]),
      ),
    ],
  }),
  component: SolveProblemPage,
});

const EXAMPLE_PROBLEMS = [
  "I need to automate employee onboarding and document collection for new hires.",
  "Our customer service team is drowning in repetitive after-hours phone calls and basic inquiries.",
  "We need a private AI knowledge assistant that answers student questions from our official catalog.",
  "We are spending 20 hours a week manually extracting line items from PDF invoices.",
  "We lose leads because sales reps take hours to respond to website quote requests.",
];

function SolveProblemPage() {
  const [problemText, setProblemText] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [currentTools, setCurrentTools] = useState("");
  const [teamSize, setTeamSize] = useState("2-10");

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemText.trim()) return;
    setAnalyzed(true);
  };

  // Derive dynamic diagnosis based on keywords
  const isDoc = problemText.toLowerCase().includes("pdf") || problemText.toLowerCase().includes("invoice") || problemText.toLowerCase().includes("document");
  const isPhoneOrVoice = problemText.toLowerCase().includes("call") || problemText.toLowerCase().includes("phone") || problemText.toLowerCase().includes("voice");
  const isEducation = problemText.toLowerCase().includes("student") || problemText.toLowerCase().includes("college") || problemText.toLowerCase().includes("admissions");
  const isLeadOrSales = problemText.toLowerCase().includes("lead") || problemText.toLowerCase().includes("quote") || problemText.toLowerCase().includes("sales");

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Problem Diagnostic Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Tell Us What You’re Trying to Solve
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Describe the bottleneck, manual task, or goal in plain English. We will break down the automation opportunities, recommended tools, and architecture.
          </p>
        </div>

        {/* Input Form Card */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-lg space-y-6">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="problem-input" className="text-sm font-bold text-foreground">
                Describe your challenge or desired automation:
              </Label>
              <Textarea
                id="problem-input"
                rows={4}
                required
                placeholder="e.g. We spend 15 hours a week answering the same 20 email questions from students, and we need a system to draft answers with citations..."
                value={problemText}
                onChange={(e) => {
                  setProblemText(e.target.value);
                  if (analyzed) setAnalyzed(false);
                }}
                className="text-sm leading-relaxed"
              />
            </div>

            {/* Quick Example Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-muted-foreground block">
                Or click an example to load:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLE_PROBLEMS.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => {
                      setProblemText(ex);
                      setAnalyzed(false);
                    }}
                    className="rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground text-left"
                  >
                    &ldquo;{ex.slice(0, 50)}...&rdquo;
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <Label htmlFor="current-tools" className="text-xs font-semibold text-muted-foreground">
                  Current Software in Use (Optional)
                </Label>
                <Input
                  id="current-tools"
                  placeholder="e.g. Gmail, HubSpot, Slate, Slack, QuickBooks"
                  value={currentTools}
                  onChange={(e) => setCurrentTools(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="team-size" className="text-xs font-semibold text-muted-foreground">
                  Organization / Team Size
                </Label>
                <Input
                  id="team-size"
                  placeholder="e.g. 5 employees, 50-person department"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full font-bold shadow-md"
              >
                <Sparkles className="mr-2 h-4 w-4 text-emerald-300" />
                <span>Analyze & Generate Solution Architecture</span>
              </Button>
            </div>
          </form>
        </div>

        {/* DIAGNOSTIC RESULTS */}
        {analyzed && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            {/* Diagnosis Summary Card */}
            <div className="rounded-3xl border border-primary/40 bg-card p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <Badge className="bg-primary text-primary-foreground text-xs font-bold">
                  Problem Diagnosis & Feasibility
                </Badge>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Automation Feasibility: 92% (High)
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
                Solution Architecture: {problemText.slice(0, 65)}...
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Based on your requirements, this workflow can be automated by combining a grounded reasoning model with an event-driven automation engine and your existing software stack.
              </p>

              {/* Automation Opportunities */}
              <div className="pt-3 border-t border-border/60 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Identified Automation Opportunities:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Instant automatic intake and classification</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Elimination of manual repetitive data entry</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Automated exception routing to human staff</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Complete audit logging and SLA tracking</span>
                  </div>
                </div>
              </div>

              {/* Recommended Stack Components */}
              <div className="pt-3 border-t border-border/60 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Recommended Core AI Stack:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[10px] text-primary font-bold uppercase block">Model</span>
                    <span className="font-bold text-foreground">
                      {isEducation ? "Claude 3.7 / Ollama" : "Claude 3.7 Sonnet"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase block">Automation</span>
                    <span className="font-bold text-foreground">n8n (Fair-Code)</span>
                  </div>
                  <div className="p-3 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[10px] text-blue-500 font-bold uppercase block">Database</span>
                    <span className="font-bold text-foreground">Supabase (PostgreSQL)</span>
                  </div>
                  <div className="p-3 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[10px] text-purple-500 font-bold uppercase block">Interface</span>
                    <span className="font-bold text-foreground">
                      {isPhoneOrVoice ? "Twilio + ElevenLabs" : "Slack + Webhook"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* THREE IMPLEMENTATION OPTIONS: DIY, BLUEPRINT, HAVE MIT BUILD IT */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-foreground text-center">
                Three Ways to Implement This Solution
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Option 1: DIY */}
                <div className="rounded-2xl border border-border/80 bg-card p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">Option 1</Badge>
                    <h3 className="text-base font-bold text-foreground">Do It Yourself (DIY)</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Use our free AI Tool Library and comparison guides to assemble the tools and wire APIs with in-house technical staff.
                    </p>
                  </div>
                  <Link
                    to="/ai-tools"
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-muted/30 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <span>Browse Tool Specs</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Option 2: Get a Blueprint */}
                <div className="rounded-2xl border border-border/80 bg-card p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">Option 2</Badge>
                    <h3 className="text-base font-bold text-foreground">Get a Blueprint</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Use our interactive AI Stack Builder to customize your parameters, budget, and download a complete technical spec.
                    </p>
                  </div>
                  <Link
                    to="/ai-stack-builder"
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-primary/40 bg-primary/10 py-2.5 text-xs font-semibold text-primary hover:bg-primary/20"
                  >
                    <span>Open Stack Builder</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Option 3: Have MIT Build It */}
                <div className="rounded-2xl border border-primary/50 bg-gradient-to-b from-primary/10 via-card to-card p-6 flex flex-col justify-between space-y-4 ring-1 ring-primary/30">
                  <div className="space-y-2">
                    <Badge className="bg-primary text-primary-foreground text-xs font-bold">
                      Recommended
                    </Badge>
                    <h3 className="text-base font-bold text-foreground">Have MIT Build It</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Turnkey production deployment. We design, connect, test, and hand over the complete automated system in 14 days.
                    </p>
                  </div>

                  <AiLeadModal
                    buttonText="Request MIT Implementation"
                    buttonVariant="default"
                    buttonClassName="w-full font-bold shadow-md"
                    defaultProblem={problemText}
                    recommendedStackSummary={{
                      problem: problemText,
                      currentTools,
                      teamSize,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
