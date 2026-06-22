import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { updateMyProfile } from "@/lib/account.functions";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Upload, User } from "lucide-react";

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export function ProfileEditor({ profile }: { profile: Profile }) {
  const qc = useQueryClient();
  const update = useServerFn(updateMyProfile);
  const fileInput = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarPath, setAvatarPath] = useState<string | null>(profile.avatar_url);
  const [uploading, setUploading] = useState(false);

  const previewUrl = useAvatarUrl(avatarPath);

  const save = useMutation({
    mutationFn: () => update({ data: { display_name: displayName, bio: bio || null, avatar_url: avatarPath } }),
    onSuccess: () => {
      toast.success("Profile saved.");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function onPickFile(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Use a PNG, JPG, WebP, or GIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be under 2 MB.");
      return;
    }
    setUploading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in.");
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${u.user.id}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      // best-effort cleanup of the previous file
      if (avatarPath && avatarPath !== path) {
        await supabase.storage.from("avatars").remove([avatarPath]);
      }
      setAvatarPath(path);
      toast.success("Avatar uploaded. Don't forget to save.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-semibold">Your profile</h2>
      <p className="mt-1 text-sm text-muted-foreground">How you'll show up across the platform.</p>

      <div className="mt-6 flex items-start gap-5">
        <div className="relative">
          <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-muted ring-1 ring-border">
            {previewUrl ? (
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 grid place-items-center rounded-2xl bg-background/70">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPickFile(f);
              e.target.value = "";
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()} disabled={uploading}>
            <Upload className="h-4 w-4" /> {avatarPath ? "Replace photo" : "Upload photo"}
          </Button>
          {avatarPath && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={async () => {
                await supabase.storage.from("avatars").remove([avatarPath]).catch(() => {});
                setAvatarPath(null);
              }}
            >
              Remove
            </Button>
          )}
          <p className="text-xs text-muted-foreground">PNG, JPG, WebP, or GIF · max 2 MB</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="display_name">Display name</Label>
          <Input
            id="display_name"
            value={displayName}
            maxLength={60}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            maxLength={280}
            rows={3}
            onChange={(e) => setBio(e.target.value)}
            placeholder="What are you building with AI agents?"
          />
          <p className="text-right text-xs text-muted-foreground">{bio.length}/280</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={() => save.mutate()} disabled={save.isPending || !displayName.trim()}>
          {save.isPending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </div>
  );
}
