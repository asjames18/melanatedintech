import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Check, Copy, Download, Github, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { buildPackMarkdown, getStarterPack } from "@/lib/agent-starter-packs";
import { trackEvent } from "@/lib/analytics";
import { buildSeoMeta, breadcrumbLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/starter-packs/$slug")({
  loader: ({ params }) => {
    const pack = getStarterPack(params.slug);
    if (!pack) throw notFound();
    return pack;
  },
  head: ({ loaderData }) => {
    const pack = loaderData!;
    return {
      ...buildSeoMeta({
        title: `${pack.title} | Melanated In Tech`,
        description: pack.description,
        url: `/starter-packs/${pack.id}`,
      }),
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Starter Packs", path: "/starter-packs" },
            { name: pack.title, path: `/starter-packs/${pack.id}` },
          ]),
        ),
      ],
    };
  },
  component: StarterPackDetail,
});

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackEvent("starter_pack_copied", { label });
    } catch {
      toast.error("Your browser blocked clipboard access. Select the text and copy manually.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
      <span className="sr-only"> {label}</span>
    </button>
  );
}

function StarterPackDetail() {
  const pack = Route.useLoaderData();

  const handleDownload = () => {
    const blob = new Blob([buildPackMarkdown(pack)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pack.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    trackEvent("starter_pack_downloaded", { pack: pack.id });
    toast.success(`Downloaded ${pack.id}.md`);
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={pack.category}
        title={pack.title}
        description={pack.description}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              <Download className="h-4 w-4" /> Download the pack (.md)
            </button>
            {pack.githubUrl ? (
              <a
                href={pack.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:border-primary/40"
              >
                <Github className="h-4 w-4" /> View Open Source Repo
              </a>
            ) : null}
            <Link
              to="/starter-packs"
              className="inline-flex items-center rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold"
            >
              All starter packs
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Built for:</span> {pack.targetAudience}
          </p>
          {pack.githubUrl ? (
            <a
              href={pack.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <Github className="h-3.5 w-3.5" /> Open-Source on GitHub
            </a>
          ) : null}
        </div>

        {pack.githubUrl ? (
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Github className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-foreground">Open-Source Community Skill Library</p>
                <p className="text-muted-foreground">
                  Explore full 6-file skill folders, JSON schemas, workflows, and automated linters.
                </p>
              </div>
            </div>
            <a
              href={pack.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-3 inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Explore repo <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : null}

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">Prompts</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Replace every <code className="rounded bg-muted px-1 py-0.5">{"{{PLACEHOLDER}}"}</code>{" "}
            with your own details before running these.
          </p>
          <div className="mt-6 space-y-6">
            {pack.prompts.map((prompt) => (
              <article key={prompt.title} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold">{prompt.title}</h3>
                  <CopyButton text={prompt.prompt} label={prompt.title} />
                </div>
                <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-muted/60 p-4 text-xs leading-relaxed">
                  {prompt.prompt}
                </pre>
              </article>
            ))}
          </div>
        </section>

        {pack.mcpConfigs?.length ? (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-semibold">MCP server configuration</h2>
            <div className="mt-3 flex gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p>
                These are sample configurations. Every{" "}
                <code className="rounded bg-muted px-1 py-0.5">{"${VARIABLE}"}</code> placeholder is
                a credential you must supply yourself — never paste a real secret into a file you
                share.
              </p>
            </div>
            <div className="mt-6 space-y-6">
              {pack.mcpConfigs.map((config) => {
                const json = JSON.stringify(
                  { command: config.command, args: config.args, env: config.env },
                  null,
                  2,
                );
                return (
                  <article key={config.name} className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold">{config.name}</h3>
                      <CopyButton text={json} label={config.name} />
                    </div>
                    <pre className="mt-4 overflow-x-auto rounded-xl bg-muted/60 p-4 text-xs leading-relaxed">
                      {json}
                    </pre>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {pack.sopTemplate ? (
          <section className="mt-14">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold">Standard operating procedure</h2>
              <CopyButton text={pack.sopTemplate} label="standard operating procedure" />
            </div>
            <pre className="mt-6 overflow-x-auto whitespace-pre-wrap break-words rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed">
              {pack.sopTemplate}
            </pre>
          </section>
        ) : null}

        {pack.policyNotes ? (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-semibold">Policy notes</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {pack.policyNotes}
            </p>
          </section>
        ) : null}
      </div>

      <section className="border-t border-border bg-muted/25">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold">Want it built and monitored for you?</h2>
          <p className="mt-3 text-muted-foreground">
            A fixed-scope pilot closes one measurable revenue leak in your existing tools, with
            testing, staff handoff, and 30 days of monitoring.
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
