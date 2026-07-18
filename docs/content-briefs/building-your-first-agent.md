# Content Brief: Build Your First AI Agent

- **Action:** Complete rewrite of obsolete technical tutorial
- **Primary URL:** `/knowledge/building-your-first-agent`
- **Authority cluster:** AI Agents for Beginners
- **Primary query:** how to build your first AI agent
- **Reader:** A beginner with basic Python familiarity who wants a small, testable agent rather than an autonomous production system
- **Reader outcome:** Build a current OpenAI Agents SDK draft assistant, test it with representative cases, and understand what must happen before adding tools or deployment
- **Primary CTA:** `/paths/start-your-first-agent`
- **Review interval:** 60 days because SDK installation and API behavior can change

## Direct answer

Build your first AI agent by choosing one low-risk drafting task, writing clear instructions and test cases, then running a single agent without external tools. Measure its outputs before adding permissions. The current OpenAI Agents SDK uses `Agent` and `Runner`; older `ChatCompletion.create` and legacy LangChain examples should not be followed.

## Evidence

| Claim | Primary source | Checked |
|---|---|---|
| Current SDK install, `Agent`, `Runner`, tools, and tracing | OpenAI Agents SDK quickstart | 2026-07-15 |
| Start with single-agent foundations, tools, instructions, and layered guardrails | OpenAI practical guide | 2026-07-15 |
| Usage data is available from a run context | OpenAI Agents SDK usage documentation | 2026-07-15 |
| Human roles and oversight should be defined across the lifecycle | NIST AI RMF Core | 2026-07-15 |

## Safety decisions

- The first version drafts but cannot send, spend, delete, or modify external records.
- Examples use fictional text and no private customer data.
- No model name or price is hardcoded.
- The tutorial explains that API use may incur cost and requires current provider terms/privacy review.

## Internal links

- `/knowledge/ai-agents-in-plain-english`
- `/knowledge/choose-your-first-agent-workflow`
- `/knowledge/prompting-an-agent-the-basics`
- `/knowledge/agent-evaluation-golden-set`
- `/knowledge/human-in-the-loop-patterns-for-agents`
- `/paths/start-your-first-agent`

## SEO fields

- **Title:** How to Build Your First AI Agent Safely
- **Description:** Build a small AI agent with the current OpenAI Agents SDK, test it with realistic cases, and add tools only after its behavior is measurable.
- **Slug:** `building-your-first-agent`
