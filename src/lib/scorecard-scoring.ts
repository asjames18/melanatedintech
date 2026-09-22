/**
 * SCORECARD_SCORING_V1 — Product lock 2026-09-22.
 * Weights and copy live here so Product can tweak without redesigning the form.
 * Never include Sprint planning-signal dollar amounts ($7.5K–$15K) in PDF/email.
 */

export const SCORECARD_SCORING_V1 = {
  version: "v1",
  volumePoints: {
    "1_5": 8,
    "6_20": 14,
    "21_50": 20,
    "51_plus": 24,
    unsure: 6,
  } as const,
  frequencyPoints: {
    daily: 16,
    few_week: 14,
    weekly: 10,
    monthly: 6,
    bursts: 8,
    unsure: 4,
  } as const,
  leakCountPoints: [
    { min: 1, points: 4 },
    { min: 2, points: 8 },
    { min: 3, points: 12 },
    { min: 4, points: 16 },
    { min: 5, points: 20 },
  ] as const,
  highWeightLeaks: {
    missed_followup: 4,
    rework: 4,
    duplicate_entry: 4,
    after_hours: 4,
  } as const,
  highWeightLeakCap: 12,
  systemsCountPoints: [
    { min: 1, points: 2 },
    { min: 2, points: 6 },
    { min: 3, points: 10 },
    { min: 4, points: 14 },
  ] as const,
  approvalPoints: {
    every_item: 4,
    exceptions: 10,
    final_only: 8,
    rarely: 6,
    unsure: 3,
  } as const,
  painMultiplier: 4,
  urgencyPoints: {
    this_month: 10,
    this_quarter: 7,
    exploring: 3,
    not_urgent: 0,
  } as const,
  ownerPoints: {
    yes: 6,
    me: 6,
    partial: 3,
    no: 0,
  } as const,
  budgetPoints: {
    yes: 8,
    maybe: 4,
    no: 0,
    unsure: 0,
  } as const,
  band: {
    lowMax: 39,
    mediumMax: 69,
  } as const,
  bandCopy: {
    Low: "From your answers, this looks early or lightly defined. A free Fit Finder pass may be enough before paid help.",
    Medium:
      "From your answers, there is a real workflow with leak signals. A short Diagnostic or a clearer workflow write-up is a sensible next step.",
    High: "From your answers, this looks like a costly repeated workflow with enough signal to discuss a structured Sprint — only if you want a written go/no-go plan.",
  } as const,
  scoreDisclaimer:
    "This score is inferred from your answers. It is not a measured baseline or guaranteed savings.",
  sprintFitCopy: {
    Fit: "A Workflow Opportunity Sprint could be a fit if you want a written map, automate-vs-human feasibility, and a pilot go/no-go for this workflow. This Scorecard is not that Sprint.",
    Maybe:
      "You may be close. Tighten the workflow definition and owner, then consider the $297 AI Workflow Diagnostic or inquire when ready — no pressure.",
    "Not yet":
      "Sprint is not the right next step from these answers. Use Fit Finder or refine the workflow description first.",
  } as const,
  leakThemePriority: [
    "missed_followup",
    "rework",
    "duplicate_entry",
    "handoffs",
    "delays",
    "inbox_friction",
    "spreadsheet_friction",
    "no_visibility",
    "after_hours",
    "other_leak",
  ] as const,
  leakThemes: {
    delays: {
      title: "Waiting and delays",
      body: "Your answers point to wait time between steps. Inferred risk: work piles up while people chase status.",
    },
    rework: {
      title: "Rework and fixes",
      body: "Your answers point to rework. Inferred risk: time spent correcting earlier mistakes instead of finishing new items.",
    },
    missed_followup: {
      title: "Missed follow-ups",
      body: "Your answers point to follow-ups falling through. Inferred risk: lost leads, stalled tickets, or unfinished loops.",
    },
    handoffs: {
      title: "Messy handoffs",
      body: "Your answers point to handoff friction. Inferred risk: context lost when work changes owners.",
    },
    inbox_friction: {
      title: "Inbox overload",
      body: "Your answers point to inbox as a bottleneck. Inferred risk: important items buried in noise.",
    },
    spreadsheet_friction: {
      title: "Manual tracking",
      body: "Your answers point to spreadsheet/manual tracking drag. Inferred risk: slow updates and version confusion.",
    },
    no_visibility: {
      title: "Weak visibility",
      body: "Your answers point to hard-to-see status. Inferred risk: firefighting instead of predictable flow.",
    },
    duplicate_entry: {
      title: "Duplicate data entry",
      body: "Your answers point to entering the same data more than once. Inferred risk: wasted minutes and inconsistency.",
    },
    after_hours: {
      title: "After-hours catch-up",
      body: "Your answers point to nights/weekends catching up. Inferred risk: burnout and delayed response.",
    },
    other_leak: {
      title: "Other friction",
      body: "You named additional friction: {leak_other}. Treated as an inferred leak theme from your input.",
    },
  } as const,
  whatThisIsNot:
    "The Workflow Opportunity Scorecard is a self-serve snapshot from your answers. It is not the $297 AI Workflow Diagnostic, not the Workflow Opportunity Sprint, not a custom build, and not a guarantee of savings or ROI.",
  nextStepCopy: {
    fit_finder: "Start with the free Fit Finder to clarify what you need.",
    diagnostic:
      "Optional next step: $297 AI Workflow Diagnostic (human-guided — not included in this Scorecard).",
    sprint_inquire:
      "If you want a written go/no-go plan for this workflow, inquire about a Workflow Opportunity Sprint. (This Scorecard is not the Sprint.)",
  } as const,
  nextStepPaths: {
    fit_finder: "/start-small",
    diagnostic: "/diagnostic",
    sprint_inquire: "/work-with-us#workflow-opportunity-sprint",
  } as const,
} as const;

