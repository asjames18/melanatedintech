import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductWaitlist } from "@/components/product-waitlist";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { PLAYBOOK, NICHES, getNiche, personalize } from "@/lib/playbook-data";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Copy, Sparkles } from "lucide-react";

export const Route = createFileRoute("/ai-playbook-for/$niche")({
  loader: ({ params }) => {
    const entry = getNiche(params.niche);
    if (!entry) throw notFound();
    return { entry };
  },
  head: ({ params, loaderData }) => {
    const entry = loaderData?.entry;
    const path = `/ai-playbook-for/${params.niche}`;
    if (!entry) return { meta: [{ title: "AI Playbook — Melanated In Tech" }] };
    const seo = buildSeoMeta({
      title: `AI Prompts for ${entry.plural} — Free AI Playbook | Melanated In Tech`,
      description: `${PLAYBOOK.reduce((n, c) => n + c.prompts.length, 0)} free copy-paste AI prompts written for ${entry.plural.toLowerCase()} — marketing, customer replies, reviews, operations, and growth. No signup required.`,
      url: path,
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "AI Playbook", path: "/tools/ai-playbook" },
            { name: entry.plural, path },
          ]),
        ),
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">
          No playbook for that niche — yet.
        </h1>
        <p className="mt-2 text-muted-foreground">
          Type what you do into the generator and it'll build one for you on the spot.
        </p>
        <Link
          to="/tools/ai-playbook"
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          Open the AI Playbook <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </SiteLayout>
  ),
  component: NichePlaybookPage,
});

function NichePlaybookPage() {
  const { entry } = Route.useLoaderData();
  const promptCount = PLAYBOOK.reduce((n, c) => n + c.prompts.length, 0);
  const otherNiches = NICHES.filter((n) => n.slug !== entry.slug);

  const handleCopy = (body: string, title: string) => {
    navigator.clipboard.writeText(body).then(
      () => {
        trackEvent("ai_playbook_prompt_copied", { niche: entry.slug, prompt: title });
        toast.success(`Copied "${title}" — paste it into ChatGPT or Claude.`);
      },
      () => toast.error("Failed to copy prompt."),
    );
  };

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Free AI Playbook
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            AI Prompts for {entry.plural}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {entry.intro}
          </p>
          <ul className="mt-6 space-y-2">
            {entry.painPoints.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent2" />
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link to="/tools/ai-playbook" search={{ niche: entry.nicheNoun }}>
                Open the interactive playbook <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              {promptCount} prompts below — free, no signup.
            </p>
          </div>
        </div>
      </section>

      {/* The playbook, fully rendered for this niche */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {PLAYBOOK.map(({ category, Icon, colorClass, prompts }) => (
            <div key={category}>
              <div className="mb-4 flex items-center gap-3">
                <div className={`rounded-xl p-2.5 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground">{category}</h2>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {prompts.map(({ title, body }) => {
                  const personalized = personalize(body, entry.nicheNoun);
                  return (
                    <Card
                      key={title}
                      className="border border-border bg-card shadow-sm transition-all hover:border-foreground/15"
                    >
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold">{title}</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 shrink-0"
                          onClick={() => handleCopy(personalized, title)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                          {personalized}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Copy any prompt into ChatGPT or Claude and fill in the [brackets] with your details. Want
          a version built around your exact wording?{" "}
          <Link
            to="/tools/ai-playbook"
            search={{ niche: entry.nicheNoun }}
            className="font-semibold text-primary hover:underline"
          >
            Use the interactive playbook →
          </Link>
        </p>

        {/* Pro waitlist */}
        <div className="mx-auto mt-16 max-w-2xl">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-xl font-bold">
                Want the complete playbook for {entry.plural.toLowerCase()}?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                AI Playbook Pro adds 40+ prompts across hiring, finance, and retention, plus
                step-by-step workflow guides and a recommended AI tool stack for your budget.
                Join the list and you'll get first access (and the launch price).
              </p>
              <ProductWaitlist productSlug="ai-playbook-pro" />
            </CardContent>
          </Card>
        </div>

        {/* Internal links to sibling pages */}
        <div className="mx-auto mt-16 max-w-4xl">
          <h2 className="text-center font-display text-lg font-bold text-foreground">
            <Sparkles className="mr-1.5 inline h-4 w-4 text-primary" />
            AI playbooks for other businesses
          </h2>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {otherNiches.map((n) => (
              <Link
                key={n.slug}
                to="/ai-playbook-for/$niche"
                params={{ niche: n.slug }}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
              >
                {n.plural}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
