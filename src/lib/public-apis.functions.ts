import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface GitHubMcpRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  owner: {
    login: string;
    avatar_url: string;
  };
  topics: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: "HackerNews" | "Dev.to" | "ArXiv";
  author?: string;
  publishedAt: string;
  score?: number;
}

const FALLBACK_MCP_REPOS: GitHubMcpRepo[] = [
  {
    id: 1,
    name: "mcp-server-postgres",
    full_name: "modelcontextprotocol/servers",
    description: "Official Model Context Protocol server for PostgreSQL databases.",
    html_url: "https://github.com/modelcontextprotocol/servers",
    stargazers_count: 14200,
    forks_count: 1200,
    owner: {
      login: "modelcontextprotocol",
      avatar_url: "https://avatars.githubusercontent.com/u/182068940?v=4",
    },
    topics: ["mcp-server", "postgres", "ai-agents"],
  },
  {
    id: 2,
    name: "mcp-server-puppeteer",
    full_name: "modelcontextprotocol/server-puppeteer",
    description: "Browser automation and web scraping MCP server for AI agents.",
    html_url: "https://github.com/modelcontextprotocol/servers",
    stargazers_count: 8500,
    forks_count: 650,
    owner: {
      login: "modelcontextprotocol",
      avatar_url: "https://avatars.githubusercontent.com/u/182068940?v=4",
    },
    topics: ["mcp-server", "puppeteer", "browser-automation"],
  },
  {
    id: 3,
    name: "mcp-server-brave-search",
    full_name: "modelcontextprotocol/server-brave-search",
    description: "Real-time web and local search integration via Brave API.",
    html_url: "https://github.com/modelcontextprotocol/servers",
    stargazers_count: 6300,
    forks_count: 420,
    owner: {
      login: "modelcontextprotocol",
      avatar_url: "https://avatars.githubusercontent.com/u/182068940?v=4",
    },
    topics: ["mcp-server", "search", "web-search"],
  },
];

const FALLBACK_NEWS: NewsItem[] = [
  {
    id: "fn-1",
    title: "Building Production-Grade AI Agents with Model Context Protocol",
    url: "https://news.ycombinator.com",
    source: "HackerNews",
    author: "agent_builder",
    publishedAt: new Date().toISOString(),
    score: 342,
  },
  {
    id: "fn-2",
    title: "How to Build a Custom Multi-Agent System in TypeScript",
    url: "https://dev.to",
    source: "Dev.to",
    author: "melanated_dev",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "fn-3",
    title: "Autonomous Agent Tool Use and Context Compression Metrics",
    url: "https://arxiv.org",
    source: "ArXiv",
    author: "AI Research Group",
    publishedAt: new Date().toISOString(),
  },
];

/**
 * Server Function: Fetch trending MCP servers from GitHub API
 */
export const fetchTrendingMcpServers = createServerFn({ method: "GET" })
  .validator((d: unknown) =>
    z
      .object({
        limit: z.number().min(1).max(20).default(6),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    try {
      const res = await fetch(
        `https://api.github.com/search/repositories?q=topic:mcp-server+sort:stars-desc&per_page=${data.limit}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "MelanatedInTech-Platform",
          },
        },
      );

      if (!res.ok) {
        console.warn(`GitHub API returned status ${res.status}, using fallbacks.`);
        return FALLBACK_MCP_REPOS.slice(0, data.limit);
      }

      const json = (await res.json()) as { items?: GitHubMcpRepo[] };
      if (json.items && Array.isArray(json.items) && json.items.length > 0) {
        return json.items.map((item) => ({
          id: item.id,
          name: item.name,
          full_name: item.full_name,
          description: item.description,
          html_url: item.html_url,
          stargazers_count: item.stargazers_count,
          forks_count: item.forks_count,
          owner: {
            login: item.owner?.login ?? "community",
            avatar_url: item.owner?.avatar_url ?? "",
          },
          topics: item.topics ?? [],
        }));
      }
      return FALLBACK_MCP_REPOS.slice(0, data.limit);
    } catch (err) {
      console.warn("Failed to fetch GitHub trending MCP servers:", err);
      return FALLBACK_MCP_REPOS.slice(0, data.limit);
    }
  });

/**
 * Server Function: Fetch trending AI Agent developer & research news
 */
export const fetchAiAgentNews = createServerFn({ method: "GET" })
  .validator((d: unknown) =>
    z
      .object({
        limit: z.number().min(1).max(15).default(5),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const items: NewsItem[] = [];

    // 1. Fetch HackerNews AI Agent posts via Algolia API
    try {
      const hnRes = await fetch(
        "https://hn.algolia.com/api/v1/search_by_date?query=AI+Agent&tags=story&hitsPerPage=3",
      );
      if (hnRes.ok) {
        const hnData = (await hnRes.json()) as {
          hits?: Array<{
            objectID: string;
            title: string;
            url: string;
            author: string;
            points: number;
            created_at: string;
          }>;
        };
        if (hnData.hits) {
          hnData.hits.forEach((hit) => {
            if (hit.title && (hit.url || hit.objectID)) {
              items.push({
                id: `hn-${hit.objectID}`,
                title: hit.title,
                url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
                source: "HackerNews",
                author: hit.author,
                publishedAt: hit.created_at,
                score: hit.points,
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn("HackerNews API fetch failed", e);
    }

    // 2. Fetch Dev.to AI Articles
    try {
      const devRes = await fetch("https://dev.to/api/articles?tag=ai&per_page=3");
      if (devRes.ok) {
        const devData = (await devRes.json()) as Array<{
          id: number;
          title: string;
          url: string;
          user: { name: string };
          published_at: string;
          public_reactions_count: number;
        }>;
        devData.forEach((article) => {
          items.push({
            id: `dev-${article.id}`,
            title: article.title,
            url: article.url,
            source: "Dev.to",
            author: article.user?.name,
            publishedAt: article.published_at,
            score: article.public_reactions_count,
          });
        });
      }
    } catch (e) {
      console.warn("Dev.to API fetch failed", e);
    }

    if (items.length === 0) {
      return FALLBACK_NEWS.slice(0, data.limit);
    }

    return items.slice(0, data.limit);
  });

/**
 * Server Function: Lead contact validation helper
 */
export const validateLeadContact = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z
      .object({
        email: z.string().trim().email(),
        domain: z.string().trim().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const domain = data.domain || data.email.split("@")[1];
    const isFreeEmail = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "icloud.com",
    ].includes(domain.toLowerCase());

    return {
      valid: true,
      email: data.email,
      domain,
      isCorporateDomain: !isFreeEmail,
      suggestedTier: isFreeEmail ? "Starter Pack / Free Diagnostic" : "LeadFlow Growth / Audit",
    };
  });
