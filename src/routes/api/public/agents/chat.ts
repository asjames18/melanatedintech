import { createFileRoute } from "@tanstack/react-router";
import type { SupabaseClient } from "@supabase/supabase-js";
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
// Bare OpenRouter ids for the models this endpoint routes between. The
// paid bundle pair and the free-tier primary are named once here; every
// "openrouter/..." string in this file derives from these.
const BUNDLE_MODEL_ID = "deepseek/deepseek-v4.1-flash";
const BUNDLE_FALLBACK_MODEL_ID = "z-ai/glm-5.3-flash";
const FREE_MODEL_ID = "stealth/space-bunny-alpha";

function isFreeModel(model: string): boolean {
  const id = model.startsWith("openrouter/") ? model.slice("openrouter/".length) : model;
  return id === "openrouter/free" || id === "free" || id === FREE_MODEL_ID || id.endsWith(":free");
}

// AppSumo bundle SKU: weekly conversation allowance for bundle redeemers.
// One API call = one conversation unit; free-tier fallback calls never
// consume the allowance. Resets every Monday (America/New_York).
const BUNDLE_WEEKLY_LIMIT = 200;

// The paid models bundle redeemers run on within their weekly allowance.
// Picked by measurement, not brand: in the 2026-10-01 bake-off (the five
// quality tasks, exact live prompts), DeepSeek V4.1 Flash and GLM 5.3 Flash
// were the only models to pass all five. DeepSeek was also the fastest
// passer and the cheapest paid input ($0.03/$0.50 per 1M tokens), so it is
// the primary; GLM is slower (up to ~50s) but equally disciplined, so it is
// the paid fallback — one retry when the primary errors or answers empty.
// GPT-OSS 20B and 120B failed the same fabrication tasks across three
// prompt revisions; quality, not price, decided this.
// The free tier rides Space Bunny Alpha: free today and strong when it
// answers, but a stealth preview (no SLA; can be repriced or pulled
// without notice) with occasional empty replies. Free calls therefore fall
// back to the OpenRouter free router on error or empty content, so a Bunny
// outage is never user-visible. Watch item: confirm
// stealth/space-bunny-alpha is still listed in the OpenRouter catalog from
// time to time; the fallback makes its removal a non-event either way.
const BUNDLE_MODEL = `openrouter/${BUNDLE_MODEL_ID}`;
const BUNDLE_FALLBACK_MODEL = `openrouter/${BUNDLE_FALLBACK_MODEL_ID}`;
const FREE_MODEL = `openrouter/${FREE_MODEL_ID}`;
// Reply cap for the bundle pair and the free primary: 1,000 tokens
// truncated real deliverables mid-sentence in testing; 4,000 completes
// them (bake-off verified at 3,000+ headroom). Agent-configured models
// keep the historical 1,000.
const EXTENDED_MAX_TOKENS = 4000;

/**
 * Record one conversation for weekly-allowance metering. Best-effort:
 * failures are swallowed so metering can never break chat.
 */
async function logAgentUsage(
  db: SupabaseClient,
  userId: string,
  agentSlug: string,
  res: Response,
): Promise<void> {
  try {
    const data = await res.clone().json();
    const usage = data?.usage ?? {};
    await db.from("agent_usage_log").insert({
      user_id: userId,
      agent_slug: agentSlug,
      model: data?.activeModel ?? data?.model ?? "unknown",
      input_tokens: usage?.prompt_tokens ?? usage?.input_tokens ?? null,
      output_tokens: usage?.completion_tokens ?? usage?.output_tokens ?? null,
    });
  } catch {
    // metering must never break chat
  }
}

/**
 * Atomically reserve one weekly-allowance conversation for a bundle
 * redeemer (the reserve_bundle_conversation RPC counts + holds in a single
 * transaction, so concurrent requests can't overshoot the limit). Returns
 * the reservation id, or null when the allowance is exhausted or the
 * reservation failed — either way the caller rides the free tier until the
 * Monday reset.
 */
async function tryReserveBundleConversation(
  db: SupabaseClient,
  userId: string,
  agentSlug: string,
): Promise<string | null> {
  try {
    const { data: raw, error } = await db.rpc("reserve_bundle_conversation", {
      p_user_id: userId,
      p_agent_slug: agentSlug,
      p_limit: BUNDLE_WEEKLY_LIMIT,
    });
    if (error) throw error;
    const data = (raw ?? {}) as { allowed?: boolean; reservation_id?: string };
    if (data.allowed === true && typeof data.reservation_id === "string") {
      return data.reservation_id;
    }
    return null;
  } catch (e) {
    console.warn("[agent-chat] bundle reservation failed:", e);
    return null;
  }
}

/**
 * Settle a bundle reservation after the provider responds. A usable
 * assistant response finalizes the placeholder row with the real
 * model/tokens (consuming one conversation); anything else deletes the row
 * so a failed or empty response never consumes allowance.
 */
