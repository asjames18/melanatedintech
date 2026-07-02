-- Expand descriptions for 12 short Marketplace Agents
UPDATE public.agents
SET description = $md$A premium support agent that integrates directly with your customer database, knowledge base, and refund policies to resolve tier-1 issues instantly and escalate complex cases.

## Core Capabilities
- **Ticket Triage:** Automatically reads incoming tickets, extracts intent, and tags them by urgency and category.
- **Knowledge Base Q&A:** Answers customer questions in your brand voice by retrieving relevant facts from your synced documents.
- **Refund Workflows:** Safely processes refund requests by checking purchase histories, active subscription statuses, and terms of service.
- **Tone-Matched Drafts:** Drafts emails tailored to the customer's sentiment (apologetic for complaints, enthusiastic for feedback).
- **Smart Escalation:** Flags unresolved questions and hands them off to human agents with a concise summary of the conversation.$md$
WHERE slug = 'customer-support-agent';

UPDATE public.agents
SET description = $md$A financial agent that monitors your transaction logs, generates cash-flow projections, and audits vendor agreements to keep solopreneurs profitable.

## Core Capabilities
- **Cash-Flow Analysis:** Analyzes historical revenues and recurring costs to project runway and monthly cash balances.
- **Pricing Strategy Auditing:** Reviews product margins and suggests pricing adjustments based on market benchmarks.
- **Vendor Audit & Review:** Analyzes recurring subscriptions and contract terms to flag duplicate services or price increases.
- **Monthly Reports:** Compiles high-level PDF summaries covering profitability ratios, cost changes, and runway projections.$md$
WHERE slug = 'small-business-cfo';

UPDATE public.agents
SET description = $md$A productivity coordinator that filters your inbox, drafts daily briefing documents, and prepares you for upcoming meetings.

## Core Capabilities
- **Inbox Triage:** Classifies emails into Action, Information, or Archive, highlighting high-priority threads.
- **Meeting Prep Sheets:** Synthesizes participant profiles, past conversation context, and action items before each calendar event.
- **Daily Briefing:** Generates a unified morning brief summarizing calendar events, tasks due, and urgent follow-ups.
- **Follow-up Tracking:** Scans outbound messages to create reminders for replies you are waiting on.$md$
WHERE slug = 'personal-chief-of-staff';

UPDATE public.agents
SET description = $md$An analytical research agent designed to perform multi-source market, competitor, and academic literature searches.

## Core Capabilities
- **Source Triangulation:** Compares data points across multiple primary and secondary sources to filter out low-credibility info.
- **Citation Tracking:** Automatically embeds inline links to sources for every fact and metric generated in reports.
- **Structured Briefing:** Compiles research findings into clean Executive Summaries, Competitor Matrices, or Trend Reports.
- **Bias Auditing:** Scans drafts to flag leading language, unverified claims, or gaps in evidence.$md$
WHERE slug = 'research-agent';

UPDATE public.agents
SET description = $md$A content production assistant that repurposes a single core idea into high-engagement scripts, hooks, and multi-platform text.

## Core Capabilities
- **Content Repurposing:** Converts one transcript or raw text block into optimized threads for X, articles for LinkedIn, or scripts for YouTube.
- **Hook Generation:** Drafts 10 high-impact variations of titles and introductory hooks designed for specific platform algorithms.
- **Script Writing:** Generates structured A/B audio/video scripts complete with visual suggestions and speaking cues.
- **Thumbnail Concepts:** Brainstorms visual layouts, color contracts, and text overlays for designers.$md$
WHERE slug = 'creator-studio-agent';

UPDATE public.agents
SET description = $md$An outbound marketing assistant that researches prospects, drafts warm personalized outreaches, and syncs data to your CRM.

