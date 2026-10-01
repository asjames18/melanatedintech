import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Lock, LogIn, MessageSquareText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listAgents } from "@/lib/public.functions";
import { getBundleStatus } from "@/lib/redeem.functions";
import { useEntitlements, entitlementIsOwned } from "@/hooks/use-entitlement";
import { categoryVisual } from "@/lib/category-style";
import { UnlockButton } from "@/components/unlock-button";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site-layout";
import { Chat } from "@/components/agents/Chat";

export const Route = createFileRoute("/app")({
  // App surface: signed-in, client-rendered. The shell handles the signed-out
  // prompt itself so visitors always get a path forward.
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    agent: typeof search.agent === "string" ? search.agent : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Agent workspace — Melanated in Tech" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AppWorkspace,
});

type CatalogAgent = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  category: string;
  tier: string;
  price_cents: number | null;
  image_url: string | null;
};

type RecentChat = {
  id: string;
  title: string;
  updated_at: string;
  agent_slug: string;
};

const agentsQO = () =>
  queryOptions({ queryKey: ["agents"], queryFn: () => listAgents() });

function useSignedInUserId() {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUserId(session?.user?.id ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);
  return userId;
}

function priceLabel(priceCents: number | null) {
  return priceCents != null ? `$${Math.round(priceCents / 100)}` : "See details";
}

