import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Server, Workflow } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { STARTER_PACKS } from "@/lib/agent-starter-packs";
import { buildSeoMeta, breadcrumbLd, collectionLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/starter-packs/")({
  head: () => ({
    ...buildSeoMeta({
      title: "AI Agent Starter Packs | Melanated In Tech",
      description:
        "Free prompt libraries, MCP server configurations, and standard operating procedures for trades, ministry, technical, and campus IT teams.",
      url: "/starter-packs",
    }),
    scripts: [
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Starter Packs", path: "/starter-packs" },
        ]),
      ),
      ldScript(
        collectionLd({
          name: "AI Agent Starter Packs",
          url: "/starter-packs",
          description:
            "Prompt libraries, MCP configurations, and SOPs you can copy into your own AI tooling.",
        }),
      ),
    ],
  }),
  component: StarterPacksIndex,
});

function StarterPacksIndex() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Free starter packs"
        title="Copy a working setup instead of starting from a blank prompt."
        description="Each pack bundles the prompts, MCP server configuration, and written procedure for one kind of team. Everything is free, editable, and yours to keep."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {STARTER_PACKS.map((pack) => (
            <Link
              key={pack.id}
              to="/starter-packs/$slug"
              params={{ slug: pack.id }}
              className="group flex flex-col rounded-3xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {pack.category}
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold">{pack.title}</h2>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{pack.description}</p>

              <dl className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-primary" />
                  <dt className="sr-only">Prompts</dt>
                  <dd>
                    {pack.prompts.length} prompt{pack.prompts.length === 1 ? "" : "s"}
                  </dd>
                </div>
                {pack.mcpConfigs?.length ? (
                  <div className="flex items-center gap-1.5">
                    <Server className="h-4 w-4 text-primary" />
                    <dt className="sr-only">MCP servers</dt>
                    <dd>
                      {pack.mcpConfigs.length} MCP server
                      {pack.mcpConfigs.length === 1 ? "" : "s"}
                    </dd>
                  </div>
                ) : null}
                {pack.sopTemplate ? (
                  <div className="flex items-center gap-1.5">
                    <Workflow className="h-4 w-4 text-primary" />
                    <dt className="sr-only">Procedure</dt>
                    <dd>Written SOP</dd>
                  </div>
                ) : null}
              </dl>

              <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Open the pack
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/25">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold">
            Want this running in your business instead?
          </h2>
          <p className="mt-3 text-muted-foreground">
            The packs are the do-it-yourself path. If you would rather have one measurable revenue
            leak closed and monitored for you, start with a fixed-scope pilot.
          </p>
          <Link
            to="/get-a-demo"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Get a relevant demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
