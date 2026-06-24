import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile, listMySavedAgents, listMySavedArticles } from "@/lib/account.functions";
import { listArticles, listAgents } from "@/lib/public.functions";
import { ProfileEditor } from "@/components/profile-editor";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import { useInterests } from "@/hooks/use-interests";
import { TierBadge } from "@/components/cards";
import { useEntitlements } from "@/hooks/use-entitlement";
import { Bookmark, BookOpen, Clock, LogOut, ShieldCheck, Sparkles, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Account — Melanated In Tech" }] }),
  component: Account,
});

function Account() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getProfile = useServerFn(getMyProfile);
  const getSavedAgents = useServerFn(listMySavedAgents);
  const getSavedArticles = useServerFn(listMySavedArticles);

  const profile = useQuery({ queryKey: ["me"], queryFn: () => getProfile() });
  const savedAgents = useQuery({ queryKey: ["saved-agents"], queryFn: () => getSavedAgents() });
  const savedArticles = useQuery({
    queryKey: ["saved-articles"],
    queryFn: () => getSavedArticles(),
  });
  const entitlements = useEntitlements();
  const avatarUrl = useAvatarUrl(profile.data?.avatar_url);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out.");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Account"
        title={profile.data?.display_name ? `Hey, ${profile.data.display_name}` : "Your account"}
        description="Saved agents and articles, reading history, profile, and access — all in one place."
      />

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-muted ring-1 ring-border">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-display text-base font-semibold leading-tight">
                {profile.data?.display_name ?? "Unnamed"}
              </p>
              {profile.data?.bio && (
                <p className="line-clamp-1 text-xs text-muted-foreground">{profile.data.bio}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/submit-agent">Submit an agent</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/submissions">My submissions</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/interests">
                <Sparkles className="h-4 w-4" /> Interests
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin">
                <ShieldCheck className="h-4 w-4" /> Admin
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="agents" className="mt-8">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="agents">
              <Bookmark className="h-4 w-4" /> Saved agents
              <Count n={savedAgents.data?.length ?? 0} />
            </TabsTrigger>
            <TabsTrigger value="articles">
              <BookOpen className="h-4 w-4" /> Saved articles
              <Count n={savedArticles.data?.length ?? 0} />
            </TabsTrigger>
            <TabsTrigger value="unlocked">
              <Sparkles className="h-4 w-4" /> Unlocked
              <Count n={entitlements.data?.length ?? 0} />
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="h-4 w-4" /> Reading history
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="mt-6">
            {savedAgents.isLoading ? (
              <Loading />
            ) : (savedAgents.data ?? []).length === 0 ? (
              <Empty
                title="No saved agents yet"
                body="Browse the marketplace and save the agents you want to follow."
                cta={
                  <Button asChild className="mt-4">
                    <Link to="/agents">Browse the marketplace</Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {(savedAgents.data ?? []).map(
                  (s) =>
                    s.agents && (
                      <Link
                        key={s.agent_id}
                        to="/agents/$slug"
                        params={{ slug: s.agents.slug }}
                        className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            {s.agents.category}
                          </p>
                          <TierBadge tier={s.agents.tier} />
                        </div>
                        <p className="mt-1 font-display text-lg font-semibold group-hover:text-primary">
                          {s.agents.name}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">{s.agents.tagline}</p>
                      </Link>
                    ),
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="articles" className="mt-6">
            {savedArticles.isLoading ? (
              <Loading />
            ) : (savedArticles.data ?? []).length === 0 ? (
              <Empty
                title="No saved articles yet"
                body="Use the Save button on any article to build your reading list."
                cta={
                  <Button asChild className="mt-4">
                    <Link to="/knowledge">Browse the knowledge hub</Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {(savedArticles.data ?? []).map(
                  (s) =>
                    s.articles && (
                      <Link
                        key={s.article_id}
                        to="/knowledge/$slug"
                        params={{ slug: s.articles.slug }}
                        className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
                      >
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          {s.articles.category}
                        </p>
                        <p className="mt-1 font-display text-lg font-semibold group-hover:text-primary">
                          {s.articles.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {s.articles.excerpt}
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                          {s.articles.read_minutes} min read
                        </p>
                      </Link>
                    ),
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="unlocked" className="mt-6">
            {entitlements.isLoading ? (
              <Loading />
            ) : (entitlements.data ?? []).length === 0 ? (
              <Empty
                title="Nothing unlocked yet"
                body="Premium agents and products you purchase will appear here."
                cta={
                  <Button asChild className="mt-4">
                    <Link to="/agents">Browse the marketplace</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
                {(entitlements.data ?? []).map((e) => (
                  <li
                    key={`${e.kind}-${e.slug}-${e.environment}`}
                    className="flex items-center justify-between gap-4 p-4"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {e.kind}
                      </p>
                      <Link
                        to={e.kind === "agent" ? "/agents/$slug" : "/products/$slug"}
                        params={{ slug: e.slug }}
                        className="text-sm font-medium hover:text-primary"
                      >
                        {e.slug}
                      </Link>
                    </div>
                    <span className="rounded-full bg-accent2/15 px-2 py-0.5 text-xs text-accent2">
                      {new Date(e.granted_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <ReadingHistory />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            {profile.isLoading || !profile.data ? (
              <Loading />
            ) : (
              <ProfileEditor profile={profile.data} />
            )}
          </TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="ml-1.5 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{n}</span>
  );
}

function Loading() {
  return <p className="text-sm text-muted-foreground">Loading…</p>;
}

function Empty({ title, body, cta }: { title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      {cta}
    </div>
  );
}

function ReadingHistory() {
  const { interests: articleInterests, clear: clearArticles } = useInterests("article");
  const { interests: agentInterests, clear: clearAgents } = useInterests("agent");
  const listArticlesFn = useServerFn(listArticles);
  const listAgentsFn = useServerFn(listAgents);
  const articles = useQuery({ queryKey: ["articles"], queryFn: () => listArticlesFn() });
  const agents = useQuery({ queryKey: ["agents"], queryFn: () => listAgentsFn() });
  const articleRows = articles.data;
  const agentRows = agents.data;
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const recentArticles = useMemo(() => {
    if (!articleRows) return [];
    const map = new Map(articleRows.map((a) => [a.slug, a]));
    return articleInterests.recent.map((s) => map.get(s)).filter(Boolean) as typeof articleRows;
  }, [articleRows, articleInterests.recent]);

  const recentAgents = useMemo(() => {
    if (!agentRows) return [];
    const map = new Map(agentRows.map((a) => [a.slug, a]));
    return agentInterests.recent.map((s) => map.get(s)).filter(Boolean) as typeof agentRows;
  }, [agentRows, agentInterests.recent]);

  if (!hydrated) return <Loading />;

  const empty = recentArticles.length === 0 && recentAgents.length === 0;
  if (empty) {
    return (
      <Empty
        title="No reading history yet"
        body="As you read articles and explore agents, your recent activity will show up here."
      />
    );
  }

  return (
    <div className="space-y-10">
      {recentArticles.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
              Recently read
            </h3>
            <button
              onClick={clearArticles}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {recentArticles.slice(0, 10).map((a) => (
              <li key={a.id}>
                <Link
                  to="/knowledge/$slug"
                  params={{ slug: a.slug }}
                  className="flex items-start justify-between gap-4 p-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {a.category}
                    </p>
                    <p className="mt-0.5 text-sm font-medium">{a.title}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {a.read_minutes} min
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recentAgents.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
              Recently viewed agents
            </h3>
            <button
              onClick={clearAgents}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {recentAgents.slice(0, 10).map((a) => (
              <li key={a.id}>
                <Link
                  to="/agents/$slug"
                  params={{ slug: a.slug }}
                  className="flex items-start justify-between gap-4 p-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {a.category}
                    </p>
                    <p className="mt-0.5 text-sm font-medium">{a.name}</p>
                  </div>
                  <TierBadge tier={a.tier} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
