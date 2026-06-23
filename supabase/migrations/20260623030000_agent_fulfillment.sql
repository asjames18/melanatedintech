-- =========================================================================
-- Agent fulfillment: deliver a real pack when a premium AGENT is bought.
-- Mirrors product fulfillment (20260623010000_product_fulfillment.sql).
--   * unlock_content — the pack itself, as Markdown, shown only to owners.
--   * asset_path / asset_name — optional hosted file in the private
--     product-assets bucket, delivered via a short-lived signed URL.
-- These columns are SECURITY-SENSITIVE: the public getAgent() must never
-- select them. They are served only by the entitlement-checked fulfillment fn.
--
-- Before this, the 3 premium agents in PREMIUM_CATALOG had live Unlock buttons
-- but no deliverable — a buyer would be charged and receive nothing.
-- =========================================================================

ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS unlock_content TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS asset_path TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS asset_name TEXT;

-- Reuse the private pack-file bucket (already created by product fulfillment).
-- Harmless if it already exists.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-assets', 'product-assets', false)
ON CONFLICT (id) DO NOTHING;

-- ---------- Real deliverables for the Stripe-buyable agents ----------

UPDATE public.agents SET unlock_content = $md$# Marketing Campaign Strategist — Operator Pack

Everything you need to run this agent as a campaign planner: the brief→plan workflow, channel playbooks, and the prompts that drive each step. Paste the prompts into the agent's instructions, wire the tools they name, and keep the human gates.

> This agent plans campaigns; it does not press send. Every outward-facing asset ends at a human approval gate.

## The workflow: brief → plan → assets → review

1. **Intake the brief** — Trigger: a new campaign request. The agent collects: objective, audience, offer, budget, timeline, success metric. If any are missing, it asks one round of clarifying questions before planning.
2. **Draft the plan** — channels, message angle per channel, cadence, and a measurement plan tied to the success metric.
3. **Generate assets** — first-draft copy per channel from the approved plan.
4. **Human review gate** — nothing publishes without sign-off.

### Prompt — Campaign brief intake
"You are a campaign strategist. Read the request and extract: objective, primary audience, the offer, budget, timeline, and the one metric that defines success. List anything missing as a short numbered question set. Do not plan until the brief is complete."

### Prompt — Plan from brief
"From this completed brief, produce a campaign plan: 2–4 channels with a one-line rationale each, the core message and one angle per channel, a week-by-week cadence, and a measurement plan that maps each channel to the success metric. Flag the single biggest risk to hitting the metric."

## Channel playbooks

- **Email** — Goal: a clear next step. Structure: hook → proof → one CTA. Cadence: 3-touch sequence, value before ask. Measure: reply/click, not opens.
- **LinkedIn / social** — Goal: reach + credibility. Lead with the audience's problem, not the product. One idea per post. Measure: saves and qualified comments over likes.
- **Paid** — Goal: test angles cheaply. Ship 3 angles small, kill losers fast, scale the winner. Measure: cost per qualified action.
- **Landing page** — Goal: one decision. Match the ad's promise, remove every link that isn't the CTA. Measure: conversion rate by source.

### Prompt — Channel copy
"Write first-draft copy for {channel} from the approved plan, in our brand voice (guide below). One idea, one CTA. Give two subject-line / headline options. Mark any claim that needs a fact-check."

## Measurement & iteration

### Prompt — Weekly campaign readout
"From this performance data, write a readout: what's working, what's underperforming vs. the success metric, the one change to make next week, and the budget implication. Lead with the recommendation."

**Guardrail:** the agent never publishes, sends, or spends. It drafts and recommends; a human approves every outward action.

---
*Adapt the playbooks to your channels and voice. Pair with the SEO Researcher for top-of-funnel demand.*$md$
WHERE slug = 'marketing-campaign-strategist' AND unlock_content IS NULL;

UPDATE public.agents SET unlock_content = $md$# PA: Inbox Zero — Operator Pack

Turn your inbox from a stressor into a system. This pack gives the agent triage rules, draft-reply prompts, and a daily/weekly operating loop. It drafts; you approve.

> This agent never sends without you. It triages, drafts, and queues — the send button stays yours.

## Triage rules

The agent sorts every message into exactly one bucket:

- **Needs me today** — a real decision or reply only you can make. Agent drafts a reply for approval.
- **Delegate / queue** — actionable but not by you. Agent drafts the hand-off.
- **Waiting on** — you're blocked on someone else. Agent tracks it and surfaces stale items.
- **FYI** — read, no action. Agent writes a one-line summary.
- **Ignore / unsubscribe** — noise. Agent flags for bulk archive.

