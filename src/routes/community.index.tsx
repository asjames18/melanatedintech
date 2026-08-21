import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell, Bot, HelpCircle, Home, Images, Rss, Sparkles, Users, Zap } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FeedComposer } from "@/components/feed/feed-composer";
import { FeedList } from "@/components/feed/feed-list";
import { StoriesBar } from "@/components/feed/stories-bar";
import { TrendingSidebar } from "@/components/feed/trending-sidebar";
import { LeftSidebar } from "@/components/feed/left-sidebar";
import { supabase } from "@/integrations/supabase/client";
import {
  reactPost,
  unreactPost,
  deleteItem,
  adminDeleteItem,
  savePost,
  unsavePost,
  sharePost,
  reportPost,
  listNotifications,
  markNotificationsRead,
} from "@/lib/community.functions";
import { checkAdminStatus } from "@/lib/admin.functions";
import { FEED_TABS, FEED_TAB_LABELS, type FeedPage, type FeedTab, type ReactionKind } from "@/lib/community";
import { toast } from "sonner";
import { buildSeoMeta } from "@/lib/seo";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";

const searchSchema = z.object({ tag: z.string().optional() });

export const Route = createFileRoute("/community/")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    ...buildSeoMeta({
      title: "Community - Melanated In Tech",
      description: "An AI and AI-agent builder network for discussions, showcases, questions, and resources.",
      url: "/community",
    }),
  }),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="p-12 text-center text-sm text-muted-foreground">{error.message}</div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="p-12">Not found.</div>
    </SiteLayout>
  ),
  component: Community,
});

const MOBILE_NAV = [
  { label: "Feed", tab: "for-you" as FeedTab, Icon: Home },
  { label: "Latest", tab: "latest" as FeedTab, Icon: Rss },
  { label: "Agents", tab: "ai-agents" as FeedTab, Icon: Bot },
  { label: "Q&A", tab: "questions" as FeedTab, Icon: HelpCircle },
  { label: "Show", tab: "showcase" as FeedTab, Icon: Images },
];

