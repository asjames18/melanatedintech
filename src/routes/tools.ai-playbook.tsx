import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  PLAYBOOK,
  PRO_TEASER,
  EXAMPLE_NICHES,
  NICHES,
  titleCase,
  personalize,
  pluralizeNiche,
} from "@/lib/playbook-data";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductWaitlist } from "@/components/product-waitlist";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Chat } from "@/components/agents/Chat";
import { ToolGuide } from "@/components/tool-guide";

const GUIDE_DATA = {
  whatItIs: "A niche-tailored prompt generator that instantly creates industry-specific AI prompts for marketing, sales, operations, and customer support.",
  whyUseIt: "Eliminates generic template guesswork by embedding your exact trade context directly into every prompt block.",
  howToUse: [
    "Type your profession or business niche into the input field (e.g. realtor, photographer, ministry leader, plumber).",
    "Click 'Build my playbook' to generate customized prompt packs.",
    "Click 'Test Drive Live' on any prompt card to run the prompt instantly in your browser, or click 'Edit in Pilot' to customize it further.",
  ],
};

export const Route = createFileRoute("/tools/ai-playbook")({
  validateSearch: (search: Record<string, unknown>): { niche?: string } => ({
    niche: typeof search.niche === "string" && search.niche.trim() ? search.niche : undefined,
  }),
  head: () => {
    const seo = buildSeoMeta({
      title: "AI Playbook — Melanated In Tech",
      description:
        "Type in what you do and get a personalized playbook of AI prompts for marketing, sales, and operations — built for your exact business.",
      url: "/tools/ai-playbook",
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "AI Tools", path: "/tools" },
            { name: "AI Playbook", path: "/tools/ai-playbook" },
          ]),
        ),
      ],
    };
  },
  component: AiPlaybookPage,
});

function AiPlaybookPage() {
  const navigate = useNavigate();
  const { niche: nicheParam } = Route.useSearch();
  const [nicheInput, setNicheInput] = useState(nicheParam ?? "");
  const [niche, setNiche] = useState<string | null>(null);
  const [activeTestDrive, setActiveTestDrive] = useState<{ title: string; prompt: string } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Arriving with ?niche= (e.g. from the homepage hero or a niche landing page)
  // builds the playbook immediately — and rebuilds on client-side nav to a new niche.
  useEffect(() => {
    if (nicheParam) generate(nicheParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nicheParam]);

  const generate = (value?: string) => {
    const raw = (value ?? nicheInput).trim();
    if (!raw) {
      toast.warning("Tell us what you do first — e.g. wedding photographer.");
      return;
    }
    if (value) setNicheInput(value);
    setNiche(raw.toLowerCase());
    trackEvent("ai_playbook_generated", { niche: raw.toLowerCase() });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleCopy = (body: string, title: string) => {
    navigator.clipboard.writeText(body).then(
      () => {
        trackEvent("ai_playbook_prompt_copied", { niche, prompt: title });
        toast.success(`Copied "${title}" — paste it into ChatGPT or Claude.`);
      },
      () => toast.error("Failed to copy prompt."),
    );
  };

  const handleSendToPilot = (prompt: string, title: string) => {
    trackEvent("ai_playbook_send_to_pilot", { niche, prompt: title });
    navigate({
      to: "/tools/prompt-pilot",
    });
    toast.success(`Opening Prompt Pilot...`);
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Interactive Tools"
        title="AI Playbook."
        description="Type in what you do and get a personalized pack of AI prompts for marketing, sales, and operations — written for your exact business, not a generic template."
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <ToolGuide guide={GUIDE_DATA} />
        {/* Generator */}
        <Card className="mx-auto max-w-2xl border border-border bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-xl font-bold">What do you do?</CardTitle>
            <CardDescription>
              Your niche, trade, or profession — the playbook rewrites itself around it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="e.g. wedding photographer, HVAC contractor, realtor…"
                value={nicheInput}
                onChange={(e) => setNicheInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
                maxLength={80}
                className="flex-1"
              />
              <Button onClick={() => generate()} className="gap-1.5">
                <Sparkles className="h-4 w-4" />
                Build my playbook
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span>Try:</span>
              {EXAMPLE_NICHES.map((n) => (
                <button
                  key={n}
                  onClick={() => generate(n)}
                  className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground transition-colors hover:bg-muted"
                >
                  {n}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {niche && (
          <div ref={resultsRef} className="mt-16 scroll-mt-24">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
                The AI Playbook for {titleCase(pluralizeNiche(niche))}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Copy any prompt into ChatGPT or Claude and fill in the [brackets] with your
                details.
              </p>
            </div>

            <div className="mt-10 space-y-12">
              {PLAYBOOK.map(({ category, Icon, colorClass, prompts }) => (
                <div key={category}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`rounded-xl p-2.5 ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground">{category}</h3>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {prompts.map(({ title, body }) => {
                      const personalized = personalize(body, niche);
                      return (
                        <Card
                          key={title}
                          className="border border-border bg-card shadow-sm transition-all hover:border-foreground/15 flex flex-col justify-between"
                        >
                          <div>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                              <CardTitle className="text-base font-semibold">{title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                                {personalized}
                              </p>
                            </CardContent>
                          </div>
                          <div className="p-4 border-t border-border/50 mt-4 flex flex-wrap items-center justify-between gap-2 pt-3">
                            <Button
                              size="sm"
                              className="gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-sm text-xs"
                              onClick={() => setActiveTestDrive({ title, prompt: personalized })}
                            >
                              <Play className="h-3.5 w-3.5 fill-current" />
                              Test Drive Live
                            </Button>
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-xs"
                                onClick={() => handleSendToPilot(personalized, title)}
                              >
                                <Wand2 className="h-3.5 w-3.5" />
                                Edit in Pilot
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-xs"
                                onClick={() => handleCopy(personalized, title)}
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Copy
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Pro tier waitlist */}
            <div className="mx-auto mt-16 max-w-2xl">
              <Card className="border border-border bg-card shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="font-display text-xl font-bold">
                        AI Playbook Pro
                      </CardTitle>
                      <CardDescription>
                        The complete playbook for {pluralizeNiche(niche)} — coming soon
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {PRO_TEASER.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <ProductWaitlist productSlug="ai-playbook-pro" />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Browse by niche — crawlable links to the per-niche landing pages */}
        <div className="mx-auto mt-20 max-w-4xl">
          <h2 className="text-center font-display text-xl font-bold text-foreground">
            Browse ready-made playbooks by niche
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {NICHES.map((n) => (
              <Link
                key={n.slug}
                to="/ai-playbook-for/$niche"
                params={{ niche: n.slug }}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
              >
                {n.plural}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Test Drive Live Modal */}
      <Dialog open={!!activeTestDrive} onOpenChange={(open) => !open && setActiveTestDrive(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Test Drive: {activeTestDrive?.title}
            </DialogTitle>
            <DialogDescription>
              Test this prompt in real time using free open-source AI models right in your browser.
            </DialogDescription>
          </DialogHeader>

          {activeTestDrive && (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] block mb-1">Preloaded System Instructions:</span>
                {activeTestDrive.prompt}
              </div>

              <Chat
                agentName={activeTestDrive.title}
                defaultModel="openrouter/openrouter/free"
                overrideSystemPrompt={activeTestDrive.prompt}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
