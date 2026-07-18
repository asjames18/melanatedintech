import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { PILLARS } from "@/lib/site";
import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    ...buildSeoMeta({
      title: "About — Melanated In Tech",
      description:
        "Melanated In Tech was founded by Antonio James to make the AI agent economy accessible — for the builders, entrepreneurs, churches, and small teams usually left out of waves like this one.",
      url: "/about",
    }),
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About"
        title="Helping people participate in the AI agent generation."
        description="Melanated In Tech exists so the people usually left out of technology waves get to build, own, and benefit from this one."
      />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Founder */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            A note from the founder
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-xl font-bold text-primary">
              AJ
            </div>
            <div>
              <p className="font-display text-lg font-semibold">Antonio James</p>
              <p className="text-sm text-muted-foreground">Founder, Melanated In Tech</p>
            </div>
          </div>
          <div className="prose prose-slate dark:prose-invert mt-6 max-w-none text-[15px] leading-relaxed">
            <p>
              I work in technology for a living — keeping the systems running that real people
              depend on every day. And like a lot of us, I watched the AI wave arrive and noticed
              the same old pattern forming: the tools, the money, and the know-how pooling in the
              same places they always do, while everyone else gets told to wait for the summary.
            </p>
            <p>
              I built Melanated In Tech because I didn't want to watch that happen again. AI agents
              are going to change how work gets done — for businesses, for churches, for solo
              builders with more ideas than hours. The people I come from shouldn't be the last to
              benefit from that. They should be building it.
            </p>
            <p>
              So this site is the place I wished existed: real agents you can use, guides written
              plainly, tools that work in your browser, and a straight answer about what things
              cost. No gatekeeping, no hype, no jargon walls.
            </p>
            <p>
              If you're here early — welcome. You're not late to AI. You're right on time.
            </p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert mt-14 max-w-none">
          <h2>What we believe</h2>
          <ul>
            <li>AI agents are the next operating layer for work — not just chat.</li>
            <li>Access matters. Knowledge, tools, and opportunity should not be gatekept.</li>
            <li>Stewardship matters. We build with ethics, transparency, and care.</li>
            <li>Doing beats talking. Everything on this site exists to help someone ship.</li>
          </ul>

          <h2>How we measure success</h2>
          <p>
            We succeed when you can learn agent concepts with confidence, build something useful,
            put it to work in your business or organization, and keep the value it creates.
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
