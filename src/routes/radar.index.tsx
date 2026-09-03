import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { ListingPendingShell } from "@/components/listing-skeleton";
import { LazyWaitlistForm } from "@/components/lazy-waitlist-form";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { trackEvent } from "@/lib/analytics";
import {
  radarGroupLabel,
  AiRadarItem,
  AiRadarCategory,
  AiRadarSourceStatus,
} from "@/lib/ai-radar.functions";
import { fetchRadarForPage } from "@/lib/radar-store.functions";
import {
  RADAR_SIGNAL_IDS,
  RADAR_SIGNALS,
  RADAR_TRACK_IDS,
  RADAR_TRACKS,
  type RadarSignal,
} from "@/lib/radar";
import {
  Search,
  RefreshCw,
  ExternalLink,
  Cpu,
  Bot,
  Code2,
  GraduationCap,
  Building2,
  Sparkles,
  Layers,
  Check,
  Share2,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Flame,
  Clock,
  Radio,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Rss,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Loaded in the route loader so the feed is server-rendered. It used to fetch
 * from a bare useQuery in the component, which meant crawlers and LLM answer
 * engines saw an empty shell where the page's whole value is.
 *
 * Reads `radar_items`, which the scheduled ingest fills, and falls back to a
 * live gather when the store is empty or the last run is stale.
 */
const radarQuery = queryOptions({
  queryKey: ["ai-radar-feed"],
  queryFn: () => fetchRadarForPage({ data: { limit: 120 } }),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/radar/")({
  head: () => {
    const seo = buildSeoMeta({
      title: "AI & Agent Radar — Real-time Intelligence, Models & Updates | Melanated In Tech",
      description:
        "Live aggregated radar tracking breakthroughs in AI models, autonomous agents, open weights, developer tooling, and research preprints from free APIs and open RSS feeds.",
      url: "/radar",
    });
    return {
      meta: seo.meta,
      links: [
        ...seo.links,
        {
          rel: "alternate",
          type: "application/rss+xml",
          href: `${SITE_URL}/radar/feed.xml`,
          title: "Melanated In Tech — AI & Agent Radar",
        },
      ],
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "AI & Agent Radar", path: "/radar" },
          ]),
        ),
      ],
    };
  },
  // Only the feed is awaited. The article rail is deliberately not prefetched
  // here: the Radar reads nothing from Supabase, and making the loader depend
  // on it would let a database outage 500 a page built entirely from public
  // feeds. The rail fills in on the client, or stays hidden.
  loader: ({ context }) => context.queryClient.ensureQueryData(radarQuery),
  pendingMs: 0,
  pendingComponent: () => (
    <SiteLayout>
      <ListingPendingShell variant="article" label="radar updates" />
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="p-12 text-center text-sm text-muted-foreground">{error.message}</div>
    </SiteLayout>
  ),
  component: RadarPage,
});

const CATEGORIES: Array<{
  id: AiRadarCategory;
  label: string;
  icon: typeof Sparkles;
  description: string;
}> = [
  { id: "all", label: "All Radar", icon: Radio, description: "All real-time updates across the AI stack" },
  { id: "models", label: "Models & Weights", icon: Cpu, description: "LLMs, vision models, weights, and benchmarks" },
  { id: "agents", label: "Autonomous Agents", icon: Bot, description: "MCP servers, tool-use, and agent frameworks" },
  { id: "developer", label: "Dev & Code", icon: Code2, description: "Hands-on tutorials, implementations, and tooling" },
  { id: "research", label: "Research & ArXiv", icon: GraduationCap, description: "Peer-reviewed papers and academic preprints" },
  { id: "industry", label: "Industry & Labs", icon: Building2, description: "Releases and commentary from leading labs" },
];

function timeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "recently";
  }
}

function getCategoryBadge(cat: AiRadarItem["category"]) {
  switch (cat) {
    case "models":
      return {
        label: "Model / Weights",
        className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      };
    case "agents":
      return {
        label: "AI Agent / MCP",
        className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      };
    case "developer":
      return {
        label: "Dev / Tooling",
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      };
    case "research":
      return {
        label: "Research / Paper",
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      };
    case "industry":
      return {
        label: "Industry News",
        className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      };
    default:
      return {
        label: "Update",
        className: "bg-muted text-muted-foreground border-border",
      };
  }
}