## Core Capabilities
- **ICP Research:** Filters company databases to find prospect matches based on revenue, team size, and tech stack.
- **Outbound Personalization:** Scans public profiles and press releases to write tailored, highly specific introduction hooks.
- **Spam Validation:** Audits email copy to flag spam-trigger words and optimize deliverability parameters.
- **CRM Syncing:** Log leads, interactions, and follow-ups directly to Hubspot, Salesforce, or custom DBs.$md$
WHERE slug = 'lead-gen-agent';

UPDATE public.agents
SET description = $md$A theological and historical research assistant that helps pastors analyze scriptures, historical contexts, and outline sermon flows.

## Core Capabilities
- **Scripture Analysis:** Cross-references verses across multiple translations (ESV, NIV, NASB) and examines original Hebrew/Greek word roots.
- **Historical Context:** Retrieves background information, geographic maps, and cultural contexts for biblical periods.
- **Outline Drafting:** Creates homiletical outlines that logically transition from exposition to application.
- **Illustration Discovery:** Recommends stories, analogies, and modern examples to illustrate complex theological concepts.$md$
WHERE slug = 'sermon-research-agent';

UPDATE public.agents
SET description = $md$A productivity assistant that parses transcript files to extract decisions, action items, and generate clear follow-up communications.

## Core Capabilities
- **Transcript Summarization:** Distills long transcripts into bulleted key takeaways and thematic highlights.
- **Action Item Capture:** Identifies commitments made during the meeting, assigning them to owners with timelines.
- **Follow-up Drafting:** Writes recap emails designed to keep attendees and stakeholders aligned on next steps.
- **Risk Tracking:** Flags blockers, unresolved questions, or dissenting views mentioned in the meeting.$md$
WHERE slug = 'meeting-notetaker-agent';

UPDATE public.agents
SET description = $md$A digital marketing assistant that clusters keywords, analyzes SERP intent, and drafts structured page briefs.

## Core Capabilities
- **Keyword Clustering:** Group keywords by search intent (Informational, Transactional, Navigational) to map to pages.
- **SERP Analysis:** Analyzes top-ranking competitor pages to define word counts, heading structures, and schema requirements.
- **Content Briefs:** Generates outlines for copywriters including target keywords, metadata, and user intent FAQs.
- **Internal Linking:** Recommends internal linking patterns based on your site map and page authority scores.$md$
WHERE slug = 'seo-research-agent';

UPDATE public.agents
SET description = $md$An administrative assistant designed to help church leaders coordinate volunteers, organize events, and manage community communications.

## Core Capabilities
- **Volunteer Coordination:** Drafts team scheduling rosters and handles follow-up reminders and confirmation logs.
- **Member Communication:** Drafts welcome sequences for new visitors, newsletters, and community announcements.
- **Event Organization:** Creates checklists, vendor briefs, and task delegation sheets for church events.
- **Sermon Series Planning:** Schedules sermon series themes, graphic asset deadlines, and media needs.$md$
WHERE slug = 'ministry-ops-agent';

UPDATE public.agents
SET description = $md$A strategic agent that maps target audiences, suggests channel distributions, and drafts campaign briefs.

## Core Capabilities
- **Audience Mapping:** Builds detailed customer personas based on demographic data, pain points, and buyer behaviors.
- **Channel Strategy:** Recommends budget splits and content frequencies across paid, earned, and owned media channels.
- **Campaign Briefs:** Drafts creative briefs for designers and copywriters to ensure consistent brand messaging.
- **KPI Measurement:** Formulates measurement frameworks, defining target conversion rates, acquisition costs, and retention metrics.$md$
WHERE slug = 'marketing-campaign-strategist';

UPDATE public.agents
SET description = $md$A professional nonprofit assistant that researches foundation criteria, drafts narrative sections, and structures budgets.

## Core Capabilities
- **Funder Alignment:** Scans foundation mission statements and past award histories to score matching compatibility.
- **Narrative Drafting:** Generates structured statements of need, program descriptions, and evaluation plans.
- **Budget Structures:** Aligns program budgets with narrative requests, translating costs into standard foundation categories.
- **Compliance Checklist:** Audits drafts against submission guidelines to ensure page limits, fonts, and required attachments are complete.$md$
WHERE slug = 'grant-writer-agent';


