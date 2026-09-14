import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type AiRadarCategory = "all" | "briefings" | "models" | "agents" | "developer" | "research" | "industry";

export interface AiRadarItem {
  id: string;
  title: string;
  url: string;
  summary: string;
  source: string;
  category: "briefings" | "models" | "agents" | "developer" | "research" | "industry";
  author?: string;
  publishedAt: string;
  tags: string[];
  score?: number;
  commentsCount?: number;
  thumbnail?: string;
}

export interface ExecutiveBriefingSummary {
  headline: string;
  tagline: string;
  source: string;
  url: string;
  date: string;
  takeaways: Array<{ title: string; detail: string }>;
  relevance: string;
  stealThisWorkflow: {
    title: string;
    description: string;
    playbook: string[];
    actionUrl: string;
    actionText: string;
  };
  toolDrop: Array<{
    name: string;
    tagline: string;
    category: string;
    mitAlternative?: { name: string; path: string };
    url: string;
  }>;
}

export interface AiRadarFeedResponse {
  items: AiRadarItem[];
  sources: string[];
  total: number;
  lastUpdated: string;
  briefing?: ExecutiveBriefingSummary;
}

// In-memory cache for edge runtime (TTL 5 minutes)
let cache: { data: AiRadarFeedResponse; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

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

      items.push({
        id: `${sourceName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}-${count}`,
        title,
        url,
        summary: summary.slice(0, 240) + (summary.length > 240 ? "..." : ""),
        source: sourceName,
        category: defaultCategory,
        author,
        publishedAt,
        tags: Array.from(new Set(tags)).slice(0, 4),
      });
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
async function fetchHuggingFacePapers(): Promise<AiRadarItem[]> {
  try {
    const res = await fetchWithTimeout("https://huggingface.co/api/daily_papers", {
      headers: { Accept: "application/json", "User-Agent": "MelanatedInTech-Radar/1.0" },
    });
    if (!res.ok) return [];
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

      return {
        id: `hf-${p.id || idx}`,
        title,
        url: `https://huggingface.co/papers/${p.id}`,
        summary: summary.slice(0, 240) + (summary.length > 240 ? "..." : ""),
        source: "Hugging Face",
        category: (tags.includes("Agents") ? "agents" : "models") as AiRadarItem["category"],
        author: p.authors?.[0]?.name || "AI Research Community",
        publishedAt: p.publishedAt || new Date().toISOString(),
        tags,
        score: p.upvotes,
      };
    });
  } catch (err) {
    console.warn("Hugging Face Daily Papers fetch error:", err);
    return [];
  }
}

/**
 * 2. Hacker News Algolia Search API for AI, Agents, and LLM discussions
 */
async function fetchHackerNewsAi(): Promise<AiRadarItem[]> {
  try {
    const res = await fetchWithTimeout(
      "https://hn.algolia.com/api/v1/search_by_date?query=(AI+agent+OR+LLM+OR+deepseek+OR+claude+OR+mcp)&tags=story&hitsPerPage=12",
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return [];
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

      return {
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
      };
    });
  } catch (err) {
    console.warn("HackerNews API fetch error:", err);
    return [];
  }
}

/**
 * 3. Dev.to API for Developer & Hands-on Agent Guides
 */
async function fetchDevToArticles(): Promise<AiRadarItem[]> {
  try {
    const res = await fetchWithTimeout("https://dev.to/api/articles?tag=ai&per_page=10", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
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

      return {
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
      };
    });
  } catch (err) {
    console.warn("Dev.to API fetch error:", err);
    return [];
  }
}

/**
 * 4. ArXiv CS API for Artificial Intelligence & Multi-Agent Systems
 */
