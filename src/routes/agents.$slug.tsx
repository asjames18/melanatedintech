import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { TierBadge } from "@/components/cards";
import { WaitlistForm } from "@/components/waitlist-form";
import { getAgent } from "@/lib/public.functions";
import { ArrowLeft, Bot, CheckCircle2 } from "lucide-react";

const agentQO = (slug: string) =>
  queryOptions({
    queryKey: ["agent", slug],
    queryFn: () => getAgent({ data: { slug } }),
  });

export const Route = createFileRoute("/agents/$slug")({
  loader: async ({ context, params }) => {
    const agent = await context.queryClient.ensureQueryData(agentQO(params.slug));
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
  if (!agent) return null;

  return (
    <SiteLayout>
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Link to="/agents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All agents
          </Link>
          <div className="mt-6 flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-foreground text-background">
              <Bot className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-primary">{agent.category}</p>
              <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{agent.name}</h1>
              <p className="mt-2 text-lg text-muted-foreground">{agent.tagline}</p>
              <div className="mt-4 flex items-center gap-2">
                <TierBadge tier={agent.tier} />
                {agent.featured && (
                  <span className="inline-flex rounded-full bg-accent2/15 px-2 py-0.5 text-xs font-medium text-accent2">
                    Featured
                  </span>
                )}
              </div>
            </div>
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
                    <li key={c} className="flex items-start gap-2 text-sm">
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
    </SiteLayout>
  );
}
