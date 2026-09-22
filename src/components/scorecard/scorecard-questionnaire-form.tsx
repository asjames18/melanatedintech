import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitScorecardQuestionnaire } from "@/lib/scorecard.functions";
import { getStripeEnvironment, hasPaymentsClientToken } from "@/lib/stripe";
import {
  APPROVAL_LABELS,
  BUDGET_LABELS,
  BUYER_ROLE_LABELS,
  FREQUENCY_LABELS,
  GOAL_LABELS,
  LEAK_LABELS,
  OWNER_LABELS,
  SYSTEM_LABELS,
  URGENCY_LABELS,
  VOLUME_LABELS,
  type LeakSignal,
  type ScorecardAnswers,
  type ScorecardResult,
  type SystemTouch,
} from "@/lib/scorecard-scoring";
import { SCORECARD_PDF_FILENAME } from "@/lib/scorecard-commerce";
import { trackEvent } from "@/lib/analytics";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

type Props = {
  sessionId: string;
  defaultEmail?: string | null;
  defaultName?: string | null;
  onCompleted?: (payload: {
    result: ScorecardResult;
    pdfBase64: string;
    pdfFilename: string;
    emailSent: boolean;
  }) => void;
};

function downloadPdf(base64: string, filename: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ScorecardQuestionnaireForm({
  sessionId,
  defaultEmail,
  defaultName,
  onCompleted,
}: Props) {
  const submit = useServerFn(submitScorecardQuestionnaire);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{
    result: ScorecardResult;
    pdfBase64: string;
    pdfFilename: string;
    emailSent: boolean;
  } | null>(null);

  const [form, setForm] = useState({
    buyer_email: defaultEmail ?? "",
    buyer_name: defaultName ?? "",
    buyer_role: "owner" as ScorecardAnswers["buyer_role"],
    company_name: "",
    workflow_one_liner: "",
    workflow_start: "",
    workflow_end: "",
    workflow_frequency: "weekly" as ScorecardAnswers["workflow_frequency"],
    workflow_volume_week: "6_20" as ScorecardAnswers["workflow_volume_week"],
    leak_signals: [] as LeakSignal[],
    leak_other: "",
    systems: [] as SystemTouch[],
    systems_other: "",
    approval_points: "exceptions" as ScorecardAnswers["approval_points"],
    approval_detail: "",
    goal_90d: "save_time" as ScorecardAnswers["goal_90d"],
    urgency: "this_quarter" as ScorecardAnswers["urgency"],
    owner_named: "me" as ScorecardAnswers["owner_named"],
    budget_conversation: "maybe" as ScorecardAnswers["budget_conversation"],
    pain_severity: "3" as ScorecardAnswers["pain_severity"],
  });

  const showLeakOther = form.leak_signals.includes("other_leak");
  const showSystemsOther = form.systems.includes("other_system");

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleMulti<T extends string>(key: "leak_signals" | "systems", value: T) {
    setForm((current) => {
      const list = current[key] as T[];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...current, [key]: next };
    });
  }

  const canSubmit = useMemo(() => {
    return (
      form.buyer_email.trim() &&
      form.buyer_name.trim() &&
      form.company_name.trim() &&
      form.workflow_one_liner.trim() &&
      form.workflow_start.trim() &&
      form.workflow_end.trim() &&
      form.leak_signals.length >= 1 &&
      form.systems.length >= 1 &&
      form.approval_detail.trim() &&
      (!showLeakOther || form.leak_other.trim()) &&
      (!showSystemsOther || form.systems_other.trim())
    );
  }, [form, showLeakOther, showSystemsOther]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      toast.error("Please complete all required fields.");
      return;
    }
    setLoading(true);
    try {
      const environment = hasPaymentsClientToken() ? getStripeEnvironment() : "live";
      const response = await submit({
        data: {
          sessionId,
          environment,
          answers: {
            ...form,
            leak_other: showLeakOther ? form.leak_other : undefined,
            systems_other: showSystemsOther ? form.systems_other : undefined,
          },
        },
      });
      if (!response.ok) throw new Error(response.error);
      const payload = {
        result: response.result,
        pdfBase64: response.pdfBase64,
        pdfFilename: response.pdfFilename || SCORECARD_PDF_FILENAME,
        emailSent: Boolean(response.emailSent),
      };
      setDone(payload);
      onCompleted?.(payload);
      trackEvent("scorecard_submitted", {
        band: response.result.band,
        sprint_fit: response.result.sprintFit,
        next_step: response.result.nextStep,
      });
      toast.success("Your Scorecard PDF is ready.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-8">
        <div className="flex gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
          <div>
            <h2 className="font-display text-xl font-semibold">Your Scorecard is ready</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Opportunity score <strong className="text-foreground">{done.result.opportunityScore}</strong>{" "}
              ({done.result.band}) · Sprint fit: <strong className="text-foreground">{done.result.sprintFit}</strong>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{done.result.bandCopy}</p>
            <p className="mt-3 text-sm text-muted-foreground">{done.result.nextStepLine}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            className="gap-2"
            onClick={() => downloadPdf(done.pdfBase64, done.pdfFilename)}
          >
            <Download className="h-4 w-4" /> Download {done.pdfFilename}
          </Button>
          <Button asChild variant="outline">
            <a href={done.result.nextStepPath}>See recommended next step</a>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {done.emailSent
            ? <>We also emailed this PDF to {form.buyer_email}. </>
            : null}
          {done.result.scoreDisclaimer}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-semibold">Complete your Scorecard</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Answer about <strong className="text-foreground">one</strong> repeated workflow. Required
          fields are marked.
        </p>
      </div>

      <fieldset className="space-y-4">
        <legend className="font-display text-base font-semibold">Contact</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="buyer_email">Email for your Scorecard *</Label>
            <Input
              id="buyer_email"
              type="email"
              required
              value={form.buyer_email}
              onChange={(e) => update("buyer_email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyer_name">Your name *</Label>
            <Input
              id="buyer_name"
              required
              value={form.buyer_name}
              onChange={(e) => update("buyer_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyer_role">Your role *</Label>
            <select
              id="buyer_role"
              className={selectClass}
              value={form.buyer_role}
              onChange={(e) => update("buyer_role", e.target.value as ScorecardAnswers["buyer_role"])}
            >
              {Object.entries(BUYER_ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_name">Business / org name *</Label>
            <Input
              id="company_name"
              required
              value={form.company_name}
              onChange={(e) => update("company_name", e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-base font-semibold">The workflow</legend>
        <div className="space-y-2">
          <Label htmlFor="workflow_one_liner">Describe one repeated workflow in one sentence *</Label>
          <Textarea
            id="workflow_one_liner"
            required
            maxLength={280}
            rows={3}
            value={form.workflow_one_liner}
            onChange={(e) => update("workflow_one_liner", e.target.value)}
            placeholder="e.g. New inbound leads sit in the inbox until someone manually books a job."
          />
          <p className="text-xs text-muted-foreground">{form.workflow_one_liner.length}/280</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="workflow_start">Where does it usually start? *</Label>
            <Input
              id="workflow_start"
              required
              value={form.workflow_start}
              onChange={(e) => update("workflow_start", e.target.value)}
              placeholder="new lead in inbox"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workflow_end">Where does it end when done right? *</Label>
            <Input
              id="workflow_end"
              required
              value={form.workflow_end}
              onChange={(e) => update("workflow_end", e.target.value)}
              placeholder="job booked / ticket closed"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workflow_frequency">How often does this run? *</Label>
            <select
              id="workflow_frequency"
              className={selectClass}
              value={form.workflow_frequency}
              onChange={(e) =>
                update("workflow_frequency", e.target.value as ScorecardAnswers["workflow_frequency"])
              }
            >
              {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="workflow_volume_week">Rough volume per week *</Label>
            <select
              id="workflow_volume_week"
              className={selectClass}
              value={form.workflow_volume_week}
              onChange={(e) =>
                update(
                  "workflow_volume_week",
                  e.target.value as ScorecardAnswers["workflow_volume_week"],
                )
              }
            >
              {Object.entries(VOLUME_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="font-display text-base font-semibold">
          Where does this workflow usually leak time or money? * (pick at least one)
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.entries(LEAK_LABELS) as [LeakSignal, string][]).map(([value, label]) => (
            <label key={value} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.leak_signals.includes(value)}
                onChange={() => toggleMulti("leak_signals", value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        {showLeakOther && (
          <div className="space-y-2">
            <Label htmlFor="leak_other">If Other, briefly what?</Label>
            <Input
              id="leak_other"
              value={form.leak_other}
              onChange={(e) => update("leak_other", e.target.value)}
            />
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="font-display text-base font-semibold">
          What systems touch this workflow today? * (pick at least one)
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.entries(SYSTEM_LABELS) as [SystemTouch, string][]).map(([value, label]) => (
            <label key={value} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.systems.includes(value)}
                onChange={() => toggleMulti("systems", value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        {showSystemsOther && (
          <div className="space-y-2">
            <Label htmlFor="systems_other">If Other, name it</Label>
            <Input
              id="systems_other"
              value={form.systems_other}
              onChange={(e) => update("systems_other", e.target.value)}
            />
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-base font-semibold">Human judgment</legend>
        <div className="space-y-2">
          <Label htmlFor="approval_points">Where must a person approve or decide? *</Label>
          <select
            id="approval_points"
            className={selectClass}
            value={form.approval_points}
            onChange={(e) =>
              update("approval_points", e.target.value as ScorecardAnswers["approval_points"])
            }
          >
            {Object.entries(APPROVAL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="approval_detail">One example of a judgment call in this workflow *</Label>
          <Textarea
            id="approval_detail"
            required
            maxLength={400}
            rows={3}
            value={form.approval_detail}
            onChange={(e) => update("approval_detail", e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-base font-semibold">Goal + fit signals</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="goal_90d">What does “better” mean in the next 90 days? *</Label>
            <select
              id="goal_90d"
              className={selectClass}
              value={form.goal_90d}
              onChange={(e) => update("goal_90d", e.target.value as ScorecardAnswers["goal_90d"])}
            >
              {Object.entries(GOAL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="urgency">How urgent is fixing this? *</Label>
            <select
              id="urgency"
              className={selectClass}
              value={form.urgency}
              onChange={(e) => update("urgency", e.target.value as ScorecardAnswers["urgency"])}
            >
              {Object.entries(URGENCY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner_named">Is there a clear owner for this workflow? *</Label>
            <select
              id="owner_named"
              className={selectClass}
              value={form.owner_named}
              onChange={(e) =>
                update("owner_named", e.target.value as ScorecardAnswers["owner_named"])
              }
            >
              {Object.entries(OWNER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget_conversation">
              Could you have a budget conversation about improving this in the next 60 days? *
            </Label>
            <select
              id="budget_conversation"
              className={selectClass}
              value={form.budget_conversation}
              onChange={(e) =>
                update(
                  "budget_conversation",
                  e.target.value as ScorecardAnswers["budget_conversation"],
                )
              }
            >
              {Object.entries(BUDGET_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pain_severity">How painful is this today (1–5)? *</Label>
            <select
              id="pain_severity"
              className={selectClass}
              value={form.pain_severity}
              onChange={(e) =>
                update("pain_severity", e.target.value as ScorecardAnswers["pain_severity"])
              }
            >
              {(["1", "2", "3", "4", "5"] as const).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <Button type="submit" size="lg" disabled={loading || !canSubmit} className="gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Generate my Scorecard PDF
      </Button>
      <p className="text-xs text-muted-foreground">
        Scores are inferred from your answers. This is not the $297 Diagnostic and not the Workflow
        Opportunity Sprint.
      </p>
    </form>
  );
}
