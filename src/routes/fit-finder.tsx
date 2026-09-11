import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, RotateCcw, Save } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArticleCard } from "@/components/cards";
import { supabase } from "@/integrations/supabase/client";
import { listAgents, listArticles, listProducts } from "@/lib/public.functions";
import { saveMyFitFinderResult } from "@/lib/retention.functions";
import { buildSeoMeta } from "@/lib/seo";
import { toast } from "sonner";
import { FitFinderStarterKit } from "@/components/fit-finder-starter-kit";
import { trackEvent } from "@/lib/analytics";
import { funnelAttribution } from "@/components/funnel-attribution";
import {
  PLANNING_SIGNAL_DISCLAIMER,
  WORKFLOW_OPPORTUNITY_SPRINT as SPRINT,
  workflowInquiryMessage,
} from "@/lib/workflow-opportunity-sprint";

export type FitFinderAnswers = {
  workflow: string;
  role: string;
  goal: string;
  risk: string;
  tools: string;
  timeline: string;
};

type Catalog = {
  agents: Awaited<ReturnType<typeof listAgents>>;
  articles: Awaited<ReturnType<typeof listArticles>>;
  products: Awaited<ReturnType<typeof listProducts>>;
};

const STORAGE_KEY = "mit:fit-finder:v2";
const WORKFLOW_MIN = 12;

const OPTIONS: Record<
  Exclude<keyof FitFinderAnswers, "workflow">,
  { label: string; options: string[] }
> = {
  role: {
    label: "What best describes you?",
    options: [
      "Founder/operator",
      "Higher education/education leader",
      "Ministry/nonprofit leader",
      "Creator/consultant",
      "Technical builder",
    ],
  },
  goal: {
    label: "What do you want help with first?",
    options: [
      "Pick a first workflow",
      "Make an agent safer",
      "Measure quality",
      "Package a paid offer",
    ],
  },
  risk: {
    label: "How risky is the workflow?",
    options: [
      "Low: drafting or research",
      "Medium: customer/community-facing",
      "High: money, policy, or private data",
    ],
  },
  tools: {
    label: "Which tools are involved?",
    options: ["Docs/spreadsheets", "Email/CRM", "Community/content", "Databases/APIs"],
  },
  timeline: {
    label: "When do you want momentum?",
    options: ["Today", "This week", "This month", "Still exploring"],
  },
};

const catalogQo = queryOptions({
  queryKey: ["fit-finder-catalog"],
  queryFn: async () => {
    try {
      const [agents, articles, products] = await Promise.all([
        listAgents(),
        listArticles(),
        listProducts(),
      ]);
      return { agents, articles, products };
    } catch {
      return { agents: [], articles: [], products: [] };
    }
  },
});

