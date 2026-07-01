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
};

const AVAILABLE_MODELS = [
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
}: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(() => {
    const isFree = AVAILABLE_MODELS.some((m) => m.value === defaultModel);
    return isFree ? defaultModel : "openrouter/openrouter/free";
  });
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
      const res = await fetch(`/api/public/agents/chat?env=${env}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      // Update model selector if a fallback occurred on the backend
      if (data.model) {
        const fullModelName = `openrouter/${data.model}`;
        const hasModel = AVAILABLE_MODELS.some((m) => m.value === fullModelName);
        if (hasModel && model !== fullModelName) {
          setModel(fullModelName);
          const modelLabel =
            AVAILABLE_MODELS.find((m) => m.value === fullModelName)?.label ?? "Auto Free";
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
            <p className="text-sm font-medium">Chat with {agentName}</p>
            <p className="text-xs text-muted-foreground">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="w-40">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_MODELS.map((m) => (
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
