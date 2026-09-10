import { createFileRoute } from "@tanstack/react-router";
import { CommercialServicePage } from "@/components/commercial-service-page";
import { getCommercialService } from "@/lib/commercial-services";
import { breadcrumbLd, buildSeoMeta, ldScript, serviceLd } from "@/lib/seo";

const service = getCommercialService("ai-agents")!;

export const Route = createFileRoute("/services/ai-agents")({
  head: () => ({
    ...buildSeoMeta({
      title: `${service.seoTitle} | Melanated In Tech`,
      description: service.description,
      url: "/services/ai-agents",
    }),
    scripts: [
      ldScript(
        serviceLd({
          name: service.name,
          description: service.description,
          url: "/services/ai-agents",
        }),
      ),
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/work-with-us" },
          { name: service.name, path: "/services/ai-agents" },
        ]),
      ),
    ],
  }),
  component: () => <CommercialServicePage service={service} />,
});
