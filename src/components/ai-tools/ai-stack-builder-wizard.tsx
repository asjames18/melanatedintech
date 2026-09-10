import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Layers,
  Database,
  Monitor,
  Activity,
  Copy,
  Check,
  ShieldAlert,
  Clock,
  DollarSign,
  Briefcase,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  generateAiStackRecommendation,
  type StackGeneratorInput,
  type GeneratedStackResponse,
} from "@/lib/ai-tools.functions";
import { AiLeadModal } from "./ai-lead-modal";

const PRESET_GOALS = [
  "Automate customer service & ticket answering",
  "Build an internal AI knowledge base for team docs",
  "Automate lead qualification & immediate follow-up",
  "Automate college admissions & student services",
  "Automate PDF invoice & application document intake",
  "Deploy autonomous AI agents to research & analyze data",
];

export function AiStackBuilderWizard() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState(PRESET_GOALS[0]);
  const [customGoal, setCustomGoal] = useState("");
  const [orgType, setOrgType] = useState<StackGeneratorInput["organizationType"]>("small-business");
  const [skillLevel, setSkillLevel] = useState<StackGeneratorInput["skillLevel"]>("low-code");
  const [monthlyBudget, setMonthlyBudget] = useState<StackGeneratorInput["monthlyBudget"]>("50-200");
  const [selfHostRequired, setSelfHostRequired] = useState(false);
  const [complianceRequired, setComplianceRequired] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const [result, setResult] = useState<GeneratedStackResponse | null>(null);

  const generateFn = useServerFn(generateAiStackRecommendation);

  const mutation = useMutation({
    mutationFn: async (input: StackGeneratorInput) => {
      return await generateFn({ data: input });
    },
    onSuccess: (data) => {
      setResult(data);
      setStep(4); // Results step
    },
  });

  const handleNextFromStep1 = () => {
    if (customGoal.trim()) {
      setGoal(customGoal.trim());
    }
    setStep(2);
  };

  const handleGenerate = () => {
    const finalGoal = customGoal.trim() || goal;
    mutation.mutate({
      goal: finalGoal,
      organizationType: orgType,
      skillLevel: skillLevel,
      monthlyBudget: monthlyBudget,
      selfHostRequired: selfHostRequired,
      complianceRequired: complianceRequired,
    });
  };

  const toggleCompliance = (item: string) => {
    setComplianceRequired((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const copyStackSummary = () => {
    if (!result) return;
    const text = `Melanated In Tech — AI Stack Recommendation
Goal: ${customGoal.trim() || goal}
Primary Model: ${result.primaryModel.name}
Orchestration: ${result.orchestration.name}
Database & Memory: ${result.database.name}
Interface: ${result.interface}
Monitoring: ${result.monitoring.name}
Estimated Monthly Cost: ${result.estimatedMonthlySoftwareCost}
Estimated Timeline: ${result.estimatedImplementationTimeline}
Recommendation: ${result.mitRecommendationVerdict}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-xl">
      {/* Progress Header */}
      {step < 4 && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
            <span>Step {step} of 3</span>
            <span>
              {step === 1
                ? "Objective & Goal"
                : step === 2
                ? "Organization & Technical Profile"
                : "Budget & Compliance"}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: GOAL / OBJECTIVE */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              What are you trying to accomplish?
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Select a standard business objective or describe your specific workflow challenge.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESET_GOALS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setGoal(preset);
                  setCustomGoal("");
                }}
                className={`rounded-xl border p-3.5 text-left text-xs sm:text-sm font-medium transition-all ${
                  goal === preset && !customGoal
                    ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                    : "border-border/80 bg-muted/20 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="custom-goal" className="text-xs font-semibold text-foreground">
              Or describe your exact problem in your own words:
            </Label>
            <Input
              id="custom-goal"
              placeholder="e.g. Automate employee onboarding, generate custom research briefs, sync orders to ERP..."
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              className="h-11 text-xs sm:text-sm"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleNextFromStep1}
              className="font-semibold"
            >
              <span>Next: Organization Profile</span>
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: ORG PROFILE & SKILL LEVEL */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Tell us about your organization and technical skill
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              We tailor the stack to the tools your team can actually manage and maintain.
            </p>
          </div>

          {/* Org Type */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Organization Type
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: "small-business", label: "Small Business / Agency" },
                { id: "higher-education", label: "Higher Education" },
                { id: "tech-agency", label: "Technology / SaaS" },
                { id: "enterprise", label: "Mid-Market / Enterprise" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOrgType(item.id as StackGeneratorInput["organizationType"])}
                  className={`rounded-xl border p-3 text-center text-xs font-medium transition-all ${
                    orgType === item.id
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30 font-semibold"
                      : "border-border/80 bg-muted/20 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Technical Skill Level */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Preferred Technical Complexity
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: "no-code",
                  title: "No-Code",
                  desc: "Visual point-and-click tools (Make, Zapier, Chatbase)",
                },
                {
                  id: "low-code",
                  title: "Low-Code (Recommended)",
                  desc: "Flexible node workflows with custom scripts (n8n, Supabase)",
                },
                {
                  id: "developer-code",
                  title: "Developer Code / APIs",
                  desc: "Full code frameworks & custom SDKs (LangChain, CrewAI, Python)",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSkillLevel(item.id as StackGeneratorInput["skillLevel"])}
                  className={`rounded-xl border p-3.5 text-left transition-all ${
                    skillLevel === item.id
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                      : "border-border/80 bg-muted/20 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <p className="font-bold text-xs sm:text-sm">{item.title}</p>
                  <p className="mt-1 text-[11px] opacity-80">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="text-xs"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              <span>Back</span>
            </Button>

            <Button
              onClick={() => setStep(3)}
              className="font-semibold"
            >
              <span>Next: Budget & Security</span>
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: BUDGET & COMPLIANCE */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Budget, Security & Compliance Requirements
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Define your software cost targets and any regulatory boundaries.
            </p>
          </div>

          {/* Monthly Software Budget */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Target Monthly Software / Tool Budget
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: "under-50", label: "Under $50 / mo", desc: "Lean / Free tiers" },
                { id: "50-200", label: "$50 - $200 / mo", desc: "Standard commercial" },
                { id: "200-1000", label: "$200 - $1,000 / mo", desc: "Growing operations" },
                { id: "enterprise", label: "$1,000+ / mo", desc: "Enterprise scale" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMonthlyBudget(item.id as StackGeneratorInput["monthlyBudget"])}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    monthlyBudget === item.id
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                      : "border-border/80 bg-muted/20 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <p className="font-bold text-xs">{item.label}</p>
                  <p className="text-[10px] opacity-80">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Self-Hosting & Privacy Toggle */}
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-xs sm:text-sm text-foreground">
                  Require On-Premise / Private Self-Hosting?
                </p>
                <p className="text-xs text-muted-foreground">
                  Forces open-source models (Ollama/DeepSeek) and self-hosted n8n/Supabase with zero cloud transmission.
                </p>
              </div>
              <input
                type="checkbox"
                checked={selfHostRequired}
                onChange={(e) => setSelfHostRequired(e.target.checked)}
                className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
              />
            </div>

            {/* Compliance Pills */}
            <div className="pt-2 border-t border-border/60">
              <Label className="text-[11px] font-semibold text-muted-foreground block mb-2">
                Mandatory Compliance Standards:
              </Label>
              <div className="flex flex-wrap gap-2">
                {["FERPA (Student Data)", "HIPAA (Health Records)", "SOC 2 Type II", "GDPR (EU Citizens)"].map(
                  (c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCompliance(c)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                        complianceRequired.includes(c)
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {c}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="text-xs"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              <span>Back</span>
            </Button>

            <Button
              onClick={handleGenerate}
              disabled={mutation.isPending}
              className="font-bold px-6 shadow-md"
            >
              <Sparkles className="mr-2 h-4 w-4 text-emerald-400" />
              <span>{mutation.isPending ? "Generating AI Stack..." : "Generate My AI Stack"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: RECOMMENDATION RESULTS */}
      {step === 4 && result && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          {/* Header Banner */}
          <div className="rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/15 via-card to-emerald-500/15 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Badge className="bg-primary text-primary-foreground mb-2 text-xs font-bold">
                  Recommended Architecture
                </Badge>
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground">
                  Tailored AI Stack for: {customGoal.trim() || goal}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Optimized for {orgType.replace("-", " ")} • {skillLevel} approach
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyStackSummary}
                  className="text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      <span>Copy Stack</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="text-xs text-muted-foreground"
                >
                  Start Over
                </Button>
              </div>
            </div>
          </div>

          {/* 5 Core Stack Layers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              Core Architecture Components
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Primary Model */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <Cpu className="h-4 w-4" />
                  <span>AI Foundation Model</span>
                </div>
                <h5 className="font-bold text-foreground text-sm">
                  {result.primaryModel.name}
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {result.primaryModel.reason}
                </p>
                <Link
                  to="/ai-tools/$slug"
                  params={{ slug: result.primaryModel.slug }}
                  className="text-[11px] font-semibold text-primary hover:underline inline-block pt-1"
                >
                  View tool specifications →
                </Link>
              </div>

              {/* Orchestration */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <Layers className="h-4 w-4" />
                  <span>Automation Engine</span>
                </div>
                <h5 className="font-bold text-foreground text-sm">
                  {result.orchestration.name}
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {result.orchestration.reason}
                </p>
                <Link
                  to="/ai-tools/$slug"
                  params={{ slug: result.orchestration.slug }}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-block pt-1"
                >
                  View tool specifications →
                </Link>
              </div>

              {/* Database & Memory */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-blue-500 font-bold text-xs">
                  <Database className="h-4 w-4" />
                  <span>Database & Vector Memory</span>
                </div>
                <h5 className="font-bold text-foreground text-sm">
                  {result.database.name}
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {result.database.reason}
                </p>
                <Link
                  to="/ai-tools/$slug"
                  params={{ slug: result.database.slug }}
                  className="text-[11px] font-semibold text-blue-500 hover:underline inline-block pt-1"
                >
                  View tool specifications →
                </Link>
              </div>

              {/* User Interface */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-purple-500 font-bold text-xs">
                  <Monitor className="h-4 w-4" />
                  <span>Frontend / Interface</span>
                </div>
                <h5 className="font-bold text-foreground text-sm">
                  {result.interface.name}
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {result.interface.reason}
                </p>
              </div>

              {/* Observability */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-amber-500 font-bold text-xs">
                  <Activity className="h-4 w-4" />
                  <span>Telemetry & Guardrails</span>
                </div>
                <h5 className="font-bold text-foreground text-sm">
                  {result.monitoring.name}
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {result.monitoring.reason}
                </p>
                <Link
                  to="/ai-tools/$slug"
                  params={{ slug: result.monitoring.slug }}
                  className="text-[11px] font-semibold text-amber-500 hover:underline inline-block pt-1"
                >
                  View tool specifications →
                </Link>
              </div>
            </div>
          </div>

          {/* Economics & Implementation Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <span>Est. Recurring Tool Cost</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {result.estimatedMonthlySoftwareCost}
              </p>
              <p className="text-[11px] text-muted-foreground">Billed by vendors directly</p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <Clock className="h-4 w-4 text-primary" />
                <span>Implementation Timeline</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {result.estimatedImplementationTimeline}
              </p>
              <p className="text-[11px] text-muted-foreground">From blueprint to production testing</p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <Briefcase className="h-4 w-4 text-purple-500" />
                <span>DIY Feasibility</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {result.diySuitabilityScore}% Suitability
              </p>
              <p className="text-[11px] text-muted-foreground">
                {result.diySuitabilityScore > 60 ? "Feasible for in-house staff" : "Professional build advised"}
              </p>
            </div>
          </div>

          {/* Alternative Stacks */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Alternative Stack Options
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-1">
                <span className="font-bold text-foreground">Low-Cost / Open-Source Option:</span>
                <p className="text-muted-foreground">
                  {result.alternativeBudgetStack.join(" → ")}
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-1">
                <span className="font-bold text-foreground">Enterprise / Sovereign Cloud Option:</span>
                <p className="text-muted-foreground">
                  {result.alternativeEnterpriseStack.join(" → ")}
                </p>
              </div>
            </div>
          </div>

          {/* Flagship Consulting Conversion CTA */}
          <div className="rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/10 via-card to-emerald-500/10 p-6 sm:p-10 text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>MIT Implementation Service</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Want MIT to Build and Deploy This for You?
            </h3>

            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Don&apos;t waste weeks stitching APIs, troubleshooting hallucinated node loops, or configuring database schemas. Antonio and the MIT technical team build, test, and hand over production-ready AI systems tailored to your exact business operations.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <AiLeadModal
                buttonText="Request MIT Implementation"
                buttonSize="lg"
                buttonClassName="px-8 py-3 text-sm font-bold shadow-lg"
                defaultProblem={`Build recommended AI stack for: ${customGoal.trim() || goal}`}
                recommendedStackSummary={{
                  goal: customGoal.trim() || goal,
                  primaryModel: result.primaryModel.name,
                  orchestration: result.orchestration.name,
                  database: result.database.name,
                  interface: result.interface,
                  monitoring: result.monitoring.name,
                  estimatedMonthlyCost: result.estimatedMonthlySoftwareCost,
                  estimatedTimeline: result.estimatedImplementationTimeline,
                }}
              />

              <Link
                to="/solutions"
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground p-2"
              >
                <span>Browse Pre-Engineered Solution Blueprints</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
