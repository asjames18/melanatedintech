import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Copy, Search, BookOpen, Eye } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@/components/markdown";
import {
  listMyPrompts,
  listPublicPrompts,
  upsertPrompt,
  deletePrompt,
  getPrompt,
  PROMPT_CATEGORIES,
  type PromptCategory,
} from "@/lib/prompts.functions";

export const Route = createFileRoute("/_authenticated/prompts")({
  head: () => ({ meta: [{ title: "Prompt Library — Melanated In Tech" }] }),
  component: PromptsPage,
});

type PromptRow = Awaited<ReturnType<typeof listMyPrompts>>[number];
type PublicPromptRow = Awaited<ReturnType<typeof listPublicPrompts>>[number];

function PromptsPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Prompt Library"
        title="Your prompts."
        description="Create, edit, and manage prompts you can reuse across agents. Share publicly or keep private."
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Tabs defaultValue="my-prompts">
          <TabsList className="flex h-auto flex-wrap justify-start gap-1">
            <TabsTrigger value="my-prompts">My Prompts</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>
          <TabsContent value="my-prompts" className="mt-6">
            <MyPromptsPanel />
          </TabsContent>
          <TabsContent value="community" className="mt-6">
            <CommunityPromptsPanel />
          </TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
}

// ---------- My Prompts ----------

function MyPromptsPanel() {
  const qc = useQueryClient();
  const listFn = useServerFn(listMyPrompts);
  const delFn = useServerFn(deletePrompt);
  const q = useQuery({ queryKey: ["my-prompts"], queryFn: () => listFn() });
  const deleteMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Prompt deleted.");
      qc.invalidateQueries({ queryKey: ["my-prompts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (!q.data) return [];
    return q.data.filter((p) => {
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.content.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [q.data, search, categoryFilter]);

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {PROMPT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <PromptEditor
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" /> New prompt
            </Button>
          }
        />
      </div>

      {/* List */}
      {q.isLoading ? (
        <div className="p-6 text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {search || categoryFilter !== "all"
              ? "No prompts match your filters."
              : "No prompts yet. Create your first one to get started."}
          </p>
          {!search && categoryFilter === "all" && (
            <div className="mt-4">
              <PromptEditor
                trigger={
                  <Button size="sm">
                    <Plus className="h-4 w-4" /> Create prompt
                  </Button>
                }
              />
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} onDelete={(id) => deleteMut.mutate(id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Community Prompts ----------

function CommunityPromptsPanel() {
  const listFn = useServerFn(listPublicPrompts);
  const q = useQuery({ queryKey: ["community-prompts"], queryFn: () => listFn() });

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!q.data) return [];
    if (!search) return q.data;
    return q.data.filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.content.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase())),
    );
  }, [q.data, search]);

  return (
    <div>
      <div className="mb-4 max-w-xs">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search community prompts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {q.isLoading ? (
        <div className="p-6 text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {search ? "No community prompts match your search." : "No public prompts yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((prompt) => (
            <PublicPromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Prompt Card ----------

function PromptCard({
  prompt,
  showUsage,
  onDelete,
}: {
  prompt: PromptRow;
  showUsage?: boolean;
  onDelete?: (id: string) => void;
}) {
  const [showPreview, setShowPreview] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.content);
    toast.success("Prompt copied to clipboard.");
  };

  return (
    <div className="group flex flex-col rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="line-clamp-1 text-sm font-semibold">{prompt.title}</h4>
        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {prompt.category}
        </span>
      </div>

      <p className="line-clamp-3 flex-1 text-xs text-muted-foreground">{prompt.content}</p>

      {prompt.tags && prompt.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {prompt.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
          {prompt.tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{prompt.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t pt-2">
        <div className="flex items-center gap-1">
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{prompt.title}</DialogTitle>
              </DialogHeader>
              <div className="rounded bg-muted/50 p-3">
                <Markdown md={prompt.content} />
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5" /> Copy prompt
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          {showUsage && prompt.usage_count > 0 && (
            <span className="text-[10px] text-muted-foreground">Used {prompt.usage_count}x</span>
          )}
          {prompt.user_id && (
            <PromptEditor
              existing={prompt}
              trigger={
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              }
            />
          )}
          {prompt.user_id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this prompt?</AlertDialogTitle>
                  <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete?.(prompt.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Prompt Editor (create/edit) ----------

function PromptEditor({ existing, trigger }: { existing?: PromptRow; trigger: React.ReactNode }) {
  const qc = useQueryClient();
  const upsertFn = useServerFn(upsertPrompt);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => ({
    id: existing?.id,
    title: existing?.title ?? "",
    content: existing?.content ?? "",
    category: (existing?.category ?? "Other") as PromptCategory,
    tags: (existing?.tags ?? []).join(", "),
    is_public: existing?.is_public ?? false,
  }));

  const mut = useMutation({
    mutationFn: () =>
      upsertFn({
        data: {
          ...form,
          tags: form.tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
      }),
    onSuccess: () => {
      toast.success(existing ? "Prompt saved." : "Prompt created.");
      qc.invalidateQueries({ queryKey: ["my-prompts"] });
      qc.invalidateQueries({ queryKey: ["community-prompts"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit prompt" : "New prompt"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label="Category">
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v as PromptCategory })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROMPT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Content (markdown supported)">
            <Textarea
              rows={8}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your prompt here. Use markdown for formatting."
            />
          </Field>
          <Field label="Tags (comma-separated)">
            <Input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="agent, research, starter"
            />
          </Field>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-public"
              checked={form.is_public}
              onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="is-public" className="text-sm">
              Make this prompt visible to the community
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending ? "Saving…" : existing ? "Save changes" : "Create prompt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Public Prompt Card (read-only) ----------

function PublicPromptCard({ prompt }: { prompt: PublicPromptRow }) {
  const [showPreview, setShowPreview] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.content);
    toast.success("Prompt copied to clipboard.");
  };

  return (
    <div className="group flex flex-col rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="line-clamp-1 text-sm font-semibold">{prompt.title}</h4>
        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {prompt.category}
        </span>
      </div>

      <p className="line-clamp-3 flex-1 text-xs text-muted-foreground">{prompt.content}</p>

      {prompt.tags && prompt.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {prompt.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
          {prompt.tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{prompt.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t pt-2">
        <div className="flex items-center gap-1">
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{prompt.title}</DialogTitle>
              </DialogHeader>
              <div className="rounded bg-muted/50 p-3">
                <Markdown md={prompt.content} />
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5" /> Copy prompt
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>

        {prompt.usage_count > 0 && (
          <span className="text-[10px] text-muted-foreground">Used {prompt.usage_count}x</span>
        )}
      </div>
    </div>
  );
}

// ---------- Shared ----------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}
