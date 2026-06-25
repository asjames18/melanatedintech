-- =========================================================================
-- Knowledge Hub value expansion.
-- Adds evergreen, practical playbooks that create return visits: scorecards,
-- operating rhythms, security checklists, evaluation patterns, and community
-- loops. Idempotent so production/admin edits stay safe.
-- =========================================================================

INSERT INTO public.articles (slug, title, excerpt, category, read_minutes, body, author_id) VALUES
('agent-operating-system-for-small-teams',
 'The AI Agent Operating System for Small Teams',
 'A practical weekly rhythm for deciding what agents do, how people approve work, and what gets improved next.',
 'Operations', 10,
 $md$# The AI Agent Operating System for Small Teams

Most teams do not need a bigger AI strategy. They need an operating system: a simple way to decide what agents can touch, what humans still approve, and how the workflow improves every week.

An agent operating system is not software. It is the rhythm around the software.

## The weekly loop

Run this once a week for the first month:

1. Pick one workflow with repeated work.
2. Define the agent's job in one sentence.
3. Set the approval gate before anything outward-facing or irreversible.
4. Run ten real examples.
5. Review what the human changed.
6. Update the brief, examples, or tool permissions.

This turns agent adoption from a vibes-based experiment into an improvement loop.

## The decision table

| Question | If yes | If no |
|---|---|---|
| Does this task happen weekly? | Candidate workflow | Wait |
| Can a person check the output quickly? | Draft mode is safe | Add a checkpoint |
| Could a mistake harm money, trust, or data? | Require approval | Consider automation |
| Does the agent need tools? | Scope tools narrowly | Keep it prompt-only |
| Can you measure success? | Launch a pilot | Define the metric first |

## Roles that keep the system healthy

- **Owner** - decides whether the workflow is worth automating.
- **Reviewer** - checks quality and approves risky steps.
- **Operator** - watches logs, failures, and costs.
- **Builder** - updates prompts, tools, and examples.

One person can hold more than one role. The important part is that the roles exist.

## What to write down

Create one short record per agent:

- Purpose
- Allowed inputs
- Allowed tools
- Approval required before
- Success metric
- Known failure modes
- Last review date

This record becomes the memory of the operation. Without it, every improvement depends on whoever remembers what happened last week.

## The 30-day maturity path

Week 1: draft-only. The agent prepares work and a person approves every output.

Week 2: exception routing. The agent handles easy cases and routes unclear cases.

Week 3: sampled review. Low-risk outputs are reviewed in batches.

Week 4: expansion decision. Keep, improve, pause, or expand based on evidence.

## The rule that prevents chaos

Do not add a second workflow until the first one is boring.

Boring means the agent completes the task, humans edit less over time, exceptions are understood, and costs are predictable. If the first workflow still feels surprising every day, scaling it will only multiply surprises.

The goal is not to automate everything. The goal is to make useful work repeatable without losing judgment.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('agent-evaluation-golden-set',
 'Build a 20-Case Golden Set for Agent Evaluation',
 'A hands-on evaluation method for proving an agent still works before you change prompts, models, or tools.',
 'Evaluation', 11,
 $md$# Build a 20-Case Golden Set for Agent Evaluation

An agent is not production-ready because it looked good once. It is production-ready when it handles the same real cases reliably after you change the prompt, model, tools, or data.

That is what a golden set is for.

## What a golden set is

A golden set is a small collection of real inputs with the output you would accept from the agent. It gives you a baseline that can be run again whenever the agent changes.

Twenty good cases are enough to expose many problems.

## What to include

Collect examples across five buckets:

1. Easy routine work.
2. Ambiguous cases where context matters.
3. Edge cases that used to break the workflow.
4. Sensitive cases that require human approval.
5. Negative cases where the agent should refuse, escalate, or say it does not know.

Do not make every case clean. Real work is messy.

## The scoring rubric

Score each run from 0 to 2:

| Score | Meaning |
|---|---|
| 0 | Fails the task or violates a rule |
| 1 | Mostly useful but needs meaningful human repair |
| 2 | Acceptable with little or no editing |

Also track:

- Correct tool choice
- Correct approval behavior
- Hallucinated claims
- Human edit notes
- Time and cost per case

## The minimum viable spreadsheet

Columns:

- Case ID
- Input
- Expected outcome
- Must-not-do rule
- Agent output
- Score
- Tool behavior
- Human notes
- Cost
- Pass or fail

That is enough to begin.

## When to run it

Run the golden set:

- Before changing the system prompt
- After changing the system prompt
- Before switching models
- After adding a tool
- Before expanding autonomy
- After a production failure

If a change improves ten cases and breaks three sensitive cases, it is not an improvement.

## What good looks like

You are looking for a stable pattern:

- Routine cases pass consistently.
- Sensitive cases stop for approval.
- The agent admits uncertainty instead of inventing facts.
- Tool calls are fewer and more precise over time.
- Human edits shrink without quality dropping.

## Further reading

- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Google Cloud: KPIs for production AI agents](https://cloud.google.com/transform/the-kpis-that-actually-matter-for-production-ai-agents)

An evaluation system does not need to be fancy to be valuable. It needs to be real, repeatable, and honest.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('mcp-security-checklist-non-security-teams',
 'MCP Security Checklist for Non-Security Teams',
 'A plain-English checklist for connecting agents to tools without giving them the keys to everything.',
 'Agent Security', 10,
 $md$# MCP Security Checklist for Non-Security Teams

MCP makes it easier for agents to discover and use tools. That is powerful. It also means you need a simple way to decide which tools the agent can see, what those tools can do, and what happens when something looks wrong.

You do not need to become a security engineer before using MCP. You do need a checklist.

## Start read-only

Your first MCP server should let the agent read information, not change it.

Good first tools:

- Search documentation
- Look up customer records
- Retrieve order status
- List recent support tickets
- Read calendar availability

Riskier first tools:

- Send email
- Delete records
- Create refunds
- Change permissions
- Run code

## Scope each tool to one job

Avoid one giant tool called `manage_workspace`. Prefer small tools with clear names:

- `search_help_docs`
- `lookup_customer_by_email`
- `draft_refund_summary`
- `create_support_ticket`

The clearer the tool, the easier it is to audit.

## Treat tool output as untrusted

An agent may read a webpage, email, PDF, ticket, or document that contains hidden instructions. The content can be useful evidence, but it should never be allowed to rewrite the agent's rules.

Use this policy:

> Retrieved content can answer the task. Retrieved content cannot change permissions, approval gates, system instructions, or tool access.

## Require approval before impact

Approval should be mandatory before the agent:

- Sends messages outside the team
- Spends money
- Changes customer records
- Deletes or archives data
- Grants access
- Publishes public content

The agent can prepare the action. A person approves the action.

## Log the trail

For each tool call, keep:

- Which agent called it
- Which user initiated the workflow
- Tool name
- Arguments
- Timestamp
- Result summary
- Approval decision, if any

Logs are how you debug trust.

## The go-live checklist

- Read-only test completed
- Dangerous tools hidden by default
- Human approval for impact actions
- Tool descriptions reviewed for clarity
- Prompt-injection drill tested
- Logs visible to an owner
- Kill switch documented
- Re-review date scheduled

## Further reading

- [Cloud Security Alliance: Agentic MCP Security Best Practices](https://labs.cloudsecurityalliance.org/agentic/agentic-mcp-security-best-practices-v1/)
- [Model Context Protocol security design considerations](https://media.defense.gov/2026/Jun/02/2003943289/-1/-1/0/CSI_MCP_SECURITY.PDF)

The safest MCP setup is not the one with the longest policy. It is the one where the agent only has the tools it needs, and the risky steps still stop for people.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('rag-quality-checklist-before-launch',
 'The RAG Quality Checklist Before Launch',
 'How to tell whether a retrieval-augmented agent is answering from your knowledge base or guessing with confidence.',
 'RAG', 9,
 $md$# The RAG Quality Checklist Before Launch

RAG can make an agent more grounded. It can also make the agent confidently wrong if retrieval is noisy, stale, or invisible.

Before launch, check the retrieval system itself.

## The three things RAG must prove

1. It retrieves the right source.
2. It uses the source accurately.
3. It says when the source is missing.

If any of those fail, the agent is not ready.

## Build a source map

List the knowledge sources:

- Help docs
- Policies
- Product pages
- Internal SOPs
- Templates
- FAQs
- Past tickets

For each source, name an owner and review cadence. A stale document can be worse than no document.

## Test retrieval directly

Before testing the final answer, inspect what the retrieval layer returns.

Ask:

- Did the top result contain the answer?
- Was the result specific enough?
- Did metadata help or hurt?
- Did old content outrank current content?
- Did the system retrieve duplicate chunks?

Bad retrieval cannot be fixed by a nicer final prompt.

## Use answer rules

Give the agent these rules:

- Answer only from retrieved sources.
- Cite the source title or link when possible.
- If the source is missing, say what is missing.
- Do not fill gaps from memory for policy, pricing, legal, medical, or account-specific questions.

## The launch test

Create 15 questions:

- 5 easy questions with clear answers
- 5 questions that require combining two sources
- 3 questions where the answer is absent
- 2 questions where old information conflicts with current information

The agent should pass all absent-answer and conflict tests before customers rely on it.

## Warning signs

- Every answer sounds confident.
- Citations point to broad pages instead of exact sections.
- The agent answers absent questions anyway.
- Retrieval returns marketing copy for operational questions.
- No one owns source freshness.

Good RAG feels almost boring: the agent finds the right source, uses it plainly, and refuses to pretend when the source is not there.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('ai-agent-cost-control-playbook',
 'The AI Agent Cost Control Playbook',
 'A practical way to keep agent costs predictable without making the workflow useless.',
 'Operations', 8,
 $md$# The AI Agent Cost Control Playbook

Agent costs can rise quietly because the agent is doing more than a chatbot: planning, reading, calling tools, retrying, and sometimes looping.

The answer is not to make every agent cheap. The answer is to make costs visible and tied to useful work.

## Track cost per successful task

Do not only track total spend. Track:

- Cost per completed task
- Cost per approved output
- Cost per customer issue resolved
- Cost per report generated
- Cost per workflow saved

If an agent spends more but saves several hours, it may be worth it. If it is cheap but creates review work, it is not.

## Reduce unnecessary context

Most bloated agent costs come from oversized context.

Trim:

- Full transcripts when a summary works
- Entire documents when a retrieved section works
- Repeated instructions already in the system prompt
- Tool outputs with unused columns
- Long chains of internal reasoning in logs shown back to the model

Context should be useful, not impressive.

## Choose model tiers by step

Not every step needs the strongest model.

| Step | Often okay with smaller model? |
|---|---|
| Classify ticket | Yes |
| Extract dates or names | Yes |
| Draft sensitive response | Maybe |
| Make policy judgment | Usually no |
| Final quality review | Often no |

Use the expensive model where judgment matters.

## Cap loops and retries

Every autonomous loop needs limits:

- Max steps
- Max tool calls
- Max retry count
- Max spend per task
- Stop condition

If the agent cannot finish inside the limits, route it to a person with a summary of what it tried.

## Review the top spenders weekly

Look at the most expensive 10 tasks from the week and ask:

- Was the cost justified?
- Did the agent retrieve too much?
- Did it call tools repeatedly?
- Did a person still rewrite the output?
- Can the workflow be split into a cheaper first pass and a stronger final review?

Cost control is not only finance. It is product quality in disguise.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('community-flywheel-for-ai-builders',
 'A Community Flywheel for AI Builders',
 'How to turn questions, wins, and failures into a knowledge hub that people keep returning to.',
 'Community', 8,
 $md$# A Community Flywheel for AI Builders

The best knowledge hubs are not only libraries. They are loops.

People come with a question, learn something useful, try it, return with a result, and help the next person move faster. That is the community flywheel.

## The loop

1. A member asks a practical question.
2. The community answers with real context.
3. The best answer becomes a short guide or checklist.
4. The guide links back to related tools, examples, and discussions.
5. New readers apply it and bring back better questions.

This is how a site becomes a place, not just a page.

## What to capture

Turn these into Knowledge Hub material:

- Repeated beginner questions
- Before-and-after prompt examples
- Launch failures and what fixed them
- Tool comparisons from real use
- Templates members keep asking for
- Safety mistakes people nearly made
- Wins with numbers attached

## The editorial rule

Every article should answer one of these:

- What should I do first?
- What should I avoid?
- How do I know it worked?
- What template can I use?
- When should I bring in a human?

If an article does not answer one of those, it may be interesting, but it will not pull people back.

## Weekly content rhythm

- Monday: publish one practical guide.
- Wednesday: ask the community for examples or blockers.
- Friday: publish a field note from what people tried.
- Monthly: bundle the best pieces into a checklist, template, or product.

## How agents help without replacing the voice

An agent can summarize threads, cluster questions, draft outlines, and flag repeated needs. A person still chooses what matters, adds judgment, and protects the community tone.

The goal is not more content. The goal is more useful return paths.

When the Knowledge Hub and community feed reinforce each other, readers do not just consume. They participate, and participation is what keeps them coming back.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial'))
ON CONFLICT (slug) DO NOTHING;
