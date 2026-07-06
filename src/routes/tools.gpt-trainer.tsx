import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Copy, Download, Sparkles, Upload, RotateCcw } from "lucide-react";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { Chat } from "@/components/agents/Chat";

import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";

const searchSchema = z.object({
  knowledge: z.string().optional(),
});

export const Route = createFileRoute("/tools/gpt-trainer")({
  validateSearch: zodValidator(searchSchema),
  head: () => {
    const seo = buildSeoMeta({
      title: "GPT Trainer — Melanated In Tech",
      description:
        "Build custom GPT system instructions using role, tone, knowledge, and style examples.",
      url: "/tools/gpt-trainer",
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "AI Tools", path: "/tools" },
            { name: "GPT Trainer", path: "/tools/gpt-trainer" },
          ]),
        ),
      ],
    };
  },
  component: GptTrainerPage,
});

interface QaPair {
  id: string;
  question: string;
  answer: string;
}

const ROLES = [
  "Copywriter",
  "Software Engineer",
  "Executive Assistant",
  "Ministry Advisor",
  "Tutor / Educator",
  "Customer Support Agent",
  "Academic Researcher",
  "Creative Writer",
  "Custom",
];

const TONES = [
  "Professional",
  "Casual / Friendly",
  "Academic / Analytical",
  "Empathetic / Supportive",
  "Humorous / Playful",
  "Enthusiastic / Inspirational",
  "Direct / Concise",
];

