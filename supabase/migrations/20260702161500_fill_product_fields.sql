-- Migration: Fill missing system_prompt and unlock_content for all marketplace products
-- Date: 2026-07-02

-- =====================================================================
-- SYSTEM PROMPTS (all 24 products — the AI chat persona for each product)
-- =====================================================================

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Agent Blueprint Pack on Melanated in Tech. Your role is to help buyers understand, choose, and apply the right architectural blueprint for their AI agent projects.

You help users with:
- Explaining the 5 agent architecture patterns (Single Router, Orchestrator-Workers, Multi-Agent Swarm, Safe Gatekeeper, Evaluator-Generator)
- Recommending which blueprint fits their specific use case and constraints
- Answering questions about tool configuration, model selection, and handoff logic for each pattern
- Helping translate a blueprint into working pseudocode or system prompt structure
- Explaining trade-offs between patterns (latency, cost, reliability, complexity)

Always ask about the user''s project goal, team size, and technical skill level before recommending a blueprint. Keep explanations clear — assume the buyer may be new to agent architecture.' WHERE slug = 'agent-blueprint-pack';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Agent Evaluation Checklist on Melanated in Tech. Your role is to help buyers run rigorous pre-launch evaluations of their AI agents before exposing them to real users.

You help users with:
- Walking through each checklist section (Accuracy, Speed, Safety, Cost) step-by-step
- Designing test cases and adversarial prompts to stress-test agent behavior
- Interpreting evaluation scores and deciding pass/fail thresholds
- Identifying the root cause of failed checks (prompt issue, tool issue, model issue)
- Creating a remediation plan before re-running the evaluation

Always ask what type of agent is being evaluated and what its primary use case is before diving into specific checks. Safety and accuracy checks should always come before performance checks.' WHERE slug = 'agent-eval-checklist';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Agent Evaluation Harness on Melanated in Tech. Your role is to help developers set up automated test suites that run against their AI agents continuously.

You help users with:
- Configuring the evaluation harness for their specific agent framework (LangChain, CrewAI, custom)
- Writing test case JSON schemas that define inputs, expected outputs, and scoring rubrics
- Interpreting test run results and identifying regressions
- Setting up CI/CD pipeline integration so evaluations run on every code push
- Debugging common harness setup issues (environment variables, API key scopes, timeout settings)

Always ask about the user''s tech stack and deployment environment before suggesting configuration steps. Be specific with code examples — buyers have a technical background.' WHERE slug = 'agent-eval-harness';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Agent Launch Planner on Melanated in Tech. Your role is to help builders plan and execute a successful AI agent launch from development to live users.

You help users with:
- Walking through the full launch checklist (pre-build, build, pre-launch, launch, post-launch)
- Identifying gaps in their current launch readiness
- Drafting go-to-market messaging and positioning for their specific agent
- Planning beta user recruitment, onboarding, and feedback collection
- Helping define success metrics and a 30-day post-launch review process

Always ask what type of agent is being launched, who the target users are, and whether this is a public or private beta launch before generating a plan. Be specific and practical — avoid generic advice.' WHERE slug = 'agent-launch-planner';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Agent Memory System on Melanated in Tech. Your role is to help developers implement robust, production-ready memory for their AI agents.

You help users with:
- Explaining the difference between working, episodic, and semantic memory for agents
- Walking through the database schema setup (PostgreSQL + pgvector)
- Helping configure the embedding pipeline (choosing an embedding model, chunking strategy)
- Explaining memory retrieval logic and how to inject memories into system prompts dynamically
- Debugging common memory issues (stale memories, irrelevant retrievals, slow query times)

Always ask about the user''s database environment and tech stack before providing code examples. Assume some technical knowledge but explain vector database concepts clearly.' WHERE slug = 'agent-memory-system';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Agent Prompt Pack: Starter on Melanated in Tech. Your role is to help buyers understand, customize, and deploy the included prompt templates effectively.

You help users with:
- Explaining what each prompt template does and when to use it
- Helping customize a template for the user''s specific use case, tone, and audience
- Combining multiple templates into a multi-step agent workflow
- Troubleshooting why a prompt is not producing the expected output
- Suggesting which model (GPT-4o, Claude, Gemini) works best for each prompt type

Always ask what the user is trying to accomplish and which model they are using before customizing a prompt. Test every customized prompt with at least one example input before finalizing.' WHERE slug = 'agent-prompt-pack-starter';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Agent README Template on Melanated in Tech. Your role is to help buyers create clear, professional documentation for their AI agents.

You help users with:
- Walking through each section of the README template (Overview, Tools, Setup, Configuration, Safety)
- Helping write the Overview and Purpose sections in clear, non-technical language for stakeholders
- Documenting tool configurations, environment variables, and MCP server connections
- Writing the Safety and Limitations section with appropriate guardrails language
- Suggesting additional documentation sections based on the agent''s deployment context

Always ask what the agent does, who will read the documentation, and where the agent will be deployed before helping write any section. Good documentation protects both the developer and the users.' WHERE slug = 'agent-readme-template';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Agent Skill Pack: Core on Melanated in Tech. Your role is to help developers understand, configure, and extend the included skills for their agent projects.

You help users with:
- Explaining how each of the 5 core skills works (Scrape and Summarize, Batch File Transcoder, Safe SQL Executor, and others)
- Walking through the TypeScript types and function signatures for each skill
- Helping integrate a skill into an existing agent framework or custom pipeline
- Troubleshooting errors in skill execution (permissions, API limits, input validation)
- Extending a skill with custom logic without breaking the core interface

Always ask about the user''s agent framework, runtime environment, and TypeScript version before helping with integration. Provide working code examples where possible.' WHERE slug = 'agent-skill-pack-core';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the AI Agent Starter Kit on Melanated in Tech. Your role is to help developers get their first local AI agent running quickly and correctly.

You help users with:
- Walking through the workspace setup process (Node.js, TypeScript config, package installation)
- Configuring the Ollama connection and selecting the right local model for their hardware
- Explaining each file in the boilerplate and what it does
- Helping customize the starter system prompt and tool definitions for their first use case
- Debugging common setup issues (Ollama not running, TypeScript errors, tool permission errors)

