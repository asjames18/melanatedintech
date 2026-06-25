-- =========================================================================
-- Catalog curation for launch.
--
-- The seed migrations created many premium agents/products with no price and
-- no deliverable pack, so they fell through to "Contact for pricing" — nothing
-- was buyable. This curates a focused FLAGSHIP paid set (8 items that have real
-- deliverables) and converts every other premium item to FREE, so the catalog
-- reads as: clear free listings + a small set of polished paid products.
--
-- Flagship paid (kept premium, all have unlock_content packs + a PREMIUM_CATALOG
-- entry + a Stripe price):
--   agents:   marketing-campaign-strategist, marketing-seo-researcher,
--             pa-inbox-zero, personal-chief-of-staff, customer-support-agent
--   products: agent-skill-pack-core, workflow-templates-ops, prompt-library-pro
--
-- Idempotent: free-conversion is naturally repeatable; pack writes guard on
-- unlock_content IS NULL so re-runs don't clobber edits.
-- =========================================================================

-- ---------- 1. Convert non-flagship premium → free ----------
UPDATE public.agents SET tier = 'free'
WHERE tier = 'premium'
  AND slug NOT IN (
    'marketing-campaign-strategist',
    'marketing-seo-researcher',
    'pa-inbox-zero',
    'personal-chief-of-staff',
    'customer-support-agent'
  );

UPDATE public.products SET tier = 'free'
WHERE tier = 'premium'
  AND slug NOT IN (
    'agent-skill-pack-core',
    'workflow-templates-ops',
    'prompt-library-pro'
  );

-- ---------- 2. Price the 3 new flagship items (display) ----------
UPDATE public.agents   SET price_cents = 4900 WHERE slug = 'personal-chief-of-staff';
UPDATE public.agents   SET price_cents = 4900 WHERE slug = 'customer-support-agent';
UPDATE public.products SET price_cents = 3900 WHERE slug = 'prompt-library-pro';

-- ---------- 3. Deliverable packs for the new flagship items ----------

UPDATE public.agents SET unlock_content = $md$# Personal Chief of Staff — Operator Pack

Run your week like you have a chief of staff. This agent prepares your priorities, your meetings, and your follow-ups so you walk into every day already oriented. It drafts, organizes, and reminds — you stay the decision-maker.

> This agent prepares and recommends. It never sends messages, accepts meetings, or commits you to anything without your explicit okay.

## The operating rhythm

**Monday plan (15 min):** the agent proposes the week's 3 priorities from your goals, open commitments, and calendar, and flags conflicts before they bite.
**Daily brief (5 min):** today's meetings with prep notes, the 3 things that must move, and anything you're waiting on from someone else.
**Friday review (10 min):** what shipped, what slipped, and a first draft of next week's priorities.

### Prompt — Weekly priorities
"From my goals, open commitments, and this week's calendar, propose the 3 priorities that matter most this week. For each, give the single next action and the risk that would derail it. Flag any calendar conflict or overload."

### Prompt — Daily brief
"Build my daily brief: each meeting with a one-line purpose and what I should prep, the 3 must-move items for today, and a list of what I'm blocked on (who owes me what, and for how long)."

## Meeting prep & decision memos

### Prompt — Meeting prep
"For this meeting, summarize the context, who's attending and what they likely want, the decision or outcome we need, and 3 questions I should be ready to answer. Keep it to half a page."

### Prompt — Decision memo
"Turn my rough notes into a one-page decision memo: the decision, the options with trade-offs, a recommendation with reasoning, and what we need to commit to it. Mark anything that's still an open question."

## Follow-through

### Prompt — Commitment tracker
"From these notes/transcripts, extract every commitment: who owns it, what's due, and by when. Separate mine from others'. Draft a short, friendly nudge for each item that's overdue."

**Guardrail:** the agent drafts replies, agendas, and memos for your approval and tracks commitments — it does not send, schedule, decline, or commit on your behalf.

---
*Tune the rhythm to how you actually work. Pair with PA: Inbox Zero for the messaging side of the same week.*$md$
WHERE slug = 'personal-chief-of-staff' AND unlock_content IS NULL;

UPDATE public.agents SET unlock_content = $md$# Customer Support Agent — Operator Pack

Give support a calm, consistent first responder. This agent triages incoming tickets, drafts on-brand replies, escalates the edge cases, and turns recurring questions into reusable macros and help-center updates. It drafts; an agent approves before anything reaches a customer.

> This agent drafts and routes. It does not send replies, issue refunds, or close tickets without a human approving — especially for angry, sensitive, or money-related cases.

## Triage

