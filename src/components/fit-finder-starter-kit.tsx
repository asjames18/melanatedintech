import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, CheckCircle2, Download, Mail, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinWaitlist } from "@/lib/public.functions";
import { trackEvent } from "@/lib/analytics";
import { funnelAttribution } from "@/components/funnel-attribution";
import { toast } from "sonner";

type Props = {
  answers: Record<string, string>;
  agentNames: string[];
  productName?: string | null;
  highIntent: boolean;
};

export function FitFinderStarterKit({ answers, agentNames, productName, highIntent }: Props) {
  const [email, setEmail] = useState("");
  const [captured, setCaptured] = useState(false);
  const [loading, setLoading] = useState(false);
  const join = useServerFn(joinWaitlist);

  async function capture(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      await join({
        data: {
          email: trimmed,
          source: "fit-finder-starter-kit",
          interest: `${answers.role || "Visitor"}: ${answers.goal || "First useful agent"}`.slice(
            0,
            200,
          ),
        },
      });
      setCaptured(true);
      trackEvent("starter_kit_email_captured", {
        role: answers.role || "not_answered",
        highIntent,
        ...funnelAttribution(),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not prepare your starter kit.");
    } finally {
      setLoading(false);
    }
  }

  function download() {
    const content = buildStarterKit(answers, agentNames, productName, highIntent);
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "my-first-useful-agent-starter-kit.md";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    trackEvent("starter_kit_downloaded", {
      role: answers.role || "not_answered",
      highIntent,
      ...funnelAttribution(),
    });
  }

  return (
    <section className="rounded-2xl border border-primary/25 bg-primary/5 p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          {captured ? <CheckCircle2 className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Your next step
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold">
            {captured ? "Your starter kit is ready." : "Email your plan to yourself."}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Get a personalized, downloadable brief with your first workflow, guardrails, human
            approvals, recommended resources, and a seven-day action plan.
          </p>
        </div>
      </div>

      {captured ? (
        <Button onClick={download} className="mt-5">
          <Download className="h-4 w-4" /> Download my starter kit
        </Button>
      ) : (
        <form onSubmit={capture} className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            required
            maxLength={255}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@organization.org"
            aria-label="Email address"
            className="bg-background"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Preparing…" : "Get my starter kit"}
          </Button>
        </form>
      )}

      {highIntent && (
        <div className="mt-6 border-t border-primary/20 pt-5">
          <p className="flex items-center gap-2 font-medium">
            <Zap className="h-4 w-4 text-accent2" /> This workflow may benefit from a focused
            diagnostic.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your timeline, role, or risk level suggests that scoping approvals and implementation
            before building would reduce rework.
          </p>
          <Button asChild variant="outline" className="mt-4 bg-background">
            <Link
              to="/work-with-us"
              onClick={() =>
                trackEvent("service_path_clicked", {
                  surface: "fit_finder_results",
                  ...funnelAttribution(),
                })
              }
            >
              Explore the AI Workflow Diagnostic <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}

function buildStarterKit(
  answers: Record<string, string>,
  agentNames: string[],
  productName: string | null | undefined,
  highIntent: boolean,
) {
  const workflow = answers.goal || "Choose one repeated, low-risk workflow";
  return `# My First Useful Agent Starter Kit

Prepared by Melanated In Tech

## My starting point

- Role: ${answers.role || "Not specified"}
- First goal: ${workflow}
- Risk level: ${answers.risk || "Not specified"}
- Tools involved: ${answers.tools || "Not specified"}
- Desired timeline: ${answers.timeline || "Not specified"}

## Recommended first-agent brief

**Job:** Help with ${workflow.toLowerCase()} while keeping a named human accountable for the final outcome.

**Inputs to gather:** 5–10 representative examples, the current checklist or policy, a list of common exceptions, and the name of the workflow owner.

**Human approvals:** A person reviews external messages, record changes, money, private data, policy decisions, and any output the agent marks as uncertain.

**First success measure:** Compare one week of the current process with one assisted week. Track minutes saved, rework required, exceptions, and user satisfaction.

## Matched resources

${agentNames.map((name) => `- Agent: ${name}`).join("\n") || "- Review your Fit Finder agent recommendations"}
${productName ? `- Product: ${productName}` : ""}

## Seven-day action plan

1. Name one workflow owner.
2. Write the current process in five to ten steps.
3. Mark every step that needs human judgment or approval.
4. Collect representative examples of good work.
5. Choose one measurable outcome.
6. Test the agent on examples before using live data.
7. Review failures and decide whether to iterate, stop, or scope a build.

## Recommended next move

${
  highIntent
    ? "Because this appears time-sensitive, leadership-owned, or higher risk, consider a focused AI Workflow Diagnostic before implementation: https://melanatedintech.com/work-with-us"
    : "Run a small internal test, then repeat the Fit Finder when the team has evidence from real examples."
}

---
Keep humans accountable. Start narrow. Measure what changes.
`;
}
