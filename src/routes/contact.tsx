import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { ContactForm } from "@/components/contact-form";
import { buildSeoMeta } from "@/lib/seo";

const searchSchema = z.object({
  topic: fallback(z.string().max(120), "").default(""),
});

export const Route = createFileRoute("/contact")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    ...buildSeoMeta({
      title: "Contact — Melanated In Tech",
      description:
        "Tell us about your AI agent project — strategy, custom build, ministry implementation, or workshop.",
      url: "/contact",
    }),
  }),
  component: Contact,
});

function Contact() {
  const { topic } = Route.useSearch();
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Contact"
        title="Tell us about your agent."
        description="Whether you're scoping a custom build, planning a ministry rollout, or just exploring — we'd love to hear what you're working on."
      />
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <ContactForm defaultTopic={topic} />
      </section>
    </SiteLayout>
  );
}
