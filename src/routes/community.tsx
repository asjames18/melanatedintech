import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { WaitlistForm } from "@/components/waitlist-form";
import { Users, MessageSquare, Lightbulb, Rocket } from "lucide-react";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Agent Builder Community — Melanated In Tech" },
      { name: "description", content: "A community for people building, deploying, and benefiting from AI agents. Coming soon." },
      { property: "og:title", content: "AI Agent Builder Community" },
      { property: "og:description", content: "Where AI agent builders learn, ship, and grow together." },
    ],
  }),
  component: Community,
});

const PILLARS = [
  { icon: Users, title: "Builders, not spectators", body: "A room full of people actually shipping agents — ministries, founders, operators, creators." },
  { icon: MessageSquare, title: "Real conversations", body: "Live Q&A, async threads, code reviews, and feedback on agents in progress." },
  { icon: Lightbulb, title: "First access", body: "Early drops of new agents, blueprints, and prompt libraries before they go public." },
  { icon: Rocket, title: "Ship together", body: "Cohorts, build challenges, and accountability — so the agent in your head ends up in production." },
];

function Community() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Community"
        title="The agent builder community is coming."
        description="A focused community for people building, deploying, and benefiting from AI agents. Join the waitlist to get an invite when doors open."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-border bg-foreground p-10 text-background">
          <h2 className="font-display text-2xl font-semibold">Join the agent builder waitlist</h2>
          <p className="mt-2 max-w-xl text-sm text-background/70">
            We're opening in waves. Drop your email and we'll send your invite when your seat is ready.
          </p>
          <div className="mt-5 max-w-md">
            <WaitlistForm source="community" />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