export type OpportunityBand = "Low" | "Medium" | "High";
export type SprintFit = "Fit" | "Maybe" | "Not yet";
export type NextStepId = "fit_finder" | "diagnostic" | "sprint_inquire";

export type BuyerRole = "owner" | "ops_lead" | "manager" | "admin" | "it" | "other";
export type WorkflowFrequency =
  | "daily"
  | "few_week"
  | "weekly"
  | "monthly"
  | "bursts"
  | "unsure";
export type WorkflowVolumeWeek = "1_5" | "6_20" | "21_50" | "51_plus" | "unsure";
export type LeakSignal =
  | "delays"
  | "rework"
  | "missed_followup"
  | "handoffs"
  | "inbox_friction"
  | "spreadsheet_friction"
  | "no_visibility"
  | "duplicate_entry"
  | "after_hours"
  | "other_leak";
export type SystemTouch =
  | "email"
  | "phone_sms"
  | "crm"
  | "spreadsheet"
  | "calendar"
  | "scheduling"
  | "ticketing"
  | "sis"
  | "erp"
  | "docs"
  | "other_system";
export type ApprovalPoints = "every_item" | "exceptions" | "final_only" | "rarely" | "unsure";
export type Goal90d =
  | "save_time"
  | "fewer_errors"
  | "visibility"
  | "follow_through"
  | "capacity"
  | "other_goal";
export type Urgency = "this_month" | "this_quarter" | "exploring" | "not_urgent";
export type OwnerNamed = "yes" | "partial" | "no" | "me";
export type BudgetConversation = "yes" | "maybe" | "no" | "unsure";
export type PainSeverity = "1" | "2" | "3" | "4" | "5";

export type ScorecardAnswers = {
  buyer_email: string;
  buyer_name: string;
  buyer_role: BuyerRole;
  company_name: string;
  workflow_one_liner: string;
  workflow_start: string;
  workflow_end: string;
  workflow_frequency: WorkflowFrequency;
  workflow_volume_week: WorkflowVolumeWeek;
  leak_signals: LeakSignal[];
  leak_other?: string;
  systems: SystemTouch[];
  systems_other?: string;
  approval_points: ApprovalPoints;
  approval_detail: string;
  goal_90d: Goal90d;
  urgency: Urgency;
  owner_named: OwnerNamed;
  budget_conversation: BudgetConversation;
  pain_severity: PainSeverity;
};

export const BUYER_ROLE_LABELS: Record<BuyerRole, string> = {
  owner: "Owner",
  ops_lead: "Ops / operations lead",
  manager: "Manager",
  admin: "Admin / coordinator",
  it: "IT / systems",
  other: "Other",
};