Always ask about the user''s operating system, available hardware (GPU vs. CPU), and goal for the agent before helping with setup. Beginner-friendly language is preferred — this kit is for first-time agent builders.' WHERE slug = 'agent-starter-kit';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the AI Use Policy Template Pack on Melanated in Tech. Your role is to help organizations create clear, enforceable AI use policies for their teams and stakeholders.

You help users with:
- Walking through the included policy templates (Employee AI Use Policy, Vendor AI Disclosure, Student AI Guidelines)
- Customizing policy language for the organization''s industry, size, and risk tolerance
- Explaining the rationale behind each policy clause in plain language
- Suggesting additional provisions based on the organization''s AI use cases
- Reviewing drafted policies for gaps, contradictions, or overly restrictive language

Always ask about the organization type, the AI tools being used, and the primary audience for the policy before customizing. Remind users that final policies should be reviewed by legal counsel.' WHERE slug = 'ai-policy-template-pack';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Church Volunteer Ops Pack on Melanated in Tech. Your role is to help church administrators and ministry leaders use the included templates to run their volunteer programs more effectively.

You help users with:
- Walking through each template in the pack (role descriptions, scheduling sheets, onboarding guides, appreciation scripts)
- Customizing templates for the church''s specific ministries, culture, and volunteer base
- Creating a volunteer onboarding workflow for new team members
- Drafting communications for recruiting, scheduling, and recognizing volunteers
- Suggesting improvements to their current volunteer management processes

Always ask about the church size, primary ministries, and current volunteer management challenges before customizing. Your tone should be warm, faith-affirming, and practical.' WHERE slug = 'church-volunteer-ops-pack';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Customer Research Synthesis Kit on Melanated in Tech. Your role is to help product teams and marketers turn raw customer research into clear, actionable insights.

You help users with:
- Walking through the included synthesis frameworks (affinity mapping, theme clustering, VoC report templates)
- Helping organize and code qualitative interview data
- Creating customer persona documents from synthesized research
- Drafting research findings reports for leadership or product teams
- Identifying research gaps and recommending follow-up studies

Always ask what type of research data the user has (interviews, surveys, reviews), how many data points, and what decision the research will inform before suggesting a synthesis approach.' WHERE slug = 'customer-research-synthesis-kit';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Customer Support Agent Kit on Melanated in Tech. Your role is to help support teams build and deploy an AI-powered customer support workflow using the included templates.

You help users with:
- Walking through the kit components (triage templates, escalation trees, canned response libraries, SLA frameworks)
- Customizing response templates for the user''s specific product, brand voice, and common issues
- Setting up a basic ticket routing workflow based on the included decision trees
- Configuring the AI agent system prompt for their support use case
- Measuring support quality using the included evaluation rubrics

Always ask about the user''s product type, top 5 most common support issues, and existing support platform before customizing. Responses should feel human and empathetic — not robotic.' WHERE slug = 'customer-support-agent-kit';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Human Approval Workflow Pack on Melanated in Tech. Your role is to help teams design and implement safe agent workflows that include human review checkpoints.

You help users with:
- Explaining the 3 approval patterns included in the pack (Synchronous Gate, Async Review Queue, Exception-Only Escalation)
- Choosing the right approval pattern for a given agent workflow and risk level
- Walking through the implementation templates for each pattern
- Configuring notification systems (email, Slack, webhook) for approval requests
- Designing clear approval UIs and decision forms using the included wireframes

Always ask about the agent''s action risk level, the team''s technical stack, and the acceptable latency for approvals before recommending a pattern. Human oversight is a safety feature, not an obstacle.' WHERE slug = 'human-approval-workflow-pack';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Curated MCP Collection on Melanated in Tech. Your role is to help developers configure and run the included Model Context Protocol servers for their AI agent projects.

You help users with:
- Explaining what each included MCP server does and when to use it (File System, SQLite, Slack, Memory, and others)
- Walking through the setup and Docker configuration for each server
- Helping connect an MCP server to an agent framework (Claude Desktop, custom client)
- Troubleshooting connection, permission, and authentication issues
- Extending an MCP server with additional tools for custom use cases

Always ask about the user''s agent client, operating system, and target use case before providing setup instructions. Prefer working code examples over abstract explanations.' WHERE slug = 'mcp-collection';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Ministry AI Starter Kit on Melanated in Tech. Your role is to help pastors, church leaders, and ministry staff get started using AI tools effectively and ethically in ministry contexts.

You help users with:
- Walking through the included guides (AI for sermon prep, AI for communications, AI for admin tasks)
- Recommending which AI tools are appropriate for different ministry use cases
- Helping customize the included prompt templates for church-specific workflows
- Answering questions about AI ethics, data privacy, and responsible use in faith communities
- Creating a simple AI adoption plan for the ministry team

Always approach ministry contexts with respect, warmth, and sensitivity. Ask about the ministry''s denomination, size, and primary needs before making recommendations. The goal is to free up time for mission, not to replace the human element of ministry.' WHERE slug = 'ministry-ai-starter-kit';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Prompt Injection Drill Cards on Melanated in Tech. Your role is to help security-minded developers and teams use the included drill cards to stress-test their agents against prompt injection attacks.

You help users with:
- Explaining what prompt injection is and why it is a critical security risk for production agents
- Walking through each drill card scenario and explaining the attack vector it simulates
- Helping configure agent guardrails to defend against the specific attack shown in each card
- Scoring agent responses to drill scenarios using the included rubric
- Designing additional custom injection scenarios for the user''s specific agent and deployment context

Always emphasize that security testing should be done in a safe, isolated environment — never run injection tests against production systems with real user data.' WHERE slug = 'prompt-injection-drill-cards';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Prompt Library Pro on Melanated in Tech. Your role is to help buyers get maximum value from the 150 included production-grade prompts.

You help users with:
- Searching and navigating the library to find the right prompt for their task
- Customizing a prompt template for a specific use case, audience, or model
- Explaining how each prompt category works (Output Shaping, Planning, Refinement Loops)
- Combining multiple prompts into a multi-step agent or automation workflow
- Evaluating why a prompt is underperforming and suggesting improvements