-- Expand descriptions for 10 short Marketplace Products
UPDATE public.products
SET description = $md$A markdown template that guides you in documenting how an agent works, what tools it needs, how to run it, and its safety constraints.

## What's Included
- A structured README.md layout with clear section headers.
- Example configuration blocks for Model Context Protocol (MCP) servers.
- Guide for documenting runtime environment variables and dependencies.
- Standard sections for logging, error handling, and manual overrides.$md$
WHERE slug = 'agent-readme-template';

UPDATE public.products
SET description = $md$A set of 5 architectural system diagrams and code abstractions detailing common agent architectures.

## Blueprints Included
1. **The Single Agent Router:** Simple, fast decision routing.
2. **The Orchestrator-Workers:** Hierarchical task division for complex workflows.
3. **The Multi-Agent Swarm:** Dynamic agent interaction and handoffs.
4. **The Safe Gatekeeper:** Security-first filtering of incoming requests.
5. **The Evaluator-Generator:** Iterative refinement of outputs.$md$
WHERE slug = 'agent-blueprint-pack';

UPDATE public.products
SET description = $md$A set of Standard Operating Procedures (SOPs) for configuring, monitoring, and auditing agent workflows in production.

## Covered Procedures
- **Handoff Protocols:** Standard formats for passing context between agents or to human reviews.
- **Failure & Retry Limits:** Rules for back-offs, timeouts, and alerting when tools fail.
- **Log Auditing:** Checklist for scanning agent trace logs for data leaks or bad formatting.
- **Data Residency Compliance:** Guide to ensuring agent memory and inputs comply with GDPR/HIPAA.$md$
WHERE slug = 'sop-library-for-agents';

UPDATE public.products
SET description = $md$A ready-to-use database schema and server-side function library for building episodic and semantic memory.

## Key Features
- PostgreSQL/pgvector database schema for storing vector embeddings.
- Memory pruning and relevance scoring algorithms based on recency and frequency.
- Retrieval code snippets for updating model system prompts dynamically with relevant past facts.
- Metadata filtering schema to ensure multi-tenant user isolation.$md$
WHERE slug = 'agent-memory-system';

UPDATE public.products
SET description = $md$A boilerplate codebase in TypeScript/Node for running local agents using Ollama and standard tools.

## Contents
- Full workspace setup with workspace configurations, TypeScript configs, and packages.
- Connection helpers for fetching model completions from local Ollama instances.
- Boilerplate implementations of simple directory read/write tools.
- System prompt templates for running basic planning loops.$md$
WHERE slug = 'agent-starter-kit';

UPDATE public.products
SET description = $md$A pre-launch checklist to evaluate whether your agent is ready for live traffic.

## Checklist Categories
- **Accuracy & Hallucination:** Scoring criteria for verifying facts and citations.
- **Speed & Latency:** Threshold metrics for tool executions and response generation.
- **Safety & Guardrails:** Stress-test checklist for prompt injections and unauthorized tool access.
- **Cost Controls:** Token budget guidelines and alert parameters.$md$
WHERE slug = 'agent-eval-checklist';

UPDATE public.products
SET description = $md$A curated directory of ready-to-run Model Context Protocol (MCP) servers to give your agents immediate capabilities.

## Included MCP Servers
- **File System:** Standard tool for reading, writing, and searching files.
- **SQLite Database:** Safe query tool with read-only limits.
- **Slack Integration:** Send and read channel alerts.
- **Memory Server:** Read and write persistent facts.
- Setup instructions and docker configurations for each server are included.$md$
WHERE slug = 'mcp-collection';

UPDATE public.products
SET description = $md$A library of 150 production-grade prompts designed to structure outputs, build plans, and safely execute tools.