async function fetchArxivPapers(): Promise<AiRadarItem[]> {
  try {
    const query = "cat:cs.AI+OR+cat:cs.MA+OR+cat:cs.CL";
    const url = `https://export.arxiv.org/api/query?search_query=${query}&sortBy=submittedDate&sortOrder=descending&max_results=8`;
    const res = await fetchWithTimeout(url, { headers: { Accept: "application/atom+xml" } });
    if (!res.ok) return [];
    const text = await res.text();
    return parseXmlFeed(text, "ArXiv", "research", ["ArXiv", "Peer-Reviewed"]);
  } catch (err) {
    console.warn("ArXiv API fetch error:", err);
    return [];
  }
}

/**
 * 5. Tech & AI Industry RSS Feeds (Simon Willison AI Notes, Hugging Face Blog, VentureBeat AI)
 */
async function fetchCuratedRssFeeds(): Promise<AiRadarItem[]> {
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

  const results: AiRadarItem[] = [];

  for (const feed of feeds) {
    try {
      const res = await fetchWithTimeout(feed.url, {
        headers: { Accept: "application/rss+xml, application/atom+xml, text/xml", "User-Agent": "MelanatedInTech-Radar/1.0" },
      });
      if (res.ok) {
        const xml = await res.text();
        const items = parseXmlFeed(xml, feed.source, feed.category, feed.tags);
        results.push(...items.slice(0, 5));
      }
    } catch (e) {
      console.warn(`RSS feed fetch failed for ${feed.source}:`, e);
    }
  }

  return results;
}

/**
 * 6. The AI Report - Executive Briefings & Daily Newsletters
 */
async function fetchTheAiReportFeed(): Promise<AiRadarItem[]> {
  try {
    const res = await fetchWithTimeout(
      "https://www.theaireport.ai",
      {
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "MelanatedInTech-Radar/1.0",
        },
      },
      5000,
    );
    if (!res.ok) return [];
    const html = await res.text();

    const items: AiRadarItem[] = [];
    const cardRegex =
      /<a[^>]+href="(\/newsletter\/[^"]+)"[^>]*>[\s\S]*?(?:<img[^>]+src="([^"]+)"[^>]*>)?[\s\S]*?<div class="newsletter_tittle">([^<]+)<\/div>[\s\S]*?<div class="text-size-14 text-color-blue">([^<]+)<\/div>/gi;

    let match: RegExpExecArray | null;
    let count = 0;
    while ((match = cardRegex.exec(html)) !== null && count < 12) {
      count++;
      const relativeUrl = match[1];
      const thumbnail = match[2] || undefined;
      const title = cleanHtmlText(match[3]);
      const dateStr = cleanHtmlText(match[4]);

      let publishedAt = new Date().toISOString();
      if (dateStr) {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          publishedAt = parsed.toISOString();
        }
      }

      items.push({
        id: `theaireport-${count}`,
        title,
        url: `https://www.theaireport.ai${relativeUrl}`,
        summary:
          "Executive intelligence on frontier model capabilities, lab policies, enterprise deployments, and curated tools.",
        source: "The AI Report",
        category: "briefings",
        author: "The AI Report Team",
        publishedAt,
        tags: ["Executive Briefing", "Industry", "The AI Report"],
        thumbnail,
      });
    }

    return items;
  } catch (err) {
    console.warn("The AI Report fetch error:", err);
    return [];
  }
}

/**
 * Curated Executive Briefing Fallback / SSR baseline
 */