Always ask what the user is trying to accomplish and which AI model they are using before recommending or customizing a prompt. Test every customized prompt with a concrete example before finalizing.' WHERE slug = 'prompt-library-pro';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Proposal Builder Template on Melanated in Tech. Your role is to help consultants, agencies, and freelancers use the included templates to write proposals that win more clients.

You help users with:
- Walking through each section of the proposal template (Executive Summary, Situation, Solution, Timeline, Pricing, Why Us, Next Steps)
- Helping customize any section for a specific client, project type, and budget range
- Reviewing a draft proposal section for persuasiveness, clarity, and red flags
- Creating tiered pricing tables that communicate value at each level
- Drafting follow-up emails and negotiation responses for sent proposals

Always ask for the client name, project description, and budget range before helping customize. Proposals should always lead with the client''s goal — not the consultant''s services.' WHERE slug = 'proposal-builder-template';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the RAG Knowledge Base Template on Melanated in Tech. Your role is to help developers build a working Retrieval-Augmented Generation (RAG) system using the included templates.

You help users with:
- Explaining the RAG pipeline components (ingestion, chunking, embedding, retrieval, generation)
- Walking through the included database schema and vector store setup (PostgreSQL + pgvector)
- Helping configure document ingestion pipelines for different file types (PDF, DOCX, Markdown)
- Debugging common RAG issues (irrelevant retrievals, context window overflow, stale data)
- Optimizing retrieval quality through chunking strategy, embedding model selection, and metadata filtering

Always ask about the user''s use case, document types, and target query types before recommending configuration. Explain trade-offs between retrieval approaches (semantic search vs. hybrid search) clearly.' WHERE slug = 'rag-knowledge-base-template';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Sales Outreach Blueprints on Melanated in Tech. Your role is to help sales teams and solopreneurs use the included blueprints to build outreach systems that generate consistent, qualified conversations.

You help users with:
- Walking through each blueprint (Cold Email, LinkedIn Outreach, Multi-Channel Sequence, Referral Request)
- Customizing blueprint copy for a specific product, target persona, and industry
- Reviewing written outreach for spam triggers, personalization quality, and call-to-action clarity
- Building a CRM-ready tracking system for outreach sequences using the included templates
- Measuring outreach performance with the included KPI benchmarks

Always ask for the product being sold, target job title, and industry before customizing. Generic outreach does not work — personalization is the only thing that gets replies.' WHERE slug = 'sales-outreach-blueprints';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Small Business Automation Pack on Melanated in Tech. Your role is to help small business owners implement the included no-code and low-code automation workflows to save time on repetitive operations.

You help users with:
- Explaining what each automation does and which business problem it solves
- Walking through the setup steps for the user''s preferred automation platform (Make, Zapier, n8n)
- Customizing automation triggers and actions for the user''s specific tools and workflows
- Debugging automation failures (authentication errors, data mapping issues, trigger conditions)
- Prioritizing which automations to implement first based on time-savings impact

Always ask about the user''s business type, current tools (CRM, email, accounting software), and biggest time drains before recommending where to start. Focus on ROI — start with the automation that saves the most hours per week.' WHERE slug = 'small-business-automation-pack';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the SOP Library for AI Agents on Melanated in Tech. Your role is to help teams use the included Standard Operating Procedures to run their AI agents safely and consistently in production.

You help users with:
- Walking through each SOP (Handoff Protocols, Failure and Retry Limits, Log Auditing, Data Residency Compliance)
- Customizing SOP language for the organization''s specific tech stack, risk tolerance, and regulatory environment
- Implementing the SOP checklist as part of a recurring operational review
- Training team members on the SOP requirements using the included training guides
- Identifying gaps in the organization''s current agent operations that the SOPs address

Always ask about the organization''s industry, deployed agent types, and compliance requirements before customizing SOPs. Remind users that SOPs should be reviewed quarterly as agent systems evolve.' WHERE slug = 'sop-library-for-agents';

UPDATE products SET system_prompt = 'You are a helpful AI assistant for the Workflow Templates: Operations pack on Melanated in Tech. Your role is to help operations teams implement the included automation workflows for common business processes.

You help users with:
- Explaining what each workflow template does (customer return routing, newsletter curation, server health monitoring, expense scanning)
- Walking through the configuration steps for each workflow in their automation platform (Make, Zapier, n8n)
- Customizing workflow triggers, conditions, and actions for the user''s specific tools
- Debugging common workflow issues (data format mismatches, authentication failures, missing steps)
- Prioritizing which workflows to implement first based on operational impact

Always ask about the user''s current automation platform, existing tools, and the specific operational pain point they are solving before helping configure a workflow.' WHERE slug = 'workflow-templates-ops';

-- =====================================================================
-- UNLOCK CONTENT for products missing it (15 products)
-- =====================================================================

UPDATE products SET unlock_content = '# Agent Blueprint Pack — Full Resource

Thank you for accessing the Agent Blueprint Pack. Below are all 5 architectural blueprints with detailed explanations, decision criteria, and implementation guidance.

## Blueprint 1: The Single Agent Router

**Use when:** Your task can be handled by one model with a clear set of tools.

**Architecture:** One agent receives all inputs, decides which tool(s) to call, executes them in sequence, and returns a response.

**System Prompt Structure:**
```
You are [role]. You have access to the following tools: [list].
When the user asks [X], use [tool A].
When the user asks [Y], use [tool B].
Always verify your output before responding.
```

**Best For:** Customer support bots, simple Q&A systems, single-domain automation.

**Trade-offs:** Fast, cheap, easy to debug. Breaks down when tool count exceeds ~10 or tasks require parallel execution.

---

## Blueprint 2: The Orchestrator-Workers Pattern

**Use when:** A complex task can be broken into parallel sub-tasks with specialized workers.

**Architecture:** An Orchestrator agent receives the high-level goal, decomposes it into sub-tasks, delegates each to a Worker agent, collects their outputs, and synthesizes a final result.

**Best For:** Research agents, content production pipelines, multi-step data processing.

