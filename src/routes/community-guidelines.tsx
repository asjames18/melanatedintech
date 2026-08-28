import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, SiteLayout } from "@/components/site-layout";
import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/community-guidelines")({
  head: () => ({
    ...buildSeoMeta({
      title: "Community Guidelines - Melanated In Tech",
      description: "Participation, attribution, privacy, and reporting expectations for the Melanated In Tech Community.",
      url: "/community-guidelines",
    }),
  }),
  component: CommunityGuidelines,
});

function CommunityGuidelines() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Community"
        title="Community Guidelines"
        description="A constructive space for sharing useful AI work, asking thoughtful questions, and learning with care for the people affected by technology."
      />
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="space-y-10 text-sm leading-7 text-muted-foreground sm:text-base">
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Build constructively</h2>
            <p className="mt-3">
              Share build updates, questions, resources, collaboration opportunities, and practical lessons. Discuss ideas directly and respectfully, assume good intent, and make room for people who are new to AI, open source, or technical work.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Credit work and protect privacy</h2>
            <p className="mt-3">
              Attribute tools, ideas, and lived expertise. Do not post private information, credentials, client material, customer data, or confidential work without clear authorization. Keep claims about safety, compliance, performance, and automation within documented evidence and project scope.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">What is not welcome</h2>
            <p className="mt-3">
              Harassment, discrimination, threats, hateful language, personal attacks, sexualized content, intimidation, public disclosure of private information, and repeated bad-faith disruption are not acceptable in this community.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Report concerns privately</h2>
            <p className="mt-3">
              If you experience or witness a concern, email <a className="font-semibold text-primary hover:underline" href="mailto:hello@melanatedintech.com?subject=Melanated%20In%20Tech%20Code%20of%20Conduct">hello@melanatedintech.com</a> with the subject line <span className="font-mono text-sm text-foreground">Melanated In Tech Code of Conduct</span>. Please do not post sensitive reports publicly. Good-faith reports are reviewed as promptly and fairly as possible, and retaliation is not acceptable.
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <p>
              These guidelines apply to the public Community and related project spaces. For the repository version, see the <a className="font-semibold text-primary hover:underline" href="https://github.com/asjames18/melanatedintech/blob/main/CODE_OF_CONDUCT.md" target="_blank" rel="noreferrer">Code of Conduct</a>.
            </p>
            <Link to="/community" className="mt-5 inline-flex font-semibold text-primary hover:underline">Return to Community</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
