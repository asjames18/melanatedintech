import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Layers, Copy, Download, Sparkles, FileText, Upload, Hash, CheckCircle2 } from "lucide-react";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { ToolGuide } from "@/components/tool-guide";
import { trackEvent } from "@/lib/analytics";

const GUIDE_DATA = {
  whatItIs: "A knowledge document chunker that splits large text files into optimized segments for AI Vector Search & RAG.",
  whyUseIt: "Prevents context truncation and retrieval loss in vector databases (Pinecone, Supabase Vector) by guaranteeing clean boundaries and token limits.",
  howToUse: [
    "Paste your raw document text or upload a .txt / .md file.",
    "Select your chunking strategy (Paragraphs, Headings, or Fixed Word Count with Overlap).",
    "Inspect the generated chunk cards and token metrics, then click 'Export JSON' to load into your vector index.",
  ],
};

export const Route = createFileRoute("/tools/rag-chunker")({
  head: () => {
    const seo = buildSeoMeta({
      title: "RAG & Knowledge Base Chunker — Melanated In Tech",
      description:
        "Split long documents into optimized text chunks for RAG vector databases. Preview token counts and export JSON/CSV.",
      url: "/tools/rag-chunker",
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "AI Tools", path: "/tools" },
            { name: "RAG Chunker", path: "/tools/rag-chunker" },
          ]),
        ),
      ],
    };
  },
  component: RagChunkerPage,
});

interface ChunkItem {
  id: number;
  content: string;
  charCount: number;
  tokenCount: number;
}

