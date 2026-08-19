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
        description="Last updated: August 11, 2026. This policy outlines our commitment to protecting your privacy and managing your personal information with care."
      />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>
            At Melanated In Tech, we respect your privacy and are committed to protecting the
            personal data you share with us. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you visit our website, utilize our
            interactive AI tools, purchase digital products, engage with our community, request a
            demonstration, or use our professional automation services.
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
              <strong>Service Inquiry Data:</strong> Business contact details, industry, team and
              location ranges, current software, customer-volume range, operational challenges,
              desired outcomes, timing, budget range, consent timestamp, and campaign attribution
              submitted through our recovery-system qualification form.
            </li>
            <li>
              <strong>Professional Service Data:</strong> Workflow requirements, business rules,
              project notes, account-access records, support communications, system events, consent
              and opt-out records, and outcome or attribution data needed to deliver an engagement.
            </li>
            <li>
              <strong>Client Customer Data:</strong> When a client authorizes an automation, we may
              process its customers&rsquo; contact details, appointment or service information,
              communication preferences, messages, and workflow status on the client&rsquo;s behalf.
            </li>
            <li>
              <strong>Content and Usage:</strong> Custom prompts saved in your library, prompt pilot
              configs, forum replies, likes/reactions, and chat history with guide assistants.
            </li>
            <li>
              <strong>Technical and Analytics Data:</strong> IP address, browser and device details,
              referring page, timestamps, security logs, page and campaign attribution, and
              non-identifying funnel events such as demo progression.
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
            <li>
              Assessing service fit, preparing relevant workflow demonstrations and proposals, and
              communicating about requested implementations.
            </li>
            <li>Enabling community forum features, user follows, and comment notifications.</li>
            <li>
              Sending email updates regarding new agents, lessons, or platform upgrades (which you
              may opt out of at any time).
            </li>
            <li>
              Analyzing non-identifying funnel events to improve the site and sales process. We do
              not send names, email addresses, phone numbers, or message contents to analytics.
            </li>
            <li>
              Configuring, testing, monitoring, troubleshooting, securing, and reporting on
              authorized client automations.
            </li>
            <li>Preventing fraud, spam, misuse, and security incidents.</li>
            <li>Complying with legal, accounting, contractual, and audit obligations.</li>
          </ul>

          <h2>3. Client Customer Data</h2>
          <p>
            When we process personal information through an automation for a business client, that
            client determines the people to contact, the purpose of the workflow, and the underlying
            business rules. The client is responsible for providing required notices, obtaining any
            required consent, maintaining lawful contact data, and honoring requests received
            outside the automated system. We process that information to provide the agreed service
            and as otherwise documented in the applicable service agreement.
          </p>

          <h2>4. Sharing and Disclosure</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We share data
            only in the following scenarios:
          </p>
          <ul>
            <li>
              <strong>Service Providers:</strong> Secure vendors such as Stripe (payment processing)
              Supabase (database operations and authentication), Cloudflare (hosting, delivery, and
              security), and Resend (email delivery), plus approved CRM, scheduling, telephony,
              messaging, analytics, and AI providers used to deliver requested workflows.
            </li>
            <li>
              <strong>Public Posts:</strong> Any content you share in the public Community tab is
              visible to all registered users and visitors.
            </li>
            <li>
              <strong>Legal Requirements:</strong> If required by law to comply with litigation or
              protect our rights and safety.
            </li>
            <li>
              <strong>Business Changes:</strong> In connection with a merger, financing,
              reorganization, or sale of relevant business assets, subject to appropriate
              confidentiality protections.
            </li>
          </ul>
          <p>
            We do not sell personal information. We do not sell or share mobile opt-in information
            with third parties for their own marketing. Providers may use information only to
            perform authorized services for us or a client, subject to their agreements and legal
            obligations.
          </p>

          <h2>5. Cookies and Analytics</h2>
          <p>
            We and our service providers may use cookies, local storage, and similar technologies
            for authentication, preferences, security, performance, and measurement. Analytics
            events are designed not to include names, email addresses, phone numbers, or message
            contents. Browser settings may allow you to block certain storage, although doing so can
            prevent account or interactive features from working properly.
          </p>

          <h2>6. Data Retention</h2>
          <p>
            We keep information only as long as reasonably necessary for the purposes described in
            this policy, including service delivery, security, dispute resolution, and legal or
            accounting requirements. In general, unsuccessful service inquiries may be retained for
            up to 24 months after the last interaction; project, consent, invoice, and transaction
            records may be retained for up to seven years after the relevant engagement; and account
            content is retained while the account remains active and for a reasonable backup or
            recovery period after deletion. A Service Order may establish a different retention
            period for client customer data.
          </p>
          <p>
            We may retain limited suppression records after an opt-out so that we can continue to
            honor the request. Aggregated or de-identified information that can no longer reasonably
            identify a person may be retained for analysis and service improvement.
          </p>

          <h2>7. Data Security</h2>
          <p>
            We implement standard encryption techniques (SSL/TLS) for data in transit and utilize
            secure, compliant cloud infrastructure provided by Supabase and Stripe. However, no
            electronic transmission is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2>8. Communication Choices</h2>
          <p>
            You may unsubscribe from marketing email using the link in the message or by contacting
            us. For supported text-message workflows, reply STOP or use the opt-out method stated in
            the message. Transactional messages related to an active request, purchase, invoice, or
            service may continue when needed to complete that interaction. Opting out of marketing
            does not prevent essential security or account notices.
          </p>

          <h2>9. Your Choices and Rights</h2>
          <p>
            You have the right to access, correct, or request the deletion of your account and
            personal data. You can modify your profile information, delete your saved prompts, or
            terminate your account directly through your profile settings or by contacting our team.
            Depending on where you live, you may have additional rights to receive a copy of your
            information, restrict or object to certain processing, or appeal a denied request.
          </p>
          <p>
            Send a request to{" "}
            <a href="mailto:hello@melanatedintech.com">hello@melanatedintech.com</a>. We may need to
            verify your identity and authority before completing it. If your information belongs to
            one of our business clients, contact that business first; we will assist the client as
            required by our agreement and applicable law. Some information may be retained where
            required for legal, security, payment, or suppression purposes.
          </p>

          <h2>10. Children&rsquo;s Privacy</h2>
          <p>
            Our services are intended for adults and businesses and are not directed to children
            under 13. We do not knowingly collect personal information from children under 13. If
            you believe a child has provided information to us, please contact us so we can review
            and delete it where appropriate.
          </p>

          <h2>11. United States Processing</h2>
          <p>
            Melanated In Tech is based in Florida, and information may be processed and stored in
            the United States or other locations where our service providers operate. Those
            locations may have data-protection rules different from those where you live.
          </p>

          <h2>12. Changes to this Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material
            changes by updating the last updated date at the top of this page.
          </p>

          <h2>13. Contact Us</h2>
          <p>
            If you have questions, requests, or concerns about this policy or our data practices,
            email <a href="mailto:hello@melanatedintech.com">hello@melanatedintech.com</a> or visit
            our <a href="/contact">Contact Page</a>. Melanated In Tech is based in Sebring, Florida.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
