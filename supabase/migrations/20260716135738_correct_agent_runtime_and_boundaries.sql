-- Production exposes an OpenRouter key but no direct OpenAI key. Store explicit
-- runtime prefixes so paid agents use the configured provider path. At the same
-- time, replace integration claims with accurate works-now/setup/review boundaries.

update public.agents
set
  model = case
    when tier = 'free'::public.agent_tier then 'openrouter/openrouter/free'
    else 'openrouter/openai/gpt-4o-mini'
  end,
  updated_at = now()
where active = true
  and status = 'published'::public.publish_status
  and model = 'gpt-4o-mini';

update public.agents
set
  description = $description$
A browser-based support drafting assistant for triage, reply drafts, summaries, and escalation notes. It is a guided workspace, not a preconnected help-desk automation.

## What works on the site now

- Paste a redacted customer message and approved policy or help-center excerpts into the chat.
- Classify the request, summarize the issue, and prepare a reply draft.
- Identify missing facts and recommend escalation when the request is sensitive or outside the supplied policy.

## What requires external setup

Direct access to a help desk, customer database, knowledge base, billing system, email account, or refund tool is not included. Those connections require your own accounts, APIs, authentication, permissions, testing, and deployment. Do not paste passwords, payment details, or unnecessary personal information into the chat.

## Human review boundary

A person must verify customer facts and approve every message, refund, account change, promise, escalation, and ticket closure. The agent cannot issue refunds or contact customers from this site.
$description$,
  updated_at = now()
where slug = 'customer-support-agent';

update public.agents
set
  description = $description$
A browser-based campaign planning assistant that turns an approved brief and pasted context into audience hypotheses, channel options, draft creative briefs, and measurement plans.

## What works on the site now

- Paste a campaign brief, brand guidance, offer details, and available performance data.
- Produce a draft channel plan, message angles, content ideas, and a measurement framework.
- Mark claims and assumptions that need evidence before use.

## What requires external setup

Connections to advertising accounts, email platforms, analytics, customer data, social schedulers, and publishing systems are not included. Budget allocation and performance targets are planning examples until checked against your own data. External automation requires separate accounts, permissions, integrations, and testing.

## Human review boundary

A person must approve audience targeting, claims, creative, budgets, privacy choices, legal disclosures, and every publish or spend action. The agent cannot launch campaigns, buy media, or guarantee conversion results from this site.
$description$,
  updated_at = now()
where slug = 'marketing-campaign-strategist';

update public.agents
set
  description = $description$
A browser-based planning assistant for daily briefs, meeting preparation, decision memos, and commitment tracking from context you choose to provide.

## What works on the site now

- Paste redacted calendar details, goals, notes, and task lists into the chat.
- Draft a daily brief, meeting prep sheet, priority list, or follow-up checklist.
- Surface missing information and possible schedule conflicts for your review.

## What requires external setup

Direct inbox, calendar, contact, task-manager, meeting-transcript, or company-system access is not included. Any connection requires your own accounts, APIs, authentication, permissions, and deployment. Avoid sharing confidential information that is not necessary for the task.

## Human review boundary

A person must approve every message, meeting change, commitment, deadline, delegation, and decision. The agent cannot send, schedule, accept, decline, or commit on your behalf from this site.
$description$,
  updated_at = now()
where slug = 'personal-chief-of-staff';

update public.agents
set
  description = $description$
A browser-based inbox triage and drafting assistant. It helps organize messages you provide, prepare reply drafts, extract tasks and dates, and identify threads that may need attention.

## What works on the site now

- Paste a redacted message or thread into the chat.
- Classify it, summarize the request, and prepare a reply or handoff draft.
- Extract proposed tasks, dates, and waiting-on items for your review.

## What requires external setup

Direct mailbox access, background monitoring, automatic labels, archives, unsubscribe actions, and sending are not included. Those capabilities require your own email account, provider API, authentication, permissions, and deployment. Do not paste passwords or unnecessary sensitive data.

## Human review boundary

You must verify recipients, facts, tone, attachments, dates, and commitments before sending or changing anything. The agent cannot send, delete, archive, unsubscribe, or modify your mailbox from this site.
$description$,
  updated_at = now()
where slug = 'pa-inbox-zero';
