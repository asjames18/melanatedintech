-- =========================================================================
-- Real deliverables for the FREE products. Free packs are public (rendered
-- inline on the product page for everyone), so this content is meant to be open.
-- Idempotent: only fills rows whose unlock_content is still empty.
-- =========================================================================

UPDATE public.products SET unlock_content = $md$# AI Agent Starter Kit

Everything you need to ship your first agent this weekend. Copy this structure, fill the blanks, and you have a working agent.

## 1. Project structure
```
my-agent/
  system-prompt.md     # who the agent is, goal, guardrails
  tools/               # one file per tool
  memory/              # notes the agent keeps
  examples/            # 5 real runs you graded
```

## 2. Base system prompt (fill the brackets)
> You are [ROLE]. Your goal is to [GOAL]. You can use these tools: [TOOLS]. Always [MUST]. Never [NEVER] — if unsure, stop and ask. Before any irreversible action, show me a draft and wait for approval.

## 3. Your first three tools
- **read** — let the agent see one source of truth (a folder, a doc, a table).
- **draft** — let it produce output without sending anything.
- **send** — gated behind your approval at first.

## 4. Memory scaffold
Keep a short `memory/facts.md` of durable facts ("user prefers concise replies"). Prepend the relevant ones each run. That's 90% of memory you'll ever need.

## 5. Ship it
1. Run the agent on five real inputs.
2. Read every step — fix the prompt, not the model, when it stumbles.
3. If 4/5 are good, you have a useful agent. Use it Monday.

*Pair this with the Agent README Template and the Agent Evaluation Checklist.*$md$
WHERE slug = 'agent-starter-kit' AND (unlock_content IS NULL OR unlock_content = '');

UPDATE public.products SET unlock_content = $md$# Curated MCP Collection

A vetted starting list of Model Context Protocol servers — what they're for and what to watch. Always check the source repo before connecting.

## Safe first connections (read-only)
- **Filesystem** — give an agent eyes on a folder. Scope to one directory; never the whole disk.
- **Web fetch / search** — let it pull pages. Treat fetched content as untrusted input.
- **Database (read replica)** — answer questions over your data without write risk.

## Action servers (add after read-only works)
- **GitHub** — issues, PRs, code search. Scope the token tightly.
- **Slack / Discord** — post and read messages. Gate posting behind approval at first.
- **Calendar / email** — schedule and draft. Keep "send" human-approved early on.

## What to check before you connect any server
1. **Auth model** — token scope, where it's stored.
2. **Rate limits** — what happens when you hit them.
3. **Write surface** — what's the worst it can do? Can you undo it?
4. **Maintenance** — last commit, open issues, who's behind it.

## The golden rule
Start read-only, prove one tool call, then widen access one server at a time.$md$
WHERE slug = 'mcp-collection' AND (unlock_content IS NULL OR unlock_content = '');

UPDATE public.products SET unlock_content = $md$# Agent Evaluation Checklist

Print this. Run it before any agent does real work. The goal is to move from "it seemed fine" to evidence.

## Build a golden set
- [ ] Collected 15-20 **real** inputs (not synthetic).
- [ ] Wrote the output you'd be happy with for each.
- [ ] Stored them somewhere you'll actually re-run.

## Write a rubric
- [ ] One paragraph per task describing a "good" answer.
- [ ] Defined what counts as a hard fail.

## Measure three things
- [ ] **Task success** — did it accomplish the goal? (human yes/no is fine to start)
- [ ] **Tool correctness** — right tool, sane arguments?
- [ ] **Cost & latency** — tokens and seconds per run, tracked over time.

## Run on every change
- [ ] Baseline the current agent on the golden set.
- [ ] Re-run before AND after every prompt or model change.
- [ ] Reject changes that fix one case but break others.

## Before go-live
- [ ] Guardrails tested (it refuses what it must).
- [ ] A human approval gate on anything irreversible.
- [ ] A kill switch you can hit without a deploy.$md$
WHERE slug = 'agent-eval-checklist' AND (unlock_content IS NULL OR unlock_content = '');

UPDATE public.products SET unlock_content = $md$# Agent README Template

Document any agent so your whole team can own it — not just the person who built it. Copy this and fill it in.

## [Agent name]
**Goal (one sentence):** ___

**Owner:** ___   **Status:** draft / live / retired

## What it does
- ___
- ___

## Tools it uses
| Tool | Purpose | Access scope |
|------|---------|--------------|
| ___  | ___     | ___          |

## Memory
- What it remembers between runs: ___
- Where that's stored: ___

## Guardrails
- It must never: ___
- Human approval required for: ___

