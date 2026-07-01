import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useMemo, useRef } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  listMyPrompts,
  upsertPrompt,
  deletePrompt,
  PROMPT_CATEGORIES,
} from "@/lib/prompts.functions";
import { toast } from "sonner";
import {
  Search,
  Copy,
  Download,
  Trash2,
  Wand2,
  Bookmark,
  Share2,
  AlertTriangle,
  Upload,
  Timer,
  Sparkles,
} from "lucide-react";
import { Chat } from "@/components/agents/Chat";
import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/tools/prompt-pilot")({
  head: () => ({
    ...buildSeoMeta({
      title: "Prompt Pilot — Melanated In Tech",
      description: "Interactive drag-and-drop prompt builder and template catalog.",
      url: "/tools/prompt-pilot",
    }),
  }),
  component: PromptPilotPage,
});

interface LocalPrompt {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

const PREDEFINED_PROMPTS = [
  // Learning Prompts
  {
    title: "Teach Me a Concept",
    category: "Learning",
    description: "Explains topics in simple terms with examples and analogies",
    content: "Explain [TOPIC] in simple terms for a beginner. Include examples and analogies.",
  },
  {
    title: "Study Plan Generator",
    category: "Learning",
    description: "Creates structured study plans with goals and resources",
    content: "Create a 4-week study plan for learning [SUBJECT] with weekly goals and resources.",
  },
  {
    title: "Quiz Me",
    category: "Learning",
    description: "Generates quizzes with multiple-choice answers and explanations",
    content: "Give me a 10-question quiz on [TOPIC] with multiple-choice answers and explanations.",
  },
  // Writing Prompts
  {
    title: "Blog Post Template",
    category: "Writing",
    description: "Creates structured blog posts with specific tone and audience",
    content:
      "Act as a content marketer. Write a 600-word blog post on [TOPIC] for [AUDIENCE] in a [TONE] tone. Include intro, body, and conclusion.",
  },
  {
    title: "Book Chapter Outline",
    category: "Writing",
    description: "Creates comprehensive book outlines for non-fiction works",
    content:
      "Act as a book editor. Create a 10-chapter outline for a non-fiction book about [TOPIC] targeting [AUDIENCE].",
  },
  // Creative Prompts
  {
    title: "X/Twitter Thread Generator",
    category: "Creative",
    description: "Creates engaging tweet threads with educational content",
    content:
      "Write a 7-tweet thread explaining [TOPIC] in a way that educates and grabs attention. Use a casual tone and include emojis and a CTA.",
  },
  {
    title: "Viral Post Hook",
    category: "Creative",
    description: "Generates attention-grabbing hooks for social media posts",
    content:
      "Give me 5 hook lines to start a viral post about [TOPIC] for [PLATFORM] (e.g., X, TikTok, Facebook). Target [AUDIENCE].",
  },
  // Business Prompts
  {
    title: "Landing Page Copy",
    category: "Business",
    description: "Creates compelling landing page content with clear CTAs",
    content:
      "Act as a copywriter. Write a landing page for [PRODUCT/SERVICE] targeting [AUDIENCE]. Include headline, subheadline, 3 benefits, and a CTA.",
  },
  {
    title: "Elevator Pitch",
    category: "Business",
    description: "Creates concise and persuasive business pitches",
    content:
      "Write a 30-second elevator pitch for [BUSINESS/IDEA] that's clear and persuasive for investors or potential partners.",
  },
  // Career Prompts
  {
    title: "Resume Bullet Points",
    category: "Career",
    description: "Creates impactful resume bullet points with achievements",
    content:
      "Create 5 strong resume bullet points for a [JOB TITLE] with experience in [SKILLS/TOOLS]. Use action verbs and quantify achievements.",
  },
  {
    title: "LinkedIn Summary Generator",
    category: "Career",
    description: "Creates professional LinkedIn summaries for transitions",
    content:
      "Write a professional, engaging LinkedIn summary for someone with experience in [INDUSTRY] who wants to transition into [NEW FIELD].",
  },
  // Technical Prompts
  {
    title: "Code Explanation",
    category: "Technical",
    description: "Explains code in beginner-friendly terms",
    content:
      "Explain what this code does and how it works: [PASTE CODE]. Include beginner-friendly explanations.",
  },
  {
    title: "Learn to Code Plan",
    category: "Technical",
    description: "Creates structured learning plans for coding languages",
    content:
      "Create a 30-day plan to learn [LANGUAGE] from scratch. Break it into daily exercises and include project ideas.",
  },
  // Email Prompts
  {
    title: "Email Newsletter Template",
    category: "Email",
    description: "Creates structured email newsletters with clear CTAs",
    content:
      "Act as an email marketing specialist. Write a 300-word newsletter about [TOPIC] for [AUDIENCE] that includes:\n- Subject line (under 50 characters)\n- Personalized greeting\n- Hook\n- 2-3 paragraph body\n- 1 clear CTA\n- Sign-off.",
  },
  {
    title: "Cold Outreach Email",
    category: "Email",
    description: "Creates concise cold emails with clear benefits",
    content:
      "Write a cold email to [TARGET] offering [SOLUTION]. Keep it under 150 words, with a clear benefit and call to action.",
  },
  // Faith Prompts
  {
    title: "Devotional Writing",
    category: "Faith",
    description: "Creates structured devotionals with scripture and prayer",
    content:
      "Write a 5-minute devotional based on [SCRIPTURE], including reflection, takeaway, and a closing prayer.",
  },
  // Planning Prompts
  {
    title: "Personal Goal Planner",
    category: "Planning",
    description: "Creates detailed 90-day action plans for personal goals",
    content:
      "Create a 90-day action plan to achieve my goal of [GOAL], broken into weekly tasks and milestones.",
  },
  {
    title: "Morning Routine Design",
    category: "Planning",
    description: "Creates balanced morning routines for focus",
    content:
      "Design a morning routine for someone who wants to be more productive, focused, and spiritually aligned.",
  },
];

const CATEGORIES = [
  "All",
  "Learning",
  "Writing",
  "Creative",
  "Business",
  "Career",
  "Technical",
  "Email",
  "Faith",
  "Planning",
];

const BLOCKS = [
  {
    label: "Role Definition",
    template: "Act as a [role] who [key characteristics].\n\n",
    colorClass:
      "bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-300",
  },
  {
    label: "Task Description",
    template: "Your task is to [specific action] with [details about requirements].\n\n",
    colorClass:
      "bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100 dark:bg-purple-950/20 dark:border-purple-900 dark:text-purple-300",
  },
  {
    label: "Format Instructions",
    template:
      "Format your response as:\n1. [First section]\n2. [Second section]\n3. [Third section]\n\n",
    colorClass:
      "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100 dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-300",
  },
  {
    label: "Examples",
    template: "Example input: [sample input]\nExpected output: [sample output]\n\n",
    colorClass:
      "bg-green-50 border-green-200 text-green-800 hover:bg-green-100 dark:bg-green-950/20 dark:border-green-900 dark:text-green-300",
  },
  {
    label: "Constraints",
    template: "Constraints:\n- [First constraint]\n- [Second constraint]\n- [Third constraint]\n\n",
    colorClass:
      "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-300",
  },
];

function PromptPilotPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const listFn = useServerFn(listMyPrompts);
  const saveFn = useServerFn(upsertPrompt);
  const deleteFn = useServerFn(deletePrompt);

