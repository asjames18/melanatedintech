import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Markdown } from "@/components/markdown";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Send, Loader2, Bot, User, Plus, Trash2, Copy, ArrowDown, Square, RotateCcw, ClipboardCopy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type SavedChat = {
  id: string;
  title: string;
  updated_at: string;
};

type ChatProps = {
  agentId?: string;
  agentSlug?: string;
  agentName: string;
  /**
   * One-line "what this agent does" shown in the empty state, so buyers who
   * switch agents in the workspace see the specialty right in the chat card.
   */
  agentBlurb?: string | null;
  defaultModel: string;
  env?: "sandbox" | "live";
  overrideSystemPrompt?: string;
  /** Bundle redeemer: list the bundle model first, default to it, show allowance. */
  bundleMode?: boolean;
  bundleRemaining?: number | null;
  bundleAllowance?: number;
  /**
   * The workspace header already shows the bundle allowance, so the card can
   * hide its own allowance line on mobile to avoid showing it twice.
   */
  hideAllowanceOnMobile?: boolean;
  /**
   * Entitled (paid) user: persist chats to agent_conversations after each
   * exchange and show the saved-chat history UI. Free users never save.
   */
  saveHistory?: boolean;
  /**
   * Workspace rail: load a saved conversation chosen outside this pane
   * (e.g. from "Recent chats"). { id, nonce } — the nonce retriggers loads.
   */
  externalLoad?: { id: string; nonce: number } | null;
  onExternalLoadHandled?: () => void;
  /**
   * Optional one-tap starter prompts rendered in the empty state, so a
   * first-time buyer never faces a blank box. Null/undefined = plain empty
   * state (agent detail pages don't pass this — their marketing copy already
   * sets the context).
   */
  suggestedPrompts?: string[] | null;
  /**
   * Called after a saved chat is created, updated, or deleted (success
   * only). The workspace passes this to refresh its cross-agent "Recent
   * chats" rail immediately, instead of leaving it stale until the buyer
   * switches agents. Agent detail pages don't pass this — their Chat pane
   * renders its own history strip, which updates locally.
   */
  onHistoryChanged?: () => void;
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
  agentBlurb = null,
  defaultModel,
  env = "sandbox",
  overrideSystemPrompt,
  bundleMode = false,
  bundleRemaining = null,
  bundleAllowance = 200,
  hideAllowanceOnMobile = false,
  saveHistory = false,
  externalLoad = null,
  onExternalLoadHandled,
  suggestedPrompts = null,
  onHistoryChanged,
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
  // Friendly label for the footer line — never the raw provider/model slug.
  const currentModelLabel =
    models.find((m) => m.value === model)?.label ?? model;
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
  // True after the buyer deliberately stops an in-flight reply (via the Stop
  // button) — the user message stays at the end of the thread so Retry below
  // can re-send it, and the error box stays hidden (nothing went wrong).
  const [stopped, setStopped] = useState(false);
  // Aborts the in-flight chat request. The "Thinking…" indicator stays as the
  // activity signal while the send button becomes Stop — the standard chat UX.
  const abortRef = useRef<AbortController | null>(null);
  const stopRequest = () => {
    abortRef.current?.abort();
  };
  // Auto-growing composer: a single-line input is painful for anything past a
  // sentence. Grows up to ~5 rows as the buyer types, then scrolls internally.
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [input]);
  const scrollRef = useRef<HTMLDivElement>(null);
  // True when the user is near the bottom of the thread. Incoming assistant
  // replies only auto-scroll while this holds, so scrolling up to re-read an
  // earlier message never gets yanked away by a late response.
  const stickToBottom = useRef(true);
  // When the user has scrolled up mid-conversation, a "jump to latest" button
  // appears over the thread — otherwise they'd never know new replies arrived
  // below the fold, and had no one-tap way back.
  const [showJumpBtn, setShowJumpBtn] = useState(false);

  const handleThreadScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    setShowJumpBtn(!stickToBottom.current);
  };

  const jumpToLatest = () => {
    const el = scrollRef.current;
    stickToBottom.current = true;
    setShowJumpBtn(false);
    el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  // Keep the scroll pinned to the messages container itself. The old
  // bottomRef.scrollIntoView() scrolled every ancestor too, so a new reply
  // could jump the whole /app pane — and on the agent pages it yanked the
  // page scroll even when the chat card was only half visible.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // Saved-chat history (entitled users only). Everything here fails soft:
  // a storage error must never break or block the chat itself.
  const historyEnabled = saveHistory && !!agentSlug;
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const activeChatIdRef = useRef<string | null>(null);

  const selectChat = (id: string | null) => {
    activeChatIdRef.current = id;
    setActiveChatId(id);
  };

  const startNewChat = () => {
    selectChat(null);
    setMessages([]);
    setInput("");
    setError(null);
    setStopped(false);
  };

  useEffect(() => {
    if (!historyEnabled) return;
    let cancelled = false;
    void (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) return;
        const { data, error } = await supabase
          .from("agent_conversations")
          .select("id, title, updated_at")
          .eq("agent_slug", agentSlug as string)
          .order("updated_at", { ascending: false })
          .limit(25);
        if (!cancelled && !error && data) setSavedChats(data);
      } catch {
        // History is best-effort; the chat works without it.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [historyEnabled, agentSlug]);

  const persistConversation = async (completed: ChatMessage[]) => {
    if (!historyEnabled) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return;
      const activeId = activeChatIdRef.current;
      if (activeId) {
        const { error } = await supabase
          .from("agent_conversations")
          .update({ messages: completed })
          .eq("id", activeId);
        if (!error) {
          setSavedChats((prev) => {
            const current = prev.find((c) => c.id === activeId);
            if (!current) return prev;
            return [
              { ...current, updated_at: new Date().toISOString() },
              ...prev.filter((c) => c.id !== activeId),
            ];
          });
          onHistoryChanged?.();
        }
      } else {
        // Chat titles come from the first user message. Truncate at a word
        // boundary instead of slicing mid-word, so the rail and history
        // chips read like titles instead of cut-off fragments.
        const rawFirst = (completed.find((m) => m.role === "user")?.content ?? "").trim();
        const title =
          rawFirst.length <= 60
            ? rawFirst
            : (() => {
                const cut = rawFirst.slice(0, 60);
                const lastSpace = cut.lastIndexOf(" ");
                return (lastSpace > 20 ? cut.slice(0, lastSpace) : cut) + "…";
              })();
        const { data, error } = await supabase
          .from("agent_conversations")
          .insert({
            user_id: userId,
            agent_slug: agentSlug as string,
            title,
            messages: completed,
          })
          .select("id, title, updated_at")
          .single();
        if (!error && data) {
          selectChat(data.id);
          setSavedChats((prev) => [data, ...prev]);
          onHistoryChanged?.();
        }
      }
    } catch {
      // Saving must never break the chat.
    }
  };

  const loadChat = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("agent_conversations")
        .select("messages")
        .eq("id", id)
        .single();
      if (error || !data) throw new Error("load failed");
      const stored: unknown[] = Array.isArray(data.messages) ? data.messages : [];
      const loaded: ChatMessage[] = [];
      for (const m of stored) {
        const msg = m as ChatMessage | null;
        if (
          msg &&
          (msg.role === "user" || msg.role === "assistant") &&
          typeof msg.content === "string"
        ) {
          loaded.push({ role: msg.role, content: msg.content });
        }
      }
      setMessages(loaded);
      selectChat(id);
      setError(null);
      // A loaded chat is a fresh pane: a stale "Stopped" box from the
      // previous conversation must not linger, and the thread re-pins to the
      // latest message.
      setStopped(false);
      stickToBottom.current = true;
      setShowJumpBtn(false);
    } catch {
      toast.error("Couldn't open that saved chat.");
    }
  };

  // Branded delete confirmation for a saved chat (the native
  // window.confirm is jarring on mobile and off-brand — the admin portal
  // already uses this shared dialog for the same pattern).
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const deleteChat = async (id: string) => {
    try {
      const { error } = await supabase.from("agent_conversations").delete().eq("id", id);
      if (error) throw error;
      setSavedChats((prev) => prev.filter((c) => c.id !== id));
      if (activeChatIdRef.current === id) startNewChat();
      onHistoryChanged?.();
    } catch {
      toast.error("Couldn't delete that chat.");
    }
  };

  // Workspace rail: open a saved chat chosen outside this pane. One-shot per
  // nonce so re-renders don't replay it.
  const externalNonceRef = useRef(0);
  useEffect(() => {
    if (externalLoad && externalLoad.nonce !== externalNonceRef.current) {
      externalNonceRef.current = externalLoad.nonce;
      void (async () => {
        await loadChat(externalLoad.id);
        onExternalLoadHandled?.();
      })();
    }
    // Intentionally one-shot: loadChat is invoked, not tracked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalLoad]);

  // One-tap recovery when a request fails (flaky mobile connections): the
  // user's message is already in the thread, so Retry re-sends the last user
  // message instead of forcing them to retype it.
  const sendMessages = async (base: ChatMessage[], content: string) => {
    const userMessage: ChatMessage = { role: "user", content };
    const newMessages = [...base, userMessage];
    // The user just sent — pin to the bottom so the reply is visible.
    stickToBottom.current = true;
    setShowJumpBtn(false);
    setMessages(newMessages);
    setLoading(true);
    setError(null);
    setStopped(false);
    const controller = new AbortController();
    abortRef.current = controller;

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
        signal: controller.signal,
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
      const completedMessages: ChatMessage[] = [
        ...newMessages,
        { role: "assistant", content: data.content ?? "" },
      ];
      setMessages(completedMessages);
      // Paid users: save the finished exchange. Fire-and-forget (fail soft).
      if (
        historyEnabled &&
        typeof data.content === "string" &&
        data.content.trim().length > 0
      ) {
        void persistConversation(completedMessages);
      }

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
      if (controller.signal.aborted) {
        // Buyer stopped the reply on purpose — not an error. The unanswered
        // user message stays at the end of the thread so Retry can re-send it.
        setStopped(true);
        setError(null);
      } else {
        setError(e instanceof Error ? e.message : "Chat request failed");
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setLoading(false);
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput("");
    void sendMessages(messages, trimmed);
  };

  const handleRetry = () => {
    if (loading || messages.length === 0) return;
    const last = messages[messages.length - 1];
    // Only a bare user message (no assistant reply yet) can be retried.
    if (last.role !== "user") return;
    void sendMessages(messages.slice(0, -1), last.content);
  };

  // One-tap "try that answer again" — a weak reply from a free/bundle model
  // is the most common dead end in chat, and retyping the same question is
  // pure friction. Drops the last assistant reply and re-sends the same user
  // message through the normal path (so bundle counting and history saving
  // stay honest — this is a new send, just like asking again by hand).
  const handleRegenerate = () => {
    if (loading || messages.length < 2) return;
    const last = messages[messages.length - 1];
    const prev = messages[messages.length - 2];
    if (last.role !== "assistant" || prev.role !== "user") return;
    void sendMessages(messages.slice(0, -2), prev.content);
  };

  // One-tap empty-state starter: fires the prompt as the user's first message.
  const sendPrompt = (text: string) => {
    if (loading || messages.length > 0) return;
    void sendMessages(messages, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Never hijack Enter while an IME composition is in progress.
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Buyers copy agent output into their own work — make it one tap, including
  // on mobile where selecting bubble text is painful. Fails soft with a toast.
  const copyMessage = (text: string) => {
    void (async () => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
      } catch {
        toast.error("Couldn't copy that message.");
      }
    })();
  };

  // One-tap whole-transcript copy: free-tier buyers on the agent pages
  // have no saved history, so this is their only way to keep a conversation.
  // Reuses copyMessage (clipboard + toast, fails soft).
  const copyConversation = () => {
    if (messages.length === 0 || loading) return;
    const transcript = messages
      .map((m) => `${m.role === "user" ? "You" : agentName}: ${m.content}`)
      .join("\n\n");
    copyMessage(transcript);
  };

  return (
    <div className="flex flex-col rounded-lg border bg-card">
      {/* Header — on mobile the model picker wraps to its own row so the
          title never collides with the badge or the dropdown. */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-4 py-2 sm:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Bot className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-medium">
              <span className="truncate">Chat with {agentName}</span>
              {bundleMode && remaining !== null && (
                <span
                  className={
                    remaining > 0
                      ? "shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary"
                      : "shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
                  }
                >
                  {remaining > 0 ? "Bundle" : "Free tier"}
                </span>
              )}
            </p>
            <p
              className={
                "text-xs text-muted-foreground" +
                (hideAllowanceOnMobile && bundleMode && remaining !== null
                  ? " hidden md:block"
                  : "")
              }
            >
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
        <div className="flex w-full shrink-0 items-center gap-1 sm:w-auto">
          <button
            type="button"
            onClick={copyConversation}
            disabled={messages.length === 0 || loading}
            aria-label="Copy conversation"
            title="Copy conversation"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            <ClipboardCopy className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1 sm:w-40">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="h-8 text-xs" aria-label="Model">
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
      </div>

      {/* Saved-chat history (paid users only) */}
      {historyEnabled && (
        <div className="flex items-center gap-2 overflow-x-auto border-b px-4 py-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0 text-xs md:h-7"
            onClick={startNewChat}
          >
            <Plus className="mr-1 h-3 w-3" /> New chat
          </Button>
          {savedChats.length === 0 ? (
            <span className="text-xs text-muted-foreground">
              Your chats with {agentName} are saved here automatically.
            </span>
          ) : (
            savedChats.map((chat) => (
              <div
                key={chat.id}
                className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-xs ${
                  chat.id === activeChatId ? "border-primary bg-primary/10" : "bg-muted/50"
                }`}
              >
                <button
                  type="button"
                  className="flex items-center gap-1.5"
                  onClick={() => void loadChat(chat.id)}
                >
                  <span className="max-w-[10rem] truncate font-medium">
                    {chat.title || "Untitled chat"}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(chat.updated_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Delete saved chat"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteTarget(chat.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete this saved chat?"
            description="This can't be undone."
            confirmLabel="Delete chat"
            destructive
            onConfirm={() => {
              if (deleteTarget) void deleteChat(deleteTarget);
              setDeleteTarget(null);
            }}
          />
        </div>
      )}

      {/* Messages — taller on phones (dvh tracks the iOS browser chrome) so
          the conversation gets the vertical room the compacted header freed.
          role="log" is the ARIA pattern for chat histories: screen readers
          announce new replies as they arrive without us managing live regions.
          The relative wrapper anchors the jump-to-latest button over the thread. */}
      <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={handleThreadScroll}
        role="log"
        aria-label={`${agentName} conversation`}
        className="max-h-[65dvh] min-h-0 flex-1 space-y-4 overflow-y-auto p-4 md:max-h-[60vh]"
      >
        {messages.length === 0 && (
          <div className="flex min-h-24 flex-col items-center justify-center gap-1 px-4 py-4 text-center text-sm text-muted-foreground sm:min-h-32">
            <p>Send a message to start chatting with {agentName}.</p>
            {agentBlurb && <p className="text-xs">{agentBlurb}</p>}
            {suggestedPrompts && suggestedPrompts.length > 0 && (
              <div className="mt-3 flex max-w-md flex-wrap items-center justify-center gap-2">
                {suggestedPrompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => sendPrompt(p)}
                    className="shrink-0 rounded-full border bg-muted/50 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
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
              className={`min-w-0 max-w-[80%] break-words rounded-lg px-3 py-2 text-sm ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {msg.role === "user" ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <Markdown md={msg.content} />
              )}
              {msg.role === "assistant" && (
                <div className="mt-1.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyMessage(msg.content)}
                    className="flex min-h-[32px] items-center gap-1 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                    aria-label="Copy assistant message"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                  {i === messages.length - 1 && !loading && !error && !stopped && (
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      className="flex min-h-[32px] items-center gap-1 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                      aria-label="Regenerate response"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Regenerate
                    </button>
                  )}
                </div>
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
          <div
            role="alert"
            className="flex items-center justify-between gap-2 rounded bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            <span className="min-w-0 break-words">{error}</span>
            {!loading &&
              messages.length > 0 &&
              messages[messages.length - 1].role === "user" && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="shrink-0 rounded border border-destructive/30 px-2.5 py-1 text-xs font-medium hover:bg-destructive/10"
                >
                  Retry
                </button>
              )}
          </div>
        )}

        {/* Buyer stopped the reply: neutral re-send offer, not the red
            error treatment — nothing went wrong. Only while the unanswered
            user message is still last. */}
        {stopped && !loading && !error && messages.length > 0 &&
          messages[messages.length - 1].role === "user" && (
          <div className="flex items-center justify-between gap-2 rounded bg-muted px-3 py-2 text-sm text-muted-foreground">
            <span>Stopped — your message is still here.</span>
            <button
              type="button"
              onClick={handleRetry}
              className="shrink-0 rounded border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-background"
            >
              Retry
            </button>
          </div>
        )}

        {showJumpBtn && (
          <button
            type="button"
            onClick={jumpToLatest}
            aria-label="Jump to latest message"
            className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border bg-card px-3 py-2 text-xs font-medium shadow-lg hover:bg-muted"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            Latest
          </button>
        )}
      </div>
      </div>

      {/* Input — multiline composer: Enter sends, Shift+Enter adds a line.
          enterKeyHint="send" gives phone keyboards a Send key; on desktop the
          hint line below explains the keys. */}
      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            aria-label={`Message ${agentName}`}
            enterKeyHint="send"
            rows={1}
            disabled={loading}
            className="min-h-[40px] resize-none"
          />
          <Button
            size="icon"
            onClick={loading ? stopRequest : handleSend}
            disabled={!loading && !input.trim()}
            aria-label={loading ? "Stop response" : "Send message"}
          >
            {loading ? (
              <Square className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          <span className="pointer-coarse:hidden">
            Press Enter to send · Shift+Enter for a new line.{" "}
          </span>
          Model: {currentModelLabel}
        </p>
        <p className="mt-2 hidden border-t border-dashed pt-2 text-[9px] leading-relaxed text-muted-foreground md:block">
          ⚠️ <strong>Note:</strong> Free models are subject to rate limits. If a model encounters a
          limit, the system automatically falls back to <em>Auto Free</em>. If you experience
          issues, please select the <strong>Auto Free (OpenRouter)</strong> option manually.
        </p>
        {/* Mobile: the same note collapsed behind a toggle so it stops eating
            vertical space on phones. */}
        <details className="mt-2 border-t border-dashed pt-2 text-[11px] text-muted-foreground md:hidden">
          <summary className="cursor-pointer font-medium">
            ⚠️ Free models can hit rate limits
          </summary>
          <p className="mt-1 leading-relaxed">
            If a model hits a limit, the system falls back to <em>Auto Free</em> automatically —
            or select <strong>Auto Free (OpenRouter)</strong> manually.
          </p>
        </details>
      </div>
    </div>
  );
}
