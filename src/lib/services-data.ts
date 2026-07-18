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
  starting_price_cents: number | null;
  features: string[];
  process: ServiceProcessStep[];
  category: string;
}

export const FALLBACK_SERVICES: ServiceItem[] = [
  {
    id: "custom-agent-build",
    slug: "custom-agent-build",
    name: "Custom Autonomous Agent Build",
    tagline: "End-to-end custom AI agent design, tool integration, guardrails, and production deployment.",
    starting_price_cents: 499900,
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
  },
  {
    id: "agent-strategy-sprint",
    slug: "agent-strategy-sprint",
    name: "2-Week Agent Strategy Sprint",
    tagline: "Intensive 2-week sprint to evaluate, scope, architect, and prototype your team's first AI agent.",
    starting_price_cents: 249900,
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
    id: "ministry-nonprofit-ai",
    slug: "ministry-nonprofit-ai",
    name: "Ministry & Non-Profit AI Implementation",
    tagline: "Welcoming, high-trust AI agent workflows designed for volunteer intake, donor care, and community outreach.",
    starting_price_cents: 199900,
    category: "Community & Faith",
    description: `Tailored AI solutions built specifically for faith communities, non-profits, and educational institutions. We design agents that maintain warmth, ethical standards, and community trust while streamlining operations.`,
    outcomes: [
      "Volunteer Pathway Coordinator Agent with automated intake summaries.",
      "Donor Communication & Appreciation Workflow.",
      "Ethical AI Governance Policy tailored for ministry standards.",
      "Staff & Leadership onboarding workshop.",
    ],
    features: [
      "Ethical & Compassionate Tone Guardrails",
      "Privacy-First Data Protection",
      "Non-Technical Staff Friendly Interfaces",
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
        title: "3. Staff Onboarding",
        desc: "Train leaders and staff on managing human-in-the-loop approvals.",
      },
    ],
  },
  {
    id: "ai-governance-audit",
    slug: "ai-governance-audit",
    name: "AI Security & Governance Audit",
    tagline: "Comprehensive evaluation of your organization's AI tool usage, data privacy compliance, and agent security.",
    starting_price_cents: 149900,
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
  return FALLBACK_SERVICES.find((s) => s.slug === slug);
}
