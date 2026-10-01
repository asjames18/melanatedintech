export type StarterPackCategory =
  | "Trades & Services"
  | "Non-Profit & Ministry"
  | "Tech & Freelancers"
  | "Education & IT";

export interface StarterPackItem {
  id: string;
  title: string;
  category: StarterPackCategory;
  description: string;
  targetAudience: string;
  prompts: { title: string; prompt: string }[];
  mcpConfigs?: { name: string; command: string; args: string[]; env: Record<string, string> }[];
  sopTemplate?: string;
  policyNotes?: string;
}

export function getStarterPack(id: string): StarterPackItem | undefined {
  return STARTER_PACKS.find((pack) => pack.id === id);
}

/** Renders a pack as the single .md file offered on the download button. */
export function buildPackMarkdown(pack: StarterPackItem): string {
  const sections = [
    `# ${pack.title}`,
    pack.description,
    `**Built for:** ${pack.targetAudience}`,
    `## Prompts`,
    ...pack.prompts.map((p) => `### ${p.title}\n\n\`\`\`\n${p.prompt}\n\`\`\``),
  ];

  if (pack.mcpConfigs?.length) {
    sections.push(
      `## MCP server configuration`,
      `Replace every \`\${VARIABLE}\` placeholder with your own credential before use.`,
      ...pack.mcpConfigs.map(
        (c) =>
          `### ${c.name}\n\n\`\`\`json\n${JSON.stringify(
            { command: c.command, args: c.args, env: c.env },
            null,
            2,
          )}\n\`\`\``,
      ),
    );
  }
  if (pack.sopTemplate) sections.push(`## Standard operating procedure`, pack.sopTemplate);
  if (pack.policyNotes) sections.push(`## Policy notes`, pack.policyNotes);

  return sections.join("\n\n");
}

