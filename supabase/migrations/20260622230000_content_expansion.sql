-- =========================================================================
-- Content expansion: house author, Knowledge Hub articles, marketplace agents,
-- and digital products. Idempotent (ON CONFLICT (slug) DO NOTHING) so it is safe
-- to re-run and never clobbers admin edits to existing rows.
--
-- Notably, this also creates real listings for the slugs referenced in
-- src/lib/premium-catalog.ts (marketing-campaign-strategist, marketing-seo-
-- researcher, pa-inbox-zero, agent-skill-pack-core, workflow-templates-ops) so
-- their Unlock/checkout buttons resolve to a purchasable item.
-- Dollar-quoting ($md$ ... $md$) is used for prose so apostrophes need no escaping.
-- =========================================================================

-- ---------- House author (gives Knowledge Hub articles a byline) ----------
INSERT INTO public.authors (slug, name, bio, links) VALUES
('mit-editorial', 'Melanated In Tech Editorial',
 $md$The Melanated In Tech editorial team writes field notes from real agent deployments — practical, hype-free, and built for the people putting agents to work.$md$,
 '{"site":"https://melanatedintech.com"}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ---------- Knowledge Hub: articles ----------
INSERT INTO public.articles (slug, title, excerpt, category, read_minutes, body, author_id) VALUES
('building-your-first-agent',
 'Building Your First Agent: A Weekend Plan',
 'A concrete, no-fluff path from blank folder to a working agent you can actually use by Sunday night.',
 'Getting Started', 7,
 $md$# Building Your First Agent: A Weekend Plan

Most "build an agent" tutorials stop at a demo. This one ends with something you keep using.

## Pick a boring, real task
Skip the flashy ideas. Pick one task you personally do every week — triaging an inbox, drafting a weekly update, summarizing a folder of docs. Boring tasks have clear success criteria, which is exactly what a first agent needs.

## The minimum viable agent
1. **One goal**, stated in a sentence.
2. **Two or three tools**, no more. Search, read a file, write a file.
3. **A short system prompt** that names the goal, the tools, and the one thing the agent must never do.
4. **A loop** that lets the model call a tool, see the result, and decide again.

## Day one: make it work once
Wire the loop, hand it the goal, watch it fumble. Read every tool call. You are debugging *judgment*, not code — when it picks the wrong tool, your prompt was unclear, not the model.

## Day two: make it trustworthy
Add a guardrail ("never send an email without showing me the draft"), log every action, and run it on five real examples. If four out of five are good, you have a useful agent. Ship it to yourself and use it Monday.

The teams that win aren't the ones with the cleverest architecture — they're the ones who shipped something small and improved it every week.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('evaluating-agents-evals',
 'How to Evaluate an Agent (Before It Embarrasses You)',
 'Vibes are not a test suite. A practical approach to evals that catches regressions without a research budget.',
 'Evaluation', 8,
 $md$# How to Evaluate an Agent

The moment an agent does real work, "it seemed fine" stops being good enough. You need evals — but you do not need a research lab.

## Start with a golden set
Collect 10–20 real inputs and the output you'd be happy with. That is your golden set. It is the single highest-leverage hour you will spend.

## Three things worth measuring
- **Task success** — did it accomplish the goal? Often a human yes/no, and that's fine to start.
- **Tool correctness** — did it call the right tools with sane arguments?
- **Cost and latency** — tokens and seconds per run. These creep up silently.

## Grade with a rubric, not a gut
Write a one-paragraph rubric per task ("a good refund reply is polite, states the policy, and offers one next step"). You can grade by hand at first, then have a second model grade against the same rubric to scale.

## Run evals on every change
Before you tweak a prompt or swap a model, run the golden set. After, run it again. A change that fixes one case and breaks three is common — and invisible without evals.

## The trap to avoid
Don't optimize your evals into a maze. Twenty real cases you actually look at beat a thousand synthetic ones you never read.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('rag-for-agents',
 'RAG for Agents Without the Buzzwords',
 'When to give an agent retrieval, how to do it simply, and the failure modes that make RAG look broken.',
 'Retrieval', 7,
 $md$# RAG for Agents Without the Buzzwords

Retrieval-Augmented Generation just means: before the agent answers, fetch relevant text and put it in context. That's it.

## When you actually need it
- The knowledge changes faster than you can retrain or re-prompt.
- The corpus is too big to paste into context.
- You need citations back to a source.

If none of those are true, a well-written system prompt may beat a vector database.

## The simple version that works
1. Split documents into chunks of a few hundred tokens.
2. Embed the chunks and store them.
3. On each query, embed the question, pull the top few chunks, and hand them to the model with the instruction to answer *only* from them.

## Failure modes that look like "RAG is broken"
- **Chunks too big** — you retrieve a whole page to answer one line, and the model drowns.
- **No re-ranking** — the closest vector isn't always the most relevant; a quick re-rank pass fixes most "why did it miss the obvious doc" complaints.
- **No "I don't know"** — without permission to say the answer isn't in the sources, the model invents one.

Start simple, look at what it retrieves, and only add machinery when a real query fails.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('guardrails-and-safety',
 'Guardrails: What Your Agent Must Never Do',
 'Capability without limits is a liability. A practical layering of guardrails that doesn''t neuter the agent.',
 'Safety', 6,
 $md$# Guardrails: What Your Agent Must Never Do

An agent you can't trust unsupervised isn't saving you time — it's adding a review job. Guardrails are how you earn the right to look away.

## Three layers
- **Prompt-level** — explicit "never" rules in the system prompt. Cheap, first line, not sufficient alone.
- **Tool-level** — the strongest layer. If the agent can't call `delete_customer`, no prompt injection can make it. Scope tools tightly.
- **Approval gates** — for irreversible or outward-facing actions (sending email, spending money, deleting data), require a human confirm.

## Default to reversible
Design tools so mistakes are recoverable. "Draft" instead of "send." "Archive" instead of "delete." Most of safety is making the worst case boring.

## Watch the inputs, not just the outputs
Prompt injection hides instructions inside the data your agent reads — a web page, an email, a PDF. Treat retrieved content as untrusted. Never let fetched text silently change what tools the agent is allowed to use.

A good guardrail is invisible when things go right and decisive when they go wrong.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('choosing-the-right-model',
 'Choosing the Right Model for the Job',
 'Frontier vs. fast vs. local — a decision guide that maps model choice to the actual shape of your task.',
 'Models', 6,
 $md$# Choosing the Right Model for the Job

The best model is the cheapest one that clears your quality bar — and that changes per task.

## Match the model to the work
- **Hard reasoning, planning, ambiguous goals** → a frontier model. This is where capability pays for itself.
- **High-volume, well-defined steps** (classify, extract, format) → a smaller, faster model. Often 80% of an agent's calls.
- **Private or offline data** → a local model, accepting a quality trade-off for control.

## Mix models inside one agent
A common, money-saving pattern: a capable model plans and a fast model executes the routine sub-steps. You pay frontier prices only for frontier-shaped problems.

## How to actually decide
Don't argue about it — run your golden eval set across two candidates and compare success, cost, and latency. The right answer is usually obvious within twenty examples.

## Re-check quarterly
Model quality and pricing move fast. The choice you made six months ago deserves a fresh look — a routine that was too expensive last quarter may be trivial now.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('controlling-agent-costs',
 'Controlling Agent Costs Before They Control You',
 'Agents fail open on spend. The handful of habits that keep a useful agent from becoming an expensive one.',
 'Operations', 6,
 $md$# Controlling Agent Costs Before They Control You

A chatbot costs one call. An agent loops — and every loop spends tokens. Cost discipline is an operational skill, not an afterthought.

## Where the money goes
- **Long context** re-sent on every turn.
- **Over-long loops** that retry instead of stopping.
- **Frontier models** doing clerical work.

## Habits that pay
1. **Cap the loop.** A hard limit on steps prevents a confused agent from spending forever.
2. **Trim context.** Summarize old turns instead of resending them verbatim.
3. **Cache the stable stuff.** System prompts and reference docs that don't change should be cached, not re-billed.
4. **Route by difficulty.** Send the easy 80% to a cheaper model.

## Make spend visible
Log tokens per run and watch the trend. Costs rarely spike — they drift. The team that reviews a weekly cost-per-task number catches the drift while it's still cheap to fix.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('designing-tools-for-agents',
 'Designing Tools an Agent Can Actually Use',
 'Your agent is only as good as its tools. The naming, scoping, and error-handling choices that make tools reliable.',
 'Tool Design', 7,
 $md$# Designing Tools an Agent Can Actually Use

When an agent misbehaves, the tool is at fault more often than the model. Good tools make good agents.

## Name and describe for a reader who skims
The model picks tools from their names and descriptions. `search_orders_by_email` beats `query`. Say what the tool does, what it needs, and when *not* to use it.

## Keep each tool small and single-purpose
One tool, one job. A mega-tool with ten optional parameters forces the model to guess. Several focused tools let it choose clearly.

## Return useful errors
"Error 500" teaches the agent nothing. "No customer found for that email — check spelling or ask the user" lets it recover on its own. Errors are instructions in disguise.

## Scope permissions tightly
Give the agent the narrowest tool that does the job. Read-only when it only needs to read. This is a safety control and a clarity control at once.

## Test tools in isolation
Before blaming the agent, call each tool by hand with the arguments the agent used. Half of "the agent is dumb" turns out to be "the tool returned garbage."$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('ai-agents-for-ministry',
 'AI Agents for Ministry: Stewardship First',
 'Where agents genuinely serve a church''s mission — and the ethical lines worth drawing before you deploy one.',
 'Church & Ministry', 6,
 $md$# AI Agents for Ministry: Stewardship First

Used well, an agent gives ministry staff back hours for the work only people can do — presence, prayer, and care. Used carelessly, it erodes trust. The order matters: stewardship first, tools second.

## Where agents genuinely help
- **Sermon research** — cross-references, original-language notes, and illustration ideas, with the pastor still doing the discernment.
- **Member follow-up** — drafting (never auto-sending) first-time-guest notes so no one slips through the cracks.
- **Volunteer and event ops** — scheduling, reminders, and logistics that quietly eat staff time.

## Lines worth drawing
- **Never automate pastoral care.** A grief message is not a tool call.
- **Disclose plainly.** If a communication was drafted with AI, your community deserves to know.
- **Guard the flock's data.** Member information is a trust, not a dataset. Keep it private and access-controlled.

## A simple test
Before deploying an agent, ask: does this free a person *for* ministry, or does it quietly replace the human touch that *is* the ministry? Keep the first. Refuse the second.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial'))
ON CONFLICT (slug) DO NOTHING;

-- ---------- Marketplace: agents (3 align with premium-catalog.ts) ----------
INSERT INTO public.agents (slug, name, tagline, description, category, capabilities, tier, price_cents, featured) VALUES
('marketing-campaign-strategist',
 'Marketing Campaign Strategist',
 'From blank brief to a launch-ready campaign plan.',
 $md$The Marketing Campaign Strategist turns a goal and an audience into a complete campaign: positioning, channel mix, message angles, a content calendar, and the metrics that prove it worked. It researches your market, drafts the assets, and hands you a plan a team can execute on Monday — not a wall of generic tips.$md$,
 'Marketing', ARRAY['Audience and market research','Channel strategy','Message and angle testing','Content calendar','KPI and measurement plan'],
 'premium', 4900, true),

('marketing-seo-researcher',
 'SEO Research Agent',
 'Find the keywords worth winning — and the content that wins them.',
 $md$The SEO Research Agent maps the search landscape for your topic: keyword clusters by intent, the competitors ranking today, content gaps you can own, and a prioritized brief for each target page. It does the research grind so your writers start with a plan instead of a guess.$md$,
 'Marketing', ARRAY['Keyword clustering by intent','Competitor SERP analysis','Content gap discovery','Per-page content briefs','Internal-link suggestions'],
 'premium', 5900, false),

('pa-inbox-zero',
 'Inbox Zero Assistant',
 'Reach the bottom of your inbox — and stay there.',
 $md$The Inbox Zero Assistant triages your email the way a sharp executive assistant would: it sorts by what actually needs you, drafts replies in your voice for approval, extracts tasks and dates, and flags the threads that will bite you if ignored. You skim and approve; it does the sorting.$md$,
 'Productivity', ARRAY['Priority triage','Voice-matched draft replies','Task and date extraction','Follow-up tracking','Daily inbox brief'],
 'premium', 3900, true),

('meeting-notetaker-agent',
 'Meeting Notetaker Agent',
 'Notes, decisions, and action items — without lifting a finger.',
 $md$Hand the Meeting Notetaker a transcript and it returns a clean summary, the decisions made, and a list of action items with owners. It separates signal from small talk so the people who missed the meeting can catch up in two minutes.$md$,
 'Productivity', ARRAY['Transcript summarization','Decision capture','Action items with owners','Follow-up email draft'],
 'free', NULL, false),

('grant-writer-agent',
 'Grant Writer Agent',
 'Turn your mission into fundable proposals — faster.',
 $md$Built for nonprofits and ministries, the Grant Writer Agent drafts proposal sections from your program details, tailors language to a funder''s priorities, and keeps a reusable library of your strongest paragraphs. It gets you to a strong first draft so your team can focus on the relationship, not the boilerplate.$md$,
 'Nonprofit & Ministry', ARRAY['Funder research','Proposal section drafting','Budget narrative','Reusable language library'],
 'free', NULL, false)
ON CONFLICT (slug) DO NOTHING;

-- ---------- Digital products (2 align with premium-catalog.ts) ----------
INSERT INTO public.products (slug, name, tagline, description, category, tier, price_cents) VALUES
('agent-skill-pack-core',
 'Agent Skill Pack: Core',
 'Ten battle-tested skills your agents can use today.',
 $md$A pack of ten ready-to-install agent skills — refund handling, meeting follow-up, weekly reporting, research briefs, and more. Each skill is a complete playbook: the prompt, the tools it expects, the guardrails, and an example run. Drop them into your stack and skip the trial-and-error.$md$,
 'Skills', 'premium', 4900),

('workflow-templates-ops',
 'Workflow Templates: Operations',
 'Twenty operational workflows, rewritten for agents.',
 $md$Twenty common operations workflows — onboarding, invoicing, support escalation, vendor reviews — rewritten in a step-by-step format agents follow reliably. Each template names the trigger, the steps, the decision points, and the human approval gates. Adapt and ship.$md$,
 'Templates', 'premium', 3900),

('agent-eval-checklist',
 'Agent Evaluation Checklist',
 'A free, printable checklist for testing agents before they ship.',
 $md$A one-page checklist that walks you through building a golden set, writing a grading rubric, and catching regressions before they reach production. The fastest way to move from "it seemed fine" to evidence.$md$,
 'Evaluation', 'free', NULL),

('agent-readme-template',
 'Agent README Template',
 'Document any agent so your team can actually maintain it.',
 $md$A fill-in-the-blanks template that captures an agent''s goal, tools, memory model, guardrails, and runbook in one page. The difference between an agent only its author understands and one your whole team can own.$md$,
 'Templates', 'free', NULL)
ON CONFLICT (slug) DO NOTHING;
