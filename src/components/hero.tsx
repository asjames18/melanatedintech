import { Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ArrowRight, Bot, Loader2, Send, Sparkles, User, Workflow, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const QUICK_QUESTIONS = [
  "What is Melanated in Tech?",
  "Find agents for creators",
  "What are digital products?",
];

const PLATFORM_GUIDE_SYSTEM_PROMPT = `You are the Melanated In Tech platform guide. You help users navigate the site's pillars, agents, products, and articles. Keep your answers warm, professional, concise, and helpful. Suggest specific pages or agents when relevant.

Melanated In Tech has 7 pillars:
1. Agent Marketplace (/agents) - Discover production-grade AI agents for ministries, businesses, sales, support, research, and creators.
2. Knowledge Hub (/knowledge) - Guides, frameworks, and field notes on memory, skills, MCP, multi-agent systems, local AI, and more.
3. Learning Paths (/paths) - Guided paths that connect articles, agents, products, and community prompts into a weekly builder loop.
4. AI Tools (/tools) - Build system prompts with Prompt Pilot and compile custom agent instructions with GPT Trainer instantly.
5. Digital Products (/products) - Starter kits, blueprints, prompt libraries, SOPs, and memory systems to ship agents faster.
6. Services (/services) - Strategy sprints, custom agent builds, and ministry implementations — done with you.
7. Builder Community (/community) - A community for people building, deploying, and benefiting from AI agents.

Be friendly, direct, and focus on practical AI deployment. Keep replies short (under 3 sentences) since you are rendered inside a landing page hero widget.`;

export function Hero() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the Melanated In Tech AI Guide. Ask me anything about our marketplace, learning paths, or digital products!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/public/agents/chat?env=sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          model: "openrouter/openrouter/free",
          override_system_prompt: PLATFORM_GUIDE_SYSTEM_PROMPT,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `Request failed (${res.status})`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content ?? "Sorry, I encountered an issue." },
      ]);
    } catch (e) {
      console.error("[hero-assistant] Error sending message", e);
      toast.error(e instanceof Error ? e.message : "Failed to contact the guide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_20%_18%,color-mix(in_oklch,var(--color-accent)_42%,transparent),transparent_34%),linear-gradient(180deg,var(--color-background),color-mix(in_oklch,var(--color-background)_72%,var(--color-accent)_28%))]">
      <div className="bg-grid absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Build, deploy, and benefit from{" "}
              <span className="text-gradient-brand">AI agents.</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Melanated In Tech is the marketplace, knowledge hub, and build partner for people
              putting AI agents to work - in businesses, ministries, creator studios, and beyond.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/agents"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Browse the agent marketplace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/knowledge"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
              >
                Explore the knowledge hub
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground pt-4">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent2" /> Production-ready agents
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" /> Ministry &amp; business ready
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Workflow className="h-3.5 w-3.5 text-accent2" /> Built by operators, not theorists
              </span>
            </div>
          </div>

          {/* Right Column: AI Guide Chat Interface */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xl overflow-hidden animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-xs font-semibold text-foreground">
                      MIT Assistant
                    </h2>
                    <p className="text-[9px] text-muted-foreground">Platform Guide Agent</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    Online (Free)
                  </span>
                </div>
              </div>

              {/* Message Board */}
              <div
                ref={scrollRef}
                className="h-[280px] overflow-y-auto p-4 space-y-3 flex flex-col text-xs leading-relaxed"
              >
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2.5 max-w-[85%] ${
                      m.role === "user" ? "self-end flex-row-reverse" : "self-start"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-full border text-[10px] ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {m.role === "user" ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3" />
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-3 py-2 ${
                        m.role === "user"
                          ? "bg-primary/10 text-foreground border border-primary/20 rounded-tr-none"
                          : "bg-muted/80 text-foreground border border-border/50 rounded-tl-none"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-2.5 self-start">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground border-border">
                      <Bot className="h-3 w-3" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-2xl bg-muted/80 px-3 py-2 border border-border/50 rounded-tl-none text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Questions Chips */}
              <div className="px-4 pb-2 pt-1 border-t border-border/30 bg-muted/10">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Frequently Asked
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      disabled={loading}
                      className="rounded-full border border-border/70 bg-card px-2.5 py-1 text-[10px] font-medium text-foreground hover:bg-accent hover:border-accent transition-colors disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex items-center gap-2 border-t border-border/60 p-3 bg-muted/20"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask the Guide a question..."
                  disabled={loading}
                  className="h-9 text-xs focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={loading || !input.trim()}
                  className="h-9 w-9 shrink-0"
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
