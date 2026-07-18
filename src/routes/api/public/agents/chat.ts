import { createFileRoute } from "@tanstack/react-router";
import type { StripeEnv } from "@/lib/stripe.server";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatRequest = {
  agent_id?: string;
  agent_slug?: string;
  messages: ChatMessage[];
  model?: string;
  override_system_prompt?: string;
  temperature?: number;
};

// Abuse limits for this public endpoint.
const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 8_000;
const MAX_TOTAL_CHARS = 24_000;
const RATE_ANON = { max: 10, windowMs: 60_000 };
const RATE_AUTHED = { max: 30, windowMs: 60_000 };

/**
 * Free-tier models are the only ones the public may run. Paid models
 * (OpenAI, Anthropic, non-free OpenRouter) are reserved for callers with a
 * verified entitlement to the specific agent configured to use them.
 */
function isFreeModel(model: string): boolean {
  const id = model.startsWith("openrouter/") ? model.slice("openrouter/".length) : model;
  return id === "openrouter/free" || id === "free" || id.endsWith(":free");
}

export const Route = createFileRoute("/api/public/agents/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        const env: StripeEnv = rawEnv === "live" ? "live" : "sandbox";

        let body: ChatRequest;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { agent_id, agent_slug, messages, model, override_system_prompt, temperature } = body;
        if (!Array.isArray(messages) || messages.length === 0) {
          return Response.json({ error: "messages[] is required" }, { status: 400 });
        }

        if (!override_system_prompt && !agent_id && !agent_slug) {
          return Response.json(
            {
              error:
                "Either override_system_prompt or at least one agent identifier (agent_id or agent_slug) is required",
            },
            { status: 400 },
          );
        }

        // Payload caps: bound the tokens a single request can consume.
        const totalChars = messages.reduce(
          (n, m) => n + (typeof m?.content === "string" ? m.content.length : 0),
          0,
        );
        if (
          messages.length > MAX_MESSAGES ||
          totalChars > MAX_TOTAL_CHARS ||
          messages.some(
            (m) => typeof m?.content !== "string" || m.content.length > MAX_MESSAGE_CHARS,
          )
        ) {
          return Response.json({ error: "Conversation too large" }, { status: 400 });
        }

        // Identify the caller (optional) and rate-limit by IP + identity.
        const { allowRequest, getClientIp, getCallerUserId } =
          await import("@/lib/request-guard.server");
        const userId = await getCallerUserId(request);
        const ip = getClientIp(request.headers);
        const rate = userId ? RATE_AUTHED : RATE_ANON;
        if (!allowRequest(`chat:${ip}:${userId ?? "anon"}`, rate.max, rate.windowMs)) {
          return Response.json(
            { error: "Too many requests — please slow down and try again in a minute." },
            { status: 429 },
          );
        }

        let systemContent = "";
        let agentName = "Custom Agent";
        let fallbackModel = "openrouter/openrouter/free";
        // Only a verified owner of a premium agent may run that agent's paid model.
        let ownsAgent = false;

        if (agent_slug === "platform-guide") {
          // MIT Assistant: the sitewide guide. Its prompt is built server-side
          // with a live catalog digest so it recommends real agents/articles/
          // products instead of hallucinating — and the prompt never ships to
          // the client. This sentinel slug shadows any DB agent of the same name.
          systemContent = await getPlatformGuidePrompt();
          agentName = "MIT Assistant";
        } else if (override_system_prompt) {
          systemContent = override_system_prompt;
        } else if (agent_id || agent_slug) {
          // Load agent from DB.
          const { createClient } = await import("@supabase/supabase-js");
          const { getSupabaseUrl, getSupabaseServiceRoleKey } =
            await import("@/integrations/supabase/env");
          const supabaseUrl = getSupabaseUrl();
          const supabaseServiceKey = getSupabaseServiceRoleKey();

          if (!supabaseUrl || !supabaseServiceKey) {
            return Response.json({ error: "Supabase configuration is missing" }, { status: 500 });
          }

          const supabase = createClient(supabaseUrl, supabaseServiceKey);

          // Match the marketplace/detail-page visibility rule (published or
          // due-scheduled) rather than the legacy `active` flag, so any agent a
          // visitor can open can also chat.
          const now = new Date().toISOString();
          let query = supabase
            .from("agents")
            .select("id, name, model, system_prompt, unlock_content, tier, price_cents, slug")
            .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`);

          if (agent_id) {
            query = query.eq("id", agent_id);
          } else if (agent_slug) {
            query = query.eq("slug", agent_slug);
          }

          const { data: agent, error: agentErr } = await query.maybeSingle();

          if (agentErr || !agent) {
            return Response.json({ error: "Agent not found" }, { status: 404 });
          }

          // Premium/custom agents are paid products: chatting with them requires
          // a signed-in caller with an entitlement to this exact agent. The UI
          // hides the chat, but this server check is the actual boundary.
          if (agent.tier !== "free") {
            if (!userId) {
              return Response.json(
                { error: "Sign in required to chat with this premium agent." },
                { status: 401 },
              );
            }
            const { data: entitlement } = await supabase
              .from("user_entitlements")
              .select("id")
              .eq("user_id", userId)
              .eq("kind", "agent")
              .eq("slug", agent.slug)
              .limit(1)
              .maybeSingle();
            if (!entitlement) {
              return Response.json(
                { error: "This is a premium agent — unlock it to start chatting." },
                { status: 403 },
              );
            }
            ownsAgent = true;
          }

          agentName = agent.name;
          fallbackModel = agent.model ?? "openrouter/openrouter/free";

          // Build the system prompt. unlock_content is the PAID deliverable —
          // it may only ever reach the model for a caller who owns the agent,
          // and even then prompt-extraction only exposes what they already bought.
          systemContent = agent.system_prompt ?? "";
          if (!systemContent && ownsAgent && agent.unlock_content) {
            systemContent = agent.unlock_content;
          }
          if (!systemContent) {
            systemContent = `You are ${agent.name}.`.trim();
          }
        }

        // Model policy: free-tier models for everyone; paid models (OpenAI,
        // Anthropic, non-free OpenRouter) only when the caller owns the agent
        // that is configured to use them — otherwise silently ride the free tier.
        let selectedModel = model ?? fallbackModel;
        if (!isFreeModel(selectedModel) && !(ownsAgent && selectedModel === fallbackModel)) {
          selectedModel = "openrouter/openrouter/free";
        }
        const selectedTemperature =
          typeof temperature === "number" && Number.isFinite(temperature)
            ? Math.min(1, Math.max(0, temperature))
            : 0.7;

        // Build final messages array with system prompt prepended.
        const fullMessages: ChatMessage[] = [
          { role: "system", content: systemContent },
          ...messages.filter((m) => m.role !== "system"),
        ];

        // Determine API key based on model.
        const isOpenAI =
          selectedModel.startsWith("gpt") ||
          selectedModel.startsWith("o1") ||
          selectedModel.startsWith("o3");
        const isAnthropic = selectedModel.startsWith("claude");
        const isOpenRouter = selectedModel.startsWith("openrouter/") || (!isOpenAI && !isAnthropic);

        if (isOpenAI) {
          return await handleOpenAIChat(selectedModel, fullMessages, env, selectedTemperature);
        }
        if (isAnthropic) {
          return await handleAnthropicChat(selectedModel, fullMessages, env, selectedTemperature);
        }
        if (isOpenRouter) {
          const actualModel = selectedModel.startsWith("openrouter/")
            ? selectedModel.substring("openrouter/".length)
            : selectedModel;
          return await handleOpenRouterChat(actualModel, fullMessages, env, selectedTemperature);
        }

        return Response.json({ error: `Unsupported model: ${selectedModel}` }, { status: 400 });
      },
    },
  },
});

// ── MIT Assistant (platform guide) ───────────────────────────────────────────

const GUIDE_CACHE_TTL_MS = 10 * 60_000;
let guidePromptCache: { text: string; expires: number } | null = null;

async function getPlatformGuidePrompt(): Promise<string> {
  const now = Date.now();
  if (guidePromptCache && guidePromptCache.expires > now) return guidePromptCache.text;

  let catalog = "";
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const { getSupabaseUrl, getSupabaseServiceRoleKey } =
      await import("@/integrations/supabase/env");
    const url = getSupabaseUrl();
    const key = getSupabaseServiceRoleKey();
    if (url && key) {
      const supabase = createClient(url, key);
      const nowIso = new Date().toISOString();
      const publicStatus = `status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${nowIso})`;
      const [agents, articles, products] = await Promise.all([
        supabase.from("agents").select("name, slug, category, tagline, tier").or(publicStatus),
        supabase
          .from("articles")
          .select("title, slug, category")
          .or(publicStatus)
          .order("published_at", { ascending: false })
          .limit(30),
        supabase
          .from("products")
          .select("name, slug, category, tier")
          .or(publicStatus)
          .order("updated_at", { ascending: false })
          .limit(40),
      ]);
      const agentLines = (agents.data ?? [])
        .map((a) => `- [${a.name}](/agents/${a.slug}) — ${a.category}, ${a.tier}: ${a.tagline ?? ""}`)
        .join("\n");
      const articleLines = (articles.data ?? [])
        .map((a) => `- [${a.title}](/knowledge/${a.slug}) — ${a.category}`)
        .join("\n");
      const productLines = (products.data ?? [])
        .map((p) => `- [${p.name}](/products/${p.slug}) — ${p.category}, ${p.tier}`)
        .join("\n");
      catalog = `\n\nCATALOG (the only agents, articles, and products that exist — never invent others):\n\nAI Agents:\n${agentLines}\n\nRecent knowledge articles:\n${articleLines}\n\nDigital products:\n${productLines}`;
    }
  } catch (e) {
    console.error("[agent-chat] guide catalog fetch failed; using base prompt", e);
  }

  const text = `You are MIT Assistant, the friendly platform guide for Melanated In Tech (melanatedintech.com) — the marketplace, knowledge hub, and build partner for people putting AI agents to work in businesses, ministries, creator studios, and beyond.

Your job: help visitors find the right agent, article, product, or service fast, and always give them a concrete next step.

Rules:
- Be warm, direct, and practical. Plain English, no hype.
- Keep replies SHORT — 2-4 sentences. You render inside a small chat widget.
- When you recommend something, link it with markdown using its site path, e.g. [Agent Name](/agents/agent-slug). Recommend at most 3 items per reply.
- Only recommend items from the catalog below. If nothing fits, point to the closest browse page instead.
- Free starting points to offer newcomers: the personalized [AI Playbook](/tools/ai-playbook), the [Fit Finder](/fit-finder) quiz, [Start Small](/start-small), and the [Knowledge Hub](/knowledge).
- For "done with you" help: the [Agent Strategy Sprint](/strategy-sprint) is a two-week engagement at $1,500; custom builds start at [Services](/services); questions go to [Contact](/contact).
- Site sections: [Agents](/agents), [Knowledge Hub](/knowledge), [Learning Paths](/paths), [Tools](/tools), [Products](/products), [Services](/services), [Community](/community).
- If asked something unrelated to AI, agents, or the platform, answer briefly and steer back to how the platform can help.${catalog}`;

  guidePromptCache = { text, expires: now + GUIDE_CACHE_TTL_MS };
  return text;
}

function getEnvKey(key: string): string | undefined {
  const sources = [
    typeof process !== "undefined" ? process.env : {},
    typeof import.meta !== "undefined"
      ? (import.meta.env as Record<string, string | undefined>)
      : {},
  ];

  for (const source of sources) {
    if (source && typeof source[key] === "string" && source[key].trim()) {
      return source[key];
    }
    const viteKey = `VITE_${key}`;
    if (source && typeof source[viteKey] === "string" && source[viteKey].trim()) {
      return source[viteKey];
    }
  }
  return undefined;
}

async function handleOpenRouterChat(
  model: string,
  messages: ChatMessage[],
  env: StripeEnv,
  temperature: number,
) {
  const apiKey =
    env === "live"
      ? (getEnvKey("OPENROUTER_LIVE_API_KEY") ?? getEnvKey("OPENROUTER_API_KEY"))
      : (getEnvKey("OPENROUTER_SANDBOX_API_KEY") ?? getEnvKey("OPENROUTER_API_KEY"));

  if (!apiKey) {
    return Response.json({ error: "OpenRouter API key not configured" }, { status: 503 });
  }

  const callOpenRouter = async (modelName: string) => {
    return await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://melanatedintech.com",
        "X-Title": "Melanated In Tech",
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        max_tokens: 1000,
        temperature,
      }),
    });
  };

  try {
    let res = await callOpenRouter(model);
    let activeModel = model;

    // Automatic fallback to openrouter/free if the specific free model fails (rate limits, service issues, etc.)
    if (!res.ok && model !== "openrouter/free") {
      console.warn(
        `[agent-chat] OpenRouter model ${model} failed (status ${res.status}). Falling back to openrouter/free...`,
      );
      res = await callOpenRouter("openrouter/free");
      activeModel = "openrouter/free";
    }

    if (!res.ok) {
      const err = await res.text();
      console.error("[agent-chat] OpenRouter error", res.status, err);
      return Response.json({ error: "AI provider error (OpenRouter)" }, { status: 502 });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    return Response.json({
      role: "assistant",
      content,
      message: { role: "assistant", content },
      model: activeModel,
      activeModel,
      usage: data.usage ?? null,
    });
  } catch (e) {
    // Attempt fallback on network fetch error
    if (model !== "openrouter/free") {
      try {
        console.warn(
          `[agent-chat] OpenRouter network error for ${model}. Falling back to openrouter/free...`,
          e,
        );
        const res = await callOpenRouter("openrouter/free");
        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content ?? "";
          return Response.json({
            role: "assistant",
            content,
            message: { role: "assistant", content },
            model: "openrouter/free",
            activeModel: "openrouter/free",
            usage: data.usage ?? null,
          });
        }
      } catch (fallbackErr) {
        console.error("[agent-chat] OpenRouter fallback failed", fallbackErr);
      }
    }
    console.error("[agent-chat] OpenRouter fetch error", e);
    return Response.json({ error: "AI request failed (OpenRouter)" }, { status: 502 });
  }
}

async function handleOpenAIChat(
  model: string,
  messages: ChatMessage[],
  env: StripeEnv,
  temperature: number,
) {
  const apiKey =
    env === "live"
      ? (getEnvKey("OPENAI_LIVE_API_KEY") ?? getEnvKey("OPENAI_API_KEY"))
      : (getEnvKey("OPENAI_SANDBOX_API_KEY") ?? getEnvKey("OPENAI_API_KEY"));

  if (!apiKey) {
    return Response.json({ error: "OpenAI API key not configured" }, { status: 503 });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1000,
        temperature,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[agent-chat] OpenAI error", res.status, err);
      return Response.json({ error: "AI provider error" }, { status: 502 });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    return Response.json({
      role: "assistant",
      content,
      message: { role: "assistant", content },
      model,
      activeModel: model,
      usage: data.usage ?? null,
    });
  } catch (e) {
    console.error("[agent-chat] OpenAI fetch error", e);
    return Response.json({ error: "AI request failed" }, { status: 502 });
  }
}

async function handleAnthropicChat(
  model: string,
  messages: ChatMessage[],
  env: StripeEnv,
  temperature: number,
) {
  const apiKey =
    env === "live"
      ? (getEnvKey("ANTHROPIC_LIVE_API_KEY") ?? getEnvKey("ANTHROPIC_API_KEY"))
      : (getEnvKey("ANTHROPIC_SANDBOX_API_KEY") ?? getEnvKey("ANTHROPIC_API_KEY"));

  if (!apiKey) {
    return Response.json({ error: "Anthropic API key not configured" }, { status: 503 });
  }

  // Anthropic expects system as a top-level field, not in messages.
  const systemMsg = messages.find((m) => m.role === "system");
  const userMessages = messages.filter((m) => m.role !== "system");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        temperature,
        system: systemMsg?.content,
        messages: userMessages,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[agent-chat] Anthropic error", res.status, err);
      return Response.json({ error: "AI provider error" }, { status: 502 });
    }

    const data = await res.json();
    const content = data.content?.[0]?.text ?? "";

    return Response.json({
      role: "assistant",
      content,
      message: { role: "assistant", content },
      model,
      activeModel: model,
      usage: data.usage ?? null,
    });
  } catch (e) {
    console.error("[agent-chat] Anthropic fetch error", e);
    return Response.json({ error: "AI request failed" }, { status: 502 });
  }
}