## Prompt Categories
- **Output Shaping:** Formats outputs into structured JSON, clean tables, or markdown documents.
- **Planning & Decomposition:** Guides models to create step-by-step plans before calling tools.
- **Refinement Loops:** Prompts that direct models to critique their own drafts and correct errors.$md$
WHERE slug = 'prompt-library-pro';

UPDATE public.products
SET description = $md$A pack of 10 operations-focused sequence diagrams and configuration files for setting up business automations.

## Templates Included
- E-commerce customer return routing and refund processing.
- Daily newsletter curation, source summaries, and drafting loops.
- Server health check logs monitoring, outlier flagging, and alert emails.
- Financial expense receipt scanning, category matching, and audit routing.$md$
WHERE slug = 'workflow-templates-ops';

UPDATE public.products
SET description = $md$A library of 5 reusable custom skills written in Node/TypeScript for file processing, web scraping, and database management.

## Included Skills
- **Scrape & Summarize:** Fetches raw web content, strips HTML, and generates concise outlines.
- **Batch File Transcoder:** Scans a directory, parses text files, and converts formats.
- **Safe SQL Executor:** Validates queries against a whitelist before running them.
- Detailed TypeScript types and deployment steps are included.$md$
WHERE slug = 'agent-skill-pack-core';


-- Expand bodies for 5 short Knowledge Hub Articles
UPDATE public.articles
SET body = $md$# Agent Memory, Explained Without the Jargon

To build an agent that actually helps you over time, you need to understand memory. In human terms, memory is how we recall facts, remember events, and keep track of a conversation. For AI agents, memory is structured exactly the same way.

## Three levels of agent memory

### 1. Working memory (The current turn)
This is the model's active context window. It contains the current conversation history and the system prompt. It is fast and cheap, but it resets as soon as you start a new chat.

### 2. Episodic memory (What happened)
This is the record of past events and specific tasks the agent completed. If the user says "on Tuesday you drafted an email, show it to me," the agent queries its episodic memory to find that specific event.

### 3. Semantic memory (What is true)
This is the distilled pool of facts and preferences. For example: "The user prefers short summaries," or "The company database requires a port prefix." This information is stored permanently in a database (like PostgreSQL with vector extension) and is retrieved whenever the agent needs to form a plan.

## The vector database connection
To implement semantic and episodic memory, developers convert text memories into mathematical vectors (embeddings) and store them in a vector database. When the user asks a question, the system converts that question into a vector, queries the database for the most mathematically similar memories, and injects them directly into the agent's system prompt before the model replies.$md$
WHERE slug = 'agent-memory-explained';

UPDATE public.articles
SET body = $md$# MCP Servers: A Practical Primer

Model Context Protocol (MCP) is a standard protocol designed to bridge the gap between AI models and local or remote development tools. Before MCP, every integration was custom-coded. With MCP, you connect your agent to a server, and the agent automatically discovers what it can do.

## Client-Server Architecture

```mermaid
graph LR
  Agent[AI Client] <-->|MCP Protocol| Server[MCP Server]
  Server <--> Tools[Local/Remote Tools]
```

The architecture consists of two main components:
- **The Client (Agent):** The AI model runtime that requests tools, resources, and prompt templates.
- **The Server:** A lightweight process (written in Node.js, Python, or Go) that exposes specific endpoints (like reading files, querying databases, or calling external APIs).

## The three core capabilities

### 1. Tools
Functions that the agent can execute (e.g. `read_directory`, `run_query`). The server declares the function name, description, and required parameters, and the agent calls it.

### 2. Resources
Static or dynamic data sources that the agent can read (e.g. log files, documentation pages, or database schemas).

### 3. Prompts
Templates that help users structure prompts for specific tasks (e.g. a "debug-code" template that guides the user to supply the language, error log, and file path).$md$
WHERE slug = 'mcp-servers-primer';

UPDATE public.articles
SET body = $md$# Agent Skills vs. Tools: The Distinction That Matters

