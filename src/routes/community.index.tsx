import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell, Bot, Sparkles, Users, Zap } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FeedComposer, type PostType } from "@/components/feed/feed-composer";
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

const MOBILE_PRIMARY_TABS: FeedTab[] = ["for-you", "latest", "ai-agents"];
const MOBILE_MORE_TABS: FeedTab[] = ["following", "questions", "showcase"];

function Community() {
  const { tag } = Route.useSearch();
  const [me, setMe] = useState<string | null | undefined>(undefined);
  const [tab, setTab] = useState<FeedTab>("for-you");
  const [composerIntent, setComposerIntent] = useState<PostType | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-3 pb-20 pt-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr_280px]">
          <LeftSidebar viewerId={me ?? null} authResolved={me !== undefined} />

          <div className="min-w-0 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_32%)] p-3.5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary ring-1 ring-border sm:px-3 sm:py-1 sm:text-[11px]">
                      <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> AI Builder Network
                    </p>
                    <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:mt-3 sm:text-4xl">Community</h1>
                    <p className="mt-1 hidden text-xs leading-relaxed text-muted-foreground sm:block sm:text-sm">
                      Share builds, showcase agents, ask for help, find collaborators, and follow people building with AI.
                    </p>
                  </div>
                  <NotificationButton viewerId={me} />
                </div>
                <div className="mt-4 hidden grid-cols-3 gap-2 sm:grid">
                  <div className="rounded-xl border border-border bg-background/75 p-3">
                    <Bot className="h-4 w-4 text-cyan-600" />
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Agents</p>
                    <p className="text-sm font-semibold text-foreground">Showcase</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/75 p-3">
                    <Users className="h-4 w-4 text-emerald-600" />
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Network</p>
                    <p className="text-sm font-semibold text-foreground">Builders</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/75 p-3">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Momentum</p>
                    <p className="text-sm font-semibold text-foreground">Updates</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Community Agent Showcase Spotlight */}
            <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-background to-card p-3.5 shadow-sm sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Spotlight
                    </span>
                    <h3 className="font-display text-xs font-bold text-foreground sm:text-sm">
                      Lead Revenue Recovery & SMS Dispatch Agent
                    </h3>
                  </div>
                </div>

                <Link to="/tools/agent-sandbox" className="shrink-0">
                  <Button size="sm" className="w-full gap-1.5 bg-primary text-xs font-bold shadow-sm sm:w-auto">
                    <Bot className="h-3.5 w-3.5" /> Test in Sandbox
                  </Button>
                </Link>
              </div>
            </div>

            <StoriesBar />

            {tag && (
              <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Filter:</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">#{tag}</span>
                </div>
                <Button asChild size="sm" variant="ghost" className="h-7 rounded-lg text-xs hover:bg-primary/10 hover:text-primary">
                  <Link to="/community">Clear</Link>
                </Button>
              </div>
            )}

            <div className="sm:hidden">
              <MobileFeedNavigation tab={tab} onChange={setTab} signedIn={!!me} authResolved={me !== undefined} />
            </div>

            <FeedComposer
              viewerId={me}
              initialTag={tag}
              focusRequest={composerIntent}
              onFocusRequestHandled={() => setComposerIntent(null)}
            />

            <Tabs value={tab} onValueChange={(v) => setTab(v as FeedTab)} className="hidden w-full sm:block">
              <TabsList className="flex w-full gap-1 overflow-x-auto rounded-2xl border border-border/80 bg-card p-1.5 shadow-2xs no-scrollbar">
                {FEED_TABS.map((t) => (
                  <TabsTrigger
                    key={t}
                    value={t}
                    disabled={t === "following" && !me}
                    className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-2xs"
                  >
                    {FEED_TAB_LABELS[t]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <FeedController
              viewerId={me}
              tab={tab}
              tag={tag}
              onStartPost={setComposerIntent}
              onBrowseLatest={() => setTab("latest")}
            />
          </div>

          <aside className="hidden lg:block">
            <TrendingSidebar />
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

function MobileFeedNavigation({
  tab,
  onChange,
  signedIn,
  authResolved,
}: {
  tab: FeedTab;
  onChange: (tab: FeedTab) => void;
  signedIn: boolean;
  authResolved: boolean;
}) {
  const mobileMoreValue = MOBILE_MORE_TABS.includes(tab) ? tab : "";

  return (
    <section aria-label="Community feed filters" className="rounded-xl border border-border/80 bg-card p-1.5 shadow-2xs">
      <div className="flex items-center gap-2">
        <div className="grid min-w-0 flex-1 grid-cols-3 gap-1">
          {MOBILE_PRIMARY_TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              className={`min-h-10 min-w-0 truncate rounded-lg px-1 text-[11px] font-bold ${
                tab === item ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {FEED_TAB_LABELS[item]}
            </button>
          ))}
        </div>
        <label className="shrink-0">
          <span className="sr-only">More community feed views</span>
          <select
            value={mobileMoreValue}
            onChange={(event) => onChange(event.target.value as FeedTab)}
            className="h-10 w-[5.25rem] rounded-lg border border-border bg-background px-1.5 text-[11px] font-bold text-foreground"
            aria-label="More community feed views"
          >
            <option value="">More</option>
            {MOBILE_MORE_TABS.map((item) => (
              <option key={item} value={item} disabled={item === "following" && (!authResolved || !signedIn)}>
                {FEED_TAB_LABELS[item]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

function NotificationButton({ viewerId }: { viewerId: string | null | undefined }) {
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

  if (viewerId === undefined) {
    return <span className="inline-flex h-10 w-10 animate-pulse rounded-xl border border-border bg-muted/60" role="status" aria-label="Loading notifications" />;
  }

  if (viewerId === null) {
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

function FeedController({
  viewerId,
  tab,
  tag,
  onStartPost,
  onBrowseLatest,
}: {
  viewerId: string | null | undefined;
  tab: FeedTab;
  tag?: string;
  onStartPost: (postType: PostType) => void;
  onBrowseLatest: () => void;
}) {
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
        onStartPost={onStartPost}
        onBrowseLatest={onBrowseLatest}
    />
  );
}

