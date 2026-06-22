import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile, listMySavedAgents } from "@/lib/account.functions";
import { ProfileEditor } from "@/components/profile-editor";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import { TierBadge } from "@/components/cards";
import { Bookmark, LogOut, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Account — Melanated In Tech" }] }),
  component: Account,
});

function Account() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getProfile = useServerFn(getMyProfile);
  const getSaved = useServerFn(listMySavedAgents);

  const profile = useQuery({ queryKey: ["me"], queryFn: () => getProfile() });
  const saved = useQuery({ queryKey: ["saved-agents"], queryFn: () => getSaved() });
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
        description="Saved agents, profile, and access — all in one place."
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
              <Link to="/admin"><ShieldCheck className="h-4 w-4" /> Admin</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>

        </div>

        <Tabs defaultValue="saved" className="mt-8">
          <TabsList>
            <TabsTrigger value="saved">
              <Bookmark className="h-4 w-4" /> Saved agents
              <span className="ml-1.5 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
                {saved.data?.length ?? 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="mt-6">
            {saved.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (saved.data ?? []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                <p className="font-display text-lg font-semibold">No saved agents yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse the marketplace and save the agents you want to follow.
                </p>
                <Button asChild className="mt-4"><Link to="/agents">Browse the marketplace</Link></Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {(saved.data ?? []).map((s) => s.agents && (
                  <Link
                    key={s.agent_id}
                    to="/agents/$slug"
                    params={{ slug: s.agents.slug }}
                    className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.agents.category}</p>
                      <TierBadge tier={s.agents.tier} />
                    </div>
                    <p className="mt-1 font-display text-lg font-semibold group-hover:text-primary">{s.agents.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{s.agents.tagline}</p>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            {profile.isLoading || !profile.data ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <ProfileEditor profile={profile.data} />
            )}
          </TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
}
