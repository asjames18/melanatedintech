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

export interface AiRadarItem {
  id: string;
  title: string;
  url: string;
  summary: string;
  source: string;
  category: "models" | "agents" | "developer" | "research" | "industry";
  author?: string;
  publishedAt: string;
  tags: string[];
  score?: number;
  commentsCount?: number;
  /** Which Knowledge Hub track this belongs to, from keyword rules. */
  track: RadarTrackId;
  /** How urgently it should change what a running agent does. */
  signal: RadarSignal;
  /** Blended source-weight x recency x popularity score used for ordering. */
  rank: number;
}

/** Per-source outcome for the run that produced this payload. */
export interface AiRadarSourceStatus {
  id: string;
  label: string;
  /** What this source is good for, shown in the transparency strip. */
  note: string;
  ok: boolean;
  count: number;
  /** Present only when the source could not be reached on this run. */
  error?: string;
}

export interface AiRadarFeedResponse {
  items: AiRadarItem[];
  sources: string[];
  /** Every configured source and whether it answered, including failures. */
  sourceStatus: AiRadarSourceStatus[];
  total: number;
  lastUpdated: string;
}

/**
 * Applies the editorial layer to a raw feed entry. Every item goes through
 * here, so track/signal/rank are never assigned ad hoc at a call site.
 */
function classify(
  item: Omit<AiRadarItem, "track" | "signal" | "rank">,
  now: number,
): AiRadarItem {
  const text = `${item.title} ${item.summary}`;
  return {
    ...item,
    track: classifyTrack(text),
    signal: classifySignal(text),
    rank: rankItem({ source: item.source, publishedAt: item.publishedAt, score: item.score, now }),
  };
}

// In-memory cache for edge runtime (TTL 5 minutes)
let cache: { data: AiRadarFeedResponse; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Nothing older than this is news; also bounds the Hacker News query. */
const WINDOW_DAYS = 21;
/** Hacker News stories below this score are noise at this query breadth. */
const HN_POINTS_FLOOR = 40;

/**
 * Configured sources. `note` is reader-facing: the page names every source and
 * says which ones answered, so an outage reads as an outage.
 */
const RADAR_SOURCES: Array<{
  id: string;
  label: string;
  note: string;
  load: (now: number) => Promise<AiRadarItem[]>;
}> = [
  {
    id: "huggingface-papers",
    label: "Hugging Face",
    note: "Daily papers, ranked by community upvotes.",
    load: fetchHuggingFacePapers,
  },
  {
    id: "hackernews",
    label: "Hacker News",
    note: "Agent and model stories above a points floor.",
    load: fetchHackerNewsAi,
  },
  {
    id: "devto",
    label: "Dev.to",
    note: "Top-rated practitioner write-ups from the last week.",
    load: fetchDevToArticles,
  },
  {
    id: "arxiv",
    label: "ArXiv",
    note: "Newest cs.AI, cs.MA and cs.CL preprints.",
    load: fetchArxivPapers,
  },
  {
    id: "curated-rss",
    label: "Curated feeds",
    note: "Hugging Face Blog, Simon Willison, and VentureBeat AI.",
    load: fetchCuratedRssFeeds,
  },
];

function errorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.name === "AbortError" ? "timed out" : err.message;
  }
  return "unavailable";
}

/**
 * Strips HTML tags and entities cleanly for plain-text summaries
 */
