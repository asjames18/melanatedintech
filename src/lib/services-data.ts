export interface ServiceProcessStep {
  title: string;
  desc: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  outcomes: string[];
  starting_price_cents: number | null; // null triggers "Custom Pricing based on service scope"
  features: string[];
  process: ServiceProcessStep[];
  category: string;
  faqs?: { q: string; a: string }[];
}

export const FALLBACK_SERVICES: ServiceItem[] = [
  {
    id: "custom-agent-build",
    slug: "custom-agent-build",
    name: "Custom Autonomous Agent Build",
    tagline: "End-to-end custom AI agent design, tool integration, guardrails, and production deployment.",
    starting_price_cents: null,
    category: "Full Engineering",
    description: `We partner with your leadership and engineering teams to design, build, test, and deploy a bespoke AI agent system tailored to your exact business requirements.

Whether you need an automated customer support agent with database write access, an internal knowledge assistant connected to private documentation, or a multi-agent orchestration pipeline, we handle the entire engineering lifecycle.

### What We Build:
- **System Architecture & Instruction Engineering**: Custom system prompts tuned for zero-hallucination and high compliance.
- **RAG & Knowledge Vectorization**: Clean chunking, embedding, and indexing of your private documentation, FAQs, and PDFs.
- **MCP Server & Database Integration**: Model Context Protocol (MCP) server development connecting your agent to PostgreSQL, Supabase, Stripe, GitHub, or custom REST APIs.
- **Production Guardrails & Security Testing**: Automated stress testing against prompt injection, data leaks, and unauthorized actions.
- **Deployment & Analytics**: Production deployment on Cloudflare, Vercel, or AWS with real-time latency and token cost analytics.`,
    outcomes: [
      "Fully deployed custom AI agent integrated directly into your existing workflow or web application.",
      "Custom Model Context Protocol (MCP) servers connecting your agent securely to internal databases.",
      "Production security guardrails and automated stress test scorecard (0-100% safety score).",
      "Complete source code ownership, technical documentation, and 30 days of post-launch engineering support.",
      "Hands-on staff training session and operational SOP document.",
    ],
    features: [
      "100% Source Code Ownership & No Vendor Lock-in",
      "Model-Agnostic Architecture (Claude 3.5, OpenAI, Llama 3.3)",
      "Strict Data Privacy & Zero Retention Setup",
      "Interactive Admin Dashboard & Audit Logs",
    ],
    process: [
      {
        title: "1. Scope & Architecture Blueprint",
        desc: "We map your workflow, define tool boundaries, select model architectures, and establish security requirements.",
      },
      {
        title: "2. Engineering & MCP Integration",
        desc: "We build custom system prompts, vector indexes, and MCP server integrations connecting your internal APIs.",
      },
      {
        title: "3. Stress Testing & Guardrails",
        desc: "We run automated prompt injection and hallucination attack drills in Eval Studio to enforce 100% safety compliance.",
      },
      {
        title: "4. Production Deployment & Training",
        desc: "We ship your agent to production, hand over full code ownership, and conduct live team training.",
      },
    ],
    faqs: [
      {
        q: "How is pricing structured?",
        a: "Pricing is completely custom based on workflow complexity, number of tool integrations (MCP servers), and custom security requirements. We provide a fixed scope quote upfront with zero surprise fees.",
      },
      {
        q: "Who owns the code and IP?",
        a: "Your organization receives 100% ownership of all source code, prompt templates, vector indexes, and custom MCP server scripts.",
      },
      {
        q: "How long does a custom build take?",
        a: "Typical custom agent builds take 3 to 6 weeks from kick-off to production deployment depending on tool integration complexity.",
      },
    ],
  },
  {
    id: "ministry-ai-implementation",
    slug: "ministry-ai-implementation",
    name: "Ministry & Non-Profit AI Implementation",
    tagline: "Welcoming, high-trust AI agent workflows designed for volunteer intake, donor care, and community outreach.",
    starting_price_cents: null,
    category: "Community & Faith",
    description: `Tailored AI solutions built specifically for faith communities, non-profits, ministries, and educational institutions. We design agents that maintain warmth, ethical standards, and community trust while streamlining operations.

### What We Build:
- **Volunteer Pathway Coordinator**: Automated intake, interest categorization, and human-in-the-loop placement routing.
- **Donor Care & Follow-Up Automation**: Warm, personal follow-up drafts and event reminder management.
- **Ethical AI Governance Policy**: Custom acceptable use framework aligning AI boundaries with ministry values.
- **Leadership & Staff Training**: Hands-on onboarding for staff to comfortably manage and audit agent outputs.`,
    outcomes: [
      "Volunteer Pathway Coordinator Agent with automated intake summaries.",
      "Donor Communication & Appreciation Workflow.",
      "Ethical AI Governance Policy tailored for ministry standards.",
      "Staff & Leadership onboarding workshop and operational playbook.",
    ],
    features: [
      "Ethical & Compassionate Tone Guardrails",
      "Privacy-First Data Protection & Safeguarding Rules",
      "Non-Technical Staff Friendly Interfaces",
      "Human-in-the-Loop Approval Safeguards",
    ],
    process: [
      {
        title: "1. Community Mapping",
        desc: "Understand your mission, communication standards, and volunteer pathways.",
      },
      {
        title: "2. Ethical Agent Build",
        desc: "Construct agents with strict warmth, tone, and privacy boundaries.",
      },
      {
        title: "3. Staff Onboarding & Launch",
        desc: "Train leaders and staff on managing human-in-the-loop approvals.",
      },
    ],
    faqs: [
      {
        q: "How is sensitive community data protected?",
        a: "We implement strict data boundary policies. Sensitive pastoral care, safeguarding, and financial records bypass agent processing completely.",
      },
      {
        q: "Does the agent replace human pastoral care?",
        a: "No. The agent handles routine administrative intake and drafting so staff and ministry leaders can dedicate more time to direct personal relationship building.",
      },
    ],
  },
  {
    id: "ai-workshop",
    slug: "ai-workshop",
    name: "Hands-On Team AI & Agent Workshop",
    tagline: "Interactive live training workshop equipping your leadership, developers, or staff to build and operate AI agents.",
    starting_price_cents: null,
    category: "Training & Education",
    description: `Equip your entire organization with practical, real-world AI agent skills. In this hands-on workshop, your team learns how to craft system prompts, build custom GPTs, connect tools using MCP, and establish internal AI governance.

### Workshop Tracks:
- **Executive Leadership & Strategy**: AI agent feasibility, ROI calculation, risk management, and governance.
- **Operations & Business Teams**: Prompt Pilot masterclass, AI Playbook customization, and workflow automation.
- **Engineering & IT Departments**: MCP server development, RAG vector indexing, and agent stress testing in Eval Studio.`,
    outcomes: [
      "Customized workshop curriculum tailored to your company's exact industry and tech stack.",
      "Hands-on exercises building real agents during the session.",
      "Complete Prompt Library & Operational SOP template pack.",
      "Recording, slide deck, and 30 days of follow-up Q&A access.",
    ],
    features: [
      "Virtual or In-Person Live Instruction",
      "Hands-On Building Drills & Live Demos",
      "Customized Industry Exercises",
    ],
    process: [
      {
        title: "1. Curriculum Customization",
        desc: "We survey your team's current skill level and tailor exercises to your active projects.",
      },
      {
        title: "2. Interactive Workshop Session",
        desc: "Live hands-on instruction, agent building drills, and real-time prompt engineering coaching.",
      },
      {
        title: "3. Resource Handoff",
        desc: "Deliver custom prompt libraries, recordings, and SOP document templates.",
      },
    ],
    faqs: [
      {
        q: "Can the workshop be delivered remotely?",
        a: "Yes. Workshops are available via Zoom / Teams with interactive breakout rooms or in-person at your team's office location.",
      },
    ],
  },
  {
    id: "agent-strategy-sprint",
    slug: "agent-strategy-sprint",
    name: "2-Week Agent Strategy Sprint",
    tagline: "Intensive 2-week sprint to evaluate, scope, architect, and prototype your team's first AI agent.",
    starting_price_cents: null,
    category: "Strategy & Advisory",
    description: `Turn AI hype into a clear, actionable implementation blueprint. Over 14 days, we work directly with your leadership and engineering teams to identify high-ROI workflows, design the system architecture, and deliver a working MVP prototype.`,
    outcomes: [
      "Complete Architectural Blueprint & Sequence Diagrams.",
      "Financial ROI Calculator projecting token expenses vs. labor hours saved.",
      "Working MVP prototype tested against real team data.",
      "Security Risk & Governance Compliance Checklist.",
    ],
    features: [
      "Rapid 14-Day Delivery",
      "Interactive MVP Demonstration",
      "Executive Leadership Roadmap Presentation",
    ],
    process: [
      {
        title: "Week 1: Discovery & Scoping",
        desc: "Identify top candidate workflows, evaluate data readiness, and map security constraints.",
      },
      {
        title: "Week 2: Prototyping & Delivery",
        desc: "Build working prototype agent, calculate financial ROI, and present executive roadmap.",
      },
    ],
  },
  {
    id: "ai-governance-audit",
    slug: "ai-governance-audit",
    name: "AI Security & Governance Audit",
    tagline: "Comprehensive evaluation of your organization's AI tool usage, data privacy compliance, and agent security.",
    starting_price_cents: null,
    category: "Security & Compliance",
    description: `Protect your organization from data leaks, compliance violations, and prompt injection vulnerabilities. We conduct a thorough audit of your team's AI tool stack and generate formal governance policies.`,
    outcomes: [
      "Agent Safety & Security Scorecard (Eval Studio Audit).",
      "Custom Acceptable AI Use Policy Document.",
      "Data Leakage & Shadow AI Risk Analysis Report.",
      "Remediation Roadmap with priority security patches.",
    ],
    features: [
      "Prompt Injection Vulnerability Scans",
      "GDPR & PII Leakage Audits",
      "Formal Executive Governance Certificate",
    ],
    process: [
      {
        title: "1. Tool & Stack Discovery",
        desc: "Audit active AI tools, browser extensions, and API keys across your team.",
      },
      {
        title: "2. Vulnerability Testing",
        desc: "Execute automated attack drills on your active AI prompts and agents.",
      },
      {
        title: "3. Governance Delivery",
        desc: "Deliver formal Acceptable Use Policy document and executive briefing.",
      },
    ],
  },
];

export function getServiceBySlug(slug: string): ServiceItem | undefined {
  const normalizedSlug =
    slug === "ministry-nonprofit-ai"
      ? "ministry-ai-implementation"
      : slug === "team-ai-workshop"
      ? "ai-workshop"
      : slug;
  return (
    FALLBACK_SERVICES.find((s) => s.slug === normalizedSlug) ??
    FALLBACK_SERVICES.find((s) => s.slug === slug)
  );
}
