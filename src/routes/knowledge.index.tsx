import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookMarked,
  BriefcaseBusiness,
  ClipboardCheck,
  Hammer,
  PlayCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
  Globe,
  ExternalLink,
  Rss,
} from "lucide-react";
import { fetchAiAgentNews, NewsItem } from "@/lib/public-apis.functions";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { ExplainerMediaBanner } from "@/components/explainer-media-banner";
import { ArticleCard } from "@/components/cards";
import { Pagination } from "@/components/pagination";
import { ListingPendingShell } from "@/components/listing-skeleton";
import { listArticles } from "@/lib/public.functions";
import { buildSeoMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { listMyLearningProgress } from "@/lib/retention.functions";
import { supabase } from "@/integrations/supabase/client";
import { useReadingProgressList } from "@/hooks/use-reading-progress";

const PAGE_SIZE = 9;

const qo = queryOptions({ queryKey: ["articles"], queryFn: () => listArticles() });

const searchSchema = z.object({
  page: fallback(z.number().int().min(1), 1).default(1),
  category: fallback(z.string(), "All").default("All"),
});

type Length = "All" | "Quick" | "Medium" | "Deep";
const LENGTHS: Length[] = ["All", "Quick", "Medium", "Deep"];
const lengthOf = (m: number): Exclude<Length, "All"> =>
  m <= 5 ? "Quick" : m <= 9 ? "Medium" : "Deep";

const FEATURED_SLUGS = [
  "choose-your-first-agent-workflow",
  "agent-evaluation-golden-set",
  "mcp-security-checklist-non-security-teams",
  "ai-agent-roi-calculator-small-teams",
];

const START_HERE_SLUGS = [
  "choose-your-first-agent-workflow",
  "write-agent-brief-that-works",
  "prompt-injection-in-everyday-language",
];

const FIELD_GUIDE_SLUG = "weekly-agent-review-meeting";

const TRACKS = [
  {
    title: "Build",
    category: "Getting Started",
    body: "Select a workflow, write the agent brief, connect tools, and ship a useful first loop.",
    Icon: Hammer,
  },
  {
    title: "Operate",
    category: "Evaluation",
    body: "Measure quality, review logs, control cost, and improve live agent behavior week by week.",
    Icon: ClipboardCheck,
  },
  {
    title: "Secure",
    category: "Agent Security",
    body: "Set permissions, approval gates, prompt-injection drills, and human review boundaries.",
    Icon: ShieldCheck,
  },
  {
    title: "Decide",
    category: "Business Strategy",
    body: "Make the business case, compare vendors, choose build paths, and avoid overbuying.",
    Icon: BriefcaseBusiness,
  },
];

export const Route = createFileRoute("/knowledge/")({
  validateSearch: zodValidator(searchSchema),
  head: () => {
    const seo = buildSeoMeta({
      title: "Agent Knowledge Hub - Melanated In Tech",
      description:
        "Practical AI agent playbooks for builders, operators, community learners, and teams deciding what to ship next.",
      url: "/knowledge",
    });
    return {
      meta: seo.meta,
      links: [
        ...seo.links,
        {
          rel: "alternate",
          type: "application/rss+xml",
          href: `${SITE_URL}/knowledge/feed.xml`,
          title: "Melanated In Tech — Knowledge Hub",
        },
      ],
    };
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  pendingMs: 0,
  pendingComponent: () => (
    <SiteLayout>
      <ListingPendingShell variant="article" label="articles" />
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="p-12 text-center text-sm text-muted-foreground">{error.message}</div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="p-12">Not found.</div>
    </SiteLayout>
  ),
  component: KnowledgeIndex,
});

function KnowledgeIndex() {
  const { data: articles } = useSuspenseQuery(qo);
  const { page, category: urlCategory } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(articles.map((a) => a.category))).sort()],
    [articles],
  );
  const [cat, setCat] = useState(urlCategory ?? "All");
  const [len, setLen] = useState<Length>("All");
  const [q, setQ] = useState("");

  // Keep local state in sync when URL changes (e.g. clicking a reason chip).
  useEffect(() => {
    if (urlCategory && urlCategory !== cat) setCat(urlCategory);
  }, [urlCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = articles.filter((a) => {
    const matchCat = cat === "All" || a.category?.toLowerCase() === cat.toLowerCase();
    const matchLen = len === "All" || lengthOf(a.read_minutes ?? 0) === len;
    const needle = q.trim().toLowerCase();
    const matchQ =
      !needle ||
      a.title.toLowerCase().includes(needle) ||
      (a.excerpt ?? "").toLowerCase().includes(needle);
    return matchCat && matchLen && matchQ;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // When filter changes, reset page + reflect category in URL.
  useEffect(() => {
    navigate({
      search: (prev: { page: number; category: string }) => ({
        ...prev,
        page: 1,
        category: cat === "All" ? "All" : cat,
      }),
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, len, q]);

  const setPage = (p: number) => {
    navigate({ search: (prev: { page: number; category: string }) => ({ ...prev, page: p }) });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setCategory = (category: string) => {
    setCat(category);
    setLen("All");
    setQ("");
    if (typeof window !== "undefined") {
      setTimeout(() => {
        document.getElementById("articles-grid")?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  };

  const hasFilters = cat !== "All" || len !== "All" || q.length > 0;
  const featured = FEATURED_SLUGS.map((slug) => articles.find((a) => a.slug === slug)).filter(
    Boolean,
  ) as typeof articles;
  const startHere = START_HERE_SLUGS.map((slug) => articles.find((a) => a.slug === slug)).filter(
    Boolean,
  ) as typeof articles;
  const fieldGuide = articles.find((a) => a.slug === FIELD_GUIDE_SLUG);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Knowledge hub"
        title="The operating library for practical AI agents."
        description="Build useful agents, operate them with evidence, secure the risky edges, and decide what deserves investment."
      />

      {/* Featured Video & NotebookLM Audio Overview */}
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <ExplainerMediaBanner
          title="Featured Knowledge Overview — Escaping AI Hype & Building Real Agents"
          subtitle="Interactive Video Overview & Knowledge Reference Guide"
          videoUrl="/videos/Melanated_in_Tech.mp4"
          sourcePackText={`# Melanated in Tech — Knowledge Hub Master Overview

Practical AI Agent Playbooks & Field Guides covering:
- Build: Prompt engineering, RAG pipelines, and MCP connectors.
- Operate: Golden-set evaluation, logging, and cost optimization.
- Secure: Guardrails, prompt injection safety, and human approvals.
- Decide: ROI calculators, build vs. buy frameworks, and vendor evaluation.`}
        />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-border pb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Start here
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                New to the Hub? Begin with the operating basics.
              </h2>
            </div>
            {fieldGuide ? (
              <Link
                to="/knowledge/$slug"
                params={{ slug: fieldGuide.slug }}
                className="group rounded-lg border border-border bg-card px-4 py-3 transition hover:border-foreground/20"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-accent2">
                  This week's field guide
                </p>
                <p className="mt-1 max-w-md text-sm font-medium group-hover:text-primary">
                  {fieldGuide.title}
                </p>
              </Link>
            ) : (
              <div className="rounded-lg border border-border bg-card px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wider text-accent2">
                  This week's field guide
                </p>
                <p className="mt-1 max-w-md text-sm font-medium">
                  Run a 30-minute review: sample good runs, inspect misses, pick one fix.
                </p>
              </div>
            )}
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {startHere.length > 0
              ? startHere.map((a) => <ArticleCard key={a.id} {...a} />)
              : [
                  [
                    "Playbook",
                    "Choose a first workflow",
                    "Rank agent ideas by risk, repeatability, review effort, and business value.",
                  ],
                  [
                    "Template",
                    "Write the agent brief",
                    "Define the job, tools, constraints, examples, and escalation rules before building.",
                  ],
                  [
                    "Field Guide",
                    "Spot prompt injection",
                    "Teach the team how untrusted content tries to act like instructions.",
                  ],
                ].map(([label, title, body]) => (
                  <div key={title} className="rounded-2xl border border-border bg-card p-6">
                    <p className="text-xs font-medium uppercase tracking-wider text-primary">
                      {label}
                    </p>
                    <h3 className="mt-3 font-display text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                  </div>
                ))}
          </div>
        </div>

        {featured.length > 0 && (
          <div className="mb-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold">Cornerstone playbooks</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Four durable entry points: build, operate, secure, and decide.
                </p>
              </div>
              <BookMarked className="hidden h-6 w-6 text-primary sm:block" aria-hidden />
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {featured.map((a) => (
                <ArticleCard key={a.id} {...a} />
              ))}
            </div>
          </div>
        )}

        <div className="mb-10 grid gap-3 md:grid-cols-4">
          {TRACKS.map(({ Icon, ...track }) => (
            <button
              key={track.title}
              onClick={() => setCategory(track.category)}
              className="group rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  {track.title}
                </p>
                <Icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
              </div>
              <h3 className="mt-2 font-display text-lg font-semibold">{track.category}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{track.body}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Explore track{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>

        <div
          id="articles-grid"
          className="scroll-mt-20 rounded-2xl border border-border bg-card p-4 sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search playbooks, checklists, scorecards..."
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-primary/20"
                aria-label="Search articles"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {filtered.length} {filtered.length === 1 ? "article" : "articles"}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  cat === c
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
            <span className="mx-2 h-5 w-px bg-border" />
            {LENGTHS.map((l) => (
              <button
                key={l}
                onClick={() => setLen(l)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  len === l
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
                title={
                  l === "Quick"
                    ? "<= 5 min"
                    : l === "Medium"
                      ? "6-9 min"
                      : l === "Deep"
                        ? "10+ min"
                        : "Any length"
                }
              >
                {l}
              </button>
            ))}
            {hasFilters && (
              <button
                onClick={() => {
                  setCat("All");
                  setLen("All");
                  setQ("");
                }}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        <div
          key={safePage}
          className="mt-8 grid animate-fade-in gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {paged.map((a) => (
            <ArticleCard key={a.id} {...a} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="mt-12 rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-sm font-medium">No articles match this filter.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try clearing filters or searching a different keyword.
            </p>
          </div>
        )}

        <Pagination
          page={safePage}
          pageCount={pageCount}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          label="articles"
          onChange={setPage}
        />

        <ContinueLearningPaths />
        <ContinueReading articles={articles} />
        <LiveAiAgentNewsFeed />
      </section>
    </SiteLayout>
  );
}

function ContinueLearningPaths() {
  const getProgress = useServerFn(listMyLearningProgress);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
  }, []);
  const progress = useQuery({
    queryKey: ["learning-progress"],
    queryFn: () => getProgress(),
    enabled: signedIn,
  });
  const rows = (progress.data ?? [])
    .filter((row) => !row.completed_at)
    .map((row) => ({
      row,
      path: Array.isArray(row.learning_paths) ? row.learning_paths[0] : row.learning_paths,
    }))
    .filter((item) => item.path)
    .slice(0, 3);
  if (rows.length === 0) return null;
  return (
    <div className="mt-16 border-t pt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold">Continue learning</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Resume the path that ties these articles to agents, products, and community practice.
          </p>
        </div>
        <Link
          to="/paths"
          className="hidden text-sm font-medium text-primary hover:underline sm:block"
        >
          View all paths
        </Link>
      </div>
      <ul className="mt-5 grid gap-4 md:grid-cols-3">
        {rows.map(({ row, path }) => (
          <li key={row.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <PlayCircle className="h-4 w-4" />
              </div>
              <div>
                <Link
                  to="/paths/$slug"
                  params={{ slug: path!.slug }}
                  className="font-medium hover:text-primary"
                >
                  {path!.title}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {row.completed_item_ids.length} steps completed
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContinueReading({
  articles,
}: {
  articles: Array<{
    id: string;
    slug: string;
    title: string;
    category: string;
    read_minutes: number;
  }>;
}) {
  const rows = useReadingProgressList();
  const inProgress = rows
    .filter((r) => r.percent > 5 && r.percent < 95)
    .slice(0, 3)
    .map((r) => ({ row: r, article: articles.find((a) => a.slug === r.slug) }))
    .filter((x) => x.article);
  if (inProgress.length === 0) return null;
  return (
    <div className="mt-16 border-t pt-10">
      <h2 className="font-display text-xl font-semibold">Continue reading</h2>
      <p className="mt-1 text-sm text-muted-foreground">Pick up where you left off.</p>
      <ul className="mt-5 grid gap-4 md:grid-cols-3">
        {inProgress.map(({ row, article }) => (
          <li key={row.slug} className="rounded-lg border bg-card p-4">
            <Link
              to="/knowledge/$slug"
              params={{ slug: article!.slug }}
              className="font-medium hover:text-primary"
            >
              {article!.title}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              {article!.category} - {article!.read_minutes} min
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${row.percent}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{row.percent}% read</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LiveAiAgentNewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAiAgentNews({ data: { limit: 5 } })
      .then((res) => setNews(res as NewsItem[]))
      .catch((e) => console.warn("Live news fetch failed:", e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mt-16 border-t pt-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Rss className="h-5 w-5 text-amber-500" />
            <h2 className="font-display text-xl font-semibold">Live AI Agent Dev & Research Feed</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Automated real-time trends surfaced via HackerNews, Dev.to, and ArXiv APIs.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-mono font-medium text-amber-600 dark:text-amber-400">
          <Globe className="h-3.5 w-3.5" /> Live Public APIs
        </span>
      </div>

      {loading ? (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl border bg-card p-4 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between rounded-xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span className="font-semibold text-primary">{item.source}</span>
                  {item.score !== undefined && <span>{item.score} pts</span>}
                </div>
                <h3 className="mt-2 text-sm font-semibold text-foreground group-hover:text-primary line-clamp-2">
                  {item.title}
                </h3>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
                <span>{item.author ? `By ${item.author}` : "Open Web"}</span>
                <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