function RadarPage() {
  const [selectedCategory, setSelectedCategory] = useState<AiRadarCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"cards" | "compact">("cards");
  const [timeframe, setTimeframe] = useState<"all" | "24h" | "3d" | "7d">("all");
  const [selectedSignal, setSelectedSignal] = useState<RadarSignal | "all">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // The route loader resolves this, so the component always has data: the
  // first paint is server-rendered and there is no client-side loading pass.
  // Pending and error UI live on the route (pendingComponent/errorComponent).
  const { data, refetch } = useSuspenseQuery(radarQuery);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Radar reloaded.");
    } catch {
      toast.error("Could not reload the radar. Showing what was already loaded.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyLink = (item: AiRadarItem) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      toast.success("Direct link copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // useSuspenseQuery guarantees `data`, so these are stable references and can
  // be used directly as hook dependencies.
  const items = data.items;
  const sources = useMemo(() => ["All", ...data.sources], [data.sources]);

  // Client-side filtering
  const filteredItems = useMemo(() => {
    const now = Date.now();
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Signal filter (Act / Watch / Context)
      if (selectedSignal !== "all" && item.signal !== selectedSignal) {
        return false;
      }

      // Source filter (by group: seven readable buckets, not forty publishers)
      if (selectedSource !== "All" && item.group !== selectedSource) {
        return false;
      }

      // Timeframe filter
      if (timeframe !== "all") {
        const itemTime = new Date(item.publishedAt).getTime();
        const diffHours = (now - itemTime) / (1000 * 60 * 60);
        if (timeframe === "24h" && diffHours > 24) return false;
        if (timeframe === "3d" && diffHours > 72) return false;
        if (timeframe === "7d" && diffHours > 168) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inSummary = item.summary.toLowerCase().includes(q);
        const inSource = item.source.toLowerCase().includes(q);
        const inAuthor = item.author ? item.author.toLowerCase().includes(q) : false;
        const inTags = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inSummary && !inSource && !inAuthor && !inTags) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedCategory, selectedSignal, selectedSource, timeframe, searchQuery]);

  const signalCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) counts[item.signal] = (counts[item.signal] ?? 0) + 1;
    return counts;
  }, [items]);

  const sourceStatus: AiRadarSourceStatus[] = data?.sourceStatus ?? [];
  const feedsOk = sourceStatus.reduce((sum, s) => sum + s.feedsOk, 0);
  const feedsTotal = sourceStatus.reduce((sum, s) => sum + s.feedsTotal, 0);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Real-Time Intelligence"
        title="AI, Agents & Models Radar"
        description="Automated updates, new model releases, open weights, and autonomous agent frameworks collected live from free APIs and public developer feeds."
      />

      {/* Main Content Area */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Control Bar: Live status, search, and refresh */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by model (Claude, DeepSeek, Llama), agent topic, MCP, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1 text-xs font-medium">
              {(
                [
                  ["all", "All"],
                  ["24h", "24h"],
                  ["3d", "3d"],
                  ["7d", "7d"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTimeframe(val)}
                  className={`rounded-lg px-2.5 py-1 transition ${
                    timeframe === val
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`rounded-lg px-2.5 py-1 transition ${
                  viewMode === "cards"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Card View"
              >
                <Layers className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("compact")}
                className={`rounded-lg px-2.5 py-1 transition ${
                  viewMode === "compact"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Compact List View"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-border/80 pb-4">
          {CATEGORIES.map(({ id, label, icon: Icon }) => {
            const isActive = selectedCategory === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedCategory(id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Signal Triage: how urgently this should change what you run */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
          <span className="shrink-0 font-medium text-muted-foreground">Signal:</span>
          <button
            type="button"
            onClick={() => setSelectedSignal("all")}
            className={`shrink-0 rounded-lg px-2.5 py-1 transition ${
              selectedSignal === "all"
                ? "bg-foreground font-semibold text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All {items.length}
          </button>
          {RADAR_SIGNAL_IDS.map((id) => (
            <button
              key={id}
              type="button"
              title={RADAR_SIGNALS[id].blurb}
              onClick={() => setSelectedSignal(id)}
              className={`shrink-0 rounded-lg px-2.5 py-1 transition ${
                selectedSignal === id
                  ? "bg-foreground font-semibold text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {RADAR_SIGNALS[id].label} {signalCounts[id] ?? 0}
            </button>
          ))}
          <span className="ml-1 hidden text-[11px] text-muted-foreground sm:inline">
            assigned by published rules, not by a model
          </span>
        </div>

        {/* Source Pills Filter */}
        {sources.length > 1 && (
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="shrink-0 text-muted-foreground font-medium">Source:</span>
            {sources.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setSelectedSource(src)}
                className={`shrink-0 rounded-lg px-2.5 py-1 transition ${
                  selectedSource === src
                    ? "bg-foreground text-background font-semibold"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {src === "All" ? "All" : radarGroupLabel(src)}
              </button>
            ))}
          </div>
        )}

        {/* Status Bar */}
        <div className="mb-6 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Showing <strong className="text-foreground">{filteredItems.length}</strong> updates
              {data?.lastUpdated && (
                <> &bull; Synced {timeAgo(data.lastUpdated)}</>
              )}
            </span>
          </div>

          <span className="text-[11px] text-muted-foreground">
            {feedsTotal > 0
              ? `${feedsOk} of ${feedsTotal} feeds responded`
              : "Source status unavailable"}
          </span>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Radio className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-3 font-display text-base font-semibold">
              {items.length === 0 ? "The live feed is unavailable" : "No updates match your filters"}
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
              {items.length === 0
                ? "Every upstream source failed or timed out on this request. We show nothing rather than filling the gap with placeholder items — check the source list below."
                : "Try adjusting your search keyword, category, signal, or timeframe."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSelectedSignal("all");
                setSelectedSource("All");
                setSearchQuery("");
                setTimeframe("all");
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Items Grid View */}
        {filteredItems.length > 0 && viewMode === "cards" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const badge = getCategoryBadge(item.category);
              return (
                <article
                  key={item.id}
                  className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-lg"
                >
                  <div>
                    {/* Top Row: Category badge, source & relative time */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${SIGNAL_STYLES[item.signal]}`}
                          title={RADAR_SIGNALS[item.signal].blurb}
                        >
                          {RADAR_SIGNALS[item.signal].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <Clock className="h-3 w-3" />
                        <span>{timeAgo(item.publishedAt)}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="mt-3 font-display text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-start gap-1"
                      >
                        <span>{item.title}</span>
                      </a>
                    </h3>

                    {/* Summary */}
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {item.summary}
                    </p>

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* On-site next step: the reason to stay rather than bounce */}
                    <NextStepRow item={item} />
                  </div>

                  {/* Bottom Row: Source, metrics & actions */}
                  <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground/90">{item.source}</span>
                      {item.score !== undefined && item.score > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                          <Flame className="h-3 w-3" />
                          {item.score}
                        </span>
                      )}
                      {item.author && (
                        <span className="hidden sm:inline text-[11px] truncate max-w-[100px]">
                          by {item.author}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(item)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                        title="Copy direct link"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Share2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10"
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Items Compact View */}
        {filteredItems.length > 0 && viewMode === "compact" && (
          <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
            {filteredItems.map((item) => {
              const badge = getCategoryBadge(item.category);
              return (
                <div
                  key={item.id}
                  className="group flex flex-col gap-2 p-4 transition hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${SIGNAL_STYLES[item.signal]}`}
                        title={RADAR_SIGNALS[item.signal].blurb}
                      >
                        {RADAR_SIGNALS[item.signal].label}
                      </span>
                      <span className="font-semibold text-foreground/80">{item.source}</span>
                      <span className="text-muted-foreground">&bull;</span>
                      <span className="text-muted-foreground">{timeAgo(item.publishedAt)}</span>
                      {item.score !== undefined && item.score > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                          <Flame className="h-3 w-3" />
                          {item.score}
                        </span>
                      )}
                    </div>
                    <h4 className="mt-1 truncate text-sm font-medium text-foreground group-hover:text-primary">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackEvent("radar_outbound_click", { source: item.source, id: item.id })
                        }
                      >
                        {item.title}
                      </a>
                    </h4>
                    <NextStepRow item={item} compact />
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(item)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                      title="Copy link"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Share2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      <span>Read</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Where this came from — failures named, never papered over */}
        {sourceStatus.length > 0 && (
          <div className="mt-12 rounded-2xl border border-border bg-muted/30 p-5 sm:p-6">
            <h2 className="font-display text-sm font-semibold">Where this came from</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Synced {timeAgo(data.lastUpdated)}
              {data.servedFrom === "store"
                ? " by the scheduled ingest"
                : " by a live fetch (the scheduled ingest has not run recently)"}
              . A source that fails is listed as failed; it is never replaced with sample content.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sourceStatus.map((source) => (
                <li key={source.id} className="flex gap-2 text-xs">
                  {source.ok ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  )}
                  <span className="min-w-0">
                    <span className="font-medium">{source.label}</span>{" "}
                    <span className="text-muted-foreground">
                      · {source.feedsOk}/{source.feedsTotal} feeds · {source.count} items
                    </span>
                    <span className="block text-muted-foreground">{source.note}</span>
                    {source.failures.length > 0 && (
                      <span className="mt-0.5 block text-[11px] text-amber-700 dark:text-amber-500">
                        No answer: {source.failures.join(", ")}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <a
              href="/radar/feed.xml"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary"
            >
              <Rss className="h-3.5 w-3.5" /> Subscribe to this radar by RSS
            </a>
          </div>
        )}

        {/* Where a headline turns into work you can do here */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold">Take it somewhere</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Headlines age in a week. Each track pairs our writing on the subject with the tool that
            answers it in about ten minutes.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {RADAR_TRACK_IDS.map((id) => {
              const track = RADAR_TRACKS[id];
              return (
                <div key={id} className="rounded-xl border border-border p-3">
                  <p className="text-xs font-semibold">{track.label}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {track.blurb}
                  </p>
                  <div className="mt-3 flex flex-col gap-1.5 text-[11px]">
                    <Link
                      to="/knowledge"
                      search={{ category: track.category, page: 1 }}
                      onClick={() => trackEvent("radar_rail_articles_click", { track: id })}
                      className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary"
                    >
                      Read the {track.label.toLowerCase()} articles
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                    <Link
                      to={track.nextStep.to}
                      onClick={() => trackEvent("radar_rail_tool_click", { track: id })}
                      className="inline-flex items-center gap-1 font-medium text-primary"
                    >
                      {track.nextStep.label}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly digest — the radar as a list-growth engine, not an exit ramp */}
        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-sm font-semibold">Get the weekly digest</h2>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
                One email a week: what moved, what breaks, and the one thing worth changing.
              </p>
            </div>
            <div className="w-full sm:max-w-sm">
              <LazyWaitlistForm source="radar-digest" compact />
            </div>
          </div>
        </div>

        {/* Builder & Operator Callout Strip */}
        <div className="mt-14 rounded-2xl border border-border bg-gradient-to-r from-primary/5 via-card to-accent2/5 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Put Intelligence to Work
              </div>
              <h2 className="mt-2 font-display text-xl font-bold sm:text-2xl">
                Ready to turn AI research and model updates into live production agents?
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Explore the interactive Model Playground to test prompts across top providers, or design an autonomous workflow with the Agent Architect.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/tools/model-playground"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:border-foreground/30 transition"
              >
                <Cpu className="h-4 w-4 text-purple-500" />
                Model Playground
              </Link>
              <Link
                to="/tools/agent-architect"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition"
              >
                <Bot className="h-4 w-4" />
                Agent Architect
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

const SIGNAL_STYLES: Record<RadarSignal, string> = {
  act: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  watch: "border-primary/30 bg-primary/10 text-primary",
  context: "border-border bg-muted text-muted-foreground",
};

/**
 * The on-site landing for an item: the track chip deep-links into the matching
 * Knowledge Hub filter, and the next step opens the tool that answers it.
 *
 * Every card on this page used to be a pure exit — the only internal links were
 * two buttons at the very bottom of the route. Reading a headline is not the
 * work; this is the shortest path from "something changed" to doing something
 * about it without leaving the site.
 */
function NextStepRow({ item, compact = false }: { item: AiRadarItem; compact?: boolean }) {
  const track = RADAR_TRACKS[item.track];
  return (
    <div className={`flex flex-wrap items-center gap-2 text-[11px] ${compact ? "mt-1.5" : "mt-3"}`}>
      <Link
        to="/knowledge"
        search={{ category: track.category, page: 1 }}
        onClick={() => trackEvent("radar_track_click", { track: item.track })}
        title={`${track.blurb} — read our articles in this track`}
        className="rounded-md border border-border px-2 py-0.5 font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary"
      >
        {track.label}
      </Link>
      <Link
        to={track.nextStep.to}
        onClick={() => trackEvent("radar_next_step_click", { track: item.track })}
        className="group/next inline-flex items-center gap-1 font-medium text-primary"
      >
        {track.nextStep.label}
        <ArrowRight className="h-3 w-3 transition-transform group-hover/next:translate-x-0.5" />
      </Link>
    </div>
  );
}