export const Route = createFileRoute("/fit-finder")({
  head: () => ({
    ...buildSeoMeta({
      title: "Fit Finder | Name One Repeated Workflow | Melanated In Tech",
      description:
        "Name the repeated workflow in one sentence, answer a few questions, and get a DIY lane or a next step with Melanated In Tech.",
      url: "/fit-finder",
    }),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQo),
  component: FitFinder,
});

const blankAnswers = (): FitFinderAnswers => ({
  workflow: "",
  role: "",
  goal: "",
  risk: "",
  tools: "",
  timeline: "",
});

function isComplexWorkflow(answers: FitFinderAnswers) {
  return answers.tools === "Email/CRM" || answers.tools === "Databases/APIs";
}

function isHighRisk(answers: FitFinderAnswers) {
  return answers.risk.startsWith("High");
}

function FitFinder() {
  const { data } = useQuery(catalogQo);
  const saveResult = useServerFn(saveMyFitFinderResult);
  const [answers, setAnswers] = useState<FitFinderAnswers>(blankAnswers);
  const [submitted, setSubmitted] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { answers?: FitFinderAnswers; submitted?: boolean };
        if (parsed.answers) setAnswers({ ...blankAnswers(), ...parsed.answers });
        if (parsed.submitted) setSubmitted(true);
      }
    } catch {
      /* ignore storage restriction */
    }
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    trackEvent("fit_finder_viewed", { ...funnelAttribution() });
  }, []);

  const result = useMemo(() => {
    if (!data) return null;
    return buildRecommendations(answers, data);
  }, [answers, data]);

  const saveMut = useMutation({
    mutationFn: () =>
      saveResult({
        data: {
          result: {
            answers,
            recommendedAgentSlugs: result?.agents.map((a) => a.slug) ?? [],
            recommendedArticleSlugs: result?.articles.map((a) => a.slug) ?? [],
            recommendedProductSlug: result?.product?.slug ?? null,
            savedAt: new Date().toISOString(),
          },
        },
      }),
    onSuccess: () => toast.success("Fit finder saved to your profile."),
    onError: (error: Error) => toast.error(error.message),
  });

  function setAnswer<K extends keyof FitFinderAnswers>(key: K, value: FitFinderAnswers[K]) {
    if (Object.values(answers).every((answer) => !answer)) {
      trackEvent("fit_finder_started", { surface: "first_answer", ...funnelAttribution() });
    }
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const workflowReady = answers.workflow.trim().length >= WORKFLOW_MIN;

  function submit() {
    if (!workflowReady) {
      toast.error("Name the repeated workflow in one sentence before seeing results.");
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, submitted: true }));
    } catch {
      /* ignore */
    }
    setSubmitted(true);
    trackEvent("fit_finder_completed", {
      answeredCount: Object.values(answers).filter(Boolean).length,
      role: answers.role || "not_answered",
      risk: answers.risk || "not_answered",
      timeline: answers.timeline || "not_answered",
      ...funnelAttribution(),
    });
  }

  function reset() {
    setAnswers(blankAnswers());
    setSubmitted(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  const answeredCount = (Object.keys(OPTIONS) as Array<keyof typeof OPTIONS>).filter(
    (key) => answers[key],
  ).length;
  const highIntent =
    isHighRisk(answers) ||
    ["Today", "This week"].includes(answers.timeline) ||
    answers.role === "Higher education/education leader" ||
    answers.role === "Ministry/nonprofit leader";
  const showSprint = isHighRisk(answers) || isComplexWorkflow(answers);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Fit finder"
        title="Name one repeated workflow. Then choose a useful next step."
        description="The sentence is required. The other questions sharpen the recommendation. Lane A is learn-it-yourself. Lane B is a conversation with us."
      />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
              <label htmlFor="workflow-sentence" className="font-medium">
                Name the repeated workflow in one sentence.
              </label>
              <p className="mt-1 text-sm text-muted-foreground">
                Required. Example: “After-hours estimate requests sit in the inbox until someone
                remembers to follow up.”
              </p>
              <Textarea
                id="workflow-sentence"
                required
                minLength={WORKFLOW_MIN}
                maxLength={240}
                rows={4}
                value={answers.workflow}
                onChange={(event) => setAnswer("workflow", event.target.value)}
                placeholder="We keep doing the same follow-up by hand every week."
                className="mt-3 bg-background"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {answers.workflow.trim().length}/240 · at least {WORKFLOW_MIN} characters
              </p>
            </div>
            {(Object.keys(OPTIONS) as Array<keyof typeof OPTIONS>).map((key) => (
              <div key={key} className="rounded-2xl border border-border bg-card p-5">
                <p className="font-medium">{OPTIONS[key].label}</p>
                <div className="mt-3 grid gap-2">
                  {OPTIONS[key].options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAnswer(key, option)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        answers[key] === option
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {option}
                      {answers[key] === option && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Button onClick={submit} className="flex-1" disabled={!workflowReady}>
                Show recommendations
              </Button>
              <Button onClick={reset} variant="outline" size="icon" aria-label="Reset fit finder">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </aside>

          <div>
            {!submitted ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                <h2 className="font-display text-2xl font-semibold">
                  Your next step will appear here.
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                  Name the workflow first. Partial answers on the other questions are okay.
                </p>
                <p className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">
                  {workflowReady ? "Workflow named" : "Workflow required"} · {answeredCount} of 5
                  questions answered
                </p>
              </div>
            ) : (
              result && (
                <FitFinderResults
                  answers={answers}
                  articles={result.articles}
                  agentCount={result.agents.length}
                  highIntent={highIntent}
                  showSprint={showSprint}
                  onReset={reset}
                  signedIn={signedIn}
                  onSave={() => saveMut.mutate()}
                  saving={saveMut.isPending}
                />
              )
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function FitFinderResults({
  answers,
  articles,
  agentCount,
  highIntent,
  showSprint,
  onReset,
  signedIn,
  onSave,
  saving,
}: {
  answers: FitFinderAnswers;
  articles: Catalog["articles"];
  agentCount: number;
  highIntent: boolean;
  showSprint: boolean;
  onReset: () => void;
  signedIn: boolean;
  onSave: () => void;
  saving: boolean;
}) {
  const inquirySearch = {
    topic: SPRINT.tellUsTopic,
    message: workflowInquiryMessage(answers),
  };
  const sprintSearch = {
    topic: SPRINT.inquiryTopic,
    message: workflowInquiryMessage(answers),
  };

  const laneA = (
    <section className="space-y-5 rounded-3xl border border-border bg-card p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Lane A · Learn it yourself
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold">Articles and a starter kit.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Use these if you want to map the workflow internally before talking with anyone.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {articles.map((article) => (
          <div
            key={article.id}
            onClickCapture={() =>
              trackEvent("fit_finder_recommendation_clicked", {
                itemType: "article",
                itemSlug: article.slug,
                ...funnelAttribution(),
              })
            }
          >
            <ArticleCard {...article} />
          </div>
        ))}
      </div>
      <FitFinderStarterKit
        answers={answers}
        agentNames={[]}
        highIntent={highIntent}
        hideServiceCta
      />
    </section>
  );

  const laneB = (
    <section className="space-y-5 rounded-3xl border border-primary/30 bg-primary/5 p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Lane B · Work with us
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold">Tell us this workflow.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We prefill the inquiry with your sentence and answers. No purchase is required to start
          the conversation.
        </p>
      </div>
      <Button asChild size="lg" className="w-full sm:w-auto">
        <Link
          to="/contact"
          search={inquirySearch}
          onClick={() =>
            trackEvent("service_offer_cta_clicked", {
              offer: "tell_us_workflow",
              surface: "fit_finder_results",
              ...funnelAttribution(),
            })
          }
        >
          Tell us this workflow <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
      <div className="rounded-2xl border border-border bg-background p-5">
        <p className="font-medium">
          Secondary: {SPRINT.diagnosticPrice} {SPRINT.diagnosticName}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Enough when the workflow is already easy to name and you want a 90-minute
          recommendation—not a 10-business-day discovery.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link
            to="/contact"
            search={{
              topic: `${SPRINT.diagnosticName} inquiry`,
              message: workflowInquiryMessage(answers),
            }}
            onClick={() =>
              trackEvent("service_offer_cta_clicked", {
                offer: "workflow_diagnostic",
                surface: "fit_finder_results",
                ...funnelAttribution(),
              })
            }
          >
            Ask about the {SPRINT.diagnosticPrice} diagnostic
          </Link>
        </Button>
      </div>
      {showSprint && (
        <div className="rounded-2xl border border-primary/25 bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            High-risk or multi-system handoffs
          </p>
          <h3 className="mt-2 font-display text-xl font-semibold">{SPRINT.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {SPRINT.duration}. You leave with a workflow map, feasibility and risk review,
            implementation-ready plan, and a pilot go / no-go / revise. This is not the{" "}
            {SPRINT.diagnosticName}, not the {SPRINT.websiteLaunchName}, and not a Recovery Pilot.
          </p>
          <p className="mt-3 text-sm font-medium">
            {SPRINT.planningSignalLabel}: {SPRINT.planningSignal}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{PLANNING_SIGNAL_DISCLAIMER}</p>
          <Button asChild className="mt-4">
            <Link
              to="/contact"
              search={sprintSearch}
              onClick={() => {
                trackEvent("strategy_sprint_clicked", {
                  surface: "fit_finder_results",
                  ...funnelAttribution(),
                });
                trackEvent("service_offer_cta_clicked", {
                  offer: "workflow_opportunity_sprint",
                  surface: "fit_finder_results",
                  ...funnelAttribution(),
                });
              }}
            >
              Ask about a {SPRINT.name}
            </Link>
          </Button>
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        <Link
          to="/agents"
          className="font-semibold text-primary"
          onClick={() =>
            trackEvent("fit_finder_recommendation_clicked", {
              itemType: "agent",
              itemSlug: "browse",
              ...funnelAttribution(),
            })
          }
        >
          Browse agents
        </Link>
        {agentCount > 0
          ? ` · ${agentCount} matched in the library if you want a self-serve look.`
          : "."}{" "}
        Marketplace browse is a tertiary option, not the primary next step.
      </p>
    </section>
  );

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-muted/30 p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          The workflow you named
        </p>
        <p className="mt-2 font-display text-xl font-semibold">{answers.workflow.trim()}</p>
      </div>
      {highIntent || showSprint ? (
        <>
          {laneB}
          {laneA}
        </>
      ) : (
        <>
          {laneA}
          {laneB}
        </>
      )}
      <div className="flex flex-wrap gap-3">
        {signedIn ? (
          <Button onClick={onSave} disabled={saving}>
            <Save className="h-4 w-4" />
            Save to profile
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link to="/auth">Sign in to save this result</Link>
          </Button>
        )}
        <Button onClick={onReset} variant="outline">
          Start over
        </Button>
      </div>
    </div>
  );
}

function buildRecommendations(answers: FitFinderAnswers, catalog: Catalog) {
  const signal = Object.values(answers).join(" ").toLowerCase();
  const keywords =
    signal.includes("safe") || signal.includes("risk") || signal.includes("private")
      ? ["security", "compliance", "approval", "risk", "mcp"]
      : signal.includes("measure") || signal.includes("quality")
        ? ["evaluation", "measure", "quality", "golden", "research"]
        : signal.includes("ministry") ||
            signal.includes("nonprofit") ||
            signal.includes("community")
          ? ["ministry", "community", "volunteer", "content"]
          : signal.includes("paid") || signal.includes("offer")
            ? ["proposal", "product", "launch", "sales", "cost"]
            : ["starter", "workflow", "research", "agent", "launch"];

  const score = (row: Record<string, unknown>) => {
    const haystack = Object.values(row).flat().join(" ").toLowerCase();
    return keywords.reduce((sum, word) => sum + (haystack.includes(word) ? 1 : 0), 0);
  };

  const agents = [...catalog.agents].sort((a, b) => score(b) - score(a)).slice(0, 3);
  const articles = [...catalog.articles].sort((a, b) => score(b) - score(a)).slice(0, 3);
  const product = [...catalog.products].sort((a, b) => score(b) - score(a))[0] ?? null;

  return {
    agents,
    articles,
    product,
  };
}