function cleanHtmlText(text: string): string {
  if (!text) return "";
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Lightweight, edge-compatible RSS 2.0 & Atom feed parser without heavy dependencies
 */
function parseXmlFeed(
  xml: string,
  sourceName: string,
  defaultCategory: AiRadarItem["category"],
  defaultTags: string[],
  now: number,
): AiRadarItem[] {
  const items: AiRadarItem[] = [];

  // Check if it's an Atom feed (<entry>) or RSS (<item>)
  const isAtom = xml.includes("<entry") || xml.includes("<feed");
  const entryPattern = isAtom ? /<entry[\s>]([\s\S]*?)<\/entry>/gi : /<item[\s>]([\s\S]*?)<\/item>/gi;

  let match: RegExpExecArray | null;
  let count = 0;

  while ((match = entryPattern.exec(xml)) !== null && count < 15) {
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

    let publishedAt = new Date().toISOString();
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
      if (lower.includes("model") || lower.includes("llm") || lower.includes("weights") || lower.includes("gpt") || lower.includes("claude")) {
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
 * Fetch wrapper with timeout to keep edge requests fast
 */
async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs = 4500): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 1. Hugging Face Daily Papers API
 */
async function fetchHuggingFacePapers(now: number): Promise<AiRadarItem[]> {
  const res = await fetchWithTimeout("https://huggingface.co/api/daily_papers", {
    headers: { Accept: "application/json", "User-Agent": "MelanatedInTech-Radar/1.0" },
  });
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

  return (papers || []).slice(0, 10).map((item, idx) => {
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
        source: "Hugging Face",
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
 * 2. Hacker News Algolia Search API for AI, Agents, and LLM discussions
 */
async function fetchHackerNewsAi(now: number): Promise<AiRadarItem[]> {
  // Relevance-ranked with a points floor and a date window. `search_by_date`
  // returned whatever was newest, which on a query this broad is mostly noise:
  // an unranked feed of everything posted in the last hour mentioning "AI".
  //
  // Algolia has no boolean OR in `query` — it matched "(AI agent OR LLM OR
  // deepseek OR claude OR mcp)" as literal text requiring every token, which
  // returns zero hits under relevance search. `optionalWords` is the actual
  // primitive: match any subset, rank by how many matched.
  const cutoff = Math.floor((now - WINDOW_DAYS * 86_400_000) / 1000);
  const res = await fetchWithTimeout(
    "https://hn.algolia.com/api/v1/search?query=AI+agent+LLM+MCP" +
      "&optionalWords=AI,agent,LLM,MCP&restrictSearchableAttributes=title" +
      `&tags=story&numericFilters=points%3E${HN_POINTS_FLOOR},created_at_i%3E${cutoff}&hitsPerPage=15`,
    { headers: { Accept: "application/json" } },
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
    } else if (lower.includes("model") || lower.includes("llm") || lower.includes("benchmark") || lower.includes("weights")) {
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
 * 3. Dev.to API for Developer & Hands-on Agent Guides
 */
async function fetchDevToArticles(now: number): Promise<AiRadarItem[]> {
  // `top=7` asks for the week's best-reacted posts. Plain recency on the `ai`
  // tag is dominated by low-signal tutorial spam published minutes ago.
  const res = await fetchWithTimeout("https://dev.to/api/articles?tag=ai&top=7&per_page=10", {
    headers: { Accept: "application/json", "User-Agent": "MelanatedInTech-Radar/1.0" },
  });
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
 * 4. ArXiv CS API for Artificial Intelligence & Multi-Agent Systems
 */
async function fetchArxivPapers(now: number): Promise<AiRadarItem[]> {
  const query = "cat:cs.AI+OR+cat:cs.MA+OR+cat:cs.CL";
  const url = `https://export.arxiv.org/api/query?search_query=${query}&sortBy=submittedDate&sortOrder=descending&max_results=8`;
  const res = await fetchWithTimeout(url, { headers: { Accept: "application/atom+xml" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseXmlFeed(await res.text(), "ArXiv", "research", ["ArXiv", "Peer-Reviewed"], now);
}

/**
 * 5. Tech & AI Industry RSS Feeds (Simon Willison AI Notes, Hugging Face Blog, VentureBeat AI)
 */
async function fetchCuratedRssFeeds(now: number): Promise<AiRadarItem[]> {
  const feeds = [
    {
      url: "https://simonwillison.net/atom/everything/",
      source: "Simon Willison Weblog",
      category: "agents" as const,
      tags: ["LLM Tooling", "Analysis"],
    },
    {
      url: "https://huggingface.co/blog/feed.xml",
      source: "Hugging Face Blog",
      category: "models" as const,
      tags: ["Open Source", "Weights"],
    },
    {
      url: "https://venturebeat.com/category/ai/feed/",
      source: "VentureBeat AI",
      category: "industry" as const,
      tags: ["Industry", "Enterprise"],
    },
  ];

  // Fetched in parallel; three sequential 4.5s timeouts could otherwise stall
  // the whole run past what a page load can wait for.
  const settled = await Promise.allSettled(
    feeds.map(async (feed) => {
      const res = await fetchWithTimeout(feed.url, {
        headers: {
          Accept: "application/rss+xml, application/atom+xml, text/xml",
          "User-Agent": "MelanatedInTech-Radar/1.0",
        },
      });
      if (!res.ok) throw new Error(`${feed.source}: HTTP ${res.status}`);
      const xml = await res.text();
      return parseXmlFeed(xml, feed.source, feed.category, feed.tags, now).slice(0, 5);
    }),
  );

  const results = settled.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  const failed = settled.filter((r) => r.status === "rejected").length;
  if (results.length === 0 && failed > 0) {
    throw new Error(`${failed} of ${feeds.length} curated feeds unreachable`);
  }
  return results;
}

/**
 * Master Server Function: Aggregates multiple free APIs and RSS feeds into a unified radar stream
 */
export const fetchAiRadarFeed = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        category: z.enum(["all", "models", "agents", "developer", "research", "industry"]).default("all"),
        source: z.string().optional(),
        query: z.string().optional(),
        limit: z.number().min(5).max(100).default(60),
        forceRefresh: z.boolean().default(false),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }): Promise<AiRadarFeedResponse> => {
    const now = Date.now();

    // Check in-memory cache if not forced refresh
    if (!data.forceRefresh && cache && cache.expiresAt > now) {
      return filterRadarResponse(cache.data, data);
    }

    // Concurrent execution across all zero-cost sources
    const settled = await Promise.allSettled(RADAR_SOURCES.map((source) => source.load(now)));

    const collected: AiRadarItem[] = [];
    const sourceStatus: AiRadarSourceStatus[] = settled.map((result, index) => {
      const { id, label, note } = RADAR_SOURCES[index]!;
      if (result.status === "rejected") {
        console.warn(`[radar] ${id} failed:`, result.reason);
        return { id, label, note, ok: false, count: 0, error: errorMessage(result.reason) };
      }
      collected.push(...result.value);
      return { id, label, note, ok: true, count: result.value.length };
    });

    // No placeholder items. If every source failed, the payload is empty and
    // the page says so — inventing plausible headlines under a "live" badge is
    // indistinguishable from real data to a reader, and this site's whole
    // proposition is that its claims are checkable.
    const deduplicated = dedupeRanked(collected);

    const fullResponse: AiRadarFeedResponse = {
      items: deduplicated,
      sources: Array.from(new Set(deduplicated.map((i) => i.source))).sort(),
      sourceStatus,
      total: deduplicated.length,
      lastUpdated: new Date(now).toISOString(),
    };

    // Keep the previous payload rather than caching a total outage: a stale but
    // real feed beats an empty one, and the timestamp shows its age. The status
    // strip still reports THIS run, so serving stale items never reads as a
    // healthy fetch.
    if (deduplicated.length > 0 || !cache) {
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
    items = items.filter((i) => i.source.toLowerCase() === filter.source?.toLowerCase());
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
