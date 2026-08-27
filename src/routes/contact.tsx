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
      title: "Work With Melanated In Tech | Training, AI & Websites",
      description:
        "Tell us about your AI training, workflow, website, presentation, or custom implementation needs.",
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
        eyebrow="Work with us"
        title="Tell us what you are trying to make better."
        description="Whether you want practical AI training, a clearer workflow, a website launch, a presentation, or a custom build, we would love to hear what you are working on."
      />
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <ContactForm defaultTopic={topic} />
      </section>
    </SiteLayout>
  );
}
