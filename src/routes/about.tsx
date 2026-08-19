import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { PILLARS } from "@/lib/site";
import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    ...buildSeoMeta({
      title: "About — Melanated In Tech",
      description:
        "Melanated In Tech builds practical revenue-recovery automation for service businesses while making AI knowledge, tools, and opportunity more accessible.",
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
        title="Practical automation built around real business outcomes."
        description="We help service businesses recover missed opportunities, follow up consistently, and retain more customers—while keeping AI education and opportunity accessible."
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
              depend on every day. That taught me that useful technology is not measured by how
              impressive it sounds. It is measured by whether it solves a real operating problem.
            </p>
            <p>
              I built Melanated In Tech to help owner-led service businesses put automation to work
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
              of Melanated In Tech.
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
