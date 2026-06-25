import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, RotateCcw, Save } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { AgentCard, ArticleCard, ProductCard } from "@/components/cards";
import { supabase } from "@/integrations/supabase/client";
import { listAgents, listArticles, listProducts } from "@/lib/public.functions";
import { saveMyFitFinderResult } from "@/lib/retention.functions";
import { buildSeoMeta } from "@/lib/seo";
import { toast } from "sonner";

type Answers = {
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

const STORAGE_KEY = "mit:fit-finder:v1";

const OPTIONS: Record<keyof Answers, { label: string; options: string[] }> = {
  role: {
    label: "What best describes you?",
    options: [
      "Founder/operator",
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
    const [agents, articles, products] = await Promise.all([
      listAgents(),
      listArticles(),
      listProducts(),
    ]);
    return { agents, articles, products };
  },
});

export const Route = createFileRoute("/fit-finder")({
  head: () => ({
    ...buildSeoMeta({
      title: "Agent/Product Fit Finder - Melanated In Tech",
      description:
        "Answer five quick questions and get recommended agents, articles, products, and a community next step.",
      url: "/fit-finder",
    }),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQo),
  component: FitFinder,
});

function FitFinder() {
  const { data } = useQuery(catalogQo);
  const saveResult = useServerFn(saveMyFitFinderResult);
  const [answers, setAnswers] = useState<Answers>({
    role: "",
    goal: "",
    risk: "",
    tools: "",
    timeline: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { answers?: Answers; submitted?: boolean };
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.submitted) setSubmitted(true);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
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

  function setAnswer(key: keyof Answers, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, submitted: true }));
    setSubmitted(true);
  }

  function reset() {
    const blank = { role: "", goal: "", risk: "", tools: "", timeline: "" };
    setAnswers(blank);
    setSubmitted(false);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  const answeredCount = Object.values(answers).filter(Boolean).length;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Fit finder"
        title="Find the next agent move worth making."
        description="Answer five quick questions and get three agents, three articles, one product, and a community next step."
      />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-4">
            {(Object.keys(OPTIONS) as Array<keyof Answers>).map((key) => (
              <div key={key} className="rounded-2xl border border-border bg-card p-5">
                <p className="font-medium">{OPTIONS[key].label}</p>
                <div className="mt-3 grid gap-2">
                  {OPTIONS[key].options.map((option) => (
                    <button
                      key={option}
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
              <Button onClick={submit} className="flex-1" disabled={answeredCount === 0}>
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
                  Your recommendations will appear here.
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                  Partial answers are okay. The finder always returns something useful, then
                  improves as you answer more.
                </p>
                <p className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">
                  {answeredCount} of 5 answered
                </p>
              </div>
            ) : (
              result && (
                <div className="space-y-8">
                  <ResultBlock title="Recommended agents">
                    <div className="grid gap-4 md:grid-cols-3">
                      {result.agents.map((agent) => (
                        <AgentCard key={agent.id} {...agent} />
                      ))}
                    </div>
                  </ResultBlock>

                  <ResultBlock title="Recommended articles">
                    <div className="grid gap-4 md:grid-cols-3">
                      {result.articles.map((article) => (
                        <ArticleCard key={article.id} {...article} />
                      ))}
                    </div>
                  </ResultBlock>

                  <ResultBlock title="Product + community next step">
                    <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
                      {result.product ? <ProductCard {...result.product} /> : null}
                      <div className="rounded-2xl border border-border bg-card p-6">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          Community prompt
                        </p>
                        <h3 className="mt-2 font-display text-xl font-semibold">
                          {result.promptTitle}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">{result.prompt}</p>
                        <Button asChild className="mt-6">
                          <Link to="/community">
                            Post your result <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </ResultBlock>

                  <div className="flex flex-wrap gap-3">
                    {signedIn ? (
                      <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
                        <Save className="h-4 w-4" />
                        Save to profile
                      </Button>
                    ) : (
                      <Button asChild variant="outline">
                        <Link to="/auth">Sign in to save this result</Link>
                      </Button>
                    )}
                    <Button onClick={reset} variant="outline">
                      Start over
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function ResultBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 font-display text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function buildRecommendations(answers: Answers, catalog: Catalog) {
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
    promptTitle: answers.goal || "Share your next agent experiment",
    prompt:
      "Post your role, the workflow you chose, the risk level, and the first result you want to measure. Ask the community what to tighten before you build.",
  };
}
