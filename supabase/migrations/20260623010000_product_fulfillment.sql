-- =========================================================================
-- Product fulfillment: deliver something real when a digital product is bought.
--   * unlock_content — the pack itself, as Markdown, shown only to owners.
--   * asset_path / asset_name — optional hosted file (zip/PDF) in a private
--     bucket, delivered via a short-lived signed URL.
-- These columns are SECURITY-SENSITIVE: the public getProduct() must never
-- select them. They are served only by the entitlement-checked fulfillment fn.
-- =========================================================================

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unlock_content TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS asset_path TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS asset_name TEXT;

-- Private bucket for downloadable pack files. Access is via service-role signed
-- URLs only (service_role bypasses storage RLS), so no public object policy.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-assets', 'product-assets', false)
ON CONFLICT (id) DO NOTHING;

-- ---------- Real deliverables for the Stripe-buyable products ----------

UPDATE public.products SET unlock_content = $md$# Agent Skill Pack: Core

Ten ready-to-install agent skills. Each skill is a complete playbook — paste the prompt into your agent's system instructions, wire the tools it names, and keep the guardrail.

> A **skill** is a packaged way of solving a recurring problem. Treat each one as a starting point and tune it to your data and voice.

## 1. Refund Handler
**Use when:** a customer asks for a refund or cancellation.
**Prompt:** "You handle refund requests. Read the customer's message and our refund policy below. If the request clearly qualifies, draft an approval and the steps. If it's borderline, summarize the case and escalate to a human — never auto-approve outside policy. Always reply with empathy first."
**Guardrail:** never issue a refund without a human approval gate.

## 2. Meeting Follow-up
**Use when:** a call or meeting just ended.
**Prompt:** "From this transcript, produce: a 3-sentence summary, the decisions made, and a list of action items with an owner and due date each. Separate signal from small talk."
**Guardrail:** only assign owners named in the transcript.

## 3. Weekly Status Update
**Use when:** it's time for the weekly update nobody wants to write.
**Prompt:** "From this task activity, write a status update: what shipped, what's in progress, what's blocked, and what's at risk. Lead with the risks. Keep it under 200 words."

## 4. Research Brief
**Prompt:** "Research the question below. Triangulate at least three sources, track citations inline, and write a structured brief: answer, evidence, open questions. Flag anything you couldn't verify."
**Guardrail:** mark unverified claims explicitly; never present a guess as a fact.

## 5. Inbox Triage
**Prompt:** "Sort these emails into: needs me today, can wait, FYI, and ignore. For 'needs me today,' draft a one-line reply I can approve."

## 6. Tone-Matched Reply
**Prompt:** "Reply to this message in our brand voice (see guide below). Be warm, concise, and specific. Offer exactly one clear next step."

## 7. Document Summarizer
**Prompt:** "Summarize this document for someone who has 60 seconds: the point, the three things that matter, and what they should do next."

## 8. Data Q&A
**Prompt:** "Answer this question from the attached data only. Show the number, a one-line 'so what,' and say plainly if the data can't answer it."
**Guardrail:** never invent figures not present in the data.

## 9. SOP Writer
**Prompt:** "Turn this messy process into a clean SOP an agent can follow: trigger, numbered steps, decision points, and the human approval gates."

## 10. Onboarding Buddy
**Prompt:** "You help new hires in their first week. Answer their question from the handbook below in a friendly tone, and point them to the right person if it's outside the docs."

---
*Adapt each skill to your stack. Pair with the Agent README Template to document what you ship.*$md$
WHERE slug = 'agent-skill-pack-core' AND unlock_content IS NULL;

UPDATE public.products SET unlock_content = $md$# Workflow Templates: Operations

Twenty operational workflows rewritten as steps an agent follows reliably. Each names the **trigger**, the **steps**, the **decision points**, and the **human approval gate**. Adapt and ship.

> Format: every workflow ends at a human gate for anything irreversible or outward-facing.

## Customer lifecycle
1. **New-customer onboarding** — Trigger: deal marked won → create account, send welcome, schedule kickoff → *gate:* human confirms kickoff time.
2. **Support escalation** — Trigger: ticket unresolved 24h → summarize, tag severity, route to owner → *gate:* human on sev-1.
3. **Refund request** — Trigger: refund keyword → check policy, draft response → *gate:* human approves.
4. **Churn save** — Trigger: cancellation request → offer based on plan, log reason → *gate:* human approves any discount.
5. **Renewal reminder** — Trigger: 30 days to renewal → draft outreach with usage stats → *gate:* human sends.

## Finance & ops
6. **Invoice creation** — Trigger: milestone complete → draft invoice from SOW → *gate:* human approves before send.
7. **Expense categorization** — Trigger: new transaction → categorize, flag anomalies → *gate:* human reviews flags.
8. **Vendor review** — Trigger: quarterly → pull spend + performance, draft summary → *gate:* human decides renew/cut.
9. **Month-end summary** — Trigger: month close → compile P&L narrative → *gate:* human reviews before share.
10. **Procurement request** — Trigger: purchase request → check budget, draft PO → *gate:* human approves over threshold.

## People & internal
11. **New-hire setup** — Trigger: offer accepted → provision accounts checklist, schedule week one → *gate:* human confirms access.
12. **PTO request** — Trigger: request submitted → check coverage, draft response → *gate:* manager approves.
13. **Weekly status roll-up** — Trigger: Friday → compile per-project status → *gate:* lead reviews.
14. **Meeting notes → actions** — Trigger: meeting ends → extract decisions + action items → *gate:* owner confirms.
15. **Policy update notice** — Trigger: policy changed → draft plain-English notice → *gate:* human approves wording.

## Marketing & sales ops
16. **Lead routing** — Trigger: new lead → score against ICP, assign owner → *gate:* none (reversible).
17. **Content repurposing** — Trigger: new long-form post → draft social + email versions → *gate:* human approves.
18. **Review request** — Trigger: positive support resolution → draft review ask → *gate:* human sends.
19. **Event follow-up** — Trigger: event ends → segment attendees, draft follow-ups → *gate:* human approves sequence.
20. **Win/loss logging** — Trigger: deal closed → capture reason, update CRM, summarize patterns monthly → *gate:* none.

---
*Each template is a starting point. Keep the approval gates until the agent has earned your trust on that workflow.*$md$
WHERE slug = 'workflow-templates-ops' AND unlock_content IS NULL;
