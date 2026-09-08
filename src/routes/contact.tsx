import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { ContactForm } from "@/components/contact-form";
import { buildSeoMeta } from "@/lib/seo";

const campaignLabel = z
  .string()
  .trim()
  .max(100)
  .regex(/^[a-zA-Z0-9._-]+$/, "Invalid campaign label.");

const optionalTopic = z
  .string()
  .trim()
  .max(120)
  .transform((value) => value || undefined)
  .optional()
  .catch(undefined);
const optionalCampaignLabel = campaignLabel
  .transform((value) => value || undefined)
  .optional()
  .catch(undefined);

const searchSchema = z.object({
  topic: optionalTopic,
  utm_source: optionalCampaignLabel,
  utm_medium: optionalCampaignLabel,
  utm_campaign: optionalCampaignLabel,
});

export const Route = createFileRoute("/contact")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    ...buildSeoMeta({
      title: "Discuss an AI Workflow or Integration Project | Melanated In Tech",
      description:
        "Tell Melanated In Tech about the workflow, systems, impact, timing, and constraints behind your AI automation or integration project.",
      url: "/contact",
    }),
  }),
  component: Contact,
});

function Contact() {
  const { topic, utm_source, utm_medium, utm_campaign } = Route.useSearch();
  return (
    <SiteLayout>
      <PageHeader
        title="Tell us what you're trying to solve."
        description="Start with the operational problem—not an AI feature list. Share enough context for us to assess fit and recommend the smallest responsible next step."
      />
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <ContactForm
          defaultTopic={topic}
          campaign={{
            source: utm_source,
            medium: utm_medium,
            campaign: utm_campaign,
          }}
        />
      </section>
    </SiteLayout>
  );
}
