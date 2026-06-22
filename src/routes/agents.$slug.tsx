import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { AgentCard, TierBadge } from "@/components/cards";
import { WaitlistForm } from "@/components/waitlist-form";
import { SaveAgentButton } from "@/components/save-agent-button";
import { getAgent, listAgents } from "@/lib/public.functions";
import { ArrowLeft, Bot, CheckCircle2, Layers, Sparkles, Tag } from "lucide-react";

const agentQO = (slug: string) =>
  queryOptions({ queryKey: ["agent", slug], queryFn: () => getAgent({ data: { slug } }) });
const allAgentsQO = queryOptions({ queryKey: ["agents"], queryFn: () => listAgents() });

export const Route = createFileRoute("/agents/$slug")({
  loader: async ({ context, params }) => {
    const [agent] = await Promise.all([
      context.queryClient.ensureQueryData(agentQO(params.slug)),
      context.queryClient.ensureQueryData(allAgentsQO),
    ]);
    if (!agent) throw notFound();
    return { agent };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.agent
      ? [
          { title: `${loaderData.agent.name} — AI Agent | Melanated In Tech` },
          { name: "description", content: loaderData.agent.tagline },
          { property: "og:title", content: `${loaderData.agent.name} — AI Agent` },
          { property: "og:description", content: loaderData.agent.tagline },
        ]
      : [{ title: "Agent — Melanated In Tech" }],
  }),
  errorComponent: ({ error }) => <SiteLayout><div className="p-12 text-center text-sm text-muted-foreground">{error.message}</div></SiteLayout>,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Agent not found</h1>
        <p className="mt-2 text-muted-foreground">It may have been retired or renamed.</p>
        <Link to="/agents" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to marketplace
        </Link>
      </div>
    </SiteLayout>
  ),
  component: AgentDetail,
});

function AgentDetail() {
  const { slug } = Route.useParams();
  const { data: agent } = useSuspenseQuery(agentQO(slug));
  const { data: allAgents } = useSuspenseQuery(allAgentsQO);
  if (!agent) return null;

  const related = allAgents
    .filter((a) => a.slug !== agent.slug && a.category === agent.category)
    .slice(0, 3);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Link to="/agents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All agents
          </Link>
          <div className="mt-6 flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-foreground text-background shadow-lg shadow-foreground/10">
              <Bot className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-primary">{agent.category}</p>
              <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{agent.name}</h1>
              <p className="mt-2 text-lg text-muted-foreground">{agent.tagline}</p>
              <div className="mt-4 flex items-center gap-2">
                <TierBadge tier={agent.tier} />
                {agent.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent2/15 px-2 py-0.5 text-xs font-medium text-accent2">
                    <Sparkles className="h-3 w-3" /> Featured
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={Tag} label="Category" value={agent.category} />
            <Stat icon={Layers} label="Capabilities" value={String((agent.capabilities ?? []).length)} />
            <Stat icon={Sparkles} label="Tier" value={agent.tier} capitalize />
            <Stat icon={CheckCircle2} label="Status" value="Onboarding" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="font-display text-xl font-semibold">About this agent</h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{agent.description}</p>

            {agent.capabilities && agent.capabilities.length > 0 && (
              <>
                <h2 className="mt-10 font-display text-xl font-semibold">Capabilities</h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {agent.capabilities.map((c) => (
                    <li key={c} className="flex items-start gap-2 rounded-lg border border-border bg-card p-3 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent2" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <aside className="md:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-medium">Get early access</p>
              <p className="mt-1 text-xs text-muted-foreground">
                We're onboarding builders for {agent.name}. Join the list to get a deployment invite.
              </p>
              <div className="mt-4">
                <WaitlistForm source={`agent:${agent.slug}`} interest={agent.name} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-primary">Related</p>
                <h2 className="mt-1 font-display text-2xl font-semibold">More {agent.category} agents</h2>
              </div>
              <Link to="/agents" className="text-sm font-medium text-primary hover:underline">All agents →</Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <AgentCard key={a.id} {...a} capabilities={a.capabilities} />
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

function Stat({
  icon: Icon, label, value, capitalize,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className={`mt-1 text-sm font-medium ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}
