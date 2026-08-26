import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => ({
    ...buildSeoMeta({
      title: "Terms of Service — Melanated In Tech",
      description:
        "Read the Terms of Service for using the Melanated In Tech platform, tools, and community.",
      url: "/terms",
    }),
  }),
  component: TermsOfService,
});

function TermsOfService() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service."
        description="Last updated: August 26, 2026. Please read these terms carefully before using our website, products, tools, or professional services."
      />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>
            Welcome to Melanated In Tech! These Terms of Service (&ldquo;Terms&rdquo;) govern your
            access to and use of our website, tools, digital products, community features, Recovery
            Pilots, managed automation, and related professional services provided by Melanated In
            Tech (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). By accessing or using
            the services, you agree to these Terms. If you act for a business, you represent that
            you have authority to bind that business.
          </p>

          <h2>1. Eligibility and Acceptable Use</h2>
          <p>
            You must be at least 18 years old and may use the services only for lawful purposes. You
            must not use our website, tools, or automations to create, transmit, or facilitate
            content or activity that:
          </p>
          <ul>
            <li>Is defamatory, obscene, harassing, threatening, or otherwise hateful.</li>
            <li>
              Infringes on the intellectual property, copyright, or trademark rights of others.
            </li>
            <li>Contains viruses, malware, or any other destructive software.</li>
            <li>
              Attempts to exploit, scrape, or circumvent security limits on our AI chat interfaces
              or API endpoints.
            </li>
            <li>Violates privacy, consumer-protection, telemarketing, or communication laws.</li>
            <li>
              Uses contact data obtained without the right to use it for the intended purpose.
            </li>
          </ul>

          <h2>2. User Accounts</h2>
          <p>
            To access certain features (such as saving custom prompts to the database or commenting
            in the community), you must create an account. You are responsible for safeguarding your
            credentials and for all activities that occur under your account. You agree to provide
            accurate and complete registration info.
          </p>

          <h2>3. Service Inquiries and Demonstrations</h2>
          <p>
            Website descriptions, demonstrations, projected workflows, and starting prices are for
            evaluation only. Demonstrations use fictional or sample data and are not customer case
            studies or promises of results. Submitting a qualification form does not require either
            party to enter an engagement.
          </p>

          <h2>4. Recovery Pilots and Professional Services</h2>
          <p>
            Paid implementation work is governed by an accepted proposal, statement of work, order
            form, or similar written scope (&ldquo;Service Order&rdquo;). A project begins only
            after the required deposit is paid and necessary access and information are provided. If
            a Service Order conflicts with these Terms on project-specific scope, price, timing, or
            acceptance criteria, the Service Order controls for that engagement.
          </p>
          <p>You agree to:</p>
          <ul>
            <li>Provide accurate workflow, pricing, availability, and escalation rules.</li>
            <li>
              Provide timely access to the approved CRM, scheduler, messaging, or related systems.
            </li>
            <li>Review tests and respond to decisions or acceptance requests on time.</li>
            <li>Maintain backups and appropriate access controls for systems you operate.</li>
            <li>
              Ensure you have a lawful basis and any required consent to contact each person whose
              information is used in a workflow.
            </li>
            <li>
              Maintain and honor suppression lists, do-not-contact requests, and channel-specific
              opt-outs, including requests received outside the automation.
            </li>
          </ul>
          <p>
            Material additions, extra locations, new channels, custom integrations, or changes to
            accepted requirements may require a revised timeline and separate quote. Delays in
            access, approvals, vendor availability, or client decisions may move delivery dates.
          </p>

          <h2>5. Fees, Deposits, and Third-Party Costs</h2>
          <p>
            Unless a Service Order states otherwise, a Recovery Pilot requires a 50% deposit before
            implementation and the remaining balance at launch or the stated acceptance milestone.
            Stripe processes payments; we do not store complete payment-card numbers. You are
            responsible for applicable taxes and separately identified third-party charges,
            including CRM, scheduling, telephony, messaging, email, and AI usage.
          </p>
          <p>
            Cancellation, rescheduling, refund, and acceptance terms are stated in the applicable
            Service Order. Deposits reserve implementation capacity and may become non-refundable
            once work begins, to the extent stated in that Service Order and permitted by law. We
            may pause work or service for overdue balances after reasonable notice.
          </p>

          <h2>6. Managed Automation Care</h2>
          <p>
            Ongoing monitoring and optimization are limited to the systems, support boundaries,
            usage, and response expectations in the applicable Service Order. Managed care does not
            include unlimited redesigns, new locations, new integrations, or continuous human call
            answering unless expressly included. Billing frequency, renewal, cancellation, and any
            minimum term are specified in the Service Order.
          </p>

          <h2>7. Third-Party Platforms and AI</h2>
          <p>
            Automations may rely on third-party platforms selected or approved by you. Those
            platforms have separate terms, pricing, limits, and privacy practices. We are not
            responsible for their outages, policy changes, delivery failures, suspended accounts,
            API limitations, or discontinued features, although managed support may include
            reasonable troubleshooting within the agreed scope.
          </p>
          <p>
            We use deterministic rules for critical scheduling, pricing, consent, and escalation
            decisions where specified. AI may assist with classification, summarization,
            personalization, or drafting, but AI output can be incomplete or incorrect. You remain
            responsible for reviewing business decisions and communications that require human
            judgment.
          </p>

          <h2>8. Intellectual Property Rights</h2>
          <ul>
            <li>
              <strong>Our Content:</strong> Except for software source code expressly released
              under the MIT License in our public repository, the design, layout, assets, logos,
              Marks, and materials on the platform are owned by Melanated In Tech and protected by
              applicable intellectual-property laws.
            </li>
            <li>
              <strong>Melanated In Tech Marks and Forks:</strong> The MIT License for the public
              source code does not grant permission to use the Melanated In Tech name, logos,
              domains, favicons, visual identity, or official accounts as the identity of another
              product, service, deployment, organization, or fork. Any public fork or derivative
              must use a distinct name, replace official branding and contact information, use its
              own domains and credentials, and not imply affiliation with or endorsement by
              Melanated In Tech. The full policy is available in our public repository.
            </li>
            <li>
              <strong>Your Contributions:</strong> You retain ownership of the prompts, text, files,
              and comments you create. By posting public content in the Community feed, you grant us
              a worldwide, non-exclusive license to display, distribute, and archive your content
              for community operations.
            </li>
            <li>
              <strong>Professional Deliverables:</strong> Ownership and license rights for
              client-specific deliverables are stated in the Service Order. Unless expressly
              transferred, we retain our pre-existing materials, reusable modules, templates,
              methods, know-how, and general improvements. After full payment, you may use the
              configured deliverables for your internal business purposes under the Service Order.
            </li>
          </ul>

          <h2>9. Payment and Digital Deliverables</h2>
          <p>
            Certain digital products, templates, and agent templates require payment. All
            transactions are billed via Stripe. Unless otherwise noted, all sales of digital
            products are final and non-refundable due to the instant nature of digital delivery.
          </p>

          <h2>10. Confidentiality and Data</h2>
          <p>
            Each party may receive non-public business, technical, or customer information from the
            other. Each party agrees to use that information only for the engagement, protect it
            with reasonable care, and disclose it only to personnel and providers who need it to
            perform the work or as required by law. Our handling of personal information is also
            described in our Privacy Policy. Any additional data-processing requirements should be
            documented in the Service Order or a separate data-processing agreement.
          </p>

          <h2>11. Electronic Communications</h2>
          <p>
            You agree that we may send transactional communications relating to inquiries,
            proposals, invoices, security, and active services. Marketing communications will
            include an appropriate way to opt out where required. You are responsible for the
            content, audience, consent, and suppression requirements of communications sent through
            automations operated for your business.
          </p>

          <h2>12. Disclaimers and Results</h2>
          <p>
            Our services and interactive AI tools are provided &ldquo;as is&rdquo; without
            warranties of any kind except those expressly stated in an accepted Service Order. We do
            not guarantee that AI output will be accurate, complete, or suitable for a particular
            business decision.
          </p>
          <p>
            Automation can improve response and follow-up consistency, but we do not guarantee
            revenue, bookings, estimate acceptance, retention, message delivery, or other commercial
            results. Results depend on demand, pricing, customer consent, staff follow-through,
            provider availability, and conditions outside our control.
          </p>

          <h2>13. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, neither party will be liable for indirect,
            incidental, special, exemplary, punitive, or consequential damages, or for lost profits,
            lost revenue, lost data, or business interruption. Our aggregate liability arising from
            a paid service will not exceed the amount you paid us for the service giving rise to the
            claim during the six months before the event. These limits do not apply where liability
            cannot lawfully be limited.
          </p>

          <h2>14. Indemnification</h2>
          <p>
            You agree to defend and indemnify Melanated In Tech from third-party claims arising from
            your unlawful use of the services, your content or contact data, communications sent on
            your behalf, your products or services, or your violation of these Terms or applicable
            law. This obligation does not apply to the extent a claim results from our willful
            misconduct or other liability that cannot be excluded by law.
          </p>

          <h2>15. Suspension and Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account or restrict your access to our
            tools/forums at any time, with or without notice, if we believe you have violated these
            Terms, created a security or legal risk, or engaged in harmful activity. Either party
            may end professional services as allowed by the applicable Service Order. Payment,
            confidentiality, intellectual-property, disclaimer, liability, and dispute provisions
            survive termination where their nature requires it.
          </p>

          <h2>16. Governing Law and Venue</h2>
          <p>
            These Terms are governed by Florida law, without regard to conflict-of-law principles.
            Unless a Service Order provides a different dispute process, claims must be brought in
            the state or federal courts with jurisdiction over Highlands County, Florida, and each
            party consents to that venue.
          </p>

          <h2>17. General Terms</h2>
          <p>
            If a provision is unenforceable, the remaining provisions stay in effect. A failure to
            enforce a provision is not a waiver. You may not assign an engagement without our prior
            written consent, except as part of a merger or sale of substantially all relevant
            assets. These Terms and any applicable Service Order form the agreement for the covered
            services and replace prior discussions about the same subject.
          </p>

          <h2>18. Updates and Contact</h2>
          <p>
            We may revise these Terms from time to time. The most current version will always be
            posted here with its effective date. Material changes will apply prospectively unless
            otherwise required by law. Questions about these Terms may be sent to{" "}
            <a href="mailto:hello@melanatedintech.com">hello@melanatedintech.com</a>. Melanated In
            Tech is based in Sebring, Florida.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
