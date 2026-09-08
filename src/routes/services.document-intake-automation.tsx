import { createFileRoute } from "@tanstack/react-router";
import { CommercialServicePage } from "@/components/commercial-service-page";
import { getCommercialService } from "@/lib/commercial-services";
import { breadcrumbLd, buildSeoMeta, ldScript, serviceLd } from "@/lib/seo";

const service = getCommercialService("document-intake-automation")!;

export const Route = createFileRoute("/services/document-intake-automation")({
  head: () => ({
    ...buildSeoMeta({
      title: `${service.seoTitle} | Melanated In Tech`,
      description: service.description,
      url: "/services/document-intake-automation",
    }),
    scripts: [
      ldScript(
        serviceLd({
          name: service.name,
          description: service.description,
          url: "/services/document-intake-automation",
        }),
      ),
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/work-with-us" },
          { name: service.name, path: "/services/document-intake-automation" },
        ]),
      ),
    ],
  }),
  component: () => <CommercialServicePage service={service} />,
});
