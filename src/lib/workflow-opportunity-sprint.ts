export const WORKFLOW_OPPORTUNITY_SPRINT = {
  name: "Workflow Opportunity Sprint",
  duration: "10 business days",
  planningSignal: "$7,500–$15,000",
  planningSignalLabel: "Planning signal",
  inquiryTopic: "Workflow Opportunity Sprint inquiry",
  tellUsTopic: "Tell us this workflow",
  hash: "workflow-opportunity-sprint",
  href: "/work-with-us#workflow-opportunity-sprint",
  diagnosticPrice: "$297",
  diagnosticName: "AI Workflow Diagnostic",
  websiteLaunchName: "Website Launch Sprint",
  websiteLaunchPrice: "$997",
  recoveryPilotName: "30-Day Recovery Pilot",
  recoveryPilotPrice: "$1,500",
  deliverables: [
    {
      title: "Workflow map",
      body: "The repeated work, handoffs, systems, owners, and where time or revenue actually stalls.",
    },
    {
      title: "Feasibility and risk",
      body: "What is viable now, what needs a human approval, and what should not be automated yet.",
    },
    {
      title: "Implementation-ready plan",
      body: "A bounded next build: scope, sequence, dependencies, and what “done” looks like.",
    },
    {
      title: "Pilot go / no-go / revise",
      body: "A written recommendation to proceed, stop, or reshape the pilot before anyone starts building.",
    },
  ],
  is: [
    "A 10-business-day discovery engagement for one costly, repeated workflow.",
    "A written map, risk review, and implementation-ready plan your team can approve.",
    "A go / no-go / revise decision on a bounded pilot—not a promise that the pilot will run.",
  ],
  isNot: [
    "Not the $297 AI Workflow Diagnostic, the $997 Website Launch Sprint, or a Recovery Pilot.",
    "Not an instant quote, a marketplace purchase, or a custom build already underway.",
    "Not a guaranteed ROI, recovered-revenue forecast, or fictional case-study result.",
  ],
  diagnosticEnough: [
    "One repeated task or customer journey is already easy to name.",
    "You want a 90-minute readout and a one-page recommendation.",
    "Handoffs live in one primary system, and approvals are already obvious.",
    "You are not yet asking for a pilot go / no-go or a bounded build plan.",
  ],
  escalateWhen: [
    "Work crosses multiple systems and the handoffs are the problem.",
    "You need a written approvals map before anyone touches production.",
    "The next decision is whether to run a bounded pilot—or not.",
    "A later build would be scoped from this plan, not invented during implementation.",
  ],
} as const;

/** Live Knowledge Hub articles (published in CMS). Link only — do not re-insert. */
export const HUB_LEARN_ARTICLES = [
  {
    slug: "before-you-automate-follow-up-name-the-workflow",
    title: "Before You Automate Follow-Up: Name the One Workflow That’s Leaking Time",
    excerpt:
      "A practical checklist to name the one repeated workflow before you buy tools or expand a pilot.",
  },
  {
    slug: "what-a-10-day-workflow-discovery-produces",
    title: "What a 10-Day Workflow Discovery Actually Produces (Map, Feasibility, Go/No-Go)",
    excerpt:
      "What a 10-business-day discovery should leave you with: a map, feasibility and risk, a plan, and a go / no-go / revise.",
  },
] as const;

export const PLANNING_SIGNAL_DISCLAIMER =
  "The $7,500–$15,000 range is a planning signal, not an instant quote. Actual price is confirmed in a written scope before work begins. It does not guarantee ROI, recovered revenue, or a specific business result.";

export function workflowInquiryMessage(answers: {
  workflow?: string;
  role?: string;
  goal?: string;
  risk?: string;
  tools?: string;
  timeline?: string;
}): string {
  return [
    answers.workflow ? `Repeated workflow: ${answers.workflow}` : null,
    answers.role ? `Role: ${answers.role}` : null,
    answers.goal ? `First goal: ${answers.goal}` : null,
    answers.risk ? `Risk: ${answers.risk}` : null,
    answers.tools ? `Tools: ${answers.tools}` : null,
    answers.timeline ? `Timeline: ${answers.timeline}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
