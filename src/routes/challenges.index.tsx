import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, MessageSquare } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { listBuilderChallenges } from "@/lib/retention.functions";
import { buildSeoMeta } from "@/lib/seo";

const qo = queryOptions({
  queryKey: ["builder-challenges"],
  queryFn: () => listBuilderChallenges(),
});

export const Route = createFileRoute("/challenges/")({
  head: () => ({
    ...buildSeoMeta({
      title: "Builder Challenges - Melanated In Tech",
      description:
        "Weekly AI agent builder prompts for learning, trying, and sharing in community.",
      url: "/challenges",
    }),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  component: ChallengesIndex,
});

function ChallengesIndex() {
  const { data: challenges } = useSuspenseQuery(qo);
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Builder challenges"
        title="Try one useful agent workflow each week."
        description="Short prompts that turn learning into practice, then pull the conversation back into the community."
      />

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <Link
              key={challenge.id}
              to="/challenges/$slug"
              params={{ slug: challenge.slug }}
              className="group block rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {challenge.related_category} / {statusFor(challenge)}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold">{challenge.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{challenge.excerpt}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  {dateRange(challenge.starts_at, challenge.ends_at)}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-muted/40 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Have a result to share?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Post what you tried, what happened, and what you would improve next.
              </p>
            </div>
            <Button asChild>
              <Link to="/community">
                <MessageSquare className="h-4 w-4" />
                Open community
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function statusFor(challenge: { starts_at: string; ends_at: string }) {
  const now = Date.now();
  const starts = new Date(challenge.starts_at).getTime();
  const ends = new Date(challenge.ends_at).getTime();
  if (now < starts) return "Upcoming";
  if (now > ends) return "Past";
  return "This week";
}

function dateRange(startsAt: string, endsAt: string) {
  const fmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  return `${fmt.format(new Date(startsAt))} - ${fmt.format(new Date(endsAt))}`;
}
