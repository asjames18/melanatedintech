import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Loader2, X, Wrench, HelpCircle, BookOpen, Bot, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { createPost } from "@/lib/community.functions";
import { getPublicProfile } from "@/lib/community.functions";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import {
  COMMUNITY_CATEGORIES,
  COMMUNITY_CATEGORY_LABELS,
  POST_BODY_MAX,
  POST_TITLE_MAX,
  POST_MEDIA_MAX,
  POST_MEDIA_MAX_BYTES,
  type CommunityCategory,
} from "@/lib/community";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

type PendingMedia = { path: string; preview: string; status: "uploading" | "done" | "error" };

export type PostType = "build" | "question" | "agent" | "resource" | "collab";

const POST_TYPE_CONFIG: Record<PostType, { label: string; icon: React.ReactNode; placeholder: string; category: CommunityCategory }> = {
  build: {
    label: "Build Update",
    icon: <Wrench className="h-4 w-4" />,
    placeholder: "Share what you are building, testing, or shipping with AI today...",
    category: "show-and-tell",
  },
  question: {
    label: "Question",
    icon: <HelpCircle className="h-4 w-4" />,
    placeholder: "Ask the community anything about AI agents, prompts, automations, or workflows...",
    category: "questions",
  },
  agent: {
    label: "Agent Showcase",
    icon: <Bot className="h-4 w-4" />,
    placeholder: "Show an AI agent: what it does, who it helps, and what stack powers it...",
    category: "agent-showcase",
  },
  resource: {
    label: "Resource",
    icon: <BookOpen className="h-4 w-4" />,
    placeholder: "Share a helpful link, template, tool, prompt, or resource...",
    category: "resources",
  },
  collab: {
    label: "Hiring/Collab",
    icon: <Users className="h-4 w-4" />,
    placeholder: "Find collaborators, beta testers, talent, or project partners...",
    category: "hiring",
  },
};

// Circular progress ring for character count
function CharRing({ value, max }: { value: number; max: number }) {
  const pct = Math.min(value / max, 1);
  const r = 10;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - pct);
  const danger = pct > 0.9;
  const warn = pct > 0.75;
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" className="rotate-[-90deg]">
      <circle cx="14" cy="14" r={r} fill="none" strokeWidth="3" className="stroke-muted" />
      <circle
        cx="14" cy="14" r={r}
        fill="none" strokeWidth="3"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        strokeLinecap="round"
        className={cn(
          "transition-all",
          danger ? "stroke-destructive" : warn ? "stroke-amber-500" : "stroke-primary"
        )}
      />
    </svg>
  );
}

