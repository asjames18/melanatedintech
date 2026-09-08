import { createFileRoute } from "@tanstack/react-router";
import { CommercialServicePage } from "@/components/commercial-service-page";
import { getCommercialService } from "@/lib/commercial-services";
import { breadcrumbLd, buildSeoMeta, ldScript, serviceLd } from "@/lib/seo";

const service = getCommercialService("ai-integrations")!;

export const Route = createFileRoute("/services/ai-integrations")({
  head: () => ({
    ...buildSeoMeta({
      title: `${service.seoTitle} | Melanated In Tech`,
      description: service.description,
      url: "/services/ai-integrations",
    }),
    scripts: [
      ldScript(
        serviceLd({
          name: service.name,
          description: service.description,
          url: "/services/ai-integrations",
        }),
      ),
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/work-with-us" },
          { name: service.name, path: "/services/ai-integrations" },
        ]),
      ),
    ],
  }),
  component: () => <CommercialServicePage service={service} />,
});