function GptTrainerPage() {
  const { knowledge: initialKnowledge } = Route.useSearch();
  const [role, setRole] = useState("Copywriter");
  const [customRole, setCustomRole] = useState("");
  const [tone, setTone] = useState("Professional");
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [knowledge, setKnowledge] = useState(initialKnowledge ?? "");
  const [qaPairs, setQaPairs] = useState<QaPair[]>([]);
  const [testing, setTesting] = useState(false);

  // Derived compiled instructions
  const compiledPrompt = useMemo(() => {
    const activeRole = role === "Custom" ? customRole.trim() || "AI Assistant" : role;
    let prompt = `You are a ${activeRole} with a ${tone.toLowerCase()} tone.`;

    if (topics.length > 0) {
      prompt += ` Your expertise focuses on: ${topics.join(", ")}.`;
    }

    if (knowledge.trim()) {
      prompt += `\n\nHere is your knowledge base:\n${knowledge.trim()}\n`;
    }

    // Filter out incomplete Q&A pairs
    const validPairs = qaPairs.filter((p) => p.question.trim() && p.answer.trim());
    if (validPairs.length > 0) {
      prompt += `\n\nPlease respond in the following style based on these examples:\n`;
      validPairs.forEach((qa) => {
        prompt += `\nUser: ${qa.question.trim()}\nYou: ${qa.answer.trim()}\n`;
      });
    }

    prompt += `\n\nNow, please respond to the user's questions based on the knowledge provided and the style demonstrated in the examples.`;
    return prompt;
  }, [role, customRole, tone, topics, knowledge, qaPairs]);

  const handleAddTopic = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const clean = topicInput.replace(/,/g, "").trim();
      if (clean && !topics.includes(clean)) {
        setTopics([...topics, clean]);
        toast.success(`Expertise added: ${clean}`);
      }
      setTopicInput("");
    }
  };

  const handleRemoveTopic = (item: string) => {
    setTopics(topics.filter((t) => t !== item));
  };

  const handleAddQaPair = () => {
    setQaPairs([
      ...qaPairs,
      {
        id: crypto.randomUUID(),
        question: "",
        answer: "",
      },
    ]);
  };

  const handleRemoveQaPair = (id: string) => {
    setQaPairs(qaPairs.filter((pair) => pair.id !== id));
  };

  const handleUpdateQaPair = (id: string, field: "question" | "answer", value: string) => {
    setQaPairs(
      qaPairs.map((pair) => {
        if (pair.id === id) {
          return { ...pair, [field]: value };
        }
        return pair;
      }),
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledPrompt).then(
      () => toast.success("Instructions copied to clipboard!"),
      () => toast.error("Failed to copy instructions."),
    );
  };

  const handleDownload = () => {
    const blob = new Blob([compiledPrompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const filename = `custom-${(role === "Custom" ? customRole : role)
      .toLowerCase()
      .replace(/\s+/g, "-")}-system-prompt.txt`;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all GPT settings?")) {
      setRole("Copywriter");
      setCustomRole("");
      setTone("Professional");
      setTopics([]);
      setTopicInput("");
      setKnowledge("");
      setQaPairs([]);
      toast.info("GPT configuration reset.");
    }
  };

  // Plain Text Knowledge Uploader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setKnowledge(String(event.target.result));
          toast.success(`Successfully uploaded knowledge file: ${file.name}`);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Interactive Tools"
        title="GPT Trainer."
        description="Compile customized system instructions for custom GPT agents. Define the agent's role, tone, knowledge documents, and fine-tune its output format with Q&A style examples."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Input Settings (Col-span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="font-display text-xl font-bold">Trainer Settings</CardTitle>
                  <CardDescription>Configure your agent's persona and rules</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="gap-1 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset Form
                </Button>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Role configuration */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="role-select" className="text-xs font-semibold">
                      System Role
                    </Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger id="role-select">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {role === "Custom" && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <Label htmlFor="custom-role" className="text-xs font-semibold">
                        Custom Role Title
                      </Label>
                      <Input
                        id="custom-role"
                        placeholder="e.g. Technical SEO Advisor"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Tone configuration */}
                <div className="space-y-1.5">
                  <Label htmlFor="tone-select" className="text-xs font-semibold">
                    Output Tone / Persona
                  </Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="tone-select">
                      <SelectValue placeholder="Select Tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Topics / Expertise tags */}
                <div className="space-y-2">
                  <Label htmlFor="topic-input" className="text-xs font-semibold">
                    Expertise / Focus Areas
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id="topic-input"
                      placeholder="Type focus area and press Enter..."
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onKeyDown={handleAddTopic}
                    />
                    {topics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {topics.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 rounded bg-secondary text-secondary-foreground text-xs px-2 py-0.5 font-medium border border-border"
                          >
                            {t}
                            <button
                              onClick={() => handleRemoveTopic(t)}
                              className="text-muted-foreground hover:text-foreground font-bold"
                              aria-label={`Remove ${t}`}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Knowledge Base */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="knowledge-input" className="text-xs font-semibold">
                      Knowledge Base (Reference Material)
                    </Label>
                    <div className="relative cursor-pointer">
                      <input
                        type="file"
                        accept=".txt,.md,.json"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-[120px]"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1 text-[11px] pointer-events-none"
                      >
                        <Upload className="h-3 w-3" /> Upload Text
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    id="knowledge-input"
                    placeholder="Paste guidelines, FAQs, mission statements, data lists, or references here for the GPT to draw facts from..."
                    value={knowledge}
                    onChange={(e) => setKnowledge(e.target.value)}
                    className="min-h-[140px] resize-y"
                  />
                </div>

                {/* Dynamic Q&A Style Examples */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-semibold block">
                        Q&A Examples (Few-Shot Training)
                      </Label>
                      <span className="text-[10px] text-muted-foreground leading-normal block">
                        Show the model your desired format by writing sample question/answer pairs.
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddQaPair}
                      className="gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Example
                    </Button>
                  </div>

                  {qaPairs.length === 0 ? (
                    <p className="text-center text-xs text-muted-foreground py-6 border border-dashed rounded-lg">
                      No style examples added yet. Add one to fine-tune the GPT's format.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {qaPairs.map((qa, index) => (
                        <div
                          key={qa.id}
                          className="p-3 border border-border rounded-lg bg-muted/20 relative space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">
                              Example Pair #{index + 1}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveQaPair(qa.id)}
                              aria-label="Remove pair"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold text-foreground/80">
                              User Query
                            </Label>
                            <Input
                              placeholder="e.g. Write a headline for a coffee shop"
                              value={qa.question}
                              onChange={(e) =>
                                handleUpdateQaPair(qa.id, "question", e.target.value)
                              }
                              className="text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold text-foreground/80">
                              Ideal Agent Response
                            </Label>
                            <Textarea
                              placeholder="e.g. Wake up and smell the fresh-brewed magic."
                              value={qa.answer}
                              onChange={(e) => handleUpdateQaPair(qa.id, "answer", e.target.value)}
                              className="min-h-[60px] text-xs resize-y"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Compiled Instructions Preview (Col-span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border border-border bg-card shadow-sm sticky top-20">
              <CardHeader>
                <CardTitle className="font-display text-xl font-bold flex items-center gap-1.5">
                  <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  System Instructions
                </CardTitle>
                <CardDescription>Compiled system prompt ready for copy/deploy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/40 p-3 min-h-[300px] max-h-[480px] overflow-y-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-all">
                  {compiledPrompt}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
                    <Download className="h-4 w-4" />
                    Download Prompt
                  </Button>
                  <Button onClick={handleCopy} size="sm" className="gap-1.5">
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                </div>

                <Button
                  onClick={() => setTesting(!testing)}
                  variant={testing ? "destructive" : "secondary"}
                  size="sm"
                  className="w-full gap-1.5 border border-border"
                >
                  <Sparkles className="h-4 w-4" />
                  {testing ? "Close Agent Test" : "Test Agent Instantly"}
                </Button>

                {testing && (
                  <div className="pt-4 border-t border-border animate-in fade-in duration-300">
                    <Chat
                      agentName={role === "Custom" ? customRole || "Custom Agent" : role}
                      defaultModel="openrouter/openrouter/free"
                      overrideSystemPrompt={compiledPrompt}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
