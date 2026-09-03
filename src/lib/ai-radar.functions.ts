import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  classifySignal,
  classifyTrack,
  dedupeRanked,
  rankItem,
  stableId,
  type RadarSignal,
  type RadarTrackId,
} from "@/lib/radar";

export type AiRadarCategory = "all" | "models" | "agents" | "developer" | "research" | "industry";

/**
 * Feeds are grouped so the reader sees seven honest rows instead of forty. The
 * group is also the source filter on /radar; the specific publisher stays on
 * the item for provenance.
 */
export type AiRadarSourceGroup =
  | "catalog"
  | "vendors"
  | "status"
  | "releases"
  | "research"
  | "press"
  | "community";

export interface AiRadarItem {
  id: string;
  title: string;
  url: string;
  summary: string;
  /** Specific publisher, e.g. "OpenAI News" — shown on the card. */
  source: string;
  group: AiRadarSourceGroup;
  category: "models" | "agents" | "developer" | "research" | "industry";
  author?: string;
  publishedAt: string;
  tags: string[];
  score?: number;
  commentsCount?: number;
  /** Which Knowledge Hub track this belongs to, from published rules. */
  track: RadarTrackId;
  /** How urgently it should change what a running agent does. */
  signal: RadarSignal;
  /** Blended source-weight x recency x popularity score used for ordering. */
  rank: number;
}

/** Per-group outcome for the run that produced this payload. */
export interface AiRadarSourceStatus {
  id: AiRadarSourceGroup;
  label: string;
  /** What this group is good for, shown in the transparency strip. */
  note: string;
  ok: boolean;
  count: number;
  feedsOk: number;
  feedsTotal: number;
  /** Publishers that failed or ran out of budget on this run. */
  failures: string[];
}

export interface AiRadarFeedResponse {
  items: AiRadarItem[];
  /** Group ids present in `items`, for the source filter. */
  sources: string[];
  /** Every configured group and whether it answered, including failures. */
  sourceStatus: AiRadarSourceStatus[];
  total: number;
  lastUpdated: string;
}