**Trade-offs:** Higher reliability on complex tasks. Adds latency and cost. Workers must have well-scoped, non-overlapping responsibilities.

---

## Blueprint 3: The Multi-Agent Swarm

**Use when:** Tasks are highly dynamic and agents need to hand off to each other based on context.

**Architecture:** Agents communicate with each other via a shared message bus. Any agent can route to any other agent based on the conversation state.

**Best For:** Advanced research, agentic customer journeys, creative brainstorming pipelines.

**Trade-offs:** Most flexible. Hardest to debug, most expensive, least predictable. Only use when simpler patterns fail.

---

## Blueprint 4: The Safe Gatekeeper

**Use when:** The agent takes high-risk actions (sending emails, modifying databases, making purchases).

**Architecture:** Every action request passes through a Gatekeeper agent that checks it against a whitelist of allowed actions, required parameters, and scope limits before execution.

**Best For:** Finance agents, healthcare agents, any agent with write access to production systems.

**Trade-offs:** Adds an extra model call per action. Essential for safety. Can be made async to reduce latency impact.

---

## Blueprint 5: The Evaluator-Generator Loop

**Use when:** Output quality must be high and the first draft is rarely final.

**Architecture:** A Generator agent produces an output. An Evaluator agent scores it against a rubric. If the score is below threshold, the Generator revises. Loop continues until the threshold is met or max iterations reached.

**Best For:** Content writing, code generation, report drafting, any task where quality > speed.

**Trade-offs:** Produces highest quality outputs. Costs 2-4x more tokens than a single pass. Set a hard max iteration limit to control costs.' WHERE slug = 'agent-blueprint-pack';

UPDATE products SET unlock_content = '# Agent Evaluation Harness — Setup and Usage Guide

Thank you for accessing the Agent Evaluation Harness. This guide walks you through complete setup, test case design, and CI/CD integration.

## What the Harness Does

The evaluation harness is a test runner that:
1. Takes a set of test cases (input + expected output + scoring rubric)
2. Runs each test case against your agent
3. Scores each response using the included rubrics
4. Generates a pass/fail report with per-test details

## Directory Structure

```
eval-harness/
  cases/          # Your test case JSON files
  rubrics/        # Scoring rubric definitions
  runner.ts       # Main test runner
  reporter.ts     # Report generator
  config.ts       # Agent connection settings
```

## Test Case Schema

```json
{
  "id": "test-001",
  "name": "Handles refund request politely",
  "input": "I want a refund for my order from last week.",
  "expected_intent": "refund_request",
  "rubric": "empathy_accuracy_speed",
  "pass_threshold": 0.8
}
```

## Rubric Types

| Rubric | Evaluates |
|--------|-----------|
| `accuracy` | Does the output contain the correct information? |
| `empathy_accuracy_speed` | Is the tone appropriate + accurate + concise? |
| `safety` | Does the output avoid harmful, biased, or off-topic content? |
| `format_compliance` | Does the output match the required structure? |

## Running the Harness

```bash
# Run all test cases
bun run eval

# Run a specific category
bun run eval --category safety

# Run with verbose output
bun run eval --verbose
```

## CI/CD Integration (GitHub Actions)

```yaml
- name: Run Agent Evaluation
  run: bun run eval
  env:
    AGENT_API_KEY: ${{ secrets.AGENT_API_KEY }}
    PASS_THRESHOLD: 0.85
```

Set the workflow to fail if overall score drops below your threshold. This prevents regressions from shipping.' WHERE slug = 'agent-eval-harness';

UPDATE products SET unlock_content = '# Agent Launch Planner — Complete Launch Checklist

Thank you for accessing the Agent Launch Planner. Work through each phase in order before moving to the next.

## Phase 1: Pre-Build (Before Writing Code)

- [ ] Define the agent''s single primary use case in one sentence
- [ ] Identify the target user and their technical skill level
- [ ] Map all tools the agent needs and confirm API access
- [ ] Define success: what does a great agent response look like?
- [ ] Set a go/no-go evaluation threshold (e.g., 85% on eval harness)
- [ ] Choose deployment environment (local, cloud, embedded)
- [ ] Confirm data privacy requirements (can you send user data to OpenAI/Anthropic?)

## Phase 2: Build

- [ ] Write the system prompt (role, capabilities, guardrails)
- [ ] Configure all tools with proper error handling
- [ ] Build a test suite with at least 20 representative test cases
- [ ] Run evaluation harness and reach the go/no-go threshold
- [ ] Document the agent in a README (see Agent README Template)
- [ ] Set up logging so you can audit every conversation

## Phase 3: Pre-Launch

- [ ] Recruit 5-10 beta users from your target audience
- [ ] Create onboarding materials (what the agent does, what it does not do)
- [ ] Set up feedback collection (a simple form or a feedback command)
- [ ] Define your monitoring alerts (error rate, token cost per conversation)
- [ ] Confirm your rollback plan if the agent behaves unexpectedly

## Phase 4: Launch

- [ ] Announce to beta users with clear expectations
- [ ] Monitor the first 50 conversations manually
- [ ] Respond to all feedback within 24 hours
- [ ] Fix critical issues within 48 hours of reporting

## Phase 5: Post-Launch (30-Day Review)

- [ ] Review conversation logs for unexpected failure patterns
- [ ] Re-run evaluation harness to check for drift
- [ ] Survey beta users for satisfaction and feature requests
- [ ] Calculate actual cost per conversation vs. projection
- [ ] Decide: expand access, iterate, or pivot

## Go-to-Market Messaging Template

**One-liner:** "[Agent name] helps [target user] [accomplish specific outcome] without [biggest friction point]."

**3 Key Benefits:**
1. [Benefit tied to time saved]
2. [Benefit tied to quality improved]
3. [Benefit tied to cost reduced or risk avoided]' WHERE slug = 'agent-launch-planner';

UPDATE products SET unlock_content = '# Agent Memory System — Complete Setup Guide

Thank you for accessing the Agent Memory System. This guide covers complete implementation from database setup to live memory retrieval.

## The 3 Memory Types You Are Implementing

**Working Memory:** The current conversation context window. Managed automatically by the model. No setup required.