export const FREQUENCY_LABELS: Record<WorkflowFrequency, string> = {
  daily: "Daily",
  few_week: "A few times a week",
  weekly: "Weekly",
  monthly: "Monthly",
  bursts: "In bursts / seasonal",
  unsure: "Not sure",
};

export const VOLUME_LABELS: Record<WorkflowVolumeWeek, string> = {
  "1_5": "1–5",
  "6_20": "6–20",
  "21_50": "21–50",
  "51_plus": "51+",
  unsure: "Not sure",
};

export const LEAK_LABELS: Record<LeakSignal, string> = {
  delays: "Delays / waiting on someone",
  rework: "Rework / fixing mistakes",
  missed_followup: "Missed follow-ups",
  handoffs: "Messy handoffs between people",
  inbox_friction: "Inbox overload",
  spreadsheet_friction: "Spreadsheet / manual tracking friction",
  no_visibility: "Hard to see status",
  duplicate_entry: "Same data entered more than once",
  after_hours: "After-hours / weekend catch-up",
  other_leak: "Other",
};

export const SYSTEM_LABELS: Record<SystemTouch, string> = {
  email: "Email",
  phone_sms: "Phone / SMS",
  crm: "CRM",
  spreadsheet: "Spreadsheet",
  calendar: "Calendar",
  scheduling: "Scheduling / booking tool",
  ticketing: "Ticketing / helpdesk",
  sis: "SIS / student system",
  erp: "ERP / accounting",
  docs: "Docs / Drive / Notion",
  other_system: "Other",
};

export const APPROVAL_LABELS: Record<ApprovalPoints, string> = {
  every_item: "Almost every item",
  exceptions: "Only exceptions / edge cases",
  final_only: "Only at the end",
  rarely: "Rarely",
  unsure: "Not sure",
};

export const GOAL_LABELS: Record<Goal90d, string> = {
  save_time: "Save time",
  fewer_errors: "Fewer errors / less rework",
  visibility: "Better visibility",
  follow_through: "Better revenue / lead follow-through",
  capacity: "Handle more volume without more headcount",
  other_goal: "Other",
};

export const URGENCY_LABELS: Record<Urgency, string> = {
  this_month: "This month",
  this_quarter: "This quarter",
  exploring: "Exploring",
  not_urgent: "Not urgent",
};

export const OWNER_LABELS: Record<OwnerNamed, string> = {
  yes: "Yes",
  partial: "Sort of",
  no: "No",
  me: "Me",
};

export const BUDGET_LABELS: Record<BudgetConversation, string> = {
  yes: "Yes",
  maybe: "Maybe",
  no: "Not now",
  unsure: "Unsure",
};

function pointsForCount(
  count: number,
  table: readonly { min: number; points: number }[],
): number {
  let points = 0;
  for (const row of table) {
    if (count >= row.min) points = row.points;
  }
  return points;
}

export type LeakThemeLine = { key: LeakSignal; title: string; body: string };

export type ScorecardResult = {
  opportunityScore: number;
  band: OpportunityBand;
  bandCopy: string;
  sprintFit: SprintFit;
  sprintFitCopy: string;
  nextStep: NextStepId;
  nextStepLine: string;
  nextStepPath: string;
  leakThemes: LeakThemeLine[];
  aiWorkerCandidate: string;
  humanApprovalCallout: string;
  systemHint: string;
  scoreDisclaimer: string;
  whatThisIsNot: string;
};

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function bandFor(score: number): OpportunityBand {
  if (score <= SCORECARD_SCORING_V1.band.lowMax) return "Low";
  if (score <= SCORECARD_SCORING_V1.band.mediumMax) return "Medium";
  return "High";
}

function computeSprintFit(answers: ScorecardAnswers, band: OpportunityBand): SprintFit {
  const leakCount = answers.leak_signals.length;
  const oneLiner = answers.workflow_one_liner.trim();

  // Hard Not yet
  if (oneLiner.length < 20) return "Not yet";
  if (answers.owner_named === "no" && answers.urgency === "not_urgent") return "Not yet";
  if (
    answers.budget_conversation === "no" &&
    (answers.urgency === "exploring" || answers.urgency === "not_urgent")
  ) {
    return "Not yet";
  }
  if (band === "Low" && leakCount <= 1) return "Not yet";

  // Fit — all must be true
  const bandOk = band === "High" || (band === "Medium" && leakCount >= 3);
  const ownerOk =
    answers.owner_named === "yes" ||
    answers.owner_named === "me" ||
    answers.owner_named === "partial";
  const urgencyOk = answers.urgency === "this_month" || answers.urgency === "this_quarter";
  const budgetOk =
    answers.budget_conversation === "yes" || answers.budget_conversation === "maybe";
  const approvalOk = answers.approval_points !== "unsure";

  if (bandOk && ownerOk && urgencyOk && budgetOk && approvalOk) return "Fit";
  return "Maybe";
}