### Prompt — Triage pass
"Sort these emails into: needs me today, delegate, waiting-on, FYI, ignore. For each 'needs me today', add a one-line draft reply I can approve. For 'waiting-on', note who I'm blocked on and for how long. Output a single ranked list, most urgent first."

## Draft replies

### Prompt — Approve-ready reply
"Draft a reply to this message in my voice (warm, concise, specific). Offer exactly one clear next step. If the message asks for something I should decline, draft a kind no with a brief reason. Keep it under 120 words."

### Prompt — The follow-up nudge
"Write a short, friendly follow-up for this thread that's gone quiet. Reference the last open item, restate the one thing I need, and make it easy to reply in one line."

## The daily & weekly loop

**Daily (morning, 10 min):**
1. Agent runs a triage pass on overnight mail.
2. You approve the 'needs me today' drafts.
3. Agent queues delegations and archives the ignore pile on your okay.

**Weekly (Friday, 15 min):**
1. Agent lists every 'waiting-on' item older than 3 days.
2. Agent drafts nudges for the ones worth chasing.
3. Agent reports inbox trend: volume, response time, recurring senders worth a rule.

### Prompt — Weekly inbox report
"Summarize this week's inbox: total handled, average time-to-reply, my top 5 senders, and any recurring request I should turn into a template or an auto-rule. Recommend one change to cut volume next week."

**Guardrail:** the agent drafts and queues; it does not send, delete permanently, or unsubscribe without explicit approval.

---
*Tune the voice and the buckets to how you actually work. Pair with the Agent README Template to document your rules.*$md$
WHERE slug = 'pa-inbox-zero' AND unlock_content IS NULL;

UPDATE public.agents SET unlock_content = $md$# Marketing SEO Researcher — Operator Pack

A research agent that finds what your audience is searching for and turns it into briefs writers can execute. This pack ships the keyword→cluster workflow, a SERP brief template, and the prompts behind each step.

> This agent researches and drafts briefs. It cites its sources and flags anything it can't verify — it never invents search volume or rankings.

## The workflow: seed → cluster → brief

1. **Seed** — start from the audience's problem, not a keyword. The agent expands a topic into candidate queries grouped by intent.
2. **Cluster** — group queries into topic clusters, each mapping to one page. One cluster = one brief.
3. **Brief** — for the priority cluster, produce a content brief a writer can execute without guessing.

### Prompt — Seed expansion
"For the topic below, list candidate search queries our audience would actually type, grouped by intent: informational, comparison, and transactional. For each query note the likely searcher goal in one phrase. Mark which queries we can answer credibly today."

### Prompt — Cluster the queries
"Group these queries into topic clusters where each cluster should become a single page. Name each cluster, pick its primary query, list the secondary queries it should also satisfy, and assign a priority (high/med/low) based on relevance to our offer and how hard it looks to rank."

## SERP brief template

For each priority cluster, the agent fills this out:

- **Primary query & intent** — the one search this page wins.
- **Audience & goal** — who's searching and what they need to walk away with.
- **Angle** — our distinct take vs. what's already ranking.
- **Must-cover subtopics** — the questions the page has to answer (from secondary queries + "people also ask" patterns).
- **Suggested structure** — H2/H3 outline.
- **Internal links** — related pages on our site to link to/from.
- **Proof to gather** — data, examples, or quotes the writer needs (the agent lists what's needed, flags what it couldn't verify).

### Prompt — Build the brief
"Using the SERP brief template, write a content brief for this cluster's primary query. Base the must-cover subtopics on the secondary queries and common follow-up questions. Propose an H2/H3 outline and an angle that differentiates us. List the proof points a writer must gather, and explicitly mark any claim you could not verify."

## Review & maintenance

### Prompt — Content refresh audit
"Given this list of our existing pages and their target queries, flag pages that look stale or thin against current search intent, and rank the top 5 to refresh first with a one-line reason each."

**Guardrail:** the agent presents research and briefs; it never fabricates metrics. Unverifiable numbers are labeled as estimates or omitted, and a human approves the content plan before writing begins.

---
*Plug your real search data in where the agent flags estimates. Pair with the Campaign Strategist to turn briefs into demand.*$md$
WHERE slug = 'marketing-seo-researcher' AND unlock_content IS NULL;
