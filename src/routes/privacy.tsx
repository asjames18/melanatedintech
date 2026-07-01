import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    ...buildSeoMeta({
      title: "Privacy Policy — Melanated In Tech",
      description: "Learn how Melanated In Tech collects, uses, and safeguards your personal data.",
      url: "/privacy",
    }),
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy."
        description="Last updated: June 30, 2026. This policy outlines our commitment to protecting your privacy and managing your personal information with care."
      />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>
            At Melanated In Tech, we respect your privacy and are committed to protecting the
            personal data you share with us. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you visit our website, utilize our
            interactive AI tools, purchase digital products, or engage with our community forum.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when creating an account, posting in
            the community, subscribing to our newsletters, purchasing premium products, or
            contacting us for custom AI agent builds. This includes:
          </p>
          <ul>
            <li>
              <strong>Account Data:</strong> Name, email address, profile avatar, bio, and auth
              credentials.
            </li>
            <li>
              <strong>Transaction Details:</strong> Payment tokens processed securely via Stripe. We
              do not store raw credit card numbers.
            </li>
            <li>
              <strong>Content and Usage:</strong> Custom prompts saved in your library, prompt pilot
              configs, forum replies, likes/reactions, and chat history with guide assistants.
            </li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the collected information for purposes necessary to operate and improve our
            platform, including:
          </p>
          <ul>
            <li>
              Providing, maintaining, and improving our interactive prompt editors and sandboxes.
            </li>
            <li>Processing payments and managing purchases.</li>
            <li>Enabling community forum features, user follows, and comment notifications.</li>
            <li>
              Sending email updates regarding new agents, lessons, or platform upgrades (which you
              may opt out of at any time).
            </li>
            <li>Analyzing usage statistics to optimize layout and functionality.</li>
          </ul>

          <h2>3. Sharing and Disclosure</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We share data
            only in the following scenarios:
          </p>
          <ul>
            <li>
              <strong>Service Providers:</strong> Secure vendors such as Stripe (payment processing)
              and Supabase (database operations and authentication).
            </li>
            <li>
              <strong>Public Posts:</strong> Any content you share in the public Community tab is
              visible to all registered users and visitors.
            </li>
            <li>
              <strong>Legal Requirements:</strong> If required by law to comply with litigation or
              protect our rights and safety.
            </li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement standard encryption techniques (SSL/TLS) for data in transit and utilize
            secure, compliant cloud infrastructure provided by Supabase and Stripe. However, no
            electronic transmission is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2>5. Your Choices and Rights</h2>
          <p>
            You have the right to access, correct, or request the deletion of your account and
            personal data. You can modify your profile information, delete your saved prompts, or
            terminate your account directly through your profile settings or by contacting our team.
          </p>

          <h2>6. Changes to this Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material
            changes by updating the last updated date at the top of this page.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have questions or concerns about this policy or our data practices, please start
            the conversation by visiting our <a href="/contact">Contact Page</a>.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
