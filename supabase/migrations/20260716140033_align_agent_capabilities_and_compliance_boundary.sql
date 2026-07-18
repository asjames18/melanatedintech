-- Align card-level capability labels and the remaining free-agent description
-- with the browser chat that exists today. Do not imply connected systems,
-- persistent monitoring, or authority to take external actions.

update public.agents
set
  description = $description$
A browser-based policy-review assistant that compares text you provide with supplied policies, checklists, and approval rules. It helps prepare review notes; it is not a compliance certification service.

## What works on the site now

- Paste a redacted draft plus the policy or checklist it should follow.
- Identify possible missing disclosures, inconsistent language, and questions for an owner.
- Prepare a plain-English review summary and a suggested approval checklist.

## What requires external setup

Direct access to company records, document systems, approval tools, audit logs, regulatory databases, or monitoring systems is not included. Connections require your own accounts, APIs, authentication, permissions, testing, and deployment. The agent only knows the context supplied in the chat and can miss requirements.

## Human review boundary

A qualified person must decide whether a document or process satisfies legal, regulatory, contractual, privacy, security, or organizational requirements. The agent cannot certify compliance, approve work, route approvals, or create an authoritative audit trail from this site.
$description$,
  capabilities = array[
    'Policy checklist review',
    'Disclosure and claim flagging',
    'Approval-plan drafts',
    'Audit-summary drafts'
  ],
  updated_at = now()
where slug = 'compliance-ops-agent';

update public.agents
set
  capabilities = array[
    'Ticket classification',
    'Knowledge-base grounded drafts',
    'Refund-case summaries',
    'Tone-matched reply drafts'
  ],
  updated_at = now()
where slug = 'customer-support-agent';

update public.agents
set
  capabilities = array[
    'Audience hypothesis drafts',
    'Channel plan drafts',
    'Message and angle options',
    'Content calendar drafts',
    'KPI planning'
  ],
  updated_at = now()
where slug = 'marketing-campaign-strategist';

update public.agents
set
  capabilities = array[
    'Priority triage from pasted messages',
    'Voice-matched reply drafts',
    'Task and date extraction',
    'Follow-up list extraction',
    'Inbox brief from supplied context'
  ],
  updated_at = now()
where slug = 'pa-inbox-zero';

update public.agents
set
  capabilities = array[
    'Inbox triage from pasted messages',
    'Meeting prep from supplied context',
    'Daily brief drafts',
    'Commitment list extraction'
  ],
  updated_at = now()
where slug = 'personal-chief-of-staff';