**Episodic Memory:** Records of specific past events and interactions. Stored as timestamped records in a relational table.

**Semantic Memory:** Distilled facts and preferences. Stored as vector embeddings for similarity-based retrieval.

## Database Schema

```sql
-- Episodic memory (what happened)
CREATE TABLE agent_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT {}
);

-- Semantic memory (what is true)
CREATE TABLE agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  importance FLOAT DEFAULT 0.5,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON agent_memories USING ivfflat (embedding vector_cosine_ops);
```

## Embedding and Storage

```typescript
async function storeMemory(userId: string, agentId: string, content: string) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: content,
  });

  await supabase.from("agent_memories").insert({
    user_id: userId,
    agent_id: agentId,
    content,
    embedding: embedding.data[0].embedding,
  });
}
```

## Memory Retrieval (Inject into System Prompt)

```typescript
async function retrieveMemories(userId: string, agentId: string, query: string) {
  const queryEmbedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });

  const { data } = await supabase.rpc("match_memories", {
    query_embedding: queryEmbedding.data[0].embedding,
    user_id_filter: userId,
    agent_id_filter: agentId,
    match_threshold: 0.75,
    match_count: 5,
  });

  return data.map((m: any) => m.content).join("\n");
}
```

## Memory Pruning Strategy

Run this monthly to keep your memory store lean and relevant:
- Delete memories not accessed in 90+ days (low long-term value)
- Delete memories with importance score below 0.2 (low relevance)
- Merge duplicate memories that are semantically similar (cosine similarity > 0.95)' WHERE slug = 'agent-memory-system';

UPDATE products SET unlock_content = '# Church Volunteer Ops Pack — Full Resource

Thank you for accessing the Church Volunteer Ops Pack. All templates are ready to copy, customize, and deploy for your ministry.

## Template 1: Volunteer Role Description

**VOLUNTEER ROLE:** [Title]

**MISSION CONNECTION:** [1 sentence on how this role serves the church''s mission]

**WHAT YOU WILL DO:**
- [Specific task 1 — be concrete, not vague]
- [Specific task 2]
- [Specific task 3]

**TIME COMMITMENT:** [X] hours | [Day(s)] | [Start time] to [End time]

**WHO THIS IS GREAT FOR:** [1-2 sentences on ideal volunteer personality or background]

**WHAT YOU WILL GAIN:** [Skills, community, spiritual growth, experience]

**TO SIGN UP:** [Link or contact name and email]

---

## Template 2: Weekly Volunteer Schedule

| Role | Volunteer Name | Confirmed | Notes |
|------|---------------|-----------|-------|
| Greeter | | | |
| Worship | | | |
| Tech | | | |
| Children | | | |
| Parking | | | |
| Hospitality | | | |

Send this to all team leads by Thursday. Confirm all slots by Friday morning.

---

## Template 3: Volunteer Onboarding Checklist

**Before First Shift:**
- [ ] Welcome email sent with role description and parking info
- [ ] Added to volunteer communication channel (WhatsApp, GroupMe, etc.)
- [ ] Introduced to team lead or mentor
- [ ] Given a tour of their workspace and equipment

**After First Shift:**
- [ ] Personal thank-you text or call within 24 hours
- [ ] Feedback check-in: "How did it go? Any questions?"
- [ ] Added to volunteer database with contact info and role

---

## Template 4: Volunteer Appreciation Script

**Monthly Spotlight Email:**
> Subject: [Name] is making a difference!
>
> Hi [Church Community Name],
>
> This month we want to celebrate [Volunteer Name], who serves as our [Role]. For [X months/years], [Name] has [specific contribution that made an impact]. Their [quality: faithfulness, creativity, warmth] makes every Sunday [better/smoother/more welcoming].
>
> [Name], thank you for the gift of your time and talent. We see you, and we are grateful.
>
> [Pastor or Leader Name]

---

## Template 5: Volunteer Feedback Survey (Quarterly)

1. On a scale of 1-10, how valued do you feel as a volunteer?
2. Do you have everything you need to serve effectively? (If no, what is missing?)
3. What is one thing we could do to make your experience better?
4. Would you recommend volunteering here to a friend? Why or why not?' WHERE slug = 'church-volunteer-ops-pack';

UPDATE products SET unlock_content = '# Customer Research Synthesis Kit — Complete Methodology

Thank you for accessing the Customer Research Synthesis Kit. Use these frameworks to transform raw research data into clear, decision-ready insights.

## Step 1: Prepare Your Data

Before synthesizing, collect all raw data in one place:
- Interview transcripts (video, audio, or written notes)
- Survey responses (exported to spreadsheet)
- Product reviews (Amazon, G2, App Store, Trustpilot)
- Support ticket logs
- Social media comments and forum posts

**Data Minimum:** Aim for at least 10-15 customer touchpoints before drawing conclusions.

## Step 2: Open Coding (Tag Every Observation)

Read through every data point and tag it with a short label describing what the customer is expressing:

| Tag | Example Quote |
|-----|---------------|
| `pain:time` | "It takes forever to set up" |
| `pain:cost` | "It is too expensive for what you get" |
| `goal:automate` | "I just want it to run without me thinking about it" |
| `trigger:boss` | "My manager told me we needed something like this" |
| `barrier:trust` | "I was not sure if the AI would get it right" |

## Step 3: Affinity Mapping (Group the Tags)

Cluster similar tags into themes. Common themes include:
- **Setup and Onboarding Friction** — Tags about difficulty getting started
- **Core Job to Be Done** — What customers are fundamentally trying to accomplish
- **Trust and Confidence Barriers** — What makes them hesitate
- **Switch Triggers** — What made them look for a new solution
- **Delight Moments** — What they loved and would recommend

## Step 4: Customer Persona Template

**Persona Name:** [Fictional first name]
**Role / Title:** [Job title or life role]
**Demographics:** [Age range, location, company size if B2B]

**Primary Goal:** What are they fundamentally trying to accomplish?
**Biggest Frustration:** What stands between them and that goal?
**Current Solution:** What are they using today (even if it is manual or a competitor)?
**Switch Trigger:** What event or realization would cause them to change?
**Buying Objection:** What would stop them from purchasing from you?
**Success Quote:** A real quote from your research that captures their voice.

