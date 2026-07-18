import { ArrowDown, CheckCircle2, UserCheck } from "lucide-react";

const EXAMPLES = [
  {
    id: "higher-education",
    eyebrow: "Higher-education reference workflow",
    title: "Administrative request triage for student services",
    problem:
      "Student questions arrive through shared inboxes and forms with inconsistent detail. Staff repeatedly classify requests, find policy language, draft routine replies, and forward exceptions while students wait without clear status.",
    current: [
      "Student submits an email or general form",
      "Coordinator reads and manually categorizes it",
      "Staff searches policy pages and prior replies",
      "A response is drafted or the request is forwarded",
      "Follow-up is tracked in inbox folders or a spreadsheet",
    ],
    agent: {
      name: "Student Request Triage Agent",
      body: "Classifies the request, checks for missing information, retrieves approved policy passages, drafts a response, recommends a destination, and creates a consistent case summary.",
    },
    flow: [
      "Request received",
      "Classify + retrieve policy",
      "Draft + confidence check",
      "Human approval",
      "Send or escalate",
    ],
    approvals: [
      "A staff member approves every external response during pilot.",
      "Policy exceptions, appeals, financial matters, accommodations, and safety concerns always escalate.",
      "The agent cannot change the student record or make an eligibility decision.",
      "Low-confidence matches route to a named queue with the evidence used.",
    ],
    outcomes: [
      "Target: reduce first-response preparation time for routine requests.",
      "More consistent use of approved policy language.",
      "Cleaner handoffs with category, urgency, missing details, and source links attached.",
      "Measurable review data: time saved, correction rate, escalations, and student wait time.",
    ],
  },
  {
    id: "ministry-nonprofit",
    eyebrow: "Ministry/nonprofit reference workflow",
    title: "Volunteer intake and follow-up coordination",
    problem:
      "Volunteer interest comes through forms, events, email, and personal referrals. A small team re-enters information, sends similar follow-ups, checks requirements, and tries to keep ministry leaders informed without losing the relational tone.",
    current: [
      "Interest form or referral reaches a shared inbox",
      "Coordinator reviews interests and availability",
      "Information is copied into a sheet or CRM",
      "A leader is asked where the person may fit",
      "Follow-ups and reminders are sent manually",
    ],
    agent: {
      name: "Volunteer Pathway Coordinator Agent",
      body: "Summarizes the intake, identifies missing information, suggests approved service pathways, prepares a warm follow-up draft, and creates reminders for the human coordinator.",
    },
    flow: [
      "Interest captured",
      "Summarize + check completeness",
      "Suggest pathways",
      "Leader approval",
      "Follow up + remind",
    ],
    approvals: [
      "A ministry or program leader approves placement recommendations.",
      "A human approves all messages until the team explicitly defines low-risk templates.",
      "Pastoral care, safeguarding, background-check, and sensitive personal disclosures bypass the agent workflow.",
      "The agent does not infer spiritual maturity, suitability, or protected characteristics.",
    ],
    outcomes: [
      "Target: shorten the time from interest to a personal response.",
      "Fewer dropped follow-ups and duplicate data-entry steps.",
      "Consistent pathway information without flattening the human relationship.",
      "A visible operating view of pending approvals, next actions, and aging requests.",
    ],
  },
] as const;

export function ReferenceWorkflows() {
  return (
    <div className="mt-14 space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Reference examples
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold">
          What a scoped agent looks like on paper.
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          These are detailed reference designs, not claims of completed client results. Expected
          outcomes are targets to validate during a pilot.
        </p>
      </div>

      {EXAMPLES.map((example) => (
        <article
          id={example.id}
          key={example.id}
          className="scroll-mt-24 overflow-hidden rounded-3xl border border-border bg-card"
        >
          <div className="border-b border-border bg-muted/35 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {example.eyebrow}
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
              {example.title}
            </h3>
          </div>

          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2">
            <div>
              <h4 className="font-display text-lg font-semibold">The problem</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {example.problem}
              </p>
            </div>
            <div>
              <h4 className="font-display text-lg font-semibold">Current process</h4>
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                {example.current.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium text-foreground">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="border-y border-border bg-foreground p-6 text-background sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-background/60">
              Proposed agent
            </p>
            <h4 className="mt-2 font-display text-2xl font-semibold">{example.agent.name}</h4>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-background/70">
              {example.agent.body}
            </p>

            <div className="mt-7 grid gap-2 md:grid-cols-5">
              {example.flow.map((step, index) => (
                <div key={step} className="relative">
                  <div
                    className={`h-full rounded-xl border p-3 text-sm ${step.toLowerCase().includes("human") || step.toLowerCase().includes("leader") ? "border-accent2/70 bg-accent2/15" : "border-background/20 bg-background/5"}`}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-background/50">
                      Step {index + 1}
                    </span>
                    <p className="mt-1 font-medium">{step}</p>
                  </div>
                  {index < example.flow.length - 1 && (
                    <ArrowDown className="mx-auto my-1 h-4 w-4 text-background/40 md:absolute md:-right-3 md:top-1/2 md:z-10 md:-translate-y-1/2 md:-rotate-90" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2">
            <div>
              <h4 className="flex items-center gap-2 font-display text-lg font-semibold">
                <UserCheck className="h-5 w-5 text-primary" /> Human approvals
              </h4>
              <ul className="mt-4 space-y-3">
                {example.approvals.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-display text-lg font-semibold">Expected outcome</h4>
              <ul className="mt-4 space-y-3">
                {example.outcomes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent2" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
