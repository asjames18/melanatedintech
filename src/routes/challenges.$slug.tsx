import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, Copy, MessageSquare } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { getBuilderChallenge } from "@/lib/retention.functions";
import { buildSeoMeta } from "@/lib/seo";
import { toast } from "sonner";

const qo = (slug: string) =>
  queryOptions({
    queryKey: ["builder-challenge", slug],
    queryFn: () => getBuilderChallenge({ data: { slug } }),
  });

export const Route = createFileRoute("/challenges/$slug")({
  head: ({ params }) => ({
    ...buildSeoMeta({
      title: "Builder Challenge - Melanated In Tech",
      description: "A weekly prompt for trying and sharing AI agent workflows.",
      url: `/challenges/${params.slug}`,
    }),
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(qo(params.slug)),
  component: ChallengeDetail,
});

function ChallengeDetail() {
  const { slug } = Route.useParams();
  const { data: challenge } = useSuspenseQuery(qo(slug));

  if (!challenge) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-display text-3xl font-semibold">Challenge not found</h1>
          <Button asChild className="mt-6">
            <Link to="/challenges">View challenges</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(challenge!.prompt);
    toast.success("Prompt copied.");
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={`${challenge.related_category} / Builder challenge`}
        title={challenge.title}
        description={challenge.excerpt}
      />

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {dateRange(challenge.starts_at, challenge.ends_at)}
          </div>

          <div className="mt-6 rounded-xl bg-muted/50 p-5">
            <p className="whitespace-pre-wrap text-base leading-7">{challenge.prompt}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={copyPrompt} variant="outline">
              <Copy className="h-4 w-4" />
              Copy prompt
            </Button>
            <Button asChild>
              <Link to="/community">
                <MessageSquare className="h-4 w-4" />
                Post your result
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-muted/40 p-6">
          <h2 className="font-display text-xl font-semibold">Community tag</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use <span className="font-medium text-foreground">#{challenge.slug}</span> in your post
            so people can find challenge responses and compare approaches.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}

function dateRange(startsAt: string, endsAt: string) {
  const fmt = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${fmt.format(new Date(startsAt))} - ${fmt.format(new Date(endsAt))}`;
}