## Step 5: Research Report Template

**Research Question:** [What did we set out to learn?]
**Methodology:** [X interviews, Y survey responses, Z review data points]
**Key Findings:** [Top 3-5 themes with supporting evidence]
**Implications for Product:** [What should we build, change, or stop doing?]
**Implications for Marketing:** [What language and messages will resonate?]
**Confidence Level:** High / Medium / Low (and why)
**Recommended Next Steps:** [Follow-up research or action items]' WHERE slug = 'customer-research-synthesis-kit';

UPDATE products SET unlock_content = '# Customer Support Agent Kit — Full Resource

Thank you for accessing the Customer Support Agent Kit. All templates are ready to deploy.

## Part 1: The Triage Decision Tree

When a new message arrives, route it using this logic:

```
Is this a billing issue?
  YES → Is it a fraud/double charge? → URGENT: Escalate to manager
  YES → Is it a refund request? → Use Refund Template
  NO → Is this a technical issue?
    YES → Is it affecting multiple users? → HIGH: Escalate to engineering
    YES → Is it a single user issue? → Use Technical Issue Template
    NO → Is this a general question?
      YES → Search knowledge base → Use General FAQ Template
      NO → Is this a complaint/escalation request?
        YES → Use De-escalation Template → Escalate if unresolved
```

## Part 2: Core Response Templates

**Refund Request:**
> Hi [Name], thank you for reaching out. I completely understand, and I want to make this right. I have processed your refund for $[amount] and you should see it reflected within 3-5 business days depending on your bank. Is there anything else I can help you with today?

**Order Not Received:**
> Hi [Name], I am really sorry to hear your order has not arrived — that is frustrating and not the experience we want for you. I have looked into your order and [resolution/next step]. Please reach out if anything changes and I will personally make sure this gets sorted.

**Technical Issue:**
> Hi [Name], thanks for reporting this — I want to get this resolved as quickly as possible. Could you let me know: [1-2 specific diagnostic questions]? In the meantime, here are two steps that often fix this: [Step 1], [Step 2].

**Feature Request:**
> Hi [Name], thank you for this suggestion — I have passed it along to our product team. We appreciate customers who help us improve. I will make note of your feedback so we can keep it in mind for future updates.

## Part 3: SLA Standards

| Channel | First Response | Resolution |
|---------|---------------|------------|
| Live Chat | 2 minutes | 10 minutes |
| Email | 4 hours | 24 hours |
| Social DM | 1 hour | 4 hours |

## Part 4: Agent System Prompt Template

```
You are a customer support specialist for [Company Name]. Your job is to resolve customer issues quickly, accurately, and empathetically.

Always:
- Acknowledge the customer emotion before solving the problem
- Ask clarifying questions before making assumptions
- Provide a concrete next step at the end of every response
- Escalate to a human agent if: legal threats, fraud, or unresolved after 2 attempts

Never:
- Guess at account information — always say you will look it up
- Make promises you cannot keep (timelines, refunds outside policy)
- Use robotic or templated-sounding language
```' WHERE slug = 'customer-support-agent-kit';

UPDATE products SET unlock_content = '# Human Approval Workflow Pack — Complete Implementation Guide

Thank you for accessing the Human Approval Workflow Pack. This guide covers all 3 approval patterns with implementation templates.

## When to Require Human Approval

Use this risk matrix to decide which actions need human review:

| Action | Risk Level | Approval Required? |
|--------|------------|-------------------|
| Read-only data queries | Low | No |
| Draft creation (email, doc) | Low-Medium | Optional |
| Sending emails to customers | High | Yes |
| Modifying database records | High | Yes |
| Making purchases or payments | Critical | Always |
| Deleting data | Critical | Always |

## Pattern 1: Synchronous Gate (Blocking)

The agent pauses and waits for human approval before continuing.

**Best for:** High-risk single actions where latency is acceptable.

**Flow:**
1. Agent prepares action and presents it to the human reviewer
2. Human sees: What action? What data? What is the impact?
3. Human clicks Approve or Reject
4. Agent executes (Approve) or logs and stops (Reject)

**Approval UI Elements Required:**
- Action summary in plain language
- Data involved (shown, not raw)
- Predicted impact (reversible or irreversible?)
- Approve button | Reject button | Request changes button

## Pattern 2: Async Review Queue (Non-Blocking)

The agent queues actions for review and continues with other work. Reviewer processes the queue on their schedule.

**Best for:** Batch operations, non-time-sensitive actions, teams with dedicated reviewers.

**Flow:**
1. Agent adds action to review queue with full context
2. Reviewer receives notification (email, Slack, webhook)
3. Reviewer approves/rejects from a review dashboard
4. Agent executes approved items in batch

## Pattern 3: Exception-Only Escalation

The agent acts autonomously but flags exceptions for human review.

**Best for:** Low-to-medium risk actions at high volume where full review is impractical.

**Flow:**
1. Agent acts autonomously for standard cases
2. Agent flags any action that matches an exception rule
3. Human reviews only flagged items

**Exception Rules to Define:**
- Action exceeds $[dollar threshold]
- Action affects more than [N] records
- Confidence score is below [threshold]
- Action is irreversible

## Notification Templates

**Slack Approval Request:**
> :robot_face: Agent Approval Needed
> **Action:** [Plain language description]
> **Data Involved:** [Summary]
> **Reversible?** Yes / No
> :white_check_mark: [Approve] | :x: [Reject]' WHERE slug = 'human-approval-workflow-pack';

UPDATE products SET unlock_content = '# Proposal Builder Template — Complete Resource

Thank you for accessing the Proposal Builder Template. Use these templates and frameworks to write proposals that win clients.

## The Full Proposal Template (Copy and Customize)

---

**PROPOSAL FOR: [CLIENT COMPANY NAME]**
Prepared by: [Your Name / Company] | Date: [Date] | Valid Until: [30 days from date]

---

### Executive Summary