function AppWorkspace() {
  const search = Route.useSearch();
  const queryClient = useQueryClient();
  const userId = useSignedInUserId();

  const { data: catalog } = useQuery({ ...agentsQO(), enabled: !!userId });
  const entitlementsQuery = useEntitlements();

  const ownedSlugs = useMemo(() => {
    const rows = entitlementsQuery.data;
    if (!rows) return null;
    return new Set(
      (catalog ?? [])
        .filter((a) => entitlementIsOwned(rows, "agent", a.slug))
        .map((a) => a.slug),
    );
  }, [entitlementsQuery.data, catalog]);

  const entitledAgents = useMemo(
    () =>
      ((catalog ?? []) as CatalogAgent[]).filter((a) => ownedSlugs?.has(a.slug)),
    [catalog, ownedSlugs],
  );
  const agentNameBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of (catalog ?? []) as CatalogAgent[]) map.set(a.slug, a.name);
    return map;
  }, [catalog]);

  // Bundle allowance (same source the agent pages use).
  const getBundleStatusFn = useServerFn(getBundleStatus);
  const { data: bundleStatus } = useQuery({
    queryKey: ["bundle-status"],
    queryFn: () => getBundleStatusFn(),
    enabled: !!userId,
    staleTime: 30_000,
  });
  const isBundleRedeemer = bundleStatus?.isRedeemer === true;

  // Rail: recent saved chats across this user's agents.
  const { data: recentChats } = useQuery({
    queryKey: ["workspace-recent-chats", userId],
    queryFn: async (): Promise<RecentChat[]> => {
      const { data, error } = await supabase
        .from("agent_conversations")
        .select("id, title, updated_at, agent_slug")
        .order("updated_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId && (ownedSlugs?.size ?? 0) > 0,
    staleTime: 15_000,
  });

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [externalLoad, setExternalLoad] = useState<{
    slug: string;
    id: string;
    nonce: number;
  } | null>(null);

  const effectiveSlug =
    (activeSlug && ownedSlugs?.has(activeSlug) ? activeSlug : null) ??
    (search.agent && ownedSlugs?.has(search.agent) ? search.agent : null) ??
    entitledAgents[0]?.slug ??
    null;

  const switchAgent = (slug: string) => {
    setActiveSlug(slug);
    setExternalLoad(null);
    void queryClient.invalidateQueries({ queryKey: ["bundle-status"] });
    void queryClient.invalidateQueries({ queryKey: ["workspace-recent-chats"] });
  };

  const openRecentChat = (row: RecentChat) => {
    if (!ownedSlugs?.has(row.agent_slug)) return;
    setActiveSlug(row.agent_slug);
    setExternalLoad({ slug: row.agent_slug, id: row.id, nonce: Date.now() });
  };

  // Signed out: clean prompt with a path forward, never a crash or dead wall.
  if (userId === null) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Bot className="h-7 w-7" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold">
            Your AI agents live here
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to open your workspace — your specialists, your saved chats, one
            place.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">
                <LogIn className="mr-2 h-4 w-4" /> Sign in
              </Link>
            </Button>
            <Link to="/agents" className="text-sm font-medium text-primary hover:underline">
              Browse the agents →
            </Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  // Auth still resolving.
  if (userId === undefined || !ownedSlugs) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Workspace header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold leading-none">
              Agent workspace
            </p>
            <p className="mt-0.5 text-[11px] leading-none text-muted-foreground">
              Melanated in Tech
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isBundleRedeemer && bundleStatus && (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              {bundleStatus.remaining} of {bundleStatus.allowance} left · resets Monday
            </span>
          )}
          <Link
            to="/agents"
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            All agents
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Rail (desktop) */}
        <aside className="hidden w-72 shrink-0 flex-col border-r bg-card md:flex">
          <p className="border-b px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your agents
          </p>
          <div className="flex-1 overflow-y-auto p-2">
            {entitledAgents.length === 0 && (
              <p className="px-2 py-3 text-xs text-muted-foreground">
                No agents unlocked yet — see below.
              </p>
            )}
            {entitledAgents.map((a) => {
              const { Icon, className } = categoryVisual(a.category, Bot);
              const active = a.slug === effectiveSlug;
              return (
                <button
                  key={a.slug}
                  type="button"
                  onClick={() => switchAgent(a.slug)}
                  aria-current={active}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    active ? "bg-primary/10" : "hover:bg-muted"
                  }`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${className}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{a.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {a.category}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="border-t px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recent chats
          </p>
          <div className="max-h-64 overflow-y-auto p-2">
            {!recentChats || recentChats.length === 0 ? (
              <p className="px-2 py-2 text-xs text-muted-foreground">
                No saved chats yet — your conversations appear here.
              </p>
            ) : (
              recentChats.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openRecentChat(c)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-muted"
                >
                  <MessageSquareText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-medium">
                      {c.title || "Untitled chat"}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {agentNameBySlug.get(c.agent_slug) ?? c.agent_slug} ·{" "}
                      {new Date(c.updated_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Pane */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          {/* Mobile agent picker */}
          <div className="flex gap-2 overflow-x-auto border-b bg-card px-4 py-2 md:hidden">
            {entitledAgents.map((a) => (
              <button
                key={a.slug}
                type="button"
                onClick={() => switchAgent(a.slug)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  a.slug === effectiveSlug
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {a.name}
              </button>
            ))}
          </div>

          <div className="mx-auto max-w-3xl px-4 py-6">
            {effectiveSlug ? (
              entitledAgents.map((a) => (
                <div key={a.slug} className={a.slug === effectiveSlug ? "" : "hidden"}>
                  <Chat
                    agentId={a.id}
                    agentSlug={a.slug}
                    agentName={a.name}
                    defaultModel="openrouter/openrouter/free"
                    bundleMode={isBundleRedeemer}
                    bundleRemaining={bundleStatus?.remaining ?? null}
                    bundleAllowance={bundleStatus?.allowance ?? 200}
                    saveHistory
                    externalLoad={
                      externalLoad && externalLoad.slug === a.slug ? externalLoad : null
                    }
                    onExternalLoadHandled={() => setExternalLoad(null)}
                  />
                </div>
              ))
            ) : (
              /* Signed in but nothing unlocked: same unlock pitch style as the agent pages. */
              <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Lock className="h-6 w-6" />
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold">
                  Unlock your agents
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Your workspace is ready — pick a specialist to unlock. One-time
                  payment, yours to keep on your account.
                </p>
                <div className="mx-auto mt-6 grid max-w-lg gap-3 text-left">
                  {((catalog ?? []) as CatalogAgent[]).map((a) => (
                    <div
                      key={a.slug}
                      className="flex items-center justify-between gap-4 rounded-xl border border-border p-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{a.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {a.tagline ?? a.category} · {priceLabel(a.price_cents)}
                        </p>
                      </div>
                      <UnlockButton
                        kind="agent"
                        slug={a.slug}
                        itemName={a.name}
                        priceCents={a.price_cents}
                        tier={a.tier}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