// In-memory cache for edge runtime (TTL 5 minutes)
let cache: { data: AiRadarFeedResponse; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Nothing older than this is news; also bounds the Hacker News query. */
const WINDOW_DAYS = 21;
/** Hacker News stories below this score are noise at this query breadth. */
const HN_POINTS_FLOOR = 40;
/** Per-request ceiling. */
const FETCH_TIMEOUT_MS = 4000;
/**
 * Whole-gather ceiling. With forty-odd upstreams, the tail latency of the
 * slowest one must not decide how long a page load takes; whatever has landed
 * when the budget runs out is what ships, and the rest is reported as pending.
 */
const GATHER_BUDGET_MS = 7000;
/** Simultaneous upstream connections. */
const CONCURRENCY = 10;
/** Hard cap on the merged archive so the payload cannot grow without bound. */
const MAX_ITEMS = 250;

const GROUP_META: Record<AiRadarSourceGroup, { label: string; note: string }> = {
  catalog: {
    label: "Model catalog",
    note: "Models added to public catalogs, with live list pricing.",
  },
  vendors: {
    label: "Model vendors & labs",
    note: "First-party announcements from the companies shipping the models.",
  },
  status: {
    label: "Service status",
    note: "Incidents and degradations on the APIs agents depend on.",
  },
  releases: {
    label: "Releases",
    note: "Version notes from the SDKs and runtimes agents are built on.",
  },
  research: {
    label: "Research",
    note: "Preprints and papers, newest and most-discussed.",
  },
  press: {
    label: "Industry press",
    note: "Reporting and analysis on funding, policy, and adoption.",
  },
  community: {
    label: "Community",
    note: "Practitioner write-ups, newsletters, and front-page discussion.",
  },
};

/**
 * Groups where the source itself settles the answer, so we do not ask a keyword
 * rule to guess it. An API incident is an operations problem to act on, whatever
 * words the status post happens to use; a catalog addition with a price on it is
 * a model-choice decision. Keyword rules handle everything else.
 */
const GROUP_OVERRIDE: Partial<
  Record<AiRadarSourceGroup, { track: RadarTrackId; signal: RadarSignal }>
> = {
  status: { track: "operate", signal: "act" },
  catalog: { track: "decide", signal: "watch" },
};

/**
 * Applies the editorial layer to a raw feed entry. Every item goes through
 * here, so track/signal/rank are never assigned ad hoc at a call site.
 */
function classify(item: Omit<AiRadarItem, "track" | "signal" | "rank">, now: number): AiRadarItem {
  const text = `${item.title} ${item.summary}`;
  const override = GROUP_OVERRIDE[item.group];
  return {
    ...item,
    track: override?.track ?? classifyTrack(text),
    signal: override?.signal ?? classifySignal(text),
    rank: rankItem({ source: item.source, publishedAt: item.publishedAt, score: item.score, now }),
  };
}

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function stripTags(text: string): string {
  return text
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ");
}

/**
 * Strips HTML tags and entities for plain-text summaries.
 *
 * Runs strip/decode twice on purpose: status pages (Atlassian Statuspage) put
 * *escaped* markup inside <description>, so a single pass decodes "&lt;p&gt;"
 * into a literal "<p>" that then survives into the visible summary.
 */
function cleanHtmlText(text: string): string {
  if (!text) return "";
  let out = text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1");
  for (let pass = 0; pass < 2; pass++) {
    out = decodeEntities(stripTags(out));
  }
  return out.replace(/\s+/g, " ").trim();
}

/**
 * Lightweight, edge-compatible RSS 2.0 & Atom feed parser without heavy dependencies
 */
function parseXmlFeed(
  xml: string,
  sourceName: string,
  group: AiRadarSourceGroup,
  defaultCategory: AiRadarItem["category"],
  defaultTags: string[],
  now: number,
  max: number,
): AiRadarItem[] {
  const items: AiRadarItem[] = [];

  // Check if it's an Atom feed (<entry>) or RSS (<item>)
  const isAtom = xml.includes("<entry") || xml.includes("<feed");
  const entryPattern = isAtom ? /<entry[\s>]([\s\S]*?)<\/entry>/gi : /<item[\s>]([\s\S]*?)<\/item>/gi;

  let match: RegExpExecArray | null;
  let count = 0;

  while ((match = entryPattern.exec(xml)) !== null && count < max) {
    count++;
    const block = match[1];

    // Extract Title
    const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = cleanHtmlText(titleMatch ? titleMatch[1] : "Untitled Update");

    // Extract Link
    let url = "";
    if (isAtom) {
      const atomLink = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);
      url = atomLink ? atomLink[1] : "";
    }
    if (!url) {
      const rssLink = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
      url = rssLink ? cleanHtmlText(rssLink[1]) : "";
    }
    if (!url) {
      const guidMatch = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
      const guid = guidMatch ? cleanHtmlText(guidMatch[1]) : "";
      if (guid.startsWith("http")) url = guid;
    }

    // Extract Description / Summary
    const summaryMatch =
      block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) ||
      block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) ||
      block.match(/<content[^>]*>([\s\S]*?)<\/content>/i);
    const summary = cleanHtmlText(summaryMatch ? summaryMatch[1] : "");

    // Extract PubDate / Published
    const dateMatch =
      block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) ||
      block.match(/<published[^>]*>([\s\S]*?)<\/published>/i) ||
      block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i) ||
      block.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i);

    let publishedAt = new Date(now).toISOString();
    if (dateMatch) {
      const parsedDate = new Date(cleanHtmlText(dateMatch[1]));
      if (!isNaN(parsedDate.getTime())) {
        publishedAt = parsedDate.toISOString();
      }
    }

    // Extract Creator / Author
    const authorMatch =
      block.match(/<dc:creator[^>]*>([\s\S]*?)<\/dc:creator>/i) ||
      block.match(/<author[^>]*>([\s\S]*?)<\/author>/i);
    const author = authorMatch ? cleanHtmlText(authorMatch[1]) : undefined;

    if (title && url) {
      const tags = [...defaultTags];
      const lower = `${title} ${summary}`.toLowerCase();
      if (lower.includes("agent") || lower.includes("mcp") || lower.includes("multi-agent")) {
        tags.push("Agents");
      }
      if (
        lower.includes("model") ||
        lower.includes("llm") ||
        lower.includes("weights") ||
        lower.includes("gpt") ||
        lower.includes("claude")
      ) {
        tags.push("Models");
      }
      if (lower.includes("open-source") || lower.includes("weights")) {
        tags.push("Open Source");
      }

      items.push(
        classify(
          {
            // Hashed from the URL, not the clock: a Date.now()-based id changed
            // on every fetch, which broke React keys and cross-run dedup.
            id: stableId(sourceName.toLowerCase().replace(/\s+/g, "-"), url),
            title,
            url,
            summary: summary.slice(0, 240) + (summary.length > 240 ? "..." : ""),
            source: sourceName,
            group,
            category: defaultCategory,
            author,
            publishedAt,
            tags: Array.from(new Set(tags)).slice(0, 4),
          },
          now,
        ),
      );
    }
  }

  return items;
}

