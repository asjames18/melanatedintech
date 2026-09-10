import { createFileRoute } from "@tanstack/react-router";
import { CommercialServicePage } from "@/components/commercial-service-page";
import { getCommercialService } from "@/lib/commercial-services";
import { breadcrumbLd, buildSeoMeta, ldScript, serviceLd } from "@/lib/seo";

const service = getCommercialService("internal-knowledge-systems")!;

export const Route = createFileRoute("/services/internal-knowledge-systems")({
  head: () => ({
    ...buildSeoMeta({
      title: `${service.seoTitle} | Melanated In Tech`,
      description: service.description,
      url: "/services/internal-knowledge-systems",
    }),
    scripts: [
      ldScript(
        serviceLd({
          name: service.name,
          description: service.description,
          url: "/services/internal-knowledge-systems",
        }),
      ),
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/work-with-us" },
          { name: service.name, path: "/services/internal-knowledge-systems" },
        ]),
      ),
    ],
  }),
  component: () => <CommercialServicePage service={service} />,
});
