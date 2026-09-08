import { createFileRoute } from "@tanstack/react-router";
import { CommercialServicePage } from "@/components/commercial-service-page";
import { getCommercialService } from "@/lib/commercial-services";
import { breadcrumbLd, buildSeoMeta, ldScript, serviceLd } from "@/lib/seo";

const service = getCommercialService("workflow-automation")!;

export const Route = createFileRoute("/services/workflow-automation")({
  head: () => ({
    ...buildSeoMeta({
      title: `${service.seoTitle} | Melanated In Tech`,
      description: service.description,
      url: "/services/workflow-automation",
    }),
    scripts: [
      ldScript(
        serviceLd({
          name: service.name,
          description: service.description,
          url: "/services/workflow-automation",
        }),
      ),
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/work-with-us" },
          { name: service.name, path: "/services/workflow-automation" },
        ]),
      ),
    ],
  }),
  component: () => <CommercialServicePage service={service} />,
});