async function finalizeBundleReservation(
  db: SupabaseClient,
  reservationId: string,
  res: Response,
): Promise<void> {
  try {
    const data = await res.clone().json().catch(() => null);
    const text = data?.content ?? data?.message?.content ?? "";
    const usable = res.ok && typeof text === "string" && text.trim().length > 0;
    if (!usable) {
      await db.from("agent_usage_log").delete().eq("id", reservationId);
      return;
    }
    const usage = data?.usage ?? {};
    await db
      .from("agent_usage_log")
      .update({
        model: data?.activeModel ?? data?.model ?? "unknown",
        input_tokens: usage?.prompt_tokens ?? usage?.input_tokens ?? null,
        output_tokens: usage?.completion_tokens ?? usage?.output_tokens ?? null,
      })
      .eq("id", reservationId);
  } catch {
    // metering must never break chat
  }
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
        const { allowPersistentRequest, getClientIp, getCallerUserId } =
          await import("@/lib/request-guard.server");
        const userId = await getCallerUserId(request);
        const ip = getClientIp(request.headers);
        const rate = userId ? RATE_AUTHED : RATE_ANON;
        if (
          !(await allowPersistentRequest(
            `chat:${ip}:${userId ?? "anon"}`,
            rate.max,
            rate.windowMs,
          ))
        ) {
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
        // AppSumo bundle: when the weekly conversation allowance is used up,
        // the caller rides the free tier until the next Monday reset.
        let cappedToFree = false;
        // Reservation id from the atomic weekly-allowance hold (null unless
        // this caller is a bundle redeemer inside their allowance). Settled
        // after the provider responds: finalized on a usable response,
        // released otherwise.
        let bundleReservationId: string | null = null;
        // Whether the caller redeemed the AppSumo bundle (drives the paid-model
        // override below). Hoisted alongside cappedToFree.
        let isBundleRedeemer = false;
        // Metering: hoisted so usage can be logged after the provider responds.
        let chatDb: SupabaseClient | null = null;
        let logSlug: string | null = null;

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
          chatDb = supabase;

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

          // AppSumo bundle: redeemers are identified via
          // redeem_codes.redeemed_by — the allowance applies only to them, not
          // to direct one-time buyers, who keep the terms they purchased under.
          if (ownsAgent && userId) {
            const { data: bundleRow } = await supabase
              .from("redeem_codes")
              .select("code")
              .eq("redeemed_by", userId)
              .limit(1)
              .maybeSingle();
            if (bundleRow) {
              isBundleRedeemer = true;
            }
          }

          agentName = agent.name;
          logSlug = agent.slug;
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
        // requestedModel is captured before the policy so the bundle branch
        // below can tell an explicit bundle-model pick from a forced fallback.
        const requestedModel = model ?? fallbackModel;
        let selectedModel = requestedModel;
        if (
          !isFreeModel(selectedModel) &&
          !(ownsAgent && selectedModel === fallbackModel)
        ) {
          selectedModel = FREE_MODEL;
        }

        // Bundle redeemers run on the bundle model (DeepSeek V4.1 Flash,
        // GLM 5.3 Flash fallback), not the
        // agent's default paid model. Direct buyers keep the model their agent
        // is configured with — their purchase terms don't change. A redeemer
        // who explicitly picks a free model rides it without spending
        // allowance. The reservation is atomic (count + hold in one
        // transaction), so concurrent requests can't overshoot the allowance;
        // over the allowance, or if the reservation fails, the caller rides
        // the free tier until the Monday reset: degraded, never a hard wall.
        if (isBundleRedeemer && ownsAgent && chatDb && userId && logSlug) {
          if (requestedModel === BUNDLE_MODEL || !isFreeModel(requestedModel)) {
            selectedModel = BUNDLE_MODEL;
            const reservationId = await tryReserveBundleConversation(
              chatDb,
              userId,
              logSlug,
            );
            if (reservationId) {
              bundleReservationId = reservationId;
            } else {
              cappedToFree = true;
              selectedModel = FREE_MODEL;
            }
          }
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

        if (isOpenAI || isAnthropic || isOpenRouter) {
          let providerRes: Response;
          if (isOpenAI) {
            providerRes = await handleOpenAIChat(
              selectedModel,
              fullMessages,
              env,
              selectedTemperature,
            );
          } else if (isAnthropic) {
            providerRes = await handleAnthropicChat(
              selectedModel,
              fullMessages,
              env,
              selectedTemperature,
            );
          } else {
            const actualModel = selectedModel.startsWith("openrouter/")
              ? selectedModel.substring("openrouter/".length)
              : selectedModel;
            providerRes = await handleOpenRouterChat(
              actualModel,
              fullMessages,
              env,
              selectedTemperature,
            );
          }

          // Metering: a bundle reservation settles now — finalized with the
          // real model/tokens on a usable response, released otherwise so a
          // failed or empty response never consumes allowance. Everyone else
          // logs fire-and-forget. Either way, metering must never break chat.
          if (bundleReservationId && chatDb) {
            // Settle the hold before responding so the usage row reflects the
            // real model (or is released) instead of lingering as __reserved__.
            await finalizeBundleReservation(chatDb, bundleReservationId, providerRes);
          } else if (chatDb && userId && logSlug) {
            logAgentUsage(chatDb, userId, logSlug, providerRes).catch(() => {});
          }

          // Tell the UI when the weekly allowance is used up so it can say so
          // honestly instead of silently answering on the free tier.
          if (cappedToFree && providerRes.ok) {
            const data = await providerRes.json().catch(() => null);
            if (data && typeof data === "object") {
              return Response.json({ ...data, weeklyAllowanceExhausted: true });
            }
          }
          return providerRes;
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

  const text = `You are MIT Assistant, the friendly platform guide for Melanated in Tech (melanatedintech.com) — the marketplace, knowledge hub, and build partner for people putting AI agents to work in businesses, ministries, creator studios, and beyond.

Your job: help visitors find the right agent, article, product, or service fast, and always give them a concrete next step.

Rules:
- Be warm, direct, and practical. Plain English, no hype.
- Keep replies SHORT — 2-4 sentences. You render inside a small chat widget.
- When you recommend something, link it with markdown using its site path, e.g. [Agent Name](/agents/agent-slug). Recommend at most 3 items per reply.
- Only recommend items from the catalog below. If nothing fits, point to the closest browse page instead.
- Free starting points to offer newcomers: the personalized [AI Playbook](/tools/ai-playbook), the [Fit Finder](/fit-finder) quiz, [Start Small](/start-small), and the [Knowledge Hub](/knowledge).
- For "done with you" help: the [Workflow Opportunity Sprint](/work-with-us#workflow-opportunity-sprint) is a 10-business-day discovery (planning signal $7,500–$15,000 — not an instant quote and not a guaranteed ROI). The $297 [AI Workflow Diagnostic](/work-with-us) and $997 [Website Launch Sprint](/work-with-us) are separate offers. Custom builds and questions go to [Contact](/contact).
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

  // One resilience retry per chat. The paid bundle model fails over to the
  // paid fallback model; every other model fails over to the OpenRouter
  // free router (the free primary is a stealth preview that can be pulled
  // without notice, and this keeps its removal invisible to users). A
  // reply counts as usable only when the provider answered AND returned
  // non-empty content: an empty 200 is a failure here, never something a
  // customer sees or the weekly allowance pays for.
  const fallbackFor = (modelName: string): string | null =>
    modelName === BUNDLE_MODEL_ID
      ? BUNDLE_FALLBACK_MODEL_ID
      : modelName === "openrouter/free"
        ? null
        : "openrouter/free";

  const maxTokensFor = (modelName: string): number =>
    modelName === BUNDLE_MODEL_ID ||
    modelName === BUNDLE_FALLBACK_MODEL_ID ||
    modelName === FREE_MODEL_ID
      ? EXTENDED_MAX_TOKENS
      : 1000;

  const callOpenRouter = async (
    modelName: string,
  ): Promise<{ ok: boolean; status: number; content: string; usage: unknown }> => {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://melanatedintech.com",
          "X-Title": "Melanated in Tech",
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          max_tokens: maxTokensFor(modelName),
          temperature,
        }),
      });
      if (!res.ok) {
        console.error(
          "[agent-chat] OpenRouter error",
          modelName,
          res.status,
          await res.text().catch(() => ""),
        );
        return { ok: false, status: res.status, content: "", usage: null };
      }
      const data = await res.json();
      return {
        ok: true,
        status: res.status,
        content: data.choices?.[0]?.message?.content ?? "",
        usage: data.usage ?? null,
      };
    } catch (e) {
      console.error("[agent-chat] OpenRouter fetch error", modelName, e);
      return { ok: false, status: 0, content: "", usage: null };
    }
  };

  let activeModel = model;
  let result = await callOpenRouter(model);
  if (!result.ok || !result.content.trim()) {
    const fallback = fallbackFor(model);
    if (fallback) {
      console.warn(
        `[agent-chat] OpenRouter model ${model} unusable (${result.ok ? "empty reply" : `status ${result.status}`}). Retrying on ${fallback}...`,
      );
      const retry = await callOpenRouter(fallback);
      if (retry.ok) {
        activeModel = fallback;
        result = retry;
      }
    }
  }

  if (!result.ok) {
    return Response.json({ error: "AI provider error (OpenRouter)" }, { status: 502 });
  }

  return Response.json({
    role: "assistant",
    content: result.content,
    message: { role: "assistant", content: result.content },
    model: activeModel,
    activeModel,
    usage: result.usage,
  });
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