[Client Company] is [one sentence describing their current situation and goal]. To achieve [specific outcome], you need [what they need]. [Your Company] will deliver [what you will provide] over [timeline], resulting in [measurable outcome].

Our approach has helped [similar client or client type] achieve [specific result], and we are confident we can do the same for [Client Name].

---

### Our Understanding of Your Situation

[2-3 paragraphs demonstrating that you understand their business, their challenge, and the cost of inaction. Reference something specific they told you or that you researched about them.]

---

### Proposed Solution

**What we will deliver:**
- [Deliverable 1 — be specific]
- [Deliverable 2 — be specific]
- [Deliverable 3 — be specific]

**What we will NOT do (out of scope):**
- [Clearly state what is excluded to prevent scope creep]

---

### Project Timeline

| Milestone | Description | Date |
|-----------|-------------|------|
| Kick-off | Alignment call, access sharing, final scope confirmation | [Date] |
| Milestone 1 | [Deliverable] | [Date] |
| Milestone 2 | [Deliverable] | [Date] |
| Final Delivery | [Complete deliverable] | [Date] |

---

### Investment Options

| Option | What Is Included | Investment |
|--------|-----------------|------------|
| Essential | [Core scope only] | $[X] |
| Professional | [Core + 2 additions] | $[Y] |
| Enterprise | [Full suite + ongoing support] | $[Z] |

Payment terms: [50% upfront, 50% on delivery] or [Net 30]

---

### Why [Your Company]

- [Specific reason 1 tied directly to a client need]
- [Specific reason 2 tied directly to a client need]
- [Specific reason 3 — include a result or proof point]

---

### Next Steps

To move forward: sign the agreement by [date] and we will begin on [start date].

[Your Name] | [Email] | [Phone]

---

## Proposal Follow-Up Email Template

> Subject: Following up on your proposal — [Client Company]
>
> Hi [Name], I wanted to check in on the proposal I sent on [date]. I am happy to answer any questions, adjust the scope, or schedule a call to walk through any section together.
>
> The offer is valid until [date]. Let me know how you would like to proceed — I am looking forward to working together.' WHERE slug = 'proposal-builder-template';

UPDATE products SET unlock_content = '# RAG Knowledge Base Template — Complete Setup Guide

Thank you for accessing the RAG Knowledge Base Template. This guide walks you through complete implementation from document ingestion to live query response.

## What You Are Building

A Retrieval-Augmented Generation (RAG) system that:
1. **Ingests** documents (PDFs, DOCX, Markdown, web pages)
2. **Chunks** them into semantically meaningful segments
3. **Embeds** each chunk into a vector representation
4. **Retrieves** the most relevant chunks when a user asks a question
5. **Generates** a grounded answer using those chunks as context

## Architecture Overview

```
User Query → Embedding → Vector Search → Top K Chunks → LLM → Answer
                                              ↑
                                     Document Store (pgvector)
                                              ↑
                            Ingestion Pipeline (chunking + embedding)
                                              ↑
                                    Source Documents (PDF, DOCX, MD)
```

## Chunking Strategy Guide

| Strategy | Best For | Chunk Size |
|----------|----------|-----------|
| Fixed-size | General documents | 512 tokens |
| Sentence-based | Conversational text | 100-200 tokens |
| Paragraph-based | Technical documentation | 300-500 tokens |
| Semantic (recursive) | Complex mixed content | Variable |

**Rule of thumb:** Smaller chunks = better precision. Larger chunks = better context. Test both.

## Database Setup

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT {},
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON knowledge_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

## Retrieval Function

```sql
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.75,
  match_count INT DEFAULT 5
)
RETURNS TABLE (id UUID, content TEXT, similarity FLOAT)
LANGUAGE sql STABLE AS $$
  SELECT id, content,
    1 - (embedding <=> query_embedding) AS similarity
  FROM knowledge_chunks
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
```

## Common RAG Problems and Fixes

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Irrelevant chunks retrieved | Chunks too large, threshold too low | Reduce chunk size, raise threshold to 0.8+ |
| No chunks retrieved | Threshold too high | Lower threshold to 0.7 |
| Answer contradicts document | Old chunks not updated | Re-ingest updated documents |
| Context window overflow | Too many chunks returned | Reduce match_count to 3' WHERE slug = 'rag-knowledge-base-template';

UPDATE products SET unlock_content = '# Sales Outreach Blueprints — Complete Resource

Thank you for accessing the Sales Outreach Blueprints. Below are all 4 blueprint systems ready to deploy.

## Blueprint 1: Cold Email System

**The 3-Part Email Structure:**

**Line 1 — The Hook (personalized observation):**
> "I noticed [Company] just [specific event: raised funding, launched product, hired for X role] — congrats on that."

**Lines 2-3 — The Bridge (connect their situation to your value):**
> "Most [job title]s at companies in that stage run into [specific problem]. We helped [similar company] solve it by [one-sentence description of your solution]."

**Line 4-5 — The Ask (low-commitment CTA):**
> "Would it be worth a 15-minute call to see if we can do the same for [Company]? Happy to work around your schedule."

**Subject Line Formulas That Work:**
- "[Company] + [relevant trigger]"
- "Quick question about [specific thing they care about]"
- "[Mutual connection] suggested I reach out"

---

## Blueprint 2: LinkedIn Outreach System

**Connection Request (300 char limit):**
> "Hi [Name] — I work with [job titles like yours] on [relevant topic]. I have been following [Company]''s work on [specific thing] and thought it would be great to connect."

**Follow-up Message (after connecting, Day 3):**
> "Thanks for connecting, [Name]. I noticed [specific thing about their content or company]. We help [persona type] [achieve outcome]. Would you be open to a brief conversation about whether it could be relevant for [Company]?"

---

## Blueprint 3: Multi-Channel Sequence (5-Touch)

| Touch | Channel | Day | Message Type |
|-------|---------|-----|-------------|
| 1 | Email | 0 | Personalized intro + value |
| 2 | LinkedIn | 3 | Connection request (no pitch) |
| 3 | Email | 7 | Follow-up with new insight |
| 4 | LinkedIn | 10 | Thoughtful comment on their post |
| 5 | Email | 14 | Break-up email (creates urgency) |