export function FeedComposer({
  viewerId,
  initialTag,
  focusRequest,
  onFocusRequestHandled,
}: {
  viewerId: string | null;
  initialTag?: string;
  focusRequest?: PostType | null;
  onFocusRequestHandled?: () => void;
}) {
  const qc = useQueryClient();
  const create = useServerFn(createPost);
  const getProfileFn = useServerFn(getPublicProfile);
  const fileInput = useRef<HTMLInputElement>(null);
  const composerInput = useRef<HTMLTextAreaElement>(null);

  const [postType, setPostType] = useState<PostType>("build");
  const [body, setBody] = useState(initialTag ? `Result for #${initialTag}:\n\n` : "");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CommunityCategory>("show-and-tell");
  const [media, setMedia] = useState<PendingMedia[]>([]);
  const [focused, setFocused] = useState(false);

  const myProfile = useQuery({
    queryKey: ["my-profile", viewerId],
    queryFn: () => getProfileFn({ data: { user_id: viewerId! } }),
    enabled: !!viewerId,
  });

  const avatarUrl = useAvatarUrl(myProfile.data?.avatar_url ?? null);
  const initials = (myProfile.data?.display_name ?? "U").slice(0, 2).toUpperCase();

  // Sync category when post type changes
  function switchPostType(pt: PostType) {
    setPostType(pt);
    setCategory(POST_TYPE_CONFIG[pt].category);
  }

  useEffect(() => {
    if (!focusRequest || viewerId === null) return;
    switchPostType(focusRequest);
    const frame = window.requestAnimationFrame(() => {
      composerInput.current?.scrollIntoView({ block: "center" });
      composerInput.current?.focus();
      onFocusRequestHandled?.();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusRequest, onFocusRequestHandled, viewerId]);

  const createMut = useMutation({
    mutationFn: async () => {
      const okMedia = media.filter((m) => m.status === "done").map((m) => m.path);
      return create({
        data: {
          body,
          category,
          media_urls: okMedia,
          title: title.trim() || undefined,
        },
      });
    },
    onSuccess: () => {
      toast.success("Posted!");
      setBody("");
      setTitle("");
      setMedia([]);
      setFocused(false);
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function onPickFiles(files: FileList) {
    const slotsLeft = POST_MEDIA_MAX - media.length;
    const picked = Array.from(files).slice(0, slotsLeft);
    for (const file of picked) {
      if (!ACCEPTED.includes(file.type)) { toast.error("Use PNG, JPG, WebP, or GIF."); continue; }
      if (file.size > POST_MEDIA_MAX_BYTES) { toast.error("Each image must be under 4 MB."); continue; }
      const preview = URL.createObjectURL(file);
      const id = crypto.randomUUID();
      setMedia((m) => [...m, { path: id, preview, status: "uploading" }]);
      try {
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) throw new Error("Not signed in.");
        const ext = file.name.split(".").pop()?.toLowerCase() || "png";
        const path = `${u.user.id}/post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from("post-media").upload(path, file, { upsert: false, contentType: file.type });
        if (error) throw error;
        setMedia((m) => m.map((it) => (it.path === id ? { ...it, path, status: "done" } : it)));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed.");
        setMedia((m) => m.map((it) => (it.path === id ? { ...it, status: "error" } : it)));
      }
    }
  }

  function removeMedia(idx: number) {
    setMedia((m) => {
      const item = m[idx];
      if (item?.status === "done") supabase.storage.from("post-media").remove([item.path]).catch(() => {});
      return m.filter((_, i) => i !== idx);
    });
  }

  if (viewerId === null) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-4 py-4 text-left sm:rounded-2xl sm:p-6 sm:text-center">
        <p className="text-sm font-medium leading-relaxed text-muted-foreground">
          <a href="/auth" className="font-semibold text-primary hover:underline">Sign in</a>{" "}
          to share a build, ask a question, or connect with the community.
        </p>
        <a href="/community-guidelines" className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline">
          Read Community Guidelines
        </a>
      </div>
    );
  }

  const remaining = POST_BODY_MAX - body.length;
  const canPost = body.trim().length > 0 && media.every((m) => m.status !== "uploading");
  const cfg = POST_TYPE_CONFIG[postType];

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card transition-all duration-200",
        focused ? "border-primary/30 shadow-md shadow-primary/5" : "border-border",
      )}
      onFocus={() => setFocused(true)}
    >
      {/* ── Post type tabs ── */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-border px-3 py-2 sm:px-4">
        {(Object.entries(POST_TYPE_CONFIG) as [PostType, typeof cfg][]).map(([pt, c]) => (
          <button
            key={pt}
            type="button"
            onClick={() => switchPostType(pt)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
              postType === pt
                ? "bg-primary/15 text-primary font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {c.icon}
            {c.label}
          </button>
        ))}
      </div>

      {/* ── Main compose area ── */}
      <div className="flex gap-3 px-4 pt-4">
        {/* User avatar */}
        <div className="shrink-0">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {/* Optional title */}
          {focused && (
            <Input
              maxLength={POST_TITLE_MAX}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a title (optional)"
              className="border-0 bg-transparent p-0 text-base font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-0"
            />
          )}

          {/* Body */}
          <Textarea
            ref={composerInput}
            rows={focused ? 4 : 2}
            maxLength={POST_BODY_MAX}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={cfg.placeholder}
            className="resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* ── Media previews ── */}
      {media.length > 0 && (
        <div className="mx-4 mt-3 grid grid-cols-4 gap-2">
          {media.map((m, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              <img src={m.preview} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeMedia(i)}
                className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-background/80 text-foreground hover:bg-background"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
              {m.status === "uploading" && (
                <div className="absolute inset-0 grid place-items-center bg-background/50">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Action toolbar ── */}
      <div className="flex flex-wrap items-center gap-2 px-4 pb-4 pt-3 border-t border-border mt-3">
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) onPickFiles(e.target.files); e.target.value = ""; }}
        />
        <Button
          type="button" variant="ghost" size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          title="Add images"
          disabled={media.length >= POST_MEDIA_MAX}
          onClick={() => fileInput.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
        </Button>

        <Select value={category} onValueChange={(v) => setCategory(v as CommunityCategory)}>
          <SelectTrigger className="h-8 w-auto min-w-[120px] border-0 bg-muted text-xs rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMMUNITY_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{COMMUNITY_CATEGORY_LABELS[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-3">
          {body.length > 0 && (
            <CharRing value={body.length} max={POST_BODY_MAX} />
          )}
          <Button
            size="sm"
            className="rounded-xl px-5 font-semibold"
            disabled={!canPost || createMut.isPending}
            onClick={() => createMut.mutate()}
          >
            {createMut.isPending ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}

