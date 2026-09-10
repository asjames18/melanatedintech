export type CommercialService = {
  slug: string;
  name: string;
  seoTitle: string;
  description: string;
  promise: string;
  problems: string[];
  deliverables: string[];
  outcomes: string[];
  examples: string[];
};

export const COMMERCIAL_SERVICES: CommercialService[] = [
  {
    slug: "workflow-automation",
    name: "AI Workflow Automation",
    seoTitle: "AI Workflow Automation Consulting & Implementation",
    description:
      "Replace repetitive handoffs, follow-up, data entry, and status chasing with controlled workflows that connect to the tools your team already uses.",
    promise: "Turn a slow, manual business process into a measurable operating workflow.",
    problems: [
      "Staff re-enter the same information across forms, spreadsheets, inboxes, and business systems.",
      "Requests stall because ownership, status, or the next action is unclear.",
      "Important follow-up depends on someone remembering to send it.",
    ],
    deliverables: [
      "Current-state workflow and bottleneck map",
      "Automation design with human approval points",
      "System connections, exception handling, and audit trail",
      "Testing, documentation, and staff handoff",
    ],
    outcomes: [
      "Less manual work",
      "Faster cycle times",
      "Clearer ownership",
      "More consistent service",
    ],
    examples: [
      "Request triage",
      "Customer follow-up",
      "Approvals and routing",
      "Reporting workflows",
    ],
  },
  {
    slug: "ai-integrations",
    name: "AI & Software Integrations",
    seoTitle: "AI Integration Services for Business Systems",
    description:
      "Connect AI capabilities to CRMs, forms, email, document platforms, databases, and internal applications without replacing the systems that already work.",
    promise: "Make your systems share useful context and trigger the right next action.",
    problems: [
      "Customer or operational data is trapped in disconnected systems.",
      "Staff copy information between tools to keep work moving.",
      "An AI proof of concept cannot safely access the context or actions it needs.",
    ],
    deliverables: [
      "Integration and data-flow design",
      "API, webhook, or automation-platform implementation",
      "Authentication, permissions, and failure handling",
      "Monitoring, documentation, and maintainable handoff",
    ],
    outcomes: [
      "Connected systems",
      "Fewer duplicate steps",
      "Reliable handoffs",
      "Maintainable automation",
    ],
    examples: [
      "CRM and email",
      "Forms and databases",
      "Document platforms",
      "Internal and vendor APIs",
    ],
  },
  {
    slug: "document-intake-automation",
    name: "Document & Intake Automation",
    seoTitle: "AI Document Processing & Intake Automation",
    description:
      "Capture, classify, extract, validate, and route information from forms, emails, PDFs, and uploaded documents while keeping sensitive decisions human-led.",
    promise: "Move information from arrival to the right person or system with less rework.",
    problems: [
      "Teams manually review high volumes of email attachments, forms, or PDFs.",
      "Incomplete submissions create repeated back-and-forth.",
      "Information is copied into systems slowly and inconsistently.",
    ],
    deliverables: [
      "Intake and document taxonomy",
      "Extraction, validation, and routing workflow",
      "Human review for low-confidence or sensitive cases",
      "Quality checks, audit trail, and operating guide",
    ],
    outcomes: ["Faster intake", "Fewer keying errors", "Consistent routing", "Visible exceptions"],
    examples: [
      "Application intake",
      "Invoice processing",
      "Case documents",
      "Email attachment routing",
    ],
  },
  {
    slug: "ai-agents",
    name: "AI Agent Development",
    seoTitle: "Custom AI Agent Development & Implementation",
    description:
      "Build focused AI agents that use approved knowledge, call the right tools, and hand work to people when judgment, risk, or policy requires it.",
    promise: "Give an AI agent one useful job, the context to do it, and clear boundaries.",
    problems: [
      "A general chatbot cannot complete the real business task.",
      "Staff need help researching, preparing, or coordinating multi-step work.",
      "Leadership needs controls, evaluations, and ownership before deployment.",
    ],
    deliverables: [
      "Agent role, tools, context, and boundary design",
      "Working agent and system integrations",
      "Evaluation set, failure tests, and approval gates",
      "Deployment documentation and improvement plan",
    ],
    outcomes: ["Focused assistance", "Controlled actions", "Testable quality", "Human escalation"],
    examples: [
      "Research assistants",
      "Service triage",
      "Operations copilots",
      "Multi-step task agents",
    ],
  },
  {
    slug: "internal-knowledge-systems",
    name: "Internal Knowledge Systems",
    seoTitle: "AI Knowledge Base & RAG Implementation Services",
    description:
      "Help staff find reliable answers across policies, procedures, guides, and internal documents with source-aware search and governed AI responses.",
    promise: "Turn scattered organizational knowledge into answers staff can verify and use.",
    problems: [
      "Staff cannot quickly find the current policy, procedure, or approved answer.",
      "Important knowledge lives across shared drives, intranets, PDFs, and individual inboxes.",
      "Existing chat tools answer without enough source visibility or governance.",
    ],
    deliverables: [
      "Knowledge-source inventory and authority model",
      "Search, retrieval, and answer experience",
      "Citations, freshness rules, permissions, and feedback loop",
      "Evaluation, documentation, and content-owner handoff",
    ],
    outcomes: ["Faster answers", "Visible sources", "Less repeated support", "Governed knowledge"],
    examples: ["Policy assistant", "Staff help desk", "Procedure search", "Onboarding knowledge"],
  },
];

export function getCommercialService(slug: string) {
  return COMMERCIAL_SERVICES.find((service) => service.slug === slug);
}
