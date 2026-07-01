import { createFileRoute } from "@tanstack/react-router";
import { createStripeClient, type StripeEnv } from "@/lib/stripe.server";
import { getPremiumEntry } from "@/lib/premium-catalog";

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
};

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

        const { agent_id, agent_slug, messages, model, override_system_prompt } = body;
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

        let systemContent = "";
        let agentName = "Custom Agent";
        let fallbackModel = "gpt-4o-mini";

        if (override_system_prompt) {
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

          let query = supabase
            .from("agents")
            .select("id, name, model, system_prompt, unlock_content, tier, price_cents, slug")
            .eq("active", true);

          if (agent_id) {
            query = query.eq("id", agent_id);
          } else if (agent_slug) {
            query = query.eq("slug", agent_slug);
          }

          const { data: agent, error: agentErr } = await query.maybeSingle();

          if (agentErr || !agent) {
            return Response.json({ error: "Agent not found" }, { status: 404 });
          }

          agentName = agent.name;
          fallbackModel = agent.model ?? "gpt-4o-mini";

          // Build the system prompt.
          // Priority: agent.system_prompt > agent.unlock_content > fallback.
          systemContent = agent.system_prompt ?? "";
          if (!systemContent && agent.unlock_content) {
            systemContent = agent.unlock_content;
          }
          if (!systemContent) {
            systemContent = `You are ${agent.name}.`.trim();
          }
        }

        let selectedModel = model ?? fallbackModel;
        if (!selectedModel.startsWith("openrouter/")) {
          selectedModel = "openrouter/openrouter/free";
        }

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
        const isOpenRouter = selectedModel.startsWith("openrouter/");

        if (isOpenAI) {
          return await handleOpenAIChat(selectedModel, fullMessages, env);
        }
        if (isAnthropic) {
          return await handleAnthropicChat(selectedModel, fullMessages, env);
        }
        if (isOpenRouter) {
          const actualModel = selectedModel.substring("openrouter/".length);
          return await handleOpenRouterChat(actualModel, fullMessages, env);
        }

        return Response.json({ error: `Unsupported model: ${selectedModel}` }, { status: 400 });
      },
    },
  },
});

function getEnvKey(key: string): string | undefined {
  const sources = [
    typeof process !== "undefined" ? process.env : {},
    typeof import.meta !== "undefined" ? (import.meta.env as Record<string, any>) : {},
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

async function handleOpenRouterChat(model: string, messages: ChatMessage[], env: StripeEnv) {
  const apiKey =
    env === "live"
      ? (getEnvKey("OPENROUTER_LIVE_API_KEY") ?? getEnvKey("OPENROUTER_API_KEY"))
      : (getEnvKey("OPENROUTER_SANDBOX_API_KEY") ?? getEnvKey("OPENROUTER_API_KEY"));

  if (!apiKey) {
    return Response.json({ error: "OpenRouter API key not configured" }, { status: 500 });
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
        temperature: 0.7,
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
      model: activeModel,
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
            model: "openrouter/free",
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

async function handleOpenAIChat(model: string, messages: ChatMessage[], env: StripeEnv) {
  const apiKey =
    env === "live"
      ? (getEnvKey("OPENAI_LIVE_API_KEY") ?? getEnvKey("OPENAI_API_KEY"))
      : (getEnvKey("OPENAI_SANDBOX_API_KEY") ?? getEnvKey("OPENAI_API_KEY"));

  if (!apiKey) {
    return Response.json({ error: "OpenAI API key not configured" }, { status: 500 });
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
        temperature: 0.7,
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
      model,
      usage: data.usage ?? null,
    });
  } catch (e) {
    console.error("[agent-chat] OpenAI fetch error", e);
    return Response.json({ error: "AI request failed" }, { status: 502 });
  }
}

async function handleAnthropicChat(model: string, messages: ChatMessage[], env: StripeEnv) {
  const apiKey =
    env === "live"
      ? (getEnvKey("ANTHROPIC_LIVE_API_KEY") ?? getEnvKey("ANTHROPIC_API_KEY"))
      : (getEnvKey("ANTHROPIC_SANDBOX_API_KEY") ?? getEnvKey("ANTHROPIC_API_KEY"));

  if (!apiKey) {
    return Response.json({ error: "Anthropic API key not configured" }, { status: 500 });
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
      model,
      usage: data.usage ?? null,
    });
  } catch (e) {
    console.error("[agent-chat] Anthropic fetch error", e);
    return Response.json({ error: "AI request failed" }, { status: 502 });
  }
}