  const [signedIn, setSignedIn] = useState(false);
  const [promptName, setPromptName] = useState("");
  const [promptContent, setPromptContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDragOver, setIsDragOver] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [testing, setTesting] = useState(false);

  // Save fields
  const [saveCategory, setSaveCategory] = useState<string>("Other");
  const [saveIsPublic, setSaveIsPublic] = useState(false);
  const [saveTagsString, setSaveTagsString] = useState("");

  // Local storage personal prompts
  const [localPrompts, setLocalPrompts] = useState<LocalPrompt[]>([]);

  // Monitor Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));

    // Load local prompts
    const local = localStorage.getItem("mit_prompt_pilot_personal");
    if (local) {
      try {
        setLocalPrompts(JSON.parse(local));
      } catch (e) {
        console.error("Error loading local prompts", e);
      }
    }

    return () => sub.subscription.unsubscribe();
  }, []);

  // Fetch private library if logged in
  const { data: dbPrompts, isLoading: dbLoading } = useQuery({
    queryKey: ["my-prompts"],
    queryFn: () => listFn(),
    enabled: signedIn,
  });

  const saveMutation = useMutation({
    mutationFn: (vars: {
      id?: string;
      title: string;
      content: string;
      category?: string;
      tags?: string[];
      is_public?: boolean;
    }) => saveFn({ data: vars as any }),
    onSuccess: () => {
      toast.success("Prompt saved to database successfully.");
      setPromptName("");
      setSaveDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["my-prompts"] });
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Prompt removed from database.");
      qc.invalidateQueries({ queryKey: ["my-prompts"] });
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  // Filter templates list
  const filteredTemplates = useMemo(() => {
    return PREDEFINED_PROMPTS.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const handleBlockClick = (template: string) => {
    setPromptContent((c) => c + template);
  };

  const handleTemplateClick = (content: string, title: string) => {
    setPromptContent(content);
    setPromptName(title);
    toast.info(`Loaded prompt: ${title}`);
  };

  const handleCopy = () => {
    if (!promptContent.trim()) {
      toast.warning("Please enter or generate prompt content first.");
      return;
    }
    navigator.clipboard.writeText(promptContent).then(
      () => toast.success("Prompt copied to clipboard!"),
      () => toast.error("Failed to copy prompt."),
    );
  };

  const handleDownload = () => {
    if (!promptContent.trim()) {
      toast.warning("Please enter some prompt content to download.");
      return;
    }
    const blob = new Blob([promptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${promptName.trim() || "prompt-pilot-compiled"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  };

  const handleClear = () => {
    setPromptName("");
    setPromptContent("");
  };

  const handleSendToGPT = () => {
    if (!promptContent.trim()) {
      toast.warning("Please write or build a prompt first.");
      return;
    }
    navigator.clipboard.writeText(promptContent).then(() => {
      window.open(
        "https://chatgpt.com/g/g-6838be4cf9748191a4decfdd6a97c5c8-prompt-pilot-gpt",
        "_blank",
      );
      toast.success("Prompt copied! Opening ChatGPT Prompt Pilot GPT...");
    });
  };

  const handleSendToGptTrainer = () => {
    if (!promptContent.trim()) {
      toast.warning("Please write or build a prompt first.");
      return;
    }
    navigate({
      to: "/tools/gpt-trainer",
      search: {
        knowledge: promptContent,
      },
    });
    toast.success("Prompt sent! Preloaded into GPT Trainer knowledge base.");
  };

  const handleSendToPlayground = () => {
    if (!promptContent.trim()) {
      toast.warning("Please write or build a prompt first.");
      return;
    }
    navigate({
      to: "/tools/model-playground",
      search: {
        systemPrompt: promptContent,
      },
    });
    toast.success("Prompt loaded into Model Playground!");
  };

  // Save handling
  const handleSave = () => {
    if (!promptName.trim() || !promptContent.trim()) {
      toast.warning("Please enter both a title and prompt content.");
      return;
    }

    if (signedIn) {
      // Open dialog for DB metadata options
      setSaveDialogOpen(true);
    } else {
      // Save locally
      const newItem: LocalPrompt = {
        id: crypto.randomUUID(),
        title: promptName,
        content: promptContent,
        category: "Other",
        created_at: new Date().toISOString(),
      };
      const updated = [newItem, ...localPrompts];
      setLocalPrompts(updated);
      localStorage.setItem("mit_prompt_pilot_personal", JSON.stringify(updated));
      toast.success("Prompt saved locally. Sign in to sync to cloud.");
      handleClear();
    }
  };

  const handleDBSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = saveTagsString
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    saveMutation.mutate({
      title: promptName,
      content: promptContent,
      category: saveCategory as any,
      is_public: saveIsPublic,
      tags,
    });
  };

  const handleDeleteLocal = (id: string) => {
    const updated = localPrompts.filter((p) => p.id !== id);
    setLocalPrompts(updated);
    localStorage.setItem("mit_prompt_pilot_personal", JSON.stringify(updated));
    toast.success("Local prompt deleted.");
  };

  // Drag and Drop Text/File Readers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPromptContent((c) => c + String(event.target?.result));
          toast.success(`Imported text from file: ${file.name}`);
        }
      };
      reader.readAsText(file);
    } else {
      const text = e.dataTransfer.getData("text/plain");
      if (text) {
        setPromptContent((c) => c + text);
        toast.success("Dropped text appended.");
      }
    }
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Interactive Tools"
        title="Prompt Pilot."
        description="Craft, perfect, and organize prompts with a drag-and-drop builder, dynamic component blocks, and pre-packaged library templates."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Prompt Builder (Col-span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="font-display text-xl font-bold">Prompt Builder</CardTitle>
                  <CardDescription>Assemble custom prompts block-by-block</CardDescription>
                </div>
                {!signedIn && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400">
                    <AlertTriangle className="h-3 w-3" />
                    Local Mode
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prompt-name" className="text-sm font-semibold">
                    Prompt Title
                  </Label>
                  <Input
                    id="prompt-name"
                    placeholder="Name your custom prompt..."
                    value={promptName}
                    onChange={(e) => setPromptName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prompt-textarea" className="text-sm font-semibold">
                      Prompt Template
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      Supports drag & drop text/files
                    </span>
                  </div>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative rounded-lg border-2 border-dashed p-1 transition-all ${
                      isDragOver
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/35"
                    }`}
                  >
                    <Textarea
                      id="prompt-textarea"
                      placeholder="Click blocks below or type your prompt contents here... drag text or file attachments to drop them in."
                      value={promptContent}
                      onChange={(e) => setPromptContent(e.target.value)}
                      className="min-h-[220px] border-none resize-y focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>

                {/* Blocks */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Quick Component Blocks (Click to append)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {BLOCKS.map((b) => (
                      <button
                        key={b.label}
                        onClick={() => handleBlockClick(b.template)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${b.colorClass}`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Operations */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" onClick={handleClear}>
                    Clear
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSave} className="gap-1.5">
                    <Bookmark className="h-4 w-4" />
                    Save Library
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
                    <Download className="h-4 w-4" />
                    Download TXT
                  </Button>
                  <Button onClick={handleCopy} size="sm" className="gap-1.5">
                    <Copy className="h-4 w-4" />
                    Copy Prompt
                  </Button>
                  <Button
                    onClick={handleSendToGPT}
                    variant="secondary"
                    size="sm"
                    className="gap-1.5 border border-border"
                  >
                    <Share2 className="h-4 w-4" />
                    Send to Custom GPT
                  </Button>
                  <Button
                    onClick={handleSendToGptTrainer}
                    variant="secondary"
                    size="sm"
                    className="gap-1.5 border border-border"
                  >
                    <Sparkles className="h-4 w-4" />
                    Send to GPT Trainer
                  </Button>
                  <Button
                    onClick={handleSendToPlayground}
                    variant="secondary"
                    size="sm"
                    className="gap-1.5 border border-border"
                  >
                    <Timer className="h-4 w-4" />
                    Test in Playground
                  </Button>
                  <Button
                    onClick={() => setTesting(!testing)}
                    variant={testing ? "destructive" : "secondary"}
                    size="sm"
                    className="gap-1.5 border border-border"
                  >
                    <Wand2 className="h-4 w-4" />
                    {testing ? "Close Chat Test" : "Chat with Prompt"}
                  </Button>
                </div>

                {testing && (
                  <div className="pt-4 border-t border-border animate-in fade-in duration-300">
                    <Chat
                      agentName={promptName.trim() || "Prompt Pilot Agent"}
                      defaultModel="openrouter/openrouter/free"
                      overrideSystemPrompt={promptContent}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="font-display text-sm font-semibold">Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>
                  1. **Specify a clear persona**: Describe exactly *who* the AI should act as (e.g.
                  "Expert Copywriter specializing in direct response marketing").
                </p>
                <p>
                  2. **Format variables clearly**: Use placeholder markers like `[TOPIC]` or
                  `[AUDIENCE]` in your prompts so they remain easily reusable.
                </p>
                <p>
                  3. **Provide examples (Few-shot prompting)**: Showing the AI 1 or 2 examples of
                  your preferred outputs dramatically increases output consistency.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Predefined & Private Prompts (Col-span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-xl font-bold">Prompts Library</CardTitle>
                <CardDescription>Explore ready-to-use template launching guides</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1 max-h-[85px] overflow-y-auto pr-1">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                        selectedCategory === c
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "bg-secondary text-secondary-foreground hover:bg-muted"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {filteredTemplates.length === 0 ? (
                    <p className="text-center text-xs text-muted-foreground py-6">
                      No matching templates found.
                    </p>
                  ) : (
                    filteredTemplates.map((item) => (
                      <div
                        key={item.title}
                        onClick={() => handleTemplateClick(item.content, item.title)}
                        className="group flex flex-col items-start gap-1.5 rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-foreground/15 hover:bg-muted/30 cursor-pointer"
                      >
                        <div className="flex w-full items-center justify-between">
                          <h4 className="text-sm font-semibold text-foreground group-hover:text-primary">
                            {item.title}
                          </h4>
                          <span className="rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 text-[10px] px-1.5 py-0.5 font-medium">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Saved Library (Tabbed) */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg font-semibold flex items-center gap-1.5">
                  <Bookmark className="h-4.5 w-4.5" />
                  Your Saved Prompts
                </CardTitle>
                <CardDescription>
                  Access prompts saved in local browser or linked cloud
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={signedIn ? "cloud" : "local"}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="local">Local Saved ({localPrompts.length})</TabsTrigger>
                    <TabsTrigger value="cloud">Cloud Sync</TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="local"
                    className="space-y-2 mt-4 max-h-[220px] overflow-y-auto"
                  >
                    {localPrompts.length === 0 ? (
                      <p className="text-center text-xs text-muted-foreground py-8 border border-dashed rounded-lg">
                        No prompts saved locally.
                      </p>
                    ) : (
                      localPrompts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between border border-border rounded-lg p-2.5 hover:bg-muted/40 transition-colors"
                        >
                          <div
                            onClick={() => handleTemplateClick(p.content, p.title)}
                            className="flex-1 cursor-pointer"
                          >
                            <h5 className="text-sm font-semibold text-foreground">{p.title}</h5>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                              {p.content}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                            onClick={() => handleDeleteLocal(p.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="cloud" className="space-y-2 mt-4">
                    {!signedIn ? (
                      <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg text-center space-y-3">
                        <Bookmark className="h-6 w-6 text-muted-foreground" />
                        <div className="space-y-1">
                          <p className="text-xs font-semibold">Unlock Cloud Backup</p>
                          <p className="text-[11px] text-muted-foreground">
                            Sign in to save prompts to the database and share across devices.
                          </p>
                        </div>
                        <Button asChild size="sm" className="w-full">
                          <a href="/auth">Sign In</a>
                        </Button>
                      </div>
                    ) : dbLoading ? (
                      <p className="text-xs text-muted-foreground py-4 text-center">
                        Loading Cloud Library...
                      </p>
                    ) : !dbPrompts || dbPrompts.length === 0 ? (
                      <p className="text-center text-xs text-muted-foreground py-8 border border-dashed rounded-lg">
                        No cloud-saved prompts.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[220px] overflow-y-auto">
                        {dbPrompts.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between border border-border rounded-lg p-2.5 hover:bg-muted/40 transition-colors"
                          >
                            <div
                              onClick={() => handleTemplateClick(p.content, p.title)}
                              className="flex-1 cursor-pointer"
                            >
                              <h5 className="text-sm font-semibold text-foreground">{p.title}</h5>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="rounded bg-secondary text-secondary-foreground text-[9px] px-1 font-medium">
                                  {p.category}
                                </span>
                                {p.is_public && (
                                  <span className="rounded bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-[9px] px-1 font-medium border border-green-200">
                                    Public
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                              onClick={() => deleteMutation.mutate(p.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Save to DB Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleDBSaveSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Save to Cloud Library</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label htmlFor="save-category" className="text-xs font-semibold">
                  Category
                </Label>
                <Select value={saveCategory} onValueChange={setSaveCategory}>
                  <SelectTrigger id="save-category" className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROMPT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="save-tags" className="text-xs font-semibold">
                  Tags (Comma separated)
                </Label>
                <Input
                  id="save-tags"
                  placeholder="e.g. system, code, writing"
                  value={saveTagsString}
                  onChange={(e) => setSaveTagsString(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="save-public"
                  checked={saveIsPublic}
                  onChange={(e) => setSaveIsPublic(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <Label htmlFor="save-public" className="text-xs font-semibold cursor-pointer">
                  Share publicly to community library
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save Prompt"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