/**
 * Fetch wrapper with timeout to keep edge requests fast. `budgetMs` clamps the
 * per-request timeout to whatever is left of the whole-gather budget.
 */
async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  budgetMs = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), Math.max(250, budgetMs));
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

const FEED_HEADERS = {
  Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
  "User-Agent": "MelanatedInTech-Radar/1.0",
};
const JSON_HEADERS = { Accept: "application/json", "User-Agent": "MelanatedInTech-Radar/1.0" };

interface FeedSpec {
  /** Publisher name shown on the card. */
  source: string;
  group: AiRadarSourceGroup;
  url: string;
  category: AiRadarItem["category"];
  tags: string[];
  /** Entries to take. Busy general feeds get fewer so they cannot crowd out
   *  a quiet vendor feed that published one important thing. */
  max: number;
}

/**
 * Every RSS/Atom source, verified reachable and parseable without a key.
 *
 * Anthropic publishes no public blog feed, so its releases are represented by
 * the SDK release notes and its status page rather than being faked.
 */
const RSS_FEEDS: FeedSpec[] = [
  // --- Model vendors & labs -------------------------------------------------
  { source: "OpenAI News", group: "vendors", url: "https://openai.com/news/rss.xml", category: "models", tags: ["OpenAI", "Vendor"], max: 4 },
  { source: "Google DeepMind", group: "vendors", url: "https://deepmind.google/blog/rss.xml", category: "models", tags: ["DeepMind", "Vendor"], max: 4 },
  { source: "Google AI", group: "vendors", url: "https://blog.google/technology/ai/rss/", category: "models", tags: ["Google", "Vendor"], max: 3 },
  { source: "Google Research", group: "vendors", url: "https://research.google/blog/rss/", category: "research", tags: ["Google", "Research"], max: 3 },
  { source: "Mistral AI", group: "vendors", url: "https://mistral.ai/rss.xml", category: "models", tags: ["Mistral", "Vendor"], max: 3 },
  { source: "Qwen", group: "vendors", url: "https://qwenlm.github.io/blog/index.xml", category: "models", tags: ["Qwen", "Open Weights"], max: 3 },
  { source: "Hugging Face Blog", group: "vendors", url: "https://huggingface.co/blog/feed.xml", category: "models", tags: ["Open Source", "Weights"], max: 4 },
  { source: "Together AI", group: "vendors", url: "https://www.together.ai/blog/rss.xml", category: "models", tags: ["Inference", "Vendor"], max: 3 },
  { source: "Ollama", group: "vendors", url: "https://ollama.com/blog/rss.xml", category: "models", tags: ["Local AI", "Open Weights"], max: 3 },
  { source: "Replicate", group: "vendors", url: "https://replicate.com/blog/rss", category: "developer", tags: ["Inference", "Vendor"], max: 3 },

  // --- Service status: the sharpest "act now" signal on the page ------------
  { source: "OpenAI Status", group: "status", url: "https://status.openai.com/history.rss", category: "industry", tags: ["Status", "Incident"], max: 3 },
  { source: "Anthropic Status", group: "status", url: "https://status.anthropic.com/history.rss", category: "industry", tags: ["Status", "Incident"], max: 3 },

  // --- Industry press -------------------------------------------------------
  { source: "TechCrunch AI", group: "press", url: "https://techcrunch.com/category/artificial-intelligence/feed/", category: "industry", tags: ["Industry"], max: 3 },
  { source: "Ars Technica AI", group: "press", url: "https://arstechnica.com/ai/feed/", category: "industry", tags: ["Industry"], max: 3 },
  { source: "The Verge AI", group: "press", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", category: "industry", tags: ["Industry"], max: 3 },
  { source: "MIT Technology Review", group: "press", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed", category: "industry", tags: ["Industry", "Analysis"], max: 3 },
  { source: "VentureBeat AI", group: "press", url: "https://venturebeat.com/category/ai/feed/", category: "industry", tags: ["Industry", "Enterprise"], max: 3 },
  { source: "AWS Machine Learning", group: "press", url: "https://aws.amazon.com/blogs/machine-learning/feed/", category: "developer", tags: ["AWS", "Cloud"], max: 3 },
  { source: "NVIDIA Blog", group: "press", url: "https://blogs.nvidia.com/feed/", category: "industry", tags: ["NVIDIA", "Hardware"], max: 3 },

  // --- Community ------------------------------------------------------------
  { source: "Simon Willison Weblog", group: "community", url: "https://simonwillison.net/atom/everything/", category: "agents", tags: ["LLM Tooling", "Analysis"], max: 4 },
  { source: "Import AI", group: "community", url: "https://importai.substack.com/feed", category: "research", tags: ["Newsletter", "Analysis"], max: 2 },
  { source: "Latent Space", group: "community", url: "https://www.latent.space/feed", category: "agents", tags: ["Newsletter", "Engineering"], max: 2 },
  { source: "Ahead of AI", group: "community", url: "https://magazine.sebastianraschka.com/feed", category: "research", tags: ["Newsletter", "Models"], max: 2 },
];

/** SDK and runtime release notes — the "will this break my build" feed. */
const RELEASE_REPOS = [
  "anthropics/anthropic-sdk-python",
  "openai/openai-python",
  "modelcontextprotocol/typescript-sdk",
  "modelcontextprotocol/python-sdk",
  "modelcontextprotocol/servers",
  "huggingface/transformers",
  "vllm-project/vllm",
  "ollama/ollama",
  "ggml-org/llama.cpp",
];

// ---------------------------------------------------------------------------
// JSON sources
// ---------------------------------------------------------------------------

/**
 * Models added to the OpenRouter catalog, with list pricing attached.
 *
 * This is the most direct answer on the page to "what did the model companies
 * ship, and what does it cost?" — one call covers every vendor they carry.
 */
async function fetchOpenRouterModels(now: number, budget: number): Promise<AiRadarItem[]> {
  const res = await fetchWithTimeout(
    "https://openrouter.ai/api/v1/models",
    { headers: JSON_HEADERS },
    budget,
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = (await res.json()) as {
    data?: Array<{
      id: string;
      name?: string;
      created?: number;
      context_length?: number;
      description?: string;
      pricing?: { prompt?: string; completion?: string };
    }>;
  };

  const cutoff = (now - WINDOW_DAYS * 86_400_000) / 1000;
  return (json.data ?? [])
    .filter((m) => typeof m.created === "number" && m.created >= cutoff)
    .sort((a, b) => (b.created ?? 0) - (a.created ?? 0))
    .slice(0, 12)
    .map((model) => {
      const promptPerM = Number.parseFloat(model.pricing?.prompt ?? "0") * 1_000_000;
      const completionPerM = Number.parseFloat(model.pricing?.completion ?? "0") * 1_000_000;
      const priced = Number.isFinite(promptPerM) && Number.isFinite(completionPerM);
      const vendor = model.id.split("/")[0] ?? "";
      const summary = [
        priced ? `$${promptPerM.toFixed(2)}/M input, $${completionPerM.toFixed(2)}/M output` : null,
        model.context_length ? `${Math.round(model.context_length / 1000)}K context` : null,
      ]
        .filter(Boolean)
        .join(" · ");

      return classify(
        {
          id: `openrouter-${model.id}`,
          // Our own framing over a catalog fact, not a claim by the vendor.
          title: `New model available: ${model.name || model.id}`,
          url: `https://openrouter.ai/${model.id}`,
          summary,
          source: "OpenRouter",
          group: "catalog",
          category: "models",
          author: vendor || undefined,
          publishedAt: new Date((model.created ?? 0) * 1000).toISOString(),
          tags: ["New Model", "Pricing", vendor].filter(Boolean).slice(0, 4),
        },
        now,
      );
    });
}

/**
 * Trending open-weight releases. `sort=trendingScore` is the only ordering that
 * surfaces actual model launches; `createdAt` returns whatever anonymous
 * account uploaded a fine-tune thirty seconds ago.
 */
async function fetchHuggingFaceModels(now: number, budget: number): Promise<AiRadarItem[]> {
  const res = await fetchWithTimeout(
    "https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=12",
    { headers: JSON_HEADERS },
    budget,
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const models = (await res.json()) as Array<{
    id?: string;
    modelId?: string;
    likes?: number;
    downloads?: number;
    createdAt?: string;
    pipeline_tag?: string;
  }>;

  const cutoff = now - WINDOW_DAYS * 86_400_000;
  return (models ?? [])
    .filter((m) => (m.modelId || m.id) && m.createdAt && new Date(m.createdAt).getTime() >= cutoff)
    .slice(0, 8)
    .map((model) => {
      const id = (model.modelId || model.id)!;
      const org = id.split("/")[0] ?? "";
      return classify(
        {
          id: `hf-model-${id}`,
          title: `Trending open weights: ${id}`,
          url: `https://huggingface.co/${id}`,
          summary: [
            model.pipeline_tag,
            model.downloads ? `${model.downloads.toLocaleString()} downloads` : null,
          ]
            .filter(Boolean)
            .join(" · "),
          source: "Hugging Face Models",
          group: "catalog",
          category: "models",
          author: org || undefined,
          publishedAt: model.createdAt!,
          tags: ["Open Weights", "New Model", org].filter(Boolean).slice(0, 4),
          score: model.likes,
        },
        now,
      );
    });
}

/**
 * Hugging Face Daily Papers API
 */
async function fetchHuggingFacePapers(now: number, budget: number): Promise<AiRadarItem[]> {
  const res = await fetchWithTimeout(
    "https://huggingface.co/api/daily_papers",
    { headers: JSON_HEADERS },
    budget,
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const papers = (await res.json()) as Array<{
    paper: {
      id: string;
      title: string;
      summary: string;
      publishedAt: string;
      authors?: Array<{ name: string }>;
      upvotes?: number;
    };
    title?: string;
  }>;

  return (papers || []).slice(0, 8).map((item, idx) => {
    const p = item.paper || item;
    const title = p.title || "AI Research Paper";
    const summary = cleanHtmlText(p.summary || "");
    const tags = ["Research", "Models"];
    const lower = `${title} ${summary}`.toLowerCase();
    if (lower.includes("agent") || lower.includes("tool") || lower.includes("workflow")) {
      tags.push("Agents");
    }

    return classify(
      {
        id: `hf-${p.id || idx}`,
        title,
        url: `https://huggingface.co/papers/${p.id}`,
        summary: summary.slice(0, 240) + (summary.length > 240 ? "..." : ""),
        source: "Hugging Face Papers",
        group: "research",
        category: (tags.includes("Agents") ? "agents" : "models") as AiRadarItem["category"],
        author: p.authors?.[0]?.name || "AI Research Community",
        publishedAt: p.publishedAt || new Date(now).toISOString(),
        tags,
        score: p.upvotes,
      },
      now,
    );
  });
}

/**
 * Hacker News via Algolia.
 *
 * Algolia has no boolean OR in `query` — the previous
 * "(AI agent OR LLM OR deepseek OR claude OR mcp)" matched as literal text
 * requiring every token, which returns zero hits under relevance search.
 * `optionalWords` is the actual primitive: match any subset, rank by how many
 * matched. Relevance plus a points floor also beats `search_by_date`, which on
 * a query this broad returned an unranked feed of everything posted this hour.
 */
async function fetchHackerNewsAi(now: number, budget: number): Promise<AiRadarItem[]> {
  const cutoff = Math.floor((now - WINDOW_DAYS * 86_400_000) / 1000);
  const res = await fetchWithTimeout(
    "https://hn.algolia.com/api/v1/search?query=AI+agent+LLM+MCP" +
      "&optionalWords=AI,agent,LLM,MCP&restrictSearchableAttributes=title" +
      `&tags=story&numericFilters=points%3E${HN_POINTS_FLOOR},created_at_i%3E${cutoff}&hitsPerPage=15`,
    { headers: JSON_HEADERS },
    budget,
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = (await res.json()) as {
    hits?: Array<{
      objectID: string;
      title: string;
      url?: string;
      author: string;
      points: number;
      num_comments: number;
      created_at: string;
    }>;
  };

  return (data.hits || []).map((hit) => {
    const lower = hit.title.toLowerCase();
    let category: AiRadarItem["category"] = "developer";
    const tags = ["Community", "HN"];

    if (lower.includes("agent") || lower.includes("mcp") || lower.includes("workflow")) {
      category = "agents";
      tags.push("Agents");
    } else if (
      lower.includes("model") ||
      lower.includes("llm") ||
      lower.includes("benchmark") ||
      lower.includes("weights")
    ) {
      category = "models";
      tags.push("Models");
    } else {
      tags.push("Dev Trends");
    }

    return classify(
      {
        id: `hn-${hit.objectID}`,
        title: hit.title,
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        summary: `Hacker News discussion by @${hit.author} with ${hit.points || 0} points and ${hit.num_comments || 0} comments.`,
        source: "Hacker News",
        group: "community",
        category,
        author: hit.author,
        publishedAt: hit.created_at,
        tags,
        score: hit.points,
        commentsCount: hit.num_comments,
      },
      now,
    );
  });
}

/**
 * Dev.to. `top=7` asks for the week's best-reacted posts; plain recency on the
 * `ai` tag is dominated by tutorial spam published minutes ago.
 */
async function fetchDevToArticles(now: number, budget: number): Promise<AiRadarItem[]> {
  const res = await fetchWithTimeout(
    "https://dev.to/api/articles?tag=ai&top=7&per_page=8",
    { headers: JSON_HEADERS },
    budget,
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const articles = (await res.json()) as Array<{
    id: number;
    title: string;
    description: string;
    url: string;
    published_at: string;
    public_reactions_count: number;
    comments_count: number;
    tag_list: string[];
    user: { name: string };
  }>;

  return (articles || []).map((article) => {
    const lower = `${article.title} ${article.description}`.toLowerCase();
    let category: AiRadarItem["category"] = "developer";
    if (lower.includes("agent") || lower.includes("mcp") || lower.includes("autonomous")) {
      category = "agents";
    } else if (lower.includes("model") || lower.includes("llm") || lower.includes("fine-tuning")) {
      category = "models";
    }

    const tags = (article.tag_list || []).slice(0, 3).map((t) => t.toUpperCase());
    if (tags.length === 0) tags.push("AI", "Tutorial");

    return classify(
      {
        id: `devto-${article.id}`,
        title: article.title,
        url: article.url,
        summary: cleanHtmlText(article.description || ""),
        source: "Dev.to",
        group: "community",
        category,
        author: article.user?.name,
        publishedAt: article.published_at,
        tags,
        score: article.public_reactions_count,
        commentsCount: article.comments_count,
      },
      now,
    );
  });
}

/**
 * ArXiv Atom API for Artificial Intelligence & Multi-Agent Systems
 */
async function fetchArxivPapers(now: number, budget: number): Promise<AiRadarItem[]> {
  const query = "cat:cs.AI+OR+cat:cs.MA+OR+cat:cs.CL";
  const res = await fetchWithTimeout(
    `https://export.arxiv.org/api/query?search_query=${query}&sortBy=submittedDate&sortOrder=descending&max_results=8`,
    { headers: { Accept: "application/atom+xml", "User-Agent": FEED_HEADERS["User-Agent"] } },
    budget,
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseXmlFeed(
    await res.text(),
    "ArXiv",
    "research",
    "research",
    ["ArXiv", "Peer-Reviewed"],
    now,
    8,
  );
}

// ---------------------------------------------------------------------------
// Task assembly
// ---------------------------------------------------------------------------

interface RadarTask {
  /** Publisher label, used in the failure list. */
  label: string;
  group: AiRadarSourceGroup;
  run: (now: number, budget: number) => Promise<AiRadarItem[]>;
}

const TASKS: RadarTask[] = [
  { label: "OpenRouter", group: "catalog", run: fetchOpenRouterModels },
  { label: "Hugging Face Models", group: "catalog", run: fetchHuggingFaceModels },
  { label: "Hugging Face Papers", group: "research", run: fetchHuggingFacePapers },
  { label: "ArXiv", group: "research", run: fetchArxivPapers },
  { label: "Hacker News", group: "community", run: fetchHackerNewsAi },
  { label: "Dev.to", group: "community", run: fetchDevToArticles },
  ...RSS_FEEDS.map(
    (feed): RadarTask => ({
      label: feed.source,
      group: feed.group,
      run: async (now, budget) => {
        const res = await fetchWithTimeout(feed.url, { headers: FEED_HEADERS }, budget);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return parseXmlFeed(
          await res.text(),
          feed.source,
          feed.group,
          feed.category,
          feed.tags,
          now,
          feed.max,
        );
      },
    }),
  ),
  ...RELEASE_REPOS.map(
    (repo): RadarTask => ({
      label: repo,
      group: "releases",
      run: async (now, budget) => {
        // releases.atom needs no token and does not consume the 60-per-hour
        // anonymous REST quota that a shared edge IP would burn through.
        const res = await fetchWithTimeout(
          `https://github.com/${repo}/releases.atom`,
          { headers: FEED_HEADERS },
          budget,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const name = repo.split("/")[1] ?? repo;
        return parseXmlFeed(
          await res.text(),
          name,
          "releases",
          "developer",
          ["Release", "SDK"],
          now,
          2,
        ).map((item) => ({ ...item, title: `${name} ${item.title}`, author: repo }));
      },
    }),
  ),
];

/**
 * Runs tasks `limit` at a time against a wall-clock deadline. Anything not
 * started when the budget runs out is reported as pending rather than failed —
 * the cache merge means it lands on a later request instead of being lost.
 */
async function runWithBudget(
  tasks: RadarTask[],
  now: number,
  limit: number,
  deadline: number,
): Promise<Array<{ task: RadarTask; items: AiRadarItem[]; error?: string }>> {
  const results: Array<{ task: RadarTask; items: AiRadarItem[]; error?: string }> = new Array(
    tasks.length,
  );
  let cursor = 0;

  async function worker() {
    for (;;) {
      const index = cursor++;
      if (index >= tasks.length) return;
      const task = tasks[index]!;
      const remaining = deadline - Date.now();
      if (remaining <= 250) {
        results[index] = { task, items: [], error: "no time left in budget" };
        continue;
      }
      try {
        const items = await task.run(now, Math.min(FETCH_TIMEOUT_MS, remaining));
        results[index] = { task, items };
      } catch (err) {
        results[index] = { task, items: [], error: errorMessage(err) };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.name === "AbortError" || err.name === "TimeoutError" ? "timed out" : err.message;
  }
  return "unavailable";
}

/**
 * Master Server Function: aggregates every free source into one radar stream.
 */
export const fetchAiRadarFeed = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        category: z
          .enum(["all", "models", "agents", "developer", "research", "industry"])
          .default("all"),
        source: z.string().optional(),
        query: z.string().optional(),
        limit: z.number().min(5).max(150).default(60),
        forceRefresh: z.boolean().default(false),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }): Promise<AiRadarFeedResponse> => {
    const now = Date.now();

    if (!data.forceRefresh && cache && cache.expiresAt > now) {
      return filterRadarResponse(cache.data, data);
    }

    const results = await runWithBudget(TASKS, now, CONCURRENCY, now + GATHER_BUDGET_MS);

    const fresh: AiRadarItem[] = [];
    const byGroup = new Map<AiRadarSourceGroup, AiRadarSourceStatus>();

    for (const group of Object.keys(GROUP_META) as AiRadarSourceGroup[]) {
      byGroup.set(group, {
        id: group,
        ...GROUP_META[group],
        ok: false,
        count: 0,
        feedsOk: 0,
        feedsTotal: 0,
        failures: [],
      });
    }

    for (const result of results) {
      const status = byGroup.get(result.task.group)!;
      status.feedsTotal += 1;
      if (result.error) {
        console.warn(`[radar] ${result.task.label} failed: ${result.error}`);
        status.failures.push(`${result.task.label} (${result.error})`);
        continue;
      }
      status.feedsOk += 1;
      status.ok = true;
      status.count += result.items.length;
      fresh.push(...result.items);
    }

    // Merge with what is already cached rather than replacing it. Sources that
    // ran out of budget on this pass keep their previous items, so the archive
    // converges instead of flickering between partial views.
    const cutoff = now - WINDOW_DAYS * 86_400_000;
    const merged = dedupeRanked(
      [...fresh, ...(cache?.data.items ?? [])].filter((item) => {
        const at = new Date(item.publishedAt).getTime();
        return Number.isFinite(at) && at >= cutoff;
      }),
    ).slice(0, MAX_ITEMS);

    // No placeholder items. If everything failed the payload is empty and the
    // page says so — inventing plausible headlines under a "live" badge is
    // indistinguishable from real data to a reader, and this site's whole
    // proposition is that its claims are checkable.
    const sourceStatus = [...byGroup.values()];
    const fullResponse: AiRadarFeedResponse = {
      items: merged,
      sources: Array.from(new Set(merged.map((i) => i.group))).sort(),
      sourceStatus,
      total: merged.length,
      lastUpdated: new Date(now).toISOString(),
    };

    // Keep the previous payload rather than caching a total outage: a stale but
    // real feed beats an empty one, and the timestamp shows its age. The status
    // strip still reports THIS run, so serving stale items never reads as a
    // healthy fetch.
    if (merged.length > 0 || !cache) {
      cache = { data: fullResponse, expiresAt: now + CACHE_TTL_MS };
    }

    return filterRadarResponse({ ...cache.data, sourceStatus }, data);
  });

function filterRadarResponse(
  full: AiRadarFeedResponse,
  filter: { category?: string; source?: string; query?: string; limit?: number },
): AiRadarFeedResponse {
  let items = [...full.items];

  if (filter.category && filter.category !== "all") {
    items = items.filter((i) => i.category === filter.category);
  }

  if (filter.source && filter.source !== "All") {
    const wanted = filter.source.toLowerCase();
    items = items.filter(
      (i) => i.group.toLowerCase() === wanted || i.source.toLowerCase() === wanted,
    );
  }

  if (filter.query && filter.query.trim()) {
    const q = filter.query.trim().toLowerCase();
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.summary.toLowerCase().includes(q) ||
        i.source.toLowerCase().includes(q) ||
        (i.author && i.author.toLowerCase().includes(q)) ||
        i.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  return {
    items: items.slice(0, filter.limit || 60),
    sources: full.sources,
    sourceStatus: full.sourceStatus,
    total: items.length,
    lastUpdated: full.lastUpdated,
  };
}

/** Group label lookup for the UI. */
export function radarGroupLabel(group: string): string {
  return GROUP_META[group as AiRadarSourceGroup]?.label ?? group;
}
