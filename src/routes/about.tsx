import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { buildSeoMeta } from "@/lib/seo";
import { ArrowRight } from "lucide-react";

const libraryResources = [
  {
    title: "Knowledge Hub",
    href: "/knowledge",
    blurb:
      "Field guides and playbooks on the patterns behind our client work: workflow mapping, responsible automation, evaluation, and handoffs.",
  },
  {
    title: "Tools workbench",
    href: "/tools",
    blurb:
      "Interactive tools like Prompt Pilot and the SOP Generator for drafting, testing, and thinking through your own workflows.",
  },
  {
    title: "Agent marketplace",
    href: "/agents",
    blurb:
      "Production-grade AI agents and starter packs — the reusable pieces, ready when you want them.",
  },
  {
    title: "AI, Translated",
    href: "/podcast",
    blurb:
      "A weekly show translating AI news into plain language for business owners.",
  },
] as const;

export const Route = createFileRoute("/about")({
  head: () => ({
    ...buildSeoMeta({
      title: "About — Melanated in Tech",
      description:
        "Melanated in Tech builds practical revenue-recovery automation for service businesses while making AI knowledge, tools, and opportunity more accessible.",
      url: "/about",
    }),
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About Melanated in Tech"
        title="We redesign how your company works in the age of AI."
        description="Melanated in Tech helps owner-led businesses find the workflows already costing them time and revenue — then rebuilds those workflows with practical, human-approved AI. Everything we learn doing that work goes into open guides, tools, and agents anyone can use."
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
              <p className="text-sm text-muted-foreground">Founder, Melanated in Tech</p>
            </div>
          </div>
          <div className="prose prose-slate dark:prose-invert mt-6 max-w-none text-[15px] leading-relaxed">
            <p>
              I work in technology for a living — keeping the systems running that real people
              depend on every day. That taught me that useful technology is not measured by how
              impressive it sounds. It is measured by whether it solves a real operating problem.
            </p>
            <p>
              I built Melanated in Tech to help owner-led service businesses put automation to work
              where revenue is commonly lost: unanswered inquiries, unfinished estimates, route
              customers who never become recurring customers, and clients who do not rebook.
            </p>
            <p>
              We start with one defined leak, build a focused recovery workflow, and measure the
              activity it influences. The goal is not to replace the people who run the business. It
              is to give them a more dependable system for responding, following up, and knowing
              when a person needs to take over.
            </p>
            <p>
              The larger mission remains the same: the people and communities usually left out of
              technology waves should be able to build, own, and benefit from this one. That is why
              the marketplace, knowledge hub, podcast, products, and interactive tools remain part
              of Melanated in Tech.
            </p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert mt-14 max-w-none">
          <h2>What we build</h2>
          <p>
            Our recovery systems support urgent-call businesses, estimate-driven contractors,
            recurring property services, and appointment-based beauty businesses. A typical
            engagement begins with a fixed-scope 30-Day Recovery Pilot and can continue with managed
            monitoring and optimization when ongoing support makes sense.
          </p>
          <p>
            We are based in Sebring, Florida, with an initial focus on Highlands County and Florida
            service businesses. Qualified businesses throughout the United States can also work with
            us.
          </p>

          <h2>What we believe</h2>
          <ul>
            <li>Business outcomes come before technology labels.</li>
            <li>Critical pricing, consent, scheduling, and escalation rules should be explicit.</li>
            <li>Automation should support people and make human takeover clear.</li>
            <li>Access matters. Knowledge, tools, and opportunity should not be gatekept.</li>
            <li>Stewardship matters. We build with ethics, transparency, and care.</li>
          </ul>

          <h2>How we measure success</h2>
          <p>
            We succeed when a client can see what the system did, where a person intervened, and
            which inquiries, bookings, estimates, reactivations, or recurring customers it
            influenced. We do not promise revenue; we build for measurable, responsible execution.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl font-semibold">Have a revenue leak worth fixing?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us where follow-up is breaking down and see the most relevant recovery system.
            </p>
          </div>
          <Link
            to="/get-a-demo"
            className="mt-4 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground sm:mt-0"
          >
            Get a Demo
          </Link>
        </div>

        <div className="mt-14">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            The library behind the work
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            Learn it yourself, or hire us to build it.
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            Every engagement teaches us something reusable. We publish the patterns, keep the tools
            open, and productize the pieces — so the knowledge doesn&apos;t stay locked inside
            client work.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {libraryResources.map((r) => (
              <Link
                key={r.title}
                to={r.href}
                className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
              >
                <p className="font-display text-lg font-semibold">{r.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.blurb}</p>
                <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Explore{" "}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
