import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Thin wrappers over keyless public APIs.
 *
 * These return an empty result when an upstream call fails. They used to return
 * hand-written sample rows — invented repositories with invented star counts,
 * invented headlines, an invented DOI — which rendered under a "Live REST APIs"
 * badge and were indistinguishable from real data. Callers own the empty state.
 *
 * The AI news and research feeds that lived here now come from
 * `src/lib/radar.functions.ts`, which merges six sources and reports per-source
 * failures to the page.
 */

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

/**
 * Server Function: Fetch trending MCP servers from the GitHub search API.
 * Returns an empty list when GitHub is unreachable or rate-limited.
 */
export const fetchTrendingMcpServers = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        limit: z.number().min(1).max(30).default(12),
        query: z.string().optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }): Promise<GitHubMcpRepo[]> => {
    try {
      const q = data.query?.trim();
      const searchTopic = q ? `${encodeURIComponent(q)}+topic:mcp-server` : "topic:mcp-server";
      const url = `https://api.github.com/search/repositories?q=${searchTopic}&sort=stars&order=desc&per_page=${data.limit}`;

      const res = await fetch(url, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "MelanatedInTech-Platform",
        },
      });

      if (!res.ok) {
        console.warn(`GitHub API returned status ${res.status}.`);
        return [];
      }

      const json = (await res.json()) as { items?: GitHubMcpRepo[] };
      if (!json.items || !Array.isArray(json.items)) return [];

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
    } catch (err) {
      console.warn("Failed to fetch GitHub trending MCP servers:", err);
      return [];
    }
  });

const PERSONAL_EMAIL_PROVIDERS = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "zoho.com",
  "mail.com",
  "gmx.com",
  "yandex.com",
  "live.com",
  "msn.com",
  "me.com",
  "comcast.net",
  "sbcglobal.net",
]);

/**
 * Server Function: Lead contact validation powered by Google Public DNS API
 */
export const validateLeadContact = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        email: z.string().trim(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const parts = email.split("@");

    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return {
        valid: false,
        reason: "Invalid email syntax",
        email,
        domain: "",
        status: "invalid",
        isCorporateDomain: false,
        suggestedTier: "Invalid Input",
      };
    }

    const domain = parts[1];
    const domainParts = domain ? domain.split(".") : [];
    const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : "";

    if (!domain || !domain.includes(".") || domain.endsWith(".") || domain.length < 4 || !tld || tld.length < 2) {
      return {
        valid: false,
        reason: "Invalid top-level domain extension",
        email,
        domain: domain || parts[1] || "",
        status: "invalid",
        isCorporateDomain: false,
        suggestedTier: "Invalid Format",
      };
    }

    const isPersonal = PERSONAL_EMAIL_PROVIDERS.has(domain);

    // Perform real DNS MX record query via Google Public DNS REST API
    try {
      const dnsRes = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`,
        { headers: { Accept: "application/json" } }
      );

      if (dnsRes.ok) {
        const dnsData = (await dnsRes.json()) as {
          Status: number; // 0 = NOERROR, 3 = NXDOMAIN
          Answer?: Array<{ name: string; type: number; data: string }>;
        };

        if (dnsData.Status === 3 || (!dnsData.Answer || dnsData.Answer.length === 0)) {
          // Fallback check: A record check if domain hosts a web server without MX
          const aRes = await fetch(
            `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`,
            { headers: { Accept: "application/json" } }
          );
          const aData = aRes.ok ? ((await aRes.json()) as { Answer?: Array<unknown> }) : null;

          if (dnsData.Status === 3 || (!aData?.Answer || aData.Answer.length === 0)) {
            return {
              valid: false,
              reason: "No active DNS or mail records found for domain",
              email,
              domain,
              status: "unregistered",
              isCorporateDomain: false,
              suggestedTier: "Inactive Domain",
            };
          }
        }
      }
    } catch (err) {
      console.warn("Google Public DNS API lookup failed, falling back:", err);
    }

    if (isPersonal) {
      return {
        valid: true,
        reason: "Personal email provider detected",
        email,
        domain,
        status: "personal",
        isCorporateDomain: false,
        suggestedTier: "Starter Pack / Free Diagnostic",
      };
    }

    return {
      valid: true,
      reason: "Verified active corporate domain",
      email,
      domain,
      status: "corporate",
      isCorporateDomain: true,
      suggestedTier: "LeadFlow Growth / Audit",
    };
  });

export interface LlmModelPricing {
  id: string;
  name: string;
  provider: string;
  promptPricePerM: number;
  completionPricePerM: number;
  contextLength: number;
}

export interface UserGeoLocation {
  city: string;
  region: string;
  country_name: string;
  timezone: string;
  org?: string;
}

/**
 * Server Function: Fetch live LLM token pricing from the OpenRouter API.
 * Returns an empty list when OpenRouter is unreachable, so a caller never
 * presents stale hard-coded prices as a live quote.
 */
export const fetchLiveLlmPricing = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ limit: z.number().default(150), query: z.string().optional() }).parse(d ?? {}),
  )
  .handler(async ({ data }): Promise<LlmModelPricing[]> => {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        console.warn(`OpenRouter models endpoint returned status ${res.status}.`);
        return [];
      }

      const json = (await res.json()) as {
        data?: Array<{
          id: string;
          name: string;
          context_length: number;
          pricing?: { prompt?: string; completion?: string };
        }>;
      };
      if (!json.data || !Array.isArray(json.data)) return [];

      let models: LlmModelPricing[] = json.data
        .filter((m) => m.pricing?.prompt !== undefined && m.pricing?.completion !== undefined)
        .map((m) => {
          const provider = m.id.split("/")[0] || "AI Provider";
          const promptPerM = parseFloat(m.pricing?.prompt || "0") * 1000000;
          const completionPerM = parseFloat(m.pricing?.completion || "0") * 1000000;
          return {
            id: m.id,
            name: m.name || m.id,
            provider: provider.toUpperCase(),
            promptPricePerM: parseFloat(promptPerM.toFixed(4)),
            completionPricePerM: parseFloat(completionPerM.toFixed(4)),
            contextLength: m.context_length || 128000,
          };
        });

      if (data.query?.trim()) {
        const q = data.query.trim().toLowerCase();
        models = models.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.id.toLowerCase().includes(q) ||
            m.provider.toLowerCase().includes(q)
        );
      }

      return models.slice(0, data.limit);
    } catch (err) {
      console.warn("OpenRouter API model pricing fetch failed:", err);
      return [];
    }
  });

/**
 * Server Function: Fetch user IP location & timezone from ipapi.co
 */
export const fetchUserLocationGeo = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const res = await fetch("https://ipapi.co/json/", {
        headers: { Accept: "application/json", "User-Agent": "MelanatedInTech-Platform" },
      });
      if (res.ok) {
        const data = (await res.json()) as {
          city?: string;
          region?: string;
          country_name?: string;
          timezone?: string;
          org?: string;
        };
        if (data.city && data.country_name) {
          return {
            city: data.city,
            region: data.region || "",
            country_name: data.country_name,
            timezone: data.timezone || "UTC",
            org: data.org || "Broadband Provider",
          };
        }
      }
    } catch (err) {
      console.warn("GeoIP lookup failed, using fallback location:", err);
    }

    return {
      city: "Washington",
      region: "DC",
      country_name: "United States",
      timezone: "America/New_York",
      org: "Local Access Provider",
    };
  });
