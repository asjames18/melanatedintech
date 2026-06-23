-- =========================================================================
-- Content expansion v2: breadth + depth.
--   * New agents across business/professional verticals (beginner-friendly).
--   * More Knowledge Hub articles in the core categories so topics aren't
--     one-article stubs (beginner -> technical).
--   * More digital products.
-- All descriptions/bodies use rich Markdown (the detail pages now render it),
-- so each item reads as a real page, not a one-line teaser.
-- Idempotent: ON CONFLICT (slug) DO NOTHING. Premium items left without a
-- price show the "Contact for pricing" CTA; none collide with premium-catalog.ts.
-- =========================================================================

-- ---------- Agents: new verticals ----------
INSERT INTO public.agents (slug, name, tagline, description, category, capabilities, tier, price_cents, featured) VALUES
('recruiting-screener', 'Recruiting Screener', 'Screen applicants and schedule interviews — fairly and fast.',
 $md$New to AI hiring tools? Start here. The Recruiting Screener reads incoming applications against the role you actually wrote, summarizes each candidate in plain language, and books interviews on your calendar — so you spend your time talking to people, not sorting PDFs.

## What it does
- Reads resumes and applications and scores them against your requirements
- Writes a 3-line, bias-aware summary of every candidate
- Drafts personalized replies (advance, hold, or kind decline)
- Books interviews against your live calendar availability

## Best for
Small teams and solo founders drowning in applicants who still want every person to get a fair, human reply.

## How it works
1. Paste the job description and your must-haves.
2. Forward or connect the application inbox.
3. Review the ranked shortlist and approve the outreach — nothing sends without you.$md$,
 'Recruiting', ARRAY['Resume screening','Bias-aware summaries','Interview scheduling','Candidate replies'],
 'premium', NULL, true),

('bookkeeping-assistant', 'Bookkeeping Assistant', 'Keep your books clean without becoming an accountant.',
 $md$You do not need to know debits from credits. The Bookkeeping Assistant watches your transactions, sorts them into the right categories, and flags the weird ones before they become a month-end headache.

## What it does
- Categorizes income and expenses automatically
- Flags duplicates, unusual charges, and likely errors
- Drafts a plain-English month-end summary
- Answers "where did my money go?" in seconds

## Best for
Solopreneurs and small businesses who want tidy books year-round, not a shoebox in April.

## How it works
1. Connect or upload your transaction export.
2. Confirm a handful of category rules once.
3. Get a clean ledger and a monthly summary you can hand to your accountant.$md$,
 'Finance', ARRAY['Transaction categorization','Anomaly flags','Month-end summaries','Expense Q&A'],
 'free', NULL, false),

('contract-reviewer', 'Contract Reviewer', 'Understand a contract before you sign it.',
 $md$Not legal advice — a first read. The Contract Reviewer reads an agreement and explains it in plain English, highlighting the clauses that tend to bite: auto-renewals, liability, termination, and anything unusual.

## What it does
- Summarizes a contract in plain language
- Flags risky or non-standard clauses with a why
- Compares terms against your saved preferences
- Drafts the questions to send back

## Best for
Founders and operators who sign vendor and client agreements and want a sanity check before looping in a lawyer.

## How it works
1. Upload the contract.
2. Read the plain-English summary and the flagged clauses.
3. Use the generated questions to negotiate — or hand the flags to counsel.$md$,
 'Legal', ARRAY['Plain-English summary','Risky-clause flags','Term comparison','Redline questions'],
 'premium', NULL, false),

('course-builder', 'Course Builder', 'Turn what you know into a course people finish.',
 $md$Have expertise but no idea how to package it? The Course Builder turns your knowledge into a structured curriculum — modules, lessons, exercises, and assessments — ready to record or write.

## What it does
- Designs a module-by-module curriculum from your topic
- Writes lesson outlines, scripts, and exercises
- Suggests assessments and project briefs
- Adapts depth for beginner, intermediate, or advanced learners

## Best for
Creators, coaches, and ministry leaders turning hard-won knowledge into a teachable program.

## How it works
1. Describe your topic and who it is for.
2. Approve the curriculum outline.
3. Generate each lesson and edit to your voice.$md$,
 'Education', ARRAY['Curriculum design','Lesson scripting','Exercises & quizzes','Level adaptation'],
 'free', NULL, false),