function Community() {
  const { tag } = Route.useSearch();
  const [me, setMe] = useState<string | null>(null);
  const [tab, setTab] = useState<FeedTab>("for-you");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr_280px]">
          <LeftSidebar />

          <div className="min-w-0 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_32%)] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary ring-1 ring-border">
                      <Sparkles className="h-3.5 w-3.5" /> AI Builder Network
                    </p>
                    <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Community</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      Share builds, showcase agents, ask for help, find collaborators, and follow people building with AI.
                    </p>
                  </div>
                  <NotificationButton viewerId={me} />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-border bg-background/75 p-3">
                    <Bot className="h-4 w-4 text-cyan-600" />
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Agents</p>
                    <p className="text-sm font-semibold text-foreground">Showcase work</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/75 p-3">
                    <Users className="h-4 w-4 text-emerald-600" />
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Network</p>
                    <p className="text-sm font-semibold text-foreground">Follow builders</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/75 p-3">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Momentum</p>
                    <p className="text-sm font-semibold text-foreground">Post updates</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Community Agent Showcase Spotlight */}
            <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-background to-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Featured Agent Build Spotlight
                    </span>
                    <h3 className="font-display text-sm font-bold text-foreground">
                      Lead Revenue Recovery & SMS Dispatch Agent
                    </h3>
                  </div>
                </div>

                <Link to="/tools/agent-sandbox">
                  <Button size="sm" className="gap-1.5 bg-primary text-xs font-bold shadow-sm">
                    <Bot className="h-3.5 w-3.5" /> Test in Sandbox
                  </Button>
                </Link>
              </div>

              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Contributed by <span className="font-semibold text-foreground">@james_builder</span> — Automatically audits uncontacted CRM leads and dispatches personalized SMS calendar links via Twilio API.
              </p>
            </div>

            <StoriesBar />

            {tag && (
              <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Active Filter:</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">#{tag}</span>
                </div>
                <Button asChild size="sm" variant="ghost" className="h-7 rounded-lg text-xs hover:bg-primary/10 hover:text-primary">
                  <Link to="/community">Clear</Link>
                </Button>
              </div>
            )}

            <FeedComposer viewerId={me ?? null} initialTag={tag} />

            <Tabs value={tab} onValueChange={(v) => setTab(v as FeedTab)} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto rounded-none border-b border-border bg-transparent p-0 h-auto">
                {FEED_TABS.map((t) => (
                  <TabsTrigger
                    key={t}
                    value={t}
                    disabled={t === "following" && !me}
                    className="shrink-0 rounded-none border-b-2 border-transparent px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                  >
                    {FEED_TAB_LABELS[t]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <FeedController viewerId={me ?? null} tab={tab} tag={tag} />
          </div>

          <aside className="hidden lg:block">
            <TrendingSidebar />
          </aside>
        </div>
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 py-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {MOBILE_NAV.map(({ label, tab: navTab, Icon }) => (
            <button
              key={navTab}
              type="button"
              onClick={() => setTab(navTab)}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold ${tab === navTab ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </SiteLayout>
  );
}

function NotificationButton({ viewerId }: { viewerId: string | null }) {
  const list = useServerFn(listNotifications);
  const markRead = useServerFn(markNotificationsRead);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["community-notifications"],
    queryFn: () => list({ data: { limit: 12 } }),
    enabled: !!viewerId,
    staleTime: 30_000,
  });
  const markMut = useMutation({
    mutationFn: () => markRead({ data: {} }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-notifications"] }),
  });
  const unread = (q.data ?? []).filter((n) => !n.read_at).length;

  if (!viewerId) {
    return (
      <Button asChild variant="outline" size="sm" className="rounded-xl">
        <Link to="/auth">Sign in</Link>
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-xl" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{unread}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-2xl p-2">
        <div className="flex items-center justify-between px-2 py-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notifications</p>
          {unread > 0 && <button type="button" className="text-xs font-semibold text-primary" onClick={() => markMut.mutate()}>Mark read</button>}
        </div>
        <div className="mt-1 max-h-80 space-y-1 overflow-auto">
          {q.isLoading ? <p className="px-2 py-6 text-center text-sm text-muted-foreground">Loading...</p> : (q.data ?? []).length === 0 ? <p className="px-2 py-6 text-center text-sm text-muted-foreground">No notifications yet.</p> : (q.data ?? []).map((n) => (
            <Link key={n.id} to={n.post_id ? "/community/$id" : "/community"} params={n.post_id ? { id: n.post_id } : {}} className="block rounded-xl px-3 py-2 text-sm hover:bg-muted">
              <span className="font-semibold">{n.actor?.display_name ?? "Someone"}</span> {notificationText(n.type)}
              <span className="mt-0.5 block text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</span>
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function notificationText(type: string) {
  if (type === "reply") return "commented on your post";
  if (type === "reaction") return "reacted to your post";
  if (type === "follow") return "followed you";
  if (type === "mention") return "mentioned you";
  return "sent an update";
}

function FeedController({ viewerId, tab, tag }: { viewerId: string | null; tab: FeedTab; tag?: string }) {
  const qc = useQueryClient();
  const react = useServerFn(reactPost);
  const unreact = useServerFn(unreactPost);
  const save = useServerFn(savePost);
  const unsave = useServerFn(unsavePost);
  const share = useServerFn(sharePost);
  const report = useServerFn(reportPost);
  const del = useServerFn(deleteItem);
  const adminDel = useServerFn(adminDeleteItem);
  const checkAdmin = useServerFn(checkAdminStatus);

  const adminQ = useQuery({ queryKey: ["admin-status"], queryFn: () => checkAdmin(), enabled: !!viewerId, staleTime: 60_000 });
  const isAdmin = !!adminQ.data?.isAdmin;

  function updateFeedPost(postId: string, fn: (post: FeedPage["posts"][number]) => FeedPage["posts"][number]) {
    const cache = qc.getQueriesData<{ pages: FeedPage[] }>({ queryKey: ["feed"] });
    for (const [key, value] of cache) {
      if (!value) continue;
      qc.setQueryData(key, {
        ...value,
        pages: value.pages.map((p) => ({ ...p, posts: p.posts.map((post) => (post.id === postId ? fn(post) : post)) })),
      });
    }
  }

  const reactMut = useMutation({
    mutationFn: (args: { postId: string; kind: ReactionKind; on: boolean }) => (args.on ? react : unreact)({ data: { post_id: args.postId, kind: args.kind } }),
    onMutate: async ({ postId, kind, on }) => {
      await qc.cancelQueries({ queryKey: ["feed"] });
      updateFeedPost(postId, (post) => {
        let mine = post.reactions_by_me;
        const counts = { ...post.reaction_count };
        if (on) {
          for (const prev of mine) counts[prev] = Math.max((counts[prev] ?? 0) - 1, 0);
          mine = [kind];
          counts[kind] = (counts[kind] ?? 0) + 1;
        } else {
          mine = mine.filter((k: string) => k !== kind);
          counts[kind] = Math.max((counts[kind] ?? 0) - 1, 0);
        }
        return { ...post, reactions_by_me: mine, reaction_count: counts };
      });
    },
    onError: () => qc.invalidateQueries({ queryKey: ["feed"] }),
  });

  function toggleReaction(postId: string, kind: ReactionKind) {
    const cache = qc.getQueriesData<{ pages: FeedPage[] }>({ queryKey: ["feed"] });
    let on = true;
    for (const [, value] of cache) {
      for (const p of value?.pages ?? []) {
        const post = p.posts.find((x) => x.id === postId);
        if (post?.reactions_by_me.includes(kind)) on = false;
      }
    }
    reactMut.mutate({ postId, kind, on });
  }

  const saveMut = useMutation({
    mutationFn: (args: { postId: string; currentlySaved: boolean }): Promise<{ ok: true; saved: boolean }> => (args.currentlySaved ? unsave : save)({ data: { post_id: args.postId } }),
    onMutate: ({ postId, currentlySaved }) => updateFeedPost(postId, (post) => ({ ...post, is_saved: !currentlySaved })),
    onSuccess: (r) => toast.success(r.saved ? "Saved post." : "Removed from saved."),
    onError: (e: Error) => { toast.error(e.message); qc.invalidateQueries({ queryKey: ["feed"] }); },
  });

  const shareMut = useMutation({
    mutationFn: (args: { postId: string; channel?: string }) => share({ data: { post_id: args.postId, channel: args.channel ?? "share" } }),
    onMutate: ({ postId }) => updateFeedPost(postId, (post) => ({ ...post, share_count: post.share_count + 1 })),
    onError: () => qc.invalidateQueries({ queryKey: ["feed"] }),
  });

  const reportMut = useMutation({
    mutationFn: (postId: string) => report({ data: { post_id: postId, reason: "community_report" } }),
    onSuccess: () => toast.success("Report submitted for review."),
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (args: { postId: string; asAdmin: boolean }) => (args.asAdmin ? adminDel : del)({ data: { id: args.postId, kind: "post" } }),
    onSuccess: () => { toast.success("Post deleted."); qc.invalidateQueries({ queryKey: ["feed"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <FeedList
      viewerId={viewerId}
      isAdmin={isAdmin}
      tab={tab}
      tag={tag}
      onToggleReaction={toggleReaction}
      onDelete={(postId, asAdmin) => delMut.mutate({ postId, asAdmin })}
      onToggleSave={(postId, currentlySaved) => saveMut.mutate({ postId, currentlySaved })}
      onReport={(postId) => reportMut.mutate(postId)}
      onShare={(postId, channel) => shareMut.mutate({ postId, channel })}
    />
  );
}

