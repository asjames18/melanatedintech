import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Layers, ShieldCheck } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { AiStackBuilderWizard } from "@/components/ai-tools/ai-stack-builder-wizard";
import { buildSeoMeta, breadcrumbLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/ai-stack-builder")({
  head: () => ({
    ...buildSeoMeta({
      title: "AI Stack Builder — Custom AI Architecture & Tool Recommendations | Melanated In Tech",
      description:
        "Tell us what you are trying to accomplish. Receive a tailored, production-ready AI stack architecture covering models, automation, databases, and monitoring.",
      url: "/ai-stack-builder",
    }),
    scripts: [
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "AI Tools", path: "/ai-tools" },
          { name: "AI Stack Builder", path: "/ai-stack-builder" },
        ]),
      ),
    ],
  }),
  component: AiStackBuilderPage,
});

function AiStackBuilderPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Interactive Architecture Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Find My AI Stack
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Not sure what AI tools you need? Tell us what you&apos;re trying to solve, your team scale, and budget. We will generate a complete, production-tested AI architecture.
          </p>
        </div>

        {/* The Interactive Wizard */}
        <AiStackBuilderWizard />

        {/* Why Curation Matters */}
        <div className="rounded-3xl border border-border/80 bg-muted/20 p-8 text-center space-y-3 max-w-3xl mx-auto text-xs sm:text-sm text-muted-foreground">
          <h3 className="font-bold text-foreground text-base">
            Why Architecture Matters More Than Directory Lists
          </h3>
          <p className="leading-relaxed">
            Most companies fail with AI because they buy disconnected subscriptions: a chatbot tool that doesn&apos;t connect to their CRM, an automation tool with crushing task fees, and a database with no vector search. Melanated In Tech engineers connected stacks designed to operate reliably in production.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