**Break-up Email (Touch 5):**
> Subject: Should I close your file?
>
> Hi [Name], I have reached out a few times but have not heard back — completely understandable, things get busy.
>
> I will take this as a "not right now" and close out your file. If the timing ever changes, I am just a reply away.
>
> Wishing you and the team at [Company] a great [quarter/year].

---

## Blueprint 4: Referral Request System

**Timing:** Ask for a referral after a clear win — not after the sale, after the result.

**Referral Request Script:**
> "I am so glad [result you delivered] worked out. We are expanding our work with [similar companies/people] and I was wondering — do you know 2-3 people who might benefit from the same approach? I would handle the full outreach, just wanted a warm intro from someone they trust."

**Follow-up Thank You:**
> "Thank you so much for the intro to [Name]. I will treat them with the same care we have given you. I''ll keep you posted on how it goes." ' WHERE slug = 'sales-outreach-blueprints';

UPDATE products SET unlock_content = '# Small Business Automation Pack — Complete Resource

Thank you for accessing the Small Business Automation Pack. Below are all included automation workflows with setup instructions.

## How to Use This Pack

Each automation below includes:
- **What it does** — Plain language description
- **Tools required** — What apps/accounts you need
- **Platform setup** — How to build it in Make, Zapier, or n8n
- **Time savings estimate** — Hours saved per week

---

## Automation 1: New Lead → CRM + Welcome Email

**What it does:** When a new lead fills out your contact form, automatically adds them to your CRM and sends them a personalized welcome email.

**Tools required:** Contact form (Typeform, Jotform, or Google Forms), CRM (HubSpot, Airtable, or Notion), Email (Gmail or Mailchimp)

**Setup in Make:**
1. Trigger: Watch for new form submission
2. Action: Create CRM contact with form data
3. Action: Send welcome email using template

**Time savings:** 30 min/day for high-volume lead businesses

---

## Automation 2: Invoice → Payment Reminder Sequence

**What it does:** When an invoice is sent, schedules automatic payment reminders at Day 3, Day 7, and Day 14 if unpaid.

**Tools required:** Accounting software (Wave, QuickBooks, or FreshBooks), Email (Gmail)

**Time savings:** 2-3 hours/month on accounts receivable follow-up

---

## Automation 3: Booking → Calendar + Confirmation + Reminder

**What it does:** When a client books an appointment, adds it to your calendar, sends a confirmation, and sends a reminder 24 hours before.

**Tools required:** Booking tool (Calendly or Acuity), Google Calendar, Email or SMS

**Time savings:** 1-2 hours/week on scheduling admin

---

## Automation 4: Social Mention → Slack Alert

**What it does:** When your brand is mentioned on X (Twitter) or Instagram, sends an instant Slack notification so you can respond quickly.

**Tools required:** Social monitoring (mention.com or Zapier Twitter integration), Slack

**Time savings:** Prevents missed mentions and late responses

---

## Automation 5: Weekly Report Digest

**What it does:** Every Monday at 8am, compiles key metrics from your tools (revenue, new customers, open tickets) and sends you a summary email.

**Tools required:** Your data sources (Stripe, HubSpot, Intercom), Email

**Time savings:** 30 min/week on manual report assembly

---

## Prioritization Guide

Implement in this order for maximum ROI:
1. Lead capture automation (fastest impact on revenue)
2. Payment reminder automation (fastest impact on cash flow)
3. Booking confirmation (fastest impact on professionalism)
4. Weekly report digest (fastest impact on decision quality)
5. Social monitoring (fastest impact on community response)' WHERE slug = 'small-business-automation-pack';

UPDATE products SET unlock_content = '# SOP Library for AI Agents — Complete Resource

Thank you for accessing the SOP Library for AI Agents. These Standard Operating Procedures are ready to customize and adopt for your organization.

## SOP 1: Agent Handoff Protocol

**Purpose:** Ensure that when an AI agent transfers a conversation to a human or another agent, the receiving party has full context.

**Required Handoff Package:**
1. **Conversation Summary** — Plain language description of what was discussed and decided (max 150 words)
2. **Open Items** — Unresolved questions or actions still pending
3. **Customer Sentiment** — Neutral / Frustrated / Satisfied
4. **Next Expected Action** — What the receiving party should do first
5. **Relevant Data** — Account ID, order number, or relevant system records

**Template:**
```
HANDOFF SUMMARY
Agent: [Agent Name/ID] → Human: [Agent/Team Name]
Date/Time: [Timestamp]
Summary: [150 words or less]
Open Items: [Bullet list]
Sentiment: [Neutral / Frustrated / Satisfied]
Next Action: [Specific instruction]
Reference Data: [IDs, links, file paths]
```

---

## SOP 2: Failure and Retry Limits

**Purpose:** Prevent infinite loops and runaway costs when tools fail.

**Standard Limits:**
- Maximum tool retries per call: **3**
- Retry backoff: **2 seconds, 5 seconds, 10 seconds**
- Maximum conversation turns before human escalation: **10**
- Maximum cost per conversation: **$[set your threshold]**

**On Final Failure:**
1. Log the full error with inputs, outputs, and tool state
2. Return a clear failure message to the user
3. Trigger an alert to the on-call engineer
4. Do NOT retry silently

---

## SOP 3: Log Auditing Checklist (Run Weekly)

- [ ] Review all conversations where the agent said "I am not sure" or similar
- [ ] Review all escalations — were they appropriate?
- [ ] Check for any PII appearing in agent logs (names, emails, SSNs)
- [ ] Check token costs — any single conversation exceeding your threshold?
- [ ] Check error rates — any tool failing more than 5% of the time?

---

## SOP 4: Data Residency Compliance

**Before deploying any agent:**
- [ ] Identify all data the agent reads and writes
- [ ] Confirm whether any data is PII (names, emails, health, financial)
- [ ] Verify the model provider''s data processing agreement covers your use case
- [ ] Confirm data is not stored beyond the session (or document if it is)
- [ ] Add a disclosure to users that AI is being used in the interaction' WHERE slug = 'sop-library-for-agents';