('ecommerce-merchandiser', 'E-commerce Merchandiser', 'Listings that rank, read well, and sell.',
 $md$The E-commerce Merchandiser writes and optimizes your product catalog: titles, descriptions, bullet points, and metadata tuned for both shoppers and search.

## What it does
- Writes conversion-focused titles and descriptions
- Generates SEO metadata and alt text
- Keeps tone and formatting consistent across the catalog
- Suggests cross-sells and bundle copy

## Best for
Online stores with more products than time to describe them.

## How it works
1. Upload your product list or connect the store.
2. Pick a brand voice and the channels you sell on.
3. Review the drafted listings and publish the ones you like.$md$,
 'E-commerce', ARRAY['Listing copywriting','SEO metadata','Catalog consistency','Cross-sell copy'],
 'premium', NULL, false),

('listing-assistant', 'Real Estate Listing Assistant', 'From walkthrough notes to a listing that moves.',
 $md$The Listing Assistant turns rough property notes into a polished listing, then answers the repetitive buyer questions so you can focus on showings.

## What it does
- Writes compelling, accurate listing descriptions
- Drafts social and email blasts for new listings
- Answers common buyer questions (taxes, schools, HOA) from your facts
- Keeps fair-housing-safe language

## Best for
Agents and small brokerages who list often and want consistent, fast copy.

## How it works
1. Drop in the property facts and a few photos' notes.
2. Get the listing plus a social and email version.
3. Hand the FAQ bot your facts and let it field the basics.$md$,
 'Real Estate', ARRAY['Listing descriptions','Social & email blasts','Buyer FAQ','Fair-housing language'],
 'free', NULL, false),

('data-analyst', 'Data Analyst Agent', 'Ask your data questions in plain English.',
 $md$No SQL required. The Data Analyst Agent connects to your data, answers questions in plain language, and builds the chart or summary to back it up.

## What it does
- Answers business questions over your data without SQL
- Builds tables, charts, and short written takeaways
- Flags trends, drops, and outliers worth a look
- Schedules a recurring plain-English report

## Best for
Operators who have dashboards nobody reads and questions nobody has time to query.

## How it works
1. Connect a spreadsheet or database (read-only).
2. Ask a question the way you'd ask a colleague.
3. Get the answer, the chart, and the "so what."$md$,
 'Data & Analytics', ARRAY['Natural-language queries','Charts & summaries','Trend & outlier flags','Scheduled reports'],
 'premium', NULL, true),

('project-manager', 'Project Manager Agent', 'Keep projects on track without the status-update grind.',
 $md$The Project Manager Agent watches your tasks and channels, writes the status update nobody wants to write, and flags what's slipping before it's late.

## What it does
- Drafts weekly status updates from real task activity
- Flags blockers, overdue items, and at-risk milestones
- Turns meeting notes into assigned action items
- Nudges owners on stale tasks

## Best for
Lead-of-everything operators juggling several projects at once.

## How it works
1. Connect your task board and notes.
2. Set your update cadence and who owns what.
3. Review the drafted update and send.$md$,
 'Project Management', ARRAY['Status updates','Risk & blocker flags','Action-item capture','Owner nudges'],
 'free', NULL, false),

('social-media-manager', 'Social Media Manager', 'Plan, write, and schedule — without living in the apps.',
 $md$The Social Media Manager turns one idea into a week of platform-native posts, keeps a consistent voice, and schedules everything for your approval.

## What it does
- Plans a content calendar around your themes
- Writes platform-native posts (short hooks, threads, captions)
- Repurposes one piece across channels
- Schedules drafts for one-click approval

## Best for
Founders, creators, and ministries who know they should post consistently but never do.

## How it works
1. Share your themes, voice, and channels.
2. Approve the week's calendar.
3. Tweak and schedule the drafts.$md$,
 'Social Media', ARRAY['Content calendar','Platform-native copy','Repurposing','Scheduling'],
 'premium', NULL, false),

