import { createFileRoute } from "@tanstack/react-router";
import { createStripeClient, type StripeEnv } from "@/lib/stripe.server";
import { getPremiumEntry } from "@/lib/premium-catalog";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatRequest = {
  agent_id: string;
  agent_slug: string;
  messages: ChatMessage[];
  model?: string;
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

        const { agent_id, agent_slug, messages, model } = body;
        if (!agent_id || !agent_slug || !Array.isArray(messages) || messages.length === 0) {
          return Response.json(
            { error: "agent_id, agent_slug, and messages[] are required" },
            { status: 400 },
          );
        }

        // Load agent from DB.
        const { createClient } = await import("@supabase/supabase-js");
        const { getEnv } = await import("@/integrations/supabase/env");
        const supabase = createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"));

        const { data: agent, error: agentErr } = await supabase
          .from("agents")
          .select("id, name, model, system_prompt, unlock_content, tier, price_cents, slug")
          .eq("id", agent_id)
          .eq("slug", agent_slug)
          .eq("active", true)
          .maybeSingle();

        if (agentErr || !agent) {
          return Response.json({ error: "Agent not found" }, { status: 404 });
        }

        // Build the system prompt.
        // Priority: agent.system_prompt > agent.unlock_content > fallback.
        let systemContent = agent.system_prompt ?? "";
        if (!systemContent && agent.unlock_content) {
          systemContent = agent.unlock_content;
        }
        if (!systemContent) {
          systemContent = `You are ${agent.name}. ${agent.description ?? ""}`.trim();
        }

        const selectedModel = model ?? agent.model ?? "gpt-4o-mini";

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

        if (isOpenAI) {
          return await handleOpenAIChat(selectedModel, fullMessages, env);
        }
        if (isAnthropic) {
          return await handleAnthropicChat(selectedModel, fullMessages, env);
        }

        return Response.json({ error: `Unsupported model: ${selectedModel}` }, { status: 400 });
      },
    },
  },
});

async function handleOpenAIChat(model: string, messages: ChatMessage[], env: StripeEnv) {
  const apiKey =
    env === "live"
      ? process.env.OPENAI_LIVE_API_KEY
      : (process.env.OPENAI_SANDBOX_API_KEY ?? process.env.OPENAI_API_KEY);

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
      ? process.env.ANTHROPIC_LIVE_API_KEY
      : (process.env.ANTHROPIC_SANDBOX_API_KEY ?? process.env.ANTHROPIC_API_KEY);

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