export const STARTER_PACKS: StarterPackItem[] = [
  {
    id: "service-recovery-pack",
    title: "Local Service & Trades Revenue Recovery Pack",
    category: "Trades & Services",
    description: "Complete AI agent starter kit for HVAC, plumbing, electrical, and roofing businesses to turn missed calls and stale estimates into booked jobs.",
    targetAudience: "Contractors, home service business owners, dispatchers",
    prompts: [
      {
        title: "After-Hours Missed Call Instant SMS Agent",
        prompt: `You are an empathetic, professional AI dispatch assistant for {{BUSINESS_NAME}}.
Your goal is to quickly confirm if the caller is experiencing an emergency service need, reassure them, gather key details (ZIP code, problem description, availability), and queue the request for human dispatch approval.
RULES:
1. Never guarantee specific arrival times or give official diagnostic price quotes.
2. Ask about safety risks first (smoke, electrical sparks, gas odor). If present, advise them to evacuate/call emergency services immediately.
3. Keep text messages under 160 characters when possible.`,
      },
      {
        title: "Stale Estimate Re-Engagement Script",
        prompt: `You are a polite customer care agent for {{BUSINESS_NAME}}.
Follow up with {{CUSTOMER_NAME}} regarding Estimate #{{ESTIMATE_ID}} sent {{DAYS_AGO}} days ago for {{PROJECT_TYPE}}.
Acknowledge that choosing a contractor is an important decision, ask if they have any questions about scope or timing, and offer to schedule a brief 5-minute call with {{ESTIMATOR_NAME}}.`,
      },
    ],
    mcpConfigs: [
      {
        name: "PostgreSQL CRM Gateway (sample)",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-postgres", "${POSTGRES_URL}"],
        env: { POSTGRES_URL: "${POSTGRES_URL}" },
      },
    ],
    sopTemplate: `# Standard Operating Procedure: AI Dispatch & Lead Recovery
1. System receives missed-call webhook from VoIP provider.
2. AI Dispatcher sends SMS within 60 seconds.
3. Once customer responds, AI validates ZIP code and emergency status.
4. Lead is pushed to team Slack/SMS channel with an [APPROVE APPOINTMENT] action or link.
5. Human dispatcher taps to approve and assign technician.`,
  },
  {
    id: "ministry-nonprofit-pack",
    title: "Ministry & Non-Profit Community Care Pack",
    category: "Non-Profit & Ministry",
    description: "Ethical AI agent prompts, donor follow-up templates, and acceptable AI use policy tailored for non-profits, churches, and community organizations.",
    targetAudience: "Executive directors, ministry leaders, volunteer coordinators",
    prompts: [
      {
        title: "First-Time Visitor & Volunteer Welcome Assistant",
        prompt: `You are a warm, welcoming administrative assistant for {{ORGANIZATION_NAME}}.
Draft a heartfelt thank-you text/email to {{VISITOR_NAME}} for visiting our recent {{EVENT_NAME}}.
Provide 2 simple options for getting involved (e.g. joining our newsletter, attending a welcome lunch, or exploring volunteer teams). Keep tone encouraging, respectful, and zero-pressure.`,
      },
      {
        title: "Donor Impact Story Generator",
        prompt: `Help {{ORGANIZATION_NAME}} translate raw project metrics into a compelling 300-word impact story for our monthly newsletter.
INPUT METRICS: {{METRICS}}
OUTCOME: Highlight real human lives touched, express deep gratitude to supporters, and outline our next community goal. Avoid hype or guilt-driven messaging.`,
      },
      {
        title: "Donor Follow-Up & Thank-You Message Template",
        prompt: `You are the donor-care coordinator for {{ORGANIZATION_NAME}}. Write warm, personal follow-up messages for a donor who gave {{GIFT_AMOUNT}} to {{CAMPAIGN_NAME}} on {{GIFT_DATE}}.
Produce three short pieces:
1. A thank-you sent within 24 hours — grateful, specific about the gift's purpose, zero-pressure.
2. A 30-day follow-up sharing one concrete outcome their gift helped make possible.
3. A 90-day update inviting them to {{NEXT_EVENT_OR_OPPORTUNITY}}, still with no ask.
RULES: sound human, not corporate; mention the donor by name ({{DONOR_NAME}}); never use guilt or urgency language; keep each piece under 120 words.`,
      },
    ],
    sopTemplate: `# SOP: Responsible AI Use in Community Outreach
1. All AI-assisted donor communications must be reviewed by a human team member before sending.
2. No confidential prayer requests or member medical data may be entered into public AI tools.
3. Every volunteer outreach message must maintain warmth, authenticity, and respect.`,
    policyNotes: `Sample Acceptable AI Use Policy — {{ORGANIZATION_NAME}}

Adapt this with your leadership team before adopting; it is a starting point, not legal advice.

1. SCOPE — Applies to staff, volunteers, and contractors using AI tools on the organization's behalf.
2. APPROVED USES — Drafting outreach, summarizing public materials, brainstorming ideas, light editing. Always disclosed internally as AI-assisted.
3. NEVER AUTOMATE PASTORAL CARE — Prayer, grief, counseling, and crisis responses are always human. AI may help organize notes; it never speaks for the ministry in these moments.
4. MEMBER DATA — Never enter confidential prayer requests, member medical information, children's details, or giving records into public AI tools. Treat donor and member data as a trust, not an input.
5. DISCLOSURE — When a communication was substantially drafted or edited by AI, a human reviews it, owns it, and plainly discloses the assistance where appropriate.
6. REVIEW GATE — No AI-assisted donor communication sends without one human approver. The approver's name is on it.
7. ACCOUNTABILITY — If an AI tool produces something biased, wrong, or off-tone, the human who sent it owns the correction. Retract and apologize promptly.
8. REVIEW CADENCE — Revisit this policy every 6 months or whenever a new AI tool is adopted.`,
  },
  {
    id: "tech-freelancer-pack",
    title: "Tech Team & Freelancer AI Automation Pack",
    category: "Tech & Freelancers",
    description: "Code review agent prompts, Claude/Cursor MCP server configurations, prompt A/B testing rubrics, and client ROI calculators.",
    targetAudience: "Software engineers, agency founders, technical consultants",
    prompts: [
      {
        title: "Pull Request Code Review & Security Auditor Agent",
        prompt: `Act as a senior staff engineer reviewing pull requests for technical excellence, performance, and security vulnerabilities.
Review the following code diff:
{{DIFF_CONTENT}}
CHECKLIST:
1. Inspect for hardcoded credentials, SQL injection, and unsafe deserialization.
2. Verify TypeScript strict types and edge-case handling.
3. Provide constructive, clear code suggestions with before/after snippets.`,
      },
      {
        title: "Prompt A/B Test Scorecard & Rubric",
        prompt: `You are a prompt-engineering evaluator. Score two prompt variants (A and B) against the same test case.

PROMPT A:
{{PROMPT_A}}

PROMPT B:
{{PROMPT_B}}

TEST INPUT:
{{TEST_INPUT}}

Score each variant 1-5 on this rubric:
1. Task completion - does the output actually accomplish {{GOAL}}?
2. Instruction adherence - follows format, length, and constraint instructions.
3. Correctness - no invented facts; flags uncertainty instead of hallucinating.
4. Tone fit - matches {{TONE}} for {{AUDIENCE}}.
5. Efficiency - reaches the result without excess tokens or steps.

RULES: reason over both variants against the test input before scoring; quote one short line of evidence per score; total each variant out of 25; declare a winner or a tie with one sentence of justification. This is a structured human-in-the-loop rubric - the scores are a judgment aid, not an automated measurement.`,
      },
      {
        title: "Client AI Automation ROI Worksheet",
        prompt: `You are an automation consultant preparing a client ROI worksheet for an AI automation engagement.

INPUTS:
- Task to automate: {{TASK_DESCRIPTION}}
- Current manual time per week: {{HOURS_PER_WEEK}} hours
- Fully-loaded hourly cost of the staff doing it: \${{HOURLY_COST}}
- One-time build/setup fee you will charge: \${{BUILD_FEE}}
- Monthly tool/usage cost (LLM API, hosting): \${{MONTHLY_TOOL_COST}}

Compute and present:
1. Current monthly labor cost = hours/week x 4.33 x hourly cost.
2. Realistic hours saved per week after automation (default to 80% of manual time; state the assumption and adjust it if the task is partially judgment-based).
3. Monthly net savings = (hours saved x 4.33 x hourly cost) - monthly tool cost.
4. Payback period in months = build fee / monthly net savings.
5. 12-month projected net value = (monthly net savings x 12) - build fee.

RULES: label every figure an estimate derived from the client's own inputs - never a promise of revenue or savings; show the full arithmetic line by line so the client can audit it; mark which numbers are the client's editable assumptions vs your defaults. If monthly net savings is negative, say so plainly and do not inflate the case.`,
      },
    ],
    mcpConfigs: [
      {
        name: "GitHub Developer API",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: { GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_PERSONAL_ACCESS_TOKEN}" },
      },
      {
        name: "Filesystem Workspace Access",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-filesystem", "./src"],
        env: {},
      },
    ],
    sopTemplate: `# SOP: Autonomous Agent Code Deployment
1. Agents generate feature branch code with unit test coverage.
2. CI pipeline runs automated linter & test runner.
3. Human staff engineer reviews PR diff and approves merge to main.`,
  },
  {
    id: "education-it-pack",
    title: "Education & Campus IT Support Pack",
    category: "Education & IT",
    description: "Student helpdesk triage prompts, RAG document chunking guidelines, and FERPA/data privacy governance rules for campus IT departments.",
    targetAudience: "Campus IT directors, university helpdesk leads, edtech teams",
    prompts: [
      {
        title: "Campus IT Helpdesk Triage Agent",
        prompt: `You are a helpful IT support assistant for {{INSTITUTION_NAME}} campus technology services.
Assist {{USER_NAME}} with common IT questions (WiFi setup, LMS password reset, campus printer mapping).
If the issue requires credential reset or hardware repair, collect their ID/building location and generate a helpdesk ticket for human staff.`,
      },
    ],
    sopTemplate: `# SOP: Campus AI Knowledge Base Management
1. Ingest campus documentation into vector DB with 500-token chunks and 50-token overlap.
2. Anonymize student records prior to embedding.
3. Maintain human fallback for complex financial aid or academic status inquiries.`,
    policyNotes: `FERPA & Data Privacy Governance Rules for Campus AI — {{INSTITUTION_NAME}}

Adapt this with your general counsel or privacy office before adopting; it is a starting point, not legal advice. FERPA protects "education records" — records directly related to a student that the institution maintains.

1. KNOW WHAT COUNTS — Grades, transcripts, financial-aid records, disciplinary files, and housing assignments are education records. Directory information (name, major, enrollment status) may be shareable UNLESS a student has opted out — check your institution's directory-information policy first.
2. KEEP EDUCATION RECORDS OUT OF AI INPUTS — Never paste identifiable student records into public AI tools, prompts, or chatbot training flows. If an AI tool must touch education records, use a vendor contract with FERPA-compliant data handling (no training on your data), signed and reviewed by your privacy office.
3. ANONYMIZE BEFORE INDEXING — Strip or pseudonymize names, IDs, and other identifiers before documents reach the vector DB; keep the key mapping in a separate access-controlled system.
4. LEAST PRIVILEGE ACCESS — The knowledge base answers from campus documentation, not from student records. Restrict who can add, view, and query indexed content; log every admin action.
5. HUMAN DECISION GATE — The triage agent collects information and drafts tickets; it never makes enrollment, disciplinary, financial-aid, or academic-status decisions. Those always go to human staff.
6. DISCLOSURE — Tell students and staff, in plain language, that AI assists the helpdesk: what it does (answers common IT questions), what it does not do (no access to their grades or records), and how to reach a human.
7. RETENTION & DELETION — Set a retention period for chat logs and embeddings (for example, one academic year) and delete on schedule. Fulfill deletion requests promptly.
8. BREACH PLAN — If student data is exposed through the system, follow your institution's breach-notification procedure. Do not attempt to hide the incident.
9. REVIEW CADENCE — Revisit these rules every academic year and whenever a new AI tool or vendor is added.`,
  },
];
