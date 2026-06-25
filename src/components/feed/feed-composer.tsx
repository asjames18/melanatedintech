import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { createPost } from "@/lib/community.functions";
import {
  COMMUNITY_CATEGORIES,
  COMMUNITY_CATEGORY_LABELS,
  POST_BODY_MAX,
  POST_MEDIA_MAX,
  POST_MEDIA_MAX_BYTES,
  type CommunityCategory,
} from "@/lib/community";
import { toast } from "sonner";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

type PendingMedia = { path: string; preview: string; status: "uploading" | "done" | "error" };

/** Compact composer for creating a short-form post. Auth gate handled by parent:
 *  pass `viewerId` (null = signed out). */
export function FeedComposer({ viewerId }: { viewerId: string | null }) {
  const qc = useQueryClient();
  const create = useServerFn(createPost);
  const fileInput = useRef<HTMLInputElement>(null);

  const [body, setBody] = useState("");
  const [category, setCategory] = useState<CommunityCategory>("general");
  const [media, setMedia] = useState<PendingMedia[]>([]);
  const [focused, setFocused] = useState(false);

  const createMut = useMutation({
    mutationFn: async () => {
      const okMedia = media.filter((m) => m.status === "done").map((m) => m.path);
      return create({ data: { body, category, media_urls: okMedia, title: undefined } });
    },
    onSuccess: () => {
      toast.success("Posted.");
      setBody("");
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
      if (!ACCEPTED.includes(file.type)) {
        toast.error("Use PNG, JPG, WebP, or GIF.");
        continue;
      }
      if (file.size > POST_MEDIA_MAX_BYTES) {
        toast.error("Each image must be under 4 MB.");
        continue;
      }
      const preview = URL.createObjectURL(file);
      const id = crypto.randomUUID();
      setMedia((m) => [...m, { path: id, preview, status: "uploading" }]);
      try {
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) throw new Error("Not signed in.");
        const ext = file.name.split(".").pop()?.toLowerCase() || "png";
        const path = `${u.user.id}/post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from("post-media")
          .upload(path, file, { upsert: false, contentType: file.type });
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
      if (item?.status === "done") {
        supabase.storage
          .from("post-media")
          .remove([item.path])
          .catch(() => {});
      }
      return m.filter((_, i) => i !== idx);
    });
  }

  if (viewerId === null) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          <a href="/auth" className="font-medium text-primary hover:underline">
            Sign in
          </a>{" "}
          to post to the community.
        </p>
      </div>
    );
  }

  const remaining = POST_BODY_MAX - body.length;
  const canPost = body.trim().length > 0 && media.every((m) => m.status !== "uploading");

  return (
    <div className="rounded-2xl border border-border bg-card p-4" onFocus={() => setFocused(true)}>
      <Textarea
        rows={focused ? 4 : 2}
        maxLength={POST_BODY_MAX}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What's on your mind?"
        className="resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
      />

      {media.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {media.map((m, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
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

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) onPickFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          title="Add images"
          disabled={media.length >= POST_MEDIA_MAX}
          onClick={() => fileInput.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
        </Button>

        <Select value={category} onValueChange={(v) => setCategory(v as CommunityCategory)}>
          <SelectTrigger className="h-8 w-auto min-w-[120px] border-0 bg-muted text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMMUNITY_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {COMMUNITY_CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-3">
          <span
            className={
              remaining < 40
                ? "text-xs font-medium text-amber-500"
                : "text-xs text-muted-foreground"
            }
          >
            {remaining}
          </span>
          <Button
            size="sm"
            disabled={!canPost || createMut.isPending}
            onClick={() => createMut.mutate()}
          >
            {createMut.isPending ? "Posting…" : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}