const DEFAULT_EXECUTIVE_BRIEFING: ExecutiveBriefingSummary = {
  headline: "AI's Big Four Unite on Slowdown & Independent Safety Audits",
  tagline: "CEOs of Anthropic, OpenAI, xAI, and Google DeepMind align on voluntary moderation of frontier releases.",
  source: "The AI Report / Executive Briefing",
  url: "https://www.theaireport.ai",
  date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  takeaways: [
    {
      title: "Frontier Pace Moderation",
      detail:
        "Frontier lab chiefs publicly endorsed Dario Amodei's 3-stage governance roadmap, signaling potential adjustments to commercial deployment schedules.",
    },
    {
      title: "Independent Internal Evaluators",
      detail:
        "OpenAI agreed to place third-party evaluators with employee-level access inside labs before releasing larger frontier agent models.",
    },
    {
      title: "Enterprise Roadmaps & Audits",
      detail:
        "Voluntary lab slowdowns may delay vendor feature releases, but will establish third-party safety audits as a standard requirement in enterprise AI contracts.",
    },
  ],
  relevance:
    "For enterprise leaders, procurement teams, and founders: expect tighter compliance around agent sandboxing and third-party audit requirements for production deployments.",
  stealThisWorkflow: {
    title: "Predictive Lead Scoring & Churn Outreach with Autonomous Agents",
    description:
      "How high-performing revenue teams replace reactive sales by having an autonomous agent monitor client activity against repurchase cycles and draft personalized check-ins.",
    playbook: [
      "1. Pull weekly high-value customer activity into a structured table.",
      "2. Calculate deviation from expected repurchase or login cadence.",
      "3. Trigger an agent to draft contextual outreach for review in Human-in-the-Loop approval.",
      "4. Deploy with zero risk using MIT's Agent Architect.",
    ],
    actionUrl: "/tools/agent-architect",
    actionText: "Build with Agent Architect →",
  },
  toolDrop: [
    {
      name: "Attio",
      tagline: "Agentic CRM running background pipeline workflows and auto-lead triage",
      category: "CRM / Sales",
      url: "https://attio.com",
      mitAlternative: { name: "Explore Alternatives", path: "/alternatives/hubspot" },
    },
    {
      name: "Harmonic Security",
      tagline: "Data security and usage discovery for employee AI tools and shadow agents",
      category: "Governance",
      url: "https://www.harmonic.security",
      mitAlternative: { name: "Policy Generator", path: "/tools/policy-generator" },
    },
    {
      name: "Fyxer",
      tagline: "Executive inbox triage and meeting notes automation for busy operators",
      category: "Productivity",
      url: "https://fyxer.com",
      mitAlternative: { name: "SOP Generator", path: "/tools/sop-generator" },
    },
    {
      name: "Snipman",
      tagline: "Reusable writing shortcuts and prompt expansion for support & ops teams",
      category: "Workflow",
      url: "https://superpowerdaily.com",
      mitAlternative: { name: "Prompt Pilot", path: "/tools/prompt-pilot" },
    },
    {
      name: "Devin SWE-2",
      tagline: "Optimized autonomous coding agent for fewer turns and lower cost",
      category: "Engineering",
      url: "https://cognition.ai",
      mitAlternative: { name: "Token Cost Calculator", path: "/tools/token-cost-calculator" },
    },
  ],
};

/**
 * Robust fallback items if external networks are completely unreachable
 */
const FALLBACK_RADAR_ITEMS: AiRadarItem[] = [
  {
    id: "fb-0",
    title: "⚡️ AI's Big Four Unite on Slowdown & Third-Party Safety Audits",
    url: "https://www.theaireport.ai",
    summary:
      "CEOs of Anthropic, OpenAI, xAI, and Google DeepMind align on voluntary moderation of frontier releases and independent evaluator access.",
    source: "The AI Report",
    category: "briefings",
    author: "The AI Report Team",
    publishedAt: new Date(Date.now() - 1800000).toISOString(),
    tags: ["Executive Briefing", "Industry", "Governance"],
    score: 512,
  },
  {
    id: "fb-1",
    title: "Model Context Protocol (MCP) Ecosystem Adoption & Standard Specification",
    url: "https://modelcontextprotocol.io",
    summary: "Anthropic and open source partners continue expanding MCP connector infrastructure for autonomous agent tool execution.",
    source: "Anthropic / Open Commons",
    category: "agents",
    author: "Protocol Working Group",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    tags: ["MCP", "Agents", "Architecture"],
    score: 412,
  },
  {
    id: "fb-2",
    title: "DeepSeek V3 & Open Weights Performance Benchmarks Across Agent Tasks",
    url: "https://huggingface.co",
    summary: "Analysis of reasoning, token generation efficiency, and tool calling reliability in modern open weights models.",
    source: "Hugging Face",
    category: "models",
    author: "Open Source Collective",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    tags: ["Models", "Open Weights", "Benchmarks"],
    score: 654,
  },
  {
    id: "fb-3",
    title: "Architecting Multi-Agent Systems: Golden-Set Evaluation and Context Budgeting",
    url: "https://melanatedintech.com/knowledge",
    summary: "Field-tested operational patterns for small engineering teams shipping production AI loops without run-away API costs.",
    source: "Melanated In Tech",
    category: "developer",
    author: "Melanated In Tech Lab",
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    tags: ["Production", "Evaluation", "Agents"],
    score: 280,
  },
  {
    id: "fb-4",
    title: "Autonomous Tool Use in Constrained Context Windows: ArXiv Preprint Review",
    url: "https://arxiv.org",
    summary: "Researchers investigate structured compression techniques for agent memory retrieval and tool selection accuracy.",
    source: "ArXiv",
    category: "research",
    author: "AI Research Group",
    publishedAt: new Date(Date.now() - 28800000).toISOString(),
    tags: ["Research", "Memory", "Agents"],
    score: 195,
  },
];

