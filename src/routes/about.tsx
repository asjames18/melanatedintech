import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { PILLARS } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Melanated In Tech" },
      {
        name: "description",
        content:
          "We exist to help individuals, entrepreneurs, churches, nonprofits, creators, and businesses understand, build, and deploy AI agents.",
      },
      { property: "og:title", content: "About Melanated In Tech" },
      {
        property: "og:description",
        content: "The vision, mission, and beliefs behind the home for AI agents.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About"
        title="Helping people participate in the AI agent generation."
        description="Melanated In Tech exists to become the leading destination for AI agent knowledge, solutions, and innovation — for the individuals, entrepreneurs, churches, nonprofits, creators, and businesses building what's next."
      />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2>Our vision</h2>
          <p>
            AI agents will become one of the most transformative technologies of this generation. We
            want to help people participate in that future rather than be left behind by it.
          </p>

          <h2>Our mission</h2>
          <p>
            We make AI agents understandable, accessible, and useful — through education, a curated
            marketplace, practical digital products, professional services, and a community of
            builders.
          </p>

          <h2>What we believe</h2>
          <ul>
            <li>AI agents are the next operating layer for work — not just chat.</li>
            <li>Access matters. Knowledge, tools, and opportunity should not be gatekept.</li>
            <li>Stewardship matters. We build with ethics, transparency, and care.</li>
            <li>Doing beats talking. Every pillar exists to help someone ship.</li>
          </ul>

          <h2>How we measure success</h2>
          <p>
            We succeed when users can learn AI agent concepts with confidence, build useful AI
            solutions, implement AI in their organizations, save time, and generate value in the
            growing agent economy.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <Link
              key={p.title}
              to={p.href}
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{p.tag}</p>
              <p className="mt-1 font-display text-lg font-semibold">{p.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