function pickNextStep(band: OpportunityBand, sprintFit: SprintFit): NextStepId {
  if (sprintFit === "Not yet" || band === "Low") return "fit_finder";
  if (sprintFit === "Fit") return "sprint_inquire";
  return "diagnostic";
}

function selectLeakThemes(answers: ScorecardAnswers): LeakThemeLine[] {
  const selected = new Set(answers.leak_signals);
  const ordered = SCORECARD_SCORING_V1.leakThemePriority.filter((key) => selected.has(key));
  const top = ordered.slice(0, 5);
  return top.map((key) => {
    const theme = SCORECARD_SCORING_V1.leakThemes[key];
    const body =
      key === "other_leak"
        ? theme.body.replace("{leak_other}", answers.leak_other?.trim() || "not specified")
        : theme.body;
    return { key, title: theme.title, body };
  });
}

export function scoreScorecard(answers: ScorecardAnswers): ScorecardResult {
  const V = SCORECARD_SCORING_V1;
  const leakCount = answers.leak_signals.length;

  let total = 0;
  total += V.volumePoints[answers.workflow_volume_week];
  total += V.frequencyPoints[answers.workflow_frequency];
  total += pointsForCount(leakCount, V.leakCountPoints);

  let highWeightBonus = 0;
  for (const [key, pts] of Object.entries(V.highWeightLeaks) as [
    keyof typeof V.highWeightLeaks,
    number,
  ][]) {
    if (answers.leak_signals.includes(key)) highWeightBonus += pts;
  }
  total += Math.min(highWeightBonus, V.highWeightLeakCap);

  total += pointsForCount(answers.systems.length, V.systemsCountPoints);
  total += V.approvalPoints[answers.approval_points];
  total += Number(answers.pain_severity) * V.painMultiplier;
  total += V.urgencyPoints[answers.urgency];
  total += V.ownerPoints[answers.owner_named];
  total += V.budgetPoints[answers.budget_conversation];

  const opportunityScore = clampScore(total);
  const band = bandFor(opportunityScore);
  const sprintFit = computeSprintFit(answers, band);
  const nextStep = pickNextStep(band, sprintFit);

  const workflowTrunc = answers.workflow_one_liner.trim().slice(0, 120);
  const aiWorkerCandidate = `Suggested bounded job: Draft / collect / route for "${workflowTrunc}" between "${answers.workflow_start.trim()}" and "${answers.workflow_end.trim()}", then pause for human approval.`;

  const humanApprovalCallout = `A person still decides at: ${APPROVAL_LABELS[answers.approval_points]}. Example you gave: ${answers.approval_detail.trim()}. Any AI assist must stop for human approval on judgment calls — this Scorecard does not authorize autonomous action.`;

  const systemLabels = answers.systems.slice(0, 4).map((s) => {
    if (s === "other_system" && answers.systems_other?.trim()) {
      return answers.systems_other.trim();
    }
    return SYSTEM_LABELS[s];
  });
  const systemHint =
    answers.systems.length >= 2
      ? `Likely touches: ${systemLabels.join(", ")}.`
      : "Keep the first worker narrow to one system before expanding.";

  return {
    opportunityScore,
    band,
    bandCopy: V.bandCopy[band],
    sprintFit,
    sprintFitCopy: V.sprintFitCopy[sprintFit],
    nextStep,
    nextStepLine: V.nextStepCopy[nextStep],
    nextStepPath: V.nextStepPaths[nextStep],
    leakThemes: selectLeakThemes(answers),
    aiWorkerCandidate,
    humanApprovalCallout,
    systemHint,
    scoreDisclaimer: V.scoreDisclaimer,
    whatThisIsNot: V.whatThisIsNot,
  };
}