function RagChunkerPage() {
  const [sourceText, setSourceText] = useState(
    `# AI AGENT WORKFLOW STANDARD OPERATING PROCEDURE

## 1. Executive Summary
Melanated in Tech provides hands-on AI education, helping individuals and organizations build, deploy, and benefit from autonomous AI agents. This document details standard operational procedures for AI agent integration across small business workflows, non-profit operations, and educational institutions.

## 2. Agent Architecture Guidelines
When building an AI agent system, designers must establish clear boundaries, role definitions, and tool capabilities. Agents should utilize explicit system prompts, structured input variables, and robust guardrails against prompt injection and hallucination.

### 2.1 Router Pattern
The Router pattern evaluates incoming user messages and dispatches them to specialized sub-agents based on topic classification.

### 2.2 Orchestrator Pattern
The Orchestrator pattern coordinates complex multi-step tasks by breaking down user requests into sub-tasks, assigning workers, and synthesizing the final response.

## 3. Knowledge Base Preparation (RAG)
Retrieval-Augmented Generation requires clean document chunking. Large text files should be divided into 200-500 word chunks with 10-15% overlap to ensure context continuity across vector index searches.`
  );

  const [strategy, setStrategy] = useState<"paragraphs" | "headings" | "words">("paragraphs");
  const [wordsPerChunk, setWordsPerChunk] = useState<number>(100);
  const [overlapWords, setOverlapWords] = useState<number>(15);

  // Perform chunking
  const chunks = useMemo<ChunkItem[]>(() => {
    if (!sourceText.trim()) return [];

    let rawChunks: string[] = [];

    if (strategy === "paragraphs") {
      rawChunks = sourceText
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    } else if (strategy === "headings") {
      rawChunks = sourceText
        .split(/(?=\n#+\s)/)
        .map((h) => h.trim())
        .filter(Boolean);
    } else {
      // Word count chunker with overlap
      const words = sourceText.split(/\s+/);
      const step = Math.max(1, wordsPerChunk - overlapWords);
      for (let i = 0; i < words.length; i += step) {
        const chunkWords = words.slice(i, i + wordsPerChunk);
        if (chunkWords.length > 0) {
          rawChunks.push(chunkWords.join(" "));
        }
      }
    }

    return rawChunks.map((content, idx) => {
      const charCount = content.length;
      // Rough token estimation: 1 token ≈ 4 chars or 0.75 words
      const tokenCount = Math.round(content.split(/\s+/).length * 1.3);
      return {
        id: idx + 1,
        content,
        charCount,
        tokenCount,
      };
    });
  }, [sourceText, strategy, wordsPerChunk, overlapWords]);

  const totalTokens = useMemo(
    () => chunks.reduce((acc, curr) => acc + curr.tokenCount, 0),
    [chunks]
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSourceText(String(event.target.result));
          toast.success(`Imported text from file: ${file.name}`);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportJson = () => {
    const jsonContent = JSON.stringify(
      chunks.map((c) => ({
        id: c.id,
        text: c.content,
        tokens: c.tokenCount,
        metadata: { source: "rag-chunker-export" },
      })),
      null,
      2
    );
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rag-knowledge-chunks.json";
    link.click();
    URL.revokeObjectURL(url);
    trackEvent("rag_chunker_export", { format: "json", count: chunks.length });
    toast.success("Downloaded JSON chunks!");
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Interactive Utilities"
        title="RAG & Knowledge Base Chunker."
        description="Prepare knowledge documents for AI Vector Search & RAG. Split text into optimized chunks, inspect token metrics, and export formatted JSON data."
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ToolGuide guide={GUIDE_DATA} />
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Form Settings (Left Col-span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-lg font-bold flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Chunking Parameters
                </CardTitle>
                <CardDescription>Select strategy and boundary controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="strategy-select" className="text-xs font-semibold">
                    Chunking Strategy
                  </Label>
                  <Select value={strategy} onValueChange={(v) => setStrategy(v as any)}>
                    <SelectTrigger id="strategy-select">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paragraphs">Paragraph Boundaries (\n\n)</SelectItem>
                      <SelectItem value="headings">Markdown Headings (# ## ###)</SelectItem>
                      <SelectItem value="words">Fixed Word Count + Overlap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {strategy === "words" && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <Label htmlFor="words-count" className="text-xs font-semibold">
                        Words / Chunk
                      </Label>
                      <Input
                        id="words-count"
                        type="number"
                        min={20}
                        max={1000}
                        value={wordsPerChunk}
                        onChange={(e) => setWordsPerChunk(Number(e.target.value) || 50)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="overlap-count" className="text-xs font-semibold">
                        Overlap Words
                      </Label>
                      <Input
                        id="overlap-count"
                        type="number"
                        min={0}
                        max={100}
                        value={overlapWords}
                        onChange={(e) => setOverlapWords(Number(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="source-text" className="text-xs font-semibold">
                      Source Document Text
                    </Label>
                    <label className="text-[11px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1">
                      <Upload className="h-3 w-3" /> Upload File
                      <input type="file" accept=".txt,.md,.markdown" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                  <Textarea
                    id="source-text"
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    rows={12}
                    placeholder="Paste text here..."
                    className="font-mono text-xs resize-y"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chunks Preview (Right Col-span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border border-border bg-card shadow-sm sticky top-20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="font-display text-xl font-bold flex items-center gap-2">
                    <Hash className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Generated Chunks ({chunks.length})
                  </CardTitle>
                  <CardDescription>Estimated Total Tokens: ~{totalTokens.toLocaleString()} tokens</CardDescription>
                </div>
                <Button onClick={handleExportJson} disabled={chunks.length === 0} className="gap-1.5">
                  <Download className="h-4 w-4" /> Export JSON
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {chunks.map((chunk) => (
                    <div key={chunk.id} className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">Chunk #{chunk.id}</span>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                          <span>{chunk.charCount} chars</span>
                          <span>•</span>
                          <span className="font-semibold text-foreground">~{chunk.tokenCount} tokens</span>
                        </div>
                      </div>
                      <p className="text-xs font-mono text-foreground leading-relaxed whitespace-pre-wrap bg-background p-2.5 rounded-lg border border-border/60">
                        {chunk.content}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <ToolCrossSell tool="rag-chunker" />
      </main>
    </SiteLayout>
  );
}