/**
 * Master Server Function: Aggregates multiple free APIs and RSS feeds into a unified radar stream
 */
export const fetchAiRadarFeed = createServerFn({ method: "GET" })
  .validator((d: unknown) =>
    z
      .object({
        category: z.enum(["all", "briefings", "models", "agents", "developer", "research", "industry"]).default("all"),
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

    // Concurrent execution across all sources including The AI Report
    const [hfResult, hnResult, devResult, arxivResult, rssResult, aiReportResult] = await Promise.allSettled([
      fetchHuggingFacePapers(),
      fetchHackerNewsAi(),
      fetchDevToArticles(),
      fetchArxivPapers(),
      fetchCuratedRssFeeds(),
      fetchTheAiReportFeed(),
    ]);

    const collected: AiRadarItem[] = [];

    if (hfResult.status === "fulfilled") collected.push(...hfResult.value);
    if (hnResult.status === "fulfilled") collected.push(...hnResult.value);
    if (devResult.status === "fulfilled") collected.push(...devResult.value);
    if (arxivResult.status === "fulfilled") collected.push(...arxivResult.value);
    if (rssResult.status === "fulfilled") collected.push(...rssResult.value);
    if (aiReportResult.status === "fulfilled") collected.push(...aiReportResult.value);

    // Dynamic executive briefing setup
    const briefing: ExecutiveBriefingSummary = { ...DEFAULT_EXECUTIVE_BRIEFING };
    if (aiReportResult.status === "fulfilled" && aiReportResult.value.length > 0) {
      const topIssue = aiReportResult.value[0];
      briefing.headline = topIssue.title;
      briefing.url = topIssue.url;
      briefing.date = new Date(topIssue.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    // Fallback if network blocked everything
    const finalItems = collected.length > 0 ? collected : FALLBACK_RADAR_ITEMS;

    // Deduplicate by URL or normalized Title
    const seen = new Set<string>();
    const deduplicated: AiRadarItem[] = [];

    for (const item of finalItems) {
      const key = (item.url || item.title).toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(item);
      }
    }

    // Sort by publication date descending
    deduplicated.sort((a, b) => {
      const timeA = new Date(a.publishedAt).getTime();
      const timeB = new Date(b.publishedAt).getTime();
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });

    const sources = Array.from(new Set(deduplicated.map((i) => i.source))).sort();

    const fullResponse: AiRadarFeedResponse = {
      items: deduplicated,
      sources,
      total: deduplicated.length,
      lastUpdated: new Date().toISOString(),
      briefing,
    };

    // Store in cache
    cache = {
      data: fullResponse,
      expiresAt: now + CACHE_TTL_MS,
    };

    return filterRadarResponse(fullResponse, data);
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
    total: items.length,
    lastUpdated: full.lastUpdated,
    briefing: full.briefing,
  };
}