Every ticket lands in one bucket:

- **Quick answer** — known question. Agent drafts a reply from the help center.
- **Needs a human** — judgment, exception, or emotion. Agent summarizes and routes with a suggested next step.
- **Bug / outage** — agent tags it, links similar reports, and drafts a holding reply.
- **Billing / refund** — always human-approved. Agent gathers the account facts and drafts options.

### Prompt — Triage + draft
"Read this ticket. Classify it (quick answer / needs a human / bug / billing). For quick answers, draft a reply in our voice using the help-center snippets below. For everything else, summarize the issue, the customer's sentiment, and the recommended next step. Never promise a refund or a fix date."

## On-brand replies

### Prompt — Reply in our voice
"Draft a reply to this customer: acknowledge the specific problem, give the clearest next step, and set a realistic expectation. Warm, plain, no corporate filler. Under 120 words. If we can't do what they asked, say so kindly with the reason and an alternative."

### Prompt — De-escalation
"This customer is frustrated. Draft a reply that takes responsibility for the experience (not blame), states exactly what we'll do next and by when, and offers a direct path to a human. Do not be defensive or over-apologize."

## Turn tickets into leverage

### Prompt — Macro from pattern
"From these recent tickets, find the 5 most common questions. For each, draft a reusable macro reply and note whether the help center needs a new or updated article."

### Prompt — Weekly support readout
"Summarize this week's tickets: volume, top issue categories, average first-response draft time, and the single change that would deflect the most future tickets. Lead with the recommendation."

**Guardrail:** drafts and routing only. Sends, refunds, account changes, and ticket closures require human approval.

---
*Load your real help-center content and voice guide where the prompts reference them. Pair with the SOP library to standardize escalations.*$md$
WHERE slug = 'customer-support-agent' AND unlock_content IS NULL;

UPDATE public.products SET unlock_content = $md$# Prompt Library Pro

A working library of production-tested prompts you can paste into your agents and tools today — plus the format and tuning method to make them your own. Organized by job to be done, not by novelty.

> Prompts are starting points, not magic. Each one names the inputs it expects and the guardrail it assumes. Adapt the voice and rules to your business before you ship.

## How to use this library

1. Find the prompt by the job you're doing.
2. Fill the `{bracketed}` inputs.
3. Keep the guardrail line — it's what keeps the output safe and on-task.
4. Tune with the method at the bottom until the output is reliably "good enough."

## Marketing

- **Campaign angle finder** — "Give 5 distinct angles to position {offer} for {audience}, each with the core message and who it's NOT for. Rank by fit to {goal}."
- **Repurpose one → many** — "Turn this {long asset} into: 3 social posts, 1 email, and 5 one-line hooks. Keep one idea per piece. Mark any claim to fact-check."
- **Plain-language rewrite** — "Rewrite this for a smart non-expert: short sentences, no jargon, concrete examples. Keep the meaning exact."

## Sales & outreach

- **Discovery synthesizer** — "From these call notes, extract the prospect's goal, constraints, decision criteria, and objections. Draft the one-line summary I'd open the proposal with."
- **Follow-up that isn't annoying** — "Write a short follow-up referencing {specific thing from the call}, restating the one next step. No 'just checking in.'"

## Support & ops

- **Ticket triage** — "Classify these tickets (quick answer / needs human / bug / billing) and draft replies only for quick answers in {voice}."
- **SOP from a transcript** — "Turn this recording of me doing {task} into a numbered SOP with inputs, steps, the done check, and where a human must approve."

## Research

- **Source-grounded brief** — "Research {question}. Give the answer, the 3 strongest supporting points with sources, and explicitly list what you could not verify. Do not fill gaps with guesses."
- **Compare options** — "Compare {A} vs {B} for {use case} on the 4 criteria that matter most to {audience}. End with a recommendation and the condition that would flip it."

## The prompt template

Reuse this shape for any new prompt:

```
Role: who the model is acting as.
Task: the one outcome you want.
Inputs: {the variables you'll fill}.
Constraints: format, length, voice, and what NOT to do.
Guardrail: the safety/approval rule (e.g., "never send; draft only").
Definition of done: how a human knows it's acceptable.
```

## The tuning method

1. Run the prompt on 3 real examples.
2. Mark each output good / fixable / wrong.
3. Add ONE constraint that fixes the most common failure.
4. Re-run. Stop when "good enough" is boringly repeatable.

---
*Treat this as a starter you fork per team. Pair with the SOP Library to turn your best prompts into documented workflows.*$md$
WHERE slug = 'prompt-library-pro' AND unlock_content IS NULL;