## How to run it
1. ___
2. ___

## When it breaks
- Common failure: ___ → fix: ___
- Kill switch: ___

## Evaluation
- Golden set location: ___
- Last evaluated: ___$md$
WHERE slug = 'agent-readme-template' AND (unlock_content IS NULL OR unlock_content = '');

UPDATE public.products SET unlock_content = $md$# Agent Prompt Pack: Starter

Copy-paste prompts that work. Fill the [brackets], then tune one line at a time. Grouped by what you're trying to do.

## Email & inbox
- **Triage:** "Sort these emails into needs-me-today, can-wait, FYI, ignore. For needs-me-today, draft a one-line reply."
- **Reply in my voice:** "Reply to this message in [tone]. Be warm, concise, specific. Offer exactly one next step."
- **Unsubscribe-worthy:** "List senders I haven't opened in 90 days and draft nothing — just the list."

## Writing
- **Summarize:** "Summarize this for someone with 60 seconds: the point, the 3 things that matter, what to do next."
- **Rewrite:** "Rewrite this to be clearer and 30% shorter without losing meaning."
- **Outline:** "Turn this brain-dump into a clean outline with headings and one line per point."

## Research
- **Brief:** "Research [question]. Triangulate 3+ sources, cite inline, and flag anything unverified."
- **Compare:** "Compare [A] vs [B] on [criteria]. Give a table and a one-line recommendation."

## Work & ops
- **Status update:** "From this activity, write a status: shipped, in progress, blocked, at risk. Lead with risks. Under 200 words."
- **Meeting → actions:** "From this transcript: 3-sentence summary, decisions, action items with owners."
- **SOP:** "Turn this messy process into a numbered SOP with decision points and approval gates."

## Decisions
- **Pros/cons:** "Steelman both sides of [decision], then give your recommendation and the biggest risk."
- **Pre-mortem:** "Assume [plan] failed in 6 months. List the 5 most likely reasons."

*This is the starter set. Tune each to your data and voice — the bracketed parts are where your edge lives.*$md$
WHERE slug = 'agent-prompt-pack-starter' AND (unlock_content IS NULL OR unlock_content = '');

UPDATE public.products SET unlock_content = $md$# Ministry AI Starter Kit

A stewardship-first starting point. Read the ethics page with your team **before** you deploy anything.

## Ethics one-pager (read first)
- **People over efficiency.** AI frees staff *for* ministry; it never replaces presence, prayer, or care.
- **Never automate pastoral care.** A grief or crisis message is always a human.
- **Disclose plainly** when a communication was AI-assisted.
- **Guard the flock's data** as the trust it is — private, access-controlled, never sold.

## Recipe 1 — Sermon research helper
> Given [passage] and [theme], return cross-references, original-language notes, 3 illustration ideas, and an outline option. The pastor does the discernment.

## Recipe 2 — First-time guest follow-up (draft only)
> From this guest's info, draft a warm, personal note inviting a next step. Never send automatically — surface it for a person to review and send.

## Recipe 3 — Volunteer & event ops
> Given this event and volunteer list, draft the schedule, reminders, and a gap list of unfilled roles. Flag conflicts.

## Disclosure template
> "Parts of this message were drafted with AI and reviewed by our team. Reply anytime to reach a person."

*Start with one recipe, in draft-only mode, for one month.*$md$
WHERE slug = 'ministry-ai-starter-kit' AND (unlock_content IS NULL OR unlock_content = '');

UPDATE public.products SET unlock_content = $md$# AI Use Policy Template Pack

Set sensible AI rules your team can actually follow. Fill the [brackets], review together once, revisit quarterly.

## Acceptable-use policy
- **Approved tools:** [list]. New tools require [who] approval.
- **Allowed uses:** drafting, research, summarizing, brainstorming.
- **Not allowed:** [e.g., final decisions on hiring/firing, sharing customer data with un-approved tools, presenting AI output as a person without disclosure].

## Data handling
- [ ] Never paste customer PII or secrets into a tool not on the approved list.
- [ ] Confidential docs stay in [approved system].
- [ ] When in doubt, ask [who] before sharing.

## Disclosure standard
- AI-assisted external communications include: "Drafted with AI, reviewed by our team."
- Published content that is substantially AI-generated is labeled.

## Approval flow for new tools
1. Request to [owner] with the use case.
2. Check data handling + cost.
3. Approve, add to the list, and tell the team.

## Review
- Owner: [name]. Revisit: every quarter — tools and risks change fast.$md$
WHERE slug = 'ai-policy-template-pack' AND (unlock_content IS NULL OR unlock_content = '');