In agentic development, the terms **Tool** and **Skill** are often used interchangeably, but separating them is crucial if you want to build reliable, scalable architectures.

## The core distinction

- **Tool:** A single, stateless action. It is a utility function that performs one specific job (e.g. writing a file, calling an API, or searching a database). The agent decides when to call it and must handle the raw inputs and outputs.
- **Skill:** An orchestrated sequence of actions. It represents a capability built on top of tools, containing logic, validation rules, error handling, and state management.

## A comparison

| Feature | Tool | Skill |
| :--- | :--- | :--- |
| **Complexity** | Low, single-purpose | High, multi-step |
| **State** | Stateless | Stateful |
| **Decision Loop** | Model decides parameters | Pre-programmed logic + Model decisions |
| **Example** | `write_to_file` | `compile_and_test_code` |

## Why this matters
If you rely solely on tools, your agent has to figure out the exact sequence of 10 different function calls every time it runs a complex task, which leads to frequent planning failures. By wrapping those tools in a **Skill** (using a script or state machine), you give the agent a single high-level command to trigger, making the overall workflow vastly more reliable.$md$
WHERE slug = 'agent-skills-vs-tools';

UPDATE public.articles
SET body = $md$# When You Actually Need Multi-Agent Systems

Multi-agent frameworks (like Autogen, CrewAI, or LangGraph) are highly popular, but they introduce significant overhead, complexity, latency, and cost. In most cases, a single agent with a well-designed system prompt and high-quality tools is the correct choice.

## The Single Agent rule
Start with a single agent. You only need to split it into a multi-agent system when:
- **The roles are conflicting:** For example, you need a writer agent to generate creative copy, and an editor agent to strictly check compliance and tone guidelines. Putting both roles in one prompt leads to mixed results.
- **The toolset is too large:** If you have 30 different tools, injecting all their schemas into a single model's context window degrades performance (due to "lost in the middle" attention issues). Splitting the task among specialized agents with 5 tools each is much more reliable.
- **You need parallel execution:** If research, data collection, and code execution can happen at the same time, separate agents can run these tasks in parallel, reducing overall user wait time.

## Architectural Patterns
- **Hierarchical (Supervisor):** One router agent coordinates tasks, delegates to sub-agents, reviews their outputs, and handles the final response.
- **Sequential (Pipeline):** Agent A processes the input, passes it to Agent B, who passes it to Agent C.
- **Collaborative (Swarm):** Agents communicate dynamically with each other to solve a task. This is the most complex and least predictable pattern.$md$
WHERE slug = 'multi-agent-systems';

UPDATE public.articles
SET body = $md$# Local AI With Ollama: Why It Matters

While cloud APIs (like OpenAI, Claude, or Gemini) offer high capabilities, they come with trade-offs in data privacy, cost, and dependence on internet connectivity. Running models locally using Ollama changes the economics and security posture of agent development.

## Key advantages of local models

### 1. Data Privacy & Compliance
For industries like healthcare, finance, or legal services, sending sensitive customer data to third-party APIs is often a compliance blocker. Local models process all data entirely on your physical machine or private network.

### 2. Zero Running Costs
Cloud models charge per token processed. For agents that run in the background 24/7 (such as logging monitor agents or email triagers), cloud costs can escalate rapidly. Local models are free to run once you have the hardware.

### 3. Offline Autonomy
Local agents can run in remote environments, aboard vessels, or on secure internal networks without requiring an active internet connection.

## Trade-offs and hardware requirements
Local models (like Llama 3 8B or Mistral 7B) require modern GPUs with at least 8GB to 16GB of VRAM to achieve fast token-per-second generation. While smaller models are highly capable of simple categorization and code generation, they lack the advanced planning and reasoning capabilities of cloud models. The best architecture is often a hybrid approach: local models for low-risk, high-volume classification, and cloud models for complex planning tasks.$md$
WHERE slug = 'local-ai-with-ollama';
