import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Markdown } from "@/components/markdown";
import { Send, Loader2, Bot, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatProps = {
  agentId?: string;
  agentSlug?: string;
  agentName: string;
  defaultModel: string;
  env?: "sandbox" | "live";
  overrideSystemPrompt?: string;
  /** Bundle redeemer: list the bundle model first, default to it, show allowance. */
  bundleMode?: boolean;
  bundleRemaining?: number | null;
  bundleAllowance?: number;
};

/** Paid model included with the AppSumo bundle (matches BUNDLE_MODEL server-side). */
const BUNDLE_MODEL_VALUE = "openrouter/deepseek/deepseek-v4.1-flash";

const AVAILABLE_MODELS = [
  { value: "openrouter/stealth/space-bunny-alpha", label: "Space Bunny Alpha (Free)" },
  { value: "openrouter/openrouter/free", label: "Auto Free (OpenRouter)" },
  { value: "openrouter/meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (Free)" },
  { value: "openrouter/google/gemini-2.5-flash:free", label: "Gemini 2.5 Flash (Free)" },
  { value: "openrouter/deepseek/deepseek-chat:free", label: "DeepSeek V3 (Free)" },
  { value: "openrouter/qwen/qwen-2.5-72b-instruct:free", label: "Qwen 2.5 72B (Free)" },
  { value: "openrouter/google/gemma-2-9b-it:free", label: "Gemma 2 9B (Free)" },
  { value: "openrouter/meta-llama/llama-3.1-8b-instruct:free", label: "Llama 3.1 8B (Free)" },
  { value: "openrouter/qwen/qwen-2.5-7b-instruct:free", label: "Qwen 2.5 7B (Free)" },
  { value: "openrouter/mistralai/mistral-7b-instruct:free", label: "Mistral 7B (Free)" },
];

export function Chat({
  agentId,
  agentSlug,
  agentName,
  defaultModel,
  env = "sandbox",
  overrideSystemPrompt,
  bundleMode = false,
  bundleRemaining = null,
  bundleAllowance = 200,
}: ChatProps) {
  const models = bundleMode
    ? [{ value: BUNDLE_MODEL_VALUE, label: "DeepSeek V4.1 Flash (Bundle)" }, ...AVAILABLE_MODELS]
    : AVAILABLE_MODELS;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(() => {
    if (bundleMode) return BUNDLE_MODEL_VALUE;
    const isFree = AVAILABLE_MODELS.some((m) => m.value === defaultModel);
    return isFree ? defaultModel : "openrouter/openrouter/free";
  });
  // Bundle status resolves after mount; once it does, default the picker to the
  // bundle model unless the user already picked something else.
  const prevBundleMode = useRef(bundleMode);
  useEffect(() => {
    if (bundleMode && !prevBundleMode.current && model === "openrouter/openrouter/free") {
      setModel(BUNDLE_MODEL_VALUE);
    }
    prevBundleMode.current = bundleMode;
  }, [bundleMode, model]);
  const [remaining, setRemaining] = useState<number | null>(bundleRemaining);
  useEffect(() => {
    setRemaining(bundleRemaining);
  }, [bundleRemaining]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      // Send the caller's token when signed in — the server needs it to verify
      // entitlement for premium agents and to apply the higher rate limit.
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const res = await fetch(`/api/public/agents/chat?env=${env}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          agent_id: agentId,
          agent_slug: agentSlug,
          messages: newMessages,
          model,
          override_system_prompt: overrideSystemPrompt,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `Request failed (${res.status})`);
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content ?? "" }]);

      // Bundle allowance meter: only a usable bundle-model response spends
      // one conversation. Explicit free-model replies (and free fallbacks)
      // leave the visible counter alone, matching the server-side count.
      if (bundleMode) {
        const returnedModel = typeof data.activeModel === "string" ? data.activeModel : data.model;
        // Bare ids the server reports for the bundle pair (primary +
        // paid fallback); either one spends a weekly conversation.
        const usedBundleModel =
          returnedModel === "deepseek/deepseek-v4.1-flash" ||
          returnedModel === "z-ai/glm-5.3-flash";
        if (data.weeklyAllowanceExhausted) {
          setRemaining(0);
        } else if (
          usedBundleModel &&
          typeof data.content === "string" &&
          data.content.trim().length > 0
        ) {
          setRemaining((r) => (r !== null && r > 0 ? r - 1 : r));
        }
      }

      // Update model selector if a fallback occurred on the backend
      if (data.model) {
        const fullModelName = `openrouter/${data.model}`;
        const hasModel = models.some((m) => m.value === fullModelName);
        if (hasModel && model !== fullModelName) {
          setModel(fullModelName);
          const modelLabel =
            models.find((m) => m.value === fullModelName)?.label ?? "Auto Free";
          toast.info(`Switched to ${modelLabel} (auto-fallback from original model).`);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col rounded-lg border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <div>
            <p className="flex items-center gap-2 text-sm font-medium">
              Chat with {agentName}
              {bundleMode && remaining !== null && (
                <span
                  className={
                    remaining > 0
                      ? "rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary"
                      : "rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
                  }
                >
                  {remaining > 0 ? "Bundle" : "Free tier"}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {bundleMode && remaining !== null ? (
                remaining > 0 ? (
                  <>
                    {remaining} of {bundleAllowance} conversations left · resets Monday
                  </>
                ) : (
                  <>Weekly allowance used — free tier until Monday</>
                )
              ) : (
                <>
                  {messages.length} message{messages.length !== 1 ? "s" : ""}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="w-40">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4" style={{ maxHeight: "60vh" }}>
        {messages.length === 0 && (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Send a message to start chatting with {agentName}.
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {msg.role === "user" ? (
                <User className="h-3.5 w-3.5" />
              ) : (
                <Bot className="h-3.5 w-3.5" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {msg.role === "user" ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <Markdown md={msg.content} />
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted">
              <Bot className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Thinking…
            </div>
          </div>
        )}

        {error && (
          <div className="rounded bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            disabled={loading}
          />
          <Button size="icon" onClick={handleSend} disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Press Enter to send. Model: {model}
        </p>
        <p className="mt-2 text-[9px] leading-relaxed text-muted-foreground border-t border-dashed pt-2">
          ⚠️ <strong>Note:</strong> Free models are subject to rate limits. If a model encounters a
          limit, the system automatically falls back to <em>Auto Free</em>. If you experience
          issues, please select the <strong>Auto Free (OpenRouter)</strong> option manually.
        </p>
      </div>
    </div>
  );
}
