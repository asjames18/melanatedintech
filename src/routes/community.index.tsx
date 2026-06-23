import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MessageSquare, Plus } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { listDiscussionPosts, createDiscussionPost } from "@/lib/community.functions";
import { COMMUNITY_CATEGORIES, COMMUNITY_CATEGORY_LABELS, type CommunityCategory } from "@/lib/community";
import { toast } from "sonner";
import { buildSeoMeta } from "@/lib/seo";
import { timeAgo } from "@/lib/utils";

const postsQO = queryOptions({ queryKey: ["discussion-posts"], queryFn: () => listDiscussionPosts() });

export const Route = createFileRoute("/community/")({
  head: () => ({
    meta: buildSeoMeta({
      title: "Community — Melanated In Tech",
      description: "Discussions, questions, and field notes from people building AI agents.",
      url: "/community",
    }),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQO),
  errorComponent: ({ error }) => <SiteLayout><div className="p-12 text-center text-sm text-muted-foreground">{error.message}</div></SiteLayout>,
  notFoundComponent: () => <SiteLayout><div className="p-12">Not found.</div></SiteLayout>,
  component: Community,
});

function Community() {
  const { data: posts } = useSuspenseQuery(postsQO);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Community"
        title="Discussions for agent builders."
        description="Ask questions, share what you're shipping, and learn from others in the field."
      />

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {posts.length} {posts.length === 1 ? "thread" : "threads"}
          </p>
          <NewPostDialog />
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-display text-lg font-semibold">No threads yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Start the first conversation.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {posts.map((p) => (
              <li key={p.id}>
                <Link
                  to="/community/$id"
                  params={{ id: p.id }}
                  className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                      {p.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {p.comment_count} {p.comment_count === 1 ? "reply" : "replies"}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold">{p.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.body}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {p.author?.display_name ?? "Someone"} · {timeAgo(p.last_activity_at)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </SiteLayout>
  );
}

function NewPostDialog() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const create = useServerFn(createDiscussionPost);
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [form, setForm] = useState<{ title: string; body: string; category: CommunityCategory }>({
    title: "",
    body: "",
    category: "general",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, []);

  const mut = useMutation({
    mutationFn: () => create({ data: form }),
    onSuccess: (r) => {
      toast.success("Thread posted.");
      qc.invalidateQueries({ queryKey: ["discussion-posts"] });
      setOpen(false);
      setForm({ title: "", body: "", category: "general" });
      navigate({ to: "/community/$id", params: { id: r.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (authed === false) {
    return (
      <Button size="sm" onClick={() => navigate({ to: "/auth" })}>
        <Plus className="h-4 w-4" /> Sign in to post
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={authed === null}>
          <Plus className="h-4 w-4" /> New thread
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Start a thread</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" maxLength={140} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What's on your mind?" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="category">Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as CommunityCategory })}>
              <SelectTrigger id="category"><SelectValue /></SelectTrigger>
              <SelectContent>
                {COMMUNITY_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{COMMUNITY_CATEGORY_LABELS[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="body">Body</Label>
            <Textarea id="body" rows={6} maxLength={4000} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Share details, questions, or context." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => mut.mutate()}
            disabled={mut.isPending || form.title.trim().length < 3 || form.body.trim().length < 1}
          >
            {mut.isPending ? "Posting…" : "Post thread"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

