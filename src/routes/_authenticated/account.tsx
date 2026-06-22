import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile, listMySavedAgents } from "@/lib/account.functions";
import { TierBadge } from "@/components/cards";
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

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Saved agents</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild><Link to="/admin">Admin</Link></Button>
            <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
          </div>
        </div>

        {saved.isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : (saved.data ?? []).length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="font-display text-lg font-semibold">No saved agents yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Browse the marketplace and save the agents you want to follow.</p>
            <Button asChild className="mt-4"><Link to="/agents">Browse the marketplace</Link></Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(saved.data ?? []).map((s) => s.agents && (
              <Link
                key={s.agent_id}
                to="/agents/$slug"
                params={{ slug: s.agents.slug }}
                className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.agents.category}</p>
                  <TierBadge tier={s.agents.tier} />
                </div>
                <p className="mt-1 font-display text-lg font-semibold">{s.agents.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.agents.tagline}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
