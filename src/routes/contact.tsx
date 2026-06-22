import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { ContactForm } from "@/components/contact-form";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Melanated In Tech" },
      { name: "description", content: "Tell us about your AI agent project — strategy, custom build, ministry implementation, or workshop." },
      { property: "og:title", content: "Contact Melanated In Tech" },
      { property: "og:description", content: "Tell us about your AI agent project." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Contact"
        title="Tell us about your agent."
        description="Whether you're scoping a custom build, planning a ministry rollout, or just exploring — we'd love to hear what you're working on."
      />
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <ContactForm />
      </section>
    </SiteLayout>
  );
}