('first-responder-support', 'Customer Support First Responder', 'Answer the easy 80% instantly, route the rest with context.',
 $md$The Support First Responder reads your help docs and past tickets, resolves the common questions instantly in your tone, and hands the hard ones to a human with a clean summary.

## What it does
- Answers tier-1 questions from your knowledge base
- Matches your brand tone and refund policy
- Escalates with a full summary and suggested reply
- Spots gaps in your docs from repeated questions

## Best for
Small teams whose inbox is full of the same ten questions.

## How it works
1. Point it at your help center and a sample of past tickets.
2. Set escalation rules and tone.
3. It drafts replies; you approve until you trust it to send.$md$,
 'Customer Service', ARRAY['KB answers','Tone matching','Smart escalation','Docs-gap detection'],
 'free', NULL, false)
ON CONFLICT (slug) DO NOTHING;

-- ---------- Knowledge Hub: depth in core categories ----------
INSERT INTO public.articles (slug, title, excerpt, category, read_minutes, body, author_id) VALUES
('ai-agents-in-plain-english',
 'AI Agents in Plain English',
 'No jargon. If you have ever used a chatbot but keep hearing the word "agent," start here.',
 'Fundamentals', 5,
 $md$# AI Agents in Plain English

If you can describe a task to a capable assistant, you can understand an AI agent.

## The one-sentence version
An **agent** is an AI that can take a goal, decide the steps, use tools to get them done, and check its own work — instead of just answering a single question.

## A kitchen analogy
- A **chatbot** is a friend who answers a cooking question over text.
- A **recipe** is a fixed set of steps — great until something goes wrong.
- An **agent** is a line cook: give it "make dinner for six," and it checks the pantry, adjusts when an ingredient is missing, and plates the result.

## What makes it an agent
1. **A goal**, not just a prompt.
2. **Tools** it can actually use (search, your files, your calendar).
3. **Memory** so it improves with context.
4. **Judgment** to recover when a step fails.

## What this means for you
You stop writing every instruction and start describing outcomes. That shift — from "do exactly this" to "achieve this" — is the whole point.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('your-first-30-minutes-with-an-agent',
 'Your First 30 Minutes With an AI Agent',
 'A calm, click-by-click first session — pick a task, set guardrails, and watch it work.',
 'Getting Started', 6,
 $md$# Your First 30 Minutes With an AI Agent

You do not need to code. You need one real task and thirty quiet minutes.

## Minutes 0-10: pick the right first task
Choose something you do weekly that has a clear "done": summarizing a document, drafting a reply, organizing notes. Avoid anything irreversible for now.

## Minutes 10-20: set the rules
Tell the agent three things:
- The **goal** in one sentence.
- What it **may** do (read this folder, draft a reply).
- What it must **never** do (send anything without showing you first).

## Minutes 20-30: run it and watch
Let it work and read each step. When it does something odd, your instructions were probably unclear — not the AI being "dumb." Adjust one sentence and run again.

## The takeaway
Trust is earned in small, reversible steps. Start with "draft," graduate to "send" only once it has earned it.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('prompting-an-agent-the-basics',
 'Prompting an Agent: The Basics',
 'The handful of prompting habits that make agents dramatically more reliable.',
 'Prompting', 6,
 $md$# Prompting an Agent: The Basics

Prompting an agent is less about clever wording and more about being a clear manager.

## Four habits that matter
1. **State the goal and the done-condition.** "Draft a reply that answers their question and offers one next step."
2. **Give context, not just commands.** Who is this for? What tone? What must stay true?
3. **Name the boundaries.** What it should never do is as important as what it should.
4. **Ask for the plan first** on anything complex, then approve it.

## A simple template
> Goal: ___. Audience: ___. Must be true: ___. Never: ___. Show me your plan before acting.

## Why this works
Agents fail most often from ambiguity, not inability. Removing ambiguity is the highest-leverage thing you can do — and it takes one extra sentence.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('giving-your-agent-long-term-memory',
 'Giving Your Agent Long-Term Memory',
 'A practical guide to the three memory layers and how to add them without over-engineering.',
 'Agent Memory', 8,
 $md$# Giving Your Agent Long-Term Memory

An agent with no memory helps once. An agent with the right memory gets better every week.

## The three layers, and when to add each
- **Working memory** — the current conversation. You already have it; keep it lean.
- **Semantic memory** — durable facts ("this user prefers concise replies"). Add this first; a single vector store covers most needs.
- **Episodic memory** — specific past events ("last Tuesday they asked about refunds"). Add only when a real task needs recall of *when*.

## A minimal setup that works
1. Summarize each session into a few durable facts.
2. Store those facts with embeddings.
3. On each new task, retrieve the most relevant facts and prepend them.

## The traps
- **Storing everything** — memory becomes noise; store distilled facts, not transcripts.
- **Never forgetting** — let stale or contradicted facts expire.
- **No retrieval test** — if you can't see what was recalled, you can't debug it.

Start with semantic-only. Most teams never need more.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('connecting-tools-with-mcp-a-walkthrough',
 'Connecting Tools With MCP: A Walkthrough',
 'From zero to a working tool connection — what MCP gives you and the gotchas to expect.',
 'MCP', 7,
 $md$# Connecting Tools With MCP: A Walkthrough

The Model Context Protocol (MCP) is how an agent discovers and uses tools through one standard interface — instead of a bespoke integration per tool.

## The mental model
An MCP **server** exposes capabilities ("search orders," "create ticket"). Your agent **connects** and asks "what can you do?", then calls what fits the task.

## A first connection, step by step
1. Pick a read-only server first (data you can see but not change).
2. Connect it and list its tools — confirm the names and descriptions read clearly.
3. Give the agent a task that needs exactly one of those tools and watch the call.
4. Only then add an action server (one that writes or sends).

## Gotchas
- **Over-broad tools** confuse the model — prefer several focused tools.
- **Untrusted content** from a tool can carry hidden instructions; treat tool output as data, not commands.
- **Auth scope** — give the narrowest access that does the job.

Start read-only, prove one call, then expand.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('designing-a-multi-step-agent-workflow',
 'Designing a Multi-Step Agent Workflow',
 'When one prompt is not enough: how to break work into reliable, checkable steps.',
 'Agent Orchestration', 7,
 $md$# Designing a Multi-Step Agent Workflow

Some jobs are too big for a single shot. The skill is breaking them into steps an agent can do — and you can check.

## Decompose by checkpoint
Split the work where you would naturally want to verify: research, then draft, then review. Each checkpoint is a place to catch errors early.

## Single agent vs many
- **One agent, many steps** handles most workflows — keep it unless you have a reason not to.
- **Multiple agents** earn their keep when roles genuinely differ (researcher vs critic) or you need parallel speed.

## Make each step checkable
1. Give every step a clear input and output.
2. Validate the output before the next step runs.
3. Let a step fail loudly instead of passing garbage downstream.

## The payoff
A workflow you can inspect step-by-step is one you can trust to run unattended.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('keeping-an-agent-safe-in-production',
 'Keeping an Agent Safe in Production',
 'The practical controls that let you stop watching an agent every second.',
 'Agent Security', 7,
 $md$# Keeping an Agent Safe in Production

Safety is what earns an agent the right to run without a babysitter.

## Defense in layers
- **Tool scope** is your strongest control: if the agent cannot call a dangerous tool, no clever prompt makes it.
- **Approval gates** for anything irreversible or outward-facing (sending, spending, deleting).
- **Reversible by default** — "draft" over "send," "archive" over "delete."

## Guard the inputs
Prompt injection hides instructions inside the data your agent reads — a web page, an email, a PDF. Treat all retrieved content as untrusted, and never let it change what tools are allowed.

## Watch the right signals
1. Log every tool call with its arguments.
2. Alert on spend, volume, and error spikes.
3. Keep a kill switch you can hit without a deploy.

Make the worst case boring, and you can finally look away.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('ai-for-your-small-business-where-to-start',
 'AI Agents for Your Small Business: Where to Start',
 'A no-hype starting map for owners who want results, not a science project.',
 'AI Business Applications', 6,
 $md$# AI Agents for Your Small Business: Where to Start

You do not need an AI strategy. You need one workflow that an agent makes cheaper, faster, or better.

## Find your first win
Look for a task that is **frequent, rules-based, and low-risk**: triaging email, drafting replies, categorizing expenses, writing product copy. Frequent means real time saved; low-risk means mistakes are cheap to catch.

## Score your candidates
1. How many hours a week does it cost today?
2. How clearly can you describe "done"?
3. How bad is a mistake — and can you catch it?

The best first agent is high-hours, clearly-defined, low-blast-radius.

## Roll it out without drama
- Start in "draft" mode — the agent proposes, a human approves.
- Measure hours saved for two weeks.
- Expand only after it has earned trust.

Pick one. Ship it. Let the results pick the next one.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('measuring-if-your-agent-actually-works',
 'Measuring If Your Agent Actually Works',
 'Move from "it seems fine" to evidence — with a test set you can build in an hour.',
 'Evaluation', 7,
 $md$# Measuring If Your Agent Actually Works

The moment an agent does real work, "it seems fine" stops being enough. You need a way to know — without a research budget.

## Build a golden set
Collect 15-20 real inputs and the output you would be happy with. That list is the single most valuable hour you will spend on quality.

## Measure three things
- **Did it succeed?** Often a human yes/no to start.
- **Did it use tools correctly?** Right tool, sane arguments.
- **What did it cost?** Tokens and seconds — these creep up silently.

## Run it on every change
1. Before you tweak a prompt or swap a model, run the golden set.
2. After, run it again.
3. Keep changes that help the set without breaking the rest.

## The trap
Twenty real cases you actually read beat a thousand synthetic ones you never look at.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial')),

('ai-in-ministry-a-gentle-start',
 'AI in Ministry: A Gentle Start',
 'Where an agent genuinely serves a church or nonprofit — and the lines to keep.',
 'Church & Ministry', 6,
 $md$# AI in Ministry: A Gentle Start

Used well, an agent returns hours to ministry staff for the work only people can do. Used carelessly, it erodes trust. Stewardship comes first.

## Three gentle starting points
- **Sermon research** — cross-references and illustration ideas, with the pastor doing the discernment.
- **First-time-guest follow-up** — drafting (never auto-sending) warm notes so no one slips through.
- **Volunteer and event logistics** — scheduling and reminders that quietly eat staff time.

## Lines worth keeping
1. **Never automate pastoral care.** A grief message is not a tool call.
2. **Disclose plainly** when AI helped draft a communication.
3. **Guard the flock's data** as the trust it is.

## A simple test
Does this free a person *for* ministry, or quietly replace the human touch that *is* the ministry? Keep the first; refuse the second.$md$,
 (SELECT id FROM public.authors WHERE slug = 'mit-editorial'))
ON CONFLICT (slug) DO NOTHING;

-- ---------- Digital products ----------
INSERT INTO public.products (slug, name, tagline, description, category, tier, price_cents) VALUES
('agent-prompt-pack-starter', 'Agent Prompt Pack: Starter', 'Fifty copy-paste prompts to get your first agents working.',
 $md$A free starter pack of fifty prompts that actually work — organized by what you are trying to do, with a note on why each one is shaped the way it is.

## What's included
- 50 prompts across email, research, writing, and ops
- A one-page "anatomy of a good agent prompt" guide
- Before/after examples showing what to fix

## Best for
Anyone new to agents who wants results today without learning prompt theory first.

## How to use it
1. Find the prompt closest to your task.
2. Fill in the brackets with your specifics.
3. Tweak one line at a time until it sings.$md$,
 'Prompts', 'free', NULL),

('customer-support-agent-kit', 'Customer Support Agent Kit', 'Everything to stand up a support agent that resolves, not deflects.',
 $md$A complete kit for launching a support agent that answers the common questions in your voice and escalates the rest cleanly.

## What's included
- Support agent system prompt and tone guide
- Escalation rules and a handoff-summary template
- Knowledge-base structure that agents read well
- An evaluation checklist for go-live

## Best for
Small teams ready to take the repetitive tickets off their plate without sounding like a robot.

## How to use it
1. Drop your help docs into the provided structure.
2. Set the tone guide and escalation rules.
3. Run the eval checklist before you let it reply.$md$,
 'Skill Packs', 'premium', NULL),

('ministry-ai-starter-kit', 'Ministry AI Starter Kit', 'A stewardship-first starting point for churches and nonprofits.',
 $md$A free, practical kit for ministries taking their first careful steps with AI — with the ethics built in, not bolted on.

## What's included
- Three ready-to-adapt agent recipes (sermon research, guest follow-up, volunteer ops)
- An ethical-use one-pager for your team
- A disclosure template for AI-assisted communications

## Best for
Pastors and nonprofit leaders who want the help without compromising trust.

## How to use it
1. Read the ethics one-pager with your team first.
2. Pick one recipe and run it in draft-only mode.
3. Adopt the disclosure template before anything goes out.$md$,
 'Starter Kits', 'free', NULL),

('sales-outreach-blueprints', 'Sales Outreach Blueprints', 'Ten outreach sequences an agent can run end-to-end.',
 $md$Ten complete outreach blueprints — each a full plan an agent can execute: who to target, what to say, when to follow up, and when to stop.

## What's included
- 10 sequences (cold, warm, re-engagement, referral, and more)
- Personalization variables that avoid the creepy valley
- Follow-up cadences with stop conditions
- A do-not-do list to keep you compliant and human

## Best for
Founders and small sales teams who want pipeline without spamming.

## How to use it
1. Pick the sequence that matches your motion.
2. Feed the agent your ICP and offer.
3. Approve the drafts — nothing sends on its own.$md$,
 'Blueprints', 'premium', NULL),

('rag-knowledge-base-template', 'RAG Knowledge Base Template', 'Structure your docs so agents answer from them accurately.',
 $md$A template and method for organizing your documents so a retrieval-augmented agent answers from them — with citations — instead of guessing.

## What's included
- A chunking and metadata structure that retrieves cleanly
- A "say I don't know" prompt pattern to stop hallucinations
- A retrieval-quality checklist
- Worked examples on a sample knowledge base

## Best for
Teams putting an agent on top of their docs, policies, or product knowledge.

## How to use it
1. Reorganize your docs into the provided structure.
2. Apply the retrieval prompt pattern.
3. Run the quality checklist before launch.$md$,
 'Knowledge Base Templates', 'premium', NULL),

('agent-eval-harness', 'Agent Evaluation Harness', 'A working setup to test agents on every change.',
 $md$A ready-to-use evaluation setup so you can prove an agent still works before you ship a change.

## What's included
- A golden-set template and rubric format
- A scoring sheet for success, tool-use, and cost
- A regression-tracking layout
- Guidance on grading by hand and with a second model

## Best for
Anyone running an agent in production who is tired of "it seemed fine."

## How to use it
1. Fill the golden set with 15-20 real cases.
2. Score your current agent as the baseline.
3. Re-run on every prompt or model change.$md$,
 'Evaluation', 'premium', NULL),

('ai-policy-template-pack', 'AI Use Policy Template Pack', 'Set sensible AI rules for your team in an afternoon.',
 $md$A free pack of editable policies so your team knows what is okay, what is not, and who to ask — without a legal department.

## What's included
- An acceptable-use policy template
- A data-handling and privacy checklist
- A disclosure standard for AI-assisted work
- A simple approval flow for new tools

## Best for
Small businesses, ministries, and nonprofits adopting AI responsibly.

## How to use it
1. Fill in the brackets with your specifics.
2. Review with your team in one sitting.
3. Revisit quarterly as tools change.$md$,
 'SOPs', 'free', NULL),

('small-business-automation-pack', 'Small Business Automation Pack', 'Twelve ready workflows that take busywork off your plate.',
 $md$Twelve agent-ready workflows for the jobs every small business shares — onboarding, invoicing, follow-up, reporting — each written as steps an agent follows reliably.

## What's included
- 12 step-by-step workflows with decision points and approval gates
- A "which to automate first" scorecard
- Tone and brand guidelines to keep outputs consistent

## Best for
Owners who wear every hat and want a few of them handled.

## How to use it
1. Use the scorecard to pick your first workflow.
2. Adapt the steps to your tools.
3. Run in draft mode, then let it loose once trusted.$md$,
 'Business Automation Packages', 'premium', NULL)
ON CONFLICT (slug) DO NOTHING;
