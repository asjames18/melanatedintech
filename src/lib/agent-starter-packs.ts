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
  githubUrl?: string;
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
    ...(pack.githubUrl ? [`**Open-Source Repository:** [${pack.githubUrl}](${pack.githubUrl})`] : []),
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
        name: "ServiceTitan / CRM API Gateway",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-postgres", "${POSTGRES_URL}"],
        env: { POSTGRES_URL: "${POSTGRES_URL}" },
      },
    ],
    sopTemplate: `# Standard Operating Procedure: AI Dispatch & Lead Recovery
1. System receives missed-call webhook from VoIP provider.
2. AI Dispatcher sends SMS within 60 seconds.
3. Once customer responds, AI validates ZIP code and emergency status.
4. Lead is pushed to team Slack/SMS channel with [APPROVE APPOINTMENT] button.
5. Human dispatcher taps to approve and assign technician.`,
  },
  {
    id: "ministry-nonprofit-pack",
    title: "Ministry & Non-Profit Community Care Pack",
    category: "Non-Profit & Ministry",
    description: "Ethical AI agent prompts, donor follow-up templates, and acceptable AI use policy tailored for non-profits, churches, and community organizations. Powered by the open-source Ministry AI Skills library.",
    targetAudience: "Executive directors, ministry leaders, volunteer coordinators",
    githubUrl: "https://github.com/asjames18/ministry-ai-skills",
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
    ],
    sopTemplate: `# SOP: Responsible AI Use in Community Outreach
1. All AI-assisted donor communications must be reviewed by a human team member before sending.
2. No confidential prayer requests or member medical data may be entered into public AI tools.
3. Every volunteer outreach message must maintain warmth, authenticity, and respect.`,
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
  },
];
