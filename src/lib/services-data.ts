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
  {
    id: "website-development",
    slug: "website-development",
    name: "Custom Website Development & Design",
    tagline: "High-converting, mobile-responsive custom websites built to capture leads, showcase services, and grow your business.",
    starting_price_cents: null,
    category: "Web & Digital",
    description: `We build modern, high-performing websites engineered specifically to attract local customers, establish trust, and turn visitors into booked phone calls and quote requests.

Whether you run an automotive trade service (like window tinting or detailing), a professional consultancy, a non-profit, or a retail brand, we deliver a complete custom website tailored to your exact business goals.

### What We Build & Include:
- **Custom Lead-Generation Architecture**: Mobile-optimized layouts designed for fast navigation, click-to-call/text buttons, and interactive quote forms.
- **Service & Product Showcases**: High-resolution image galleries, pricing callout cards, warranties, and customer reviews.
- **Search Engine & Local SEO Foundation**: Technical SEO, page-by-page meta tags, schema markup, and Google Business Profile connection.
- **Analytics & Tracking**: Integrated Google Analytics 4 and Google Search Console so you know exactly where your leads come from.
- **Admin Control & Content Updates**: Easy-to-manage structure or managed website care options.`,
    outcomes: [
      "Fully responsive custom website optimized for desktop, tablet, and mobile browsers.",
      "Interactive quote forms, appointment booking, and click-to-call lead conversion triggers.",
      "Google Analytics 4 & Search Console setup for real-time traffic tracking.",
      "Page-by-page Local SEO foundation to rank higher in local search results.",
      "100% ownership of site assets, code, domain, and media content.",
    ],
    features: [
      "Custom Mobile-First Responsive Design",
      "High Conversion Quote & Lead Forms",
      "Google Business Profile Integration",
      "Fast 7–14 Day Delivery Options",
    ],
    process: [
      {
        title: "1. Brand & Scope Kickoff",
        desc: "We collect your business logo, services list, brand colors, and primary goals.",
      },
      {
        title: "2. Custom Design & Build",
        desc: "We build your mobile-optimized website with conversion forms, project galleries, and reviews.",
      },
      {
        title: "3. SEO & Analytics Setup",
        desc: "We configure local search tags, schema markup, Google Business Profile, and analytics tracking.",
      },
      {
        title: "4. Launch & Handoff",
        desc: "We deploy your site live to custom domain and provide full account access and training.",
      },
    ],
  },
  {
    id: "digital-marketing-seo",
    slug: "digital-marketing-seo",
    name: "Digital Marketing & Local SEO Growth",
    tagline: "Drive local search traffic, dominate Google Maps, and generate consistent high-intent client inquiries.",
    starting_price_cents: null,
    category: "Marketing & Growth",
    description: `Position your business at the top of local Google search results when local customers are actively looking for your services.

Our Local SEO and digital marketing campaigns focus on measurable growth—ranking higher in the Google 3-Pack map results, building local citation authority, and converting search traffic into paying clients.

### Key Strategies Delivered:
- **Google Business Profile (GBP) Optimization**: Geo-targeted keyword optimization, category tuning, and photo uploads.
- **Local Citation & Directory Building**: Consistent NAP (Name, Address, Phone) sync across major business directories.
- **Review Strategy & Reputation Management**: Automated customer review request workflows to build high trust.
- **On-Page & Content SEO**: Optimizing service pages with high-intent local search terms.`,
    outcomes: [
      "Increased visibility in the Google Maps Local 3-Pack search results.",
      "Higher volume of incoming phone calls and online quote requests from local customers.",
      "Consistent local directory citations (Yelp, Apple Maps, Bing Places, YellowPages).",
      "Monthly transparent rank tracking reports and traffic growth analytics.",
    ],
    features: [
      "Google Business Profile Optimization",
      "Geo-Targeted Local Keyword Strategy",
      "Customer Review Automation Setup",
      "Monthly Performance & Rank Reports",
    ],
    process: [
      {
        title: "1. Local Search Audit",
        desc: "We analyze your current rankings, Google Business Profile state, and competitor local keywords.",
      },
      {
        title: "2. Profile & On-Page Optimization",
        desc: "We overhaul your GBP listings, schema metadata, and service landing pages for local search.",
      },
      {
        title: "3. Citation & Growth Execution",
        desc: "We submit clean directory citations, launch review campaigns, and monitor ranking improvements.",
      },
    ],
  },
  {
    id: "video-editing-content",
    slug: "video-editing-content",
    name: "Professional Video Editing & Content Creation",
    tagline: "Turn raw video footage into engaging social media reels, promotional videos, and high-impact brand content.",
    starting_price_cents: null,
    category: "Media & Content",
    description: `Capture attention and elevate your brand with professional video editing tailored for YouTube, Instagram Reels, TikTok, Facebook, and client promo campaigns.

From short-form vertical video clips to full-length marketing videos and podcast episodes, we edit your raw media with crisp pacing, dynamic captions, sound design, and brand color grading.

### Services Provided:
- **Short-Form Reels & Shorts**: Fast-paced vertical videos (9:16) with animated subtitles, hooks, and trend music.
- **Promotional & Commercial Videos**: High-quality promo ads highlighting your products, services, or events.
- **Podcast & Interview Editing**: Multi-camera switching, audio noise reduction, master audio balancing, and show highlight clips.
- **Corporate & Demo Videos**: Professional explainer videos, customer testimonial edits, and product walkthroughs.`,
    outcomes: [
      "Polished, broadcast-quality video content ready for instant social media posting.",
      "Dynamic animated captions and kinetic typography for maximum mobile engagement.",
      "Professional audio cleanup, noise reduction, and background music mixing.",
      "Optimized export formats for YouTube, Instagram Reels, TikTok, and web embedding.",
    ],
    features: [
      "Short-Form & Long-Form Video Editing",
      "Custom Subtitles & Kinetic Captions",
      "Professional Sound Design & Color Grading",
      "Fast Turnaround Options",
    ],
    process: [
      {
        title: "1. Footage & Brand Upload",
        desc: "Upload your raw video files, logos, brand guidelines, and desired video style notes.",
      },
      {
        title: "2. Editing & Color/Audio Master",
        desc: "We cut footage, apply hooks, add custom subtitles, balance audio, and grade colors.",
      },
      {
        title: "3. Review & HD Export",
        desc: "Review your video draft, request revisions, and download full resolution HD/4K exports.",
      },
    ],
  },
  {
    id: "flyer-promotion-design",
    slug: "flyer-promotion-design",
    name: "Flyer & Promotional Graphic Design",
    tagline: "Eye-catching digital and print promotional graphics, event flyers, banners, and marketing collateral.",
    starting_price_cents: null,
    category: "Design & Branding",
    description: `Make your promotions stand out with custom graphic designs that demand attention and drive action.

We craft custom event flyers, digital social media promo graphics, print-ready marketing cards, banners, and branded announcement materials for trade businesses, events, corporate promotions, and ministries.

### What We Design:
- **Event & Party Flyers**: Vibrant digital and print flyers for grand openings, special events, and sales.
- **Social Media Promotional Graphics**: Tailored posts, story graphics, and carousel banners for Instagram, Facebook, and LinkedIn.
- **Print Marketing Collateral**: Business cards, promo cards, door hangers, rack cards, and vinyl banner layouts.
- **Digital Ad Banners**: High-converting visual ads optimized for web banners and social ad campaigns.`,
    outcomes: [
      "High-resolution digital graphics ready for instant social media publication.",
      "Print-ready CMYK files with crop marks and bleed specifications for commercial printers.",
      "Multiple format exports (PNG, JPEG, PDF, SVG).",
      "Fast 24-to-48 hour rush delivery options available.",
    ],
    features: [
      "Custom High-Resolution Artwork",
      "Print-Ready CMYK & Digital RGB Formats",
      "Multiple Layout Aspect Ratios (Story, Square, Banner)",
      "100% Original Design Concepts",
    ],
    process: [
      {
        title: "1. Design Brief",
        desc: "Provide your event details, headline text, brand logos, and style preferences.",
      },
      {
        title: "2. Concept Design",
        desc: "We create initial eye-catching design concepts and present for your feedback.",
      },
      {
        title: "3. Polishing & Final Handoff",
        desc: "We refine design details and export all digital and print-ready master files.",
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
