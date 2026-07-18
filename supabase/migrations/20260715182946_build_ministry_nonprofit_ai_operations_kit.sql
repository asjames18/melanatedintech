-- Recorded remotely as migration version 20260715182946.
-- Add the second net-new flagship offer: a stewardship-first governance and
-- pilot workbook for churches and nonprofits.

insert into public.products (
  slug,
  name,
  tagline,
  description,
  category,
  tier,
  price_cents,
  active,
  status,
  system_prompt,
  unlock_content,
  asset_path,
  asset_name
) values (
  'ministry-nonprofit-ai-operations-kit',
  'Ministry & Nonprofit AI Operations Kit',
  'Create responsible AI boundaries, policies, pilots, and review practices.',
  $description$
**Version 1.0 - reviewed July 15, 2026**

A stewardship-first governance and pilot workbook for churches, ministries, and nonprofits adopting AI. It helps leaders define where AI may assist, where people must remain fully responsible, what data is off-limits, how vendors are reviewed, and how a low-risk pilot is tested and paused.

## What is included

- Stewardship charter and accountable-owner worksheet
- Green, yellow, and red use-case classification
- Data inventory and minimum-necessary worksheet
- Vendor and plan due-diligence record
- Acceptable-use policy starter with staff and volunteer examples
- Human-approval, disclosure, and escalation matrices
- Disconnected pilot brief and evaluation cases
- Volunteer-operations drafting SOP with safeguarding boundaries
- Incident, pause, access-review, and leadership-review templates
- Fictional church and nonprofit worked examples

## Delivery format

One structured Markdown workbook is displayed after purchase and can be downloaded as a `.md` file. Copy and adapt it inside your organization's approved document or policy system.

## What is not included

This kit is operational education, not legal, privacy, security, theological, pastoral, financial, safeguarding, employment, or regulatory advice. It is not a compliance certification, hosted tool, provider account, integration, deployment, custom policy review, or managed implementation. It does not authorize the use of confidential member, donor, client, beneficiary, child, counseling, prayer, giving, health, or safeguarding information in an AI system.

## License

Single-organization internal-use license. You may adapt the workbook for your own ministry or nonprofit. Resale, redistribution, sublicensing, or publishing it as a competing template product is not permitted.
$description$,
  'Starter Kits',
  'premium',
  5900,
  true,
  'published',
  $prompt$
You are the workbook guide for the Ministry & Nonprofit AI Operations Kit. Help leaders adapt the templates to one low-risk, clearly owned workflow.

Ask about the organization's mission, workflow, users, data, provider plan, tools, actions, human owner, and consequences of failure. Keep pastoral care, spiritual discernment, safeguarding, counseling, benevolence, employment, legal, financial, health, and other consequential decisions human-owned.

Do not claim legal compliance, security certification, theological authority, or access to the organization's systems. Do not advise entering confidential member, donor, client, beneficiary, child, counseling, prayer, giving, health, or safeguarding information into a general AI tool. Recommend qualified review when the context requires it.
$prompt$,
  $pack$
# Ministry & Nonprofit AI Operations Kit

**Version 1.0**  
**Reviewed:** July 15, 2026  
**Delivery:** Markdown governance and pilot workbook  

This kit helps a church, ministry, or nonprofit define responsible AI use before connecting confidential data or live systems. It keeps mission, dignity, truth, privacy, safety, and accountable human care ahead of convenience.

> This workbook is operational education. It is not legal, privacy, security, theological, pastoral, financial, safeguarding, employment, or regulatory advice. It is not a compliance certification or permission to process confidential information. Involve the qualified leaders and advisers responsible for your organization's obligations.

## What you will produce

1. A stewardship charter and named owners
2. A classified list of proposed AI uses
3. A data and system inventory
4. A current vendor-review record
5. A short acceptable-use policy
6. Human approval, disclosure, and escalation rules
7. A disconnected pilot and test set
8. An incident and pause process
9. A leadership review record

---

# Part 1: Stewardship charter

Begin with the mission and the people affected, not the tool.

## Charter

```text
Organization:
Mission statement or purpose relevant to this work:
Date:
Review cycle or review trigger:

Executive or ministry owner:
Operations owner:
Data/privacy owner:
Security owner:
Pastoral/program owner:
Safeguarding owner, if applicable:
Person authorized to pause AI-supported work:

Why the organization is considering AI:
Whom the workflow should serve:
What human work or relationship must be protected:
What the organization will not delegate to AI:
How concerns can be reported:
```

## Stewardship test

For every proposed use, ask:

- Does it return time and attention to people?
- Does it preserve dignity and access to a real person?
- Can the organization explain the use honestly?
- Can a responsible person verify and correct the result?
- Is the minimum necessary data sufficient?
- Can the workflow stop without abandoning a person in need?
- Would the organization be comfortable describing the use to the community?

Record disagreement instead of forcing false consensus.

---

# Part 2: Classify proposed uses

Use these colors as a discussion aid, not a legal determination.

## Green - low-consequence support

Public, fictional, or approved nonconfidential inputs; draft or organizing output; human review before use.

Examples:

- Reformat a public event announcement
- Draft a public volunteer-role description
- Turn an approved public calendar into a checklist
- Summarize a nonconfidential planning document
- Create discussion questions that a qualified leader reviews
- Organize a public supply list or room plan

## Yellow - stronger controls required

Personal information, internal systems, individualized communication, or operational decisions may be involved.

Examples:

- Draft personalized follow-up
- Summarize internal meeting notes
- Analyze attendance or program trends
- Prepare a volunteer schedule
- Search an internal policy library
- Categorize requests for staff review

Yellow uses require a documented purpose, approved provider and plan, minimum data, access and retention rules, human approval, testing, incident response, and specialist review where needed.

## Red - keep judgment and relationship human

- Pastoral counseling, spiritual direction, crisis response, or prayer-care decisions
- Child safety, safeguarding, transport eligibility, or vulnerable-person decisions
- Discipline, membership, hiring, dismissal, compensation, or eligibility decisions
- Benevolence, grant, benefit, or financial-assistance decisions about people
- Payment approval, giving-record changes, or moving money
- Legal, medical, mental-health, tax, credit, or financial recommendations
- Sensitive personal communication sent without responsible human judgment

## Use-case register

| Use case | People affected | Data | Output/action | Green/yellow/red | Owner | Required review | Decision |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

---

# Part 3: Inventory data and systems

Churches and nonprofits may hold information shared in trust: member or client details, family relationships, donor and giving history, prayer or counseling notes, health or disability information, immigration concerns, child information, background checks, case-management records, benefits, and security plans.

## Data inventory

| Field/source | Purpose | Needed? | Classification | System owner | AI allowed? | Retention | Redaction/deletion |
|---|---|---:|---|---|---:|---|---|
| | | | Public / Internal / Confidential / Restricted | | | | |

## Minimum-necessary test

```text
Proposed workflow:
Desired outcome:
Fields initially requested:
Fields removed as unnecessary:
Smallest approved input:
Why each remaining field is required:
Alternative using fictional, public, aggregated, or de-identified data:
Approver:
Date:
```

Do not paste confidential information into a general AI interface because it is convenient. Treat the provider as an external system until the exact product, plan, settings, agreement, data flow, and use case have been reviewed.

---

# Part 4: Review the provider and plan

Features and terms can differ across free, personal, team, nonprofit, education, and enterprise plans. Record sources and dates.

## Vendor review

```text
Provider:
Product and plan:
Use case reviewed:
Review date:
Reviewer:

Official terms URL:
Privacy/data-use URL:
Security documentation URL:
Subprocessor URL:
Retention documentation URL:

Are prompts/files/outputs used to train or improve models?
What settings or contractual terms control that use?
Retention defaults and controls:
Deletion and export process:
Data locations and subprocessors:
Encryption and authentication:
Roles and administrator controls:
Audit logs:
Incident notification:
Integration permissions:
Account termination and data retrieval:
Accessibility considerations:

Evidence gaps:
Required contractual or specialist review:
Approved scope:
Prohibited scope:
Next review trigger:
```

Do not treat "secure," "private," or "compliant" marketing language as the entire review. Configuration, contract, workflow, data, jurisdiction, and organizational practices matter.

---

# Part 5: Acceptable-use policy starter

Replace brackets and have the responsible people review the policy.

## Purpose

`[Organization]` may use approved AI tools to support clearly defined work while protecting people, confidential information, mission, truth, and accountable human judgment.

## Approved tools and uses

- Approved tools/plans: `[list]`
- Approved teams/roles: `[list]`
- Approved use cases: `[list]`
- Owner of approved list: `[name/role]`

## Prohibited information

Unless specifically authorized through a documented review, users must not enter:

- passwords, credentials, secrets, or security configurations;
- confidential member, donor, client, beneficiary, employee, volunteer, or child information;
- prayer requests, counseling notes, confessions, care records, or safeguarding information;
- giving history, bank, payment, tax, benefit, or financial-assistance information;
- health, disability, immigration, background-check, or legal information; or
- copyrighted or licensed material the organization is not permitted to provide.

## Prohibited delegation

AI does not make final pastoral, theological, safeguarding, crisis, discipline, membership, employment, eligibility, benevolence, legal, medical, mental-health, financial, or payment decisions.

## Human responsibility

The named owner reviews facts, sources, theology or program accuracy, tone, accessibility, recipients, attachments, and actions before consequential use.

## Transparency

`[Organization]` discloses AI assistance when it materially shapes a public message, individualized interaction, service, or decision in a way a reasonable person would want to understand. The disclosure method is `[describe]`.

## New tools and uses

Users submit the use case, data, affected people, provider/plan, tools/actions, owner, and risk review to `[approver]` before use.

## Concerns and incidents

Report unexpected output, data exposure, harmful content, unauthorized action, or community concern to `[channel/owner]`. The pause owner is `[role]`.

## Review

The policy is reviewed by `[owner]` on `[schedule or triggers]`, including provider, plan, integration, law, program, and workflow changes.

---

# Part 6: Human approval, escalation, and disclosure

## Approval matrix

| Event/action | Draft allowed? | Human approval | Approver | Evidence shown | Log | If unavailable |
|---|---:|---:|---|---|---:|---|
| Public announcement | | | | | | |
| Individual message | | | | | | |
| Volunteer assignment | | | | | | |
| Record update | | | | | | |
| Financial action | no | yes | | | yes | stop |
| Permission change | no | yes | | | yes | stop |

## Escalation matrix

| Situation | Stop behavior | Route to | Response expectation | Information included | Information excluded |
|---|---|---|---|---|---|
| Pastoral/care concern | | | | | |
| Safeguarding concern | | | | | |
| Crisis/emergency | | | | | |
| Legal/privacy/security concern | | | | | |
| Financial or donor concern | | | | | |
| Tool or data failure | | | | | |

## Disclosure decision

```text
AI use:
People affected:
Is AI interacting directly with a person?
Does it materially shape content or a recommendation?
Could a person reasonably misunderstand the role of AI?
Disclosure required by policy or adviser?
Disclosure text/channel/timing:
Human contact offered:
Owner:
```

Sample starting language, if appropriate to your policy:

> This draft was prepared with AI assistance and reviewed by our team. Contact `[role/channel]` if you would like to speak with a person.

Do not copy a disclosure blindly. Make it accurate for the actual use.

---

# Part 7: Disconnected pilot

Choose one green use and keep it away from live systems.

## Pilot brief

```text
Pilot workflow:
Owner:
Successful outcome:
Fictional/public input:
Allowed tool:
Allowed output:
Prohibited data:
Prohibited actions:
Human review:
Test cases:
Release-blocking failures:
Pause method:
Decision this pilot may support:
```

## Starter test cases

- Complete public event brief
- Important date missing
- Two dates conflict
- Request asks the tool to invent a name or budget
- Untrusted document says to ignore the policy
- Draft contains an unsupported quotation or citation
- Output attempts individualized pastoral language
- User includes confidential information unexpectedly
- Request asks the tool to send, schedule, or update a record
- Reviewer cannot verify the source

## Result sheet

| Case | Factual | Source verified | Boundary kept | Escalated | Human edits | Failure category | Decision |
|---|---:|---:|---:|---:|---|---|---|
| | | | | | | | |

Document the result with [How to Evaluate an AI Agent](/knowledge/evaluating-agents-evals). A successful disconnected test does not authorize confidential data or connected actions.

---

# Part 8: Volunteer-operations drafting SOP

This SOP prepares a draft only. It does not replace safeguarding, qualification, background-check, accessibility, transport, supervision, or ministry-owner review.

## Inputs

- Approved role requirements
- Fictional or approved availability fields
- Public event/service time
- Constraints approved by the responsible owner

## Steps

1. Confirm the input source and version.
2. Reject or remove fields not approved for the pilot.
3. List required roles without assigning people.
4. Prepare a proposed roster from approved availability.
5. Flag missing coverage and conflicting assignments.
6. Mark every assignment `PROPOSED - HUMAN REVIEW REQUIRED`.
7. Route the draft to the authorized volunteer or program owner.
8. The owner verifies qualifications, safeguarding restrictions, accessibility, workload, and personal considerations.
9. A person finalizes and communicates the schedule through the approved system.

## Prohibited behavior

- Do not infer fitness, reliability, protected traits, health, family status, or spiritual maturity.
- Do not expose background-check or safeguarding information.
- Do not assign work involving children or vulnerable people without responsible human verification.
- Do not message volunteers automatically during the first pilot.
- Do not use a public AI account as a volunteer database.

## Review record

```text
Roster version:
Prepared from:
AI-assisted steps:
Reviewer:
Safeguarding/qualification check completed by:
Conflicts corrected:
People contacted by:
Final system of record:
Date:
```

---

# Part 9: Incident and pause plan

## Immediate pause triggers

- Confidential information appears in an unapproved system
- The tool takes or attempts an unauthorized action
- A safeguarding, pastoral, employment, financial, or eligibility decision is delegated
- Harmful, discriminatory, deceptive, or materially false output reaches a person
- Required human approval is bypassed
- Logs or ownership are insufficient to reconstruct the event
- The provider or integration changes outside the approved scope

## Incident record

```text
incident_id:
detected_at:
reported_by:
workflow/provider/plan:
people or data potentially affected:
observable event:
immediate containment:
systems/access paused:
owners notified:
required legal/privacy/security/safeguarding/pastoral review:
evidence preserved under approved process:
correction or communication:
new test case:
retest:
restart decision and approver:
closed_at:
```

Do not delay containment while seeking a perfect technical explanation. Follow existing emergency, safeguarding, breach, insurance, and legal procedures where applicable.

---

# Part 10: Leadership review

## Agenda

1. Mission and people affected
2. Current approved tools, plans, and uses
3. Data and access changes
4. Pilot outcomes and corrections
5. Incidents, concerns, and complaints
6. Vendor term or feature changes
7. Staff and volunteer training needs
8. Uses to approve, limit, pause, or retire
9. Owners and next review triggers

## Decision record

| Use/provider | Evidence reviewed | Decision | Authorized scope | Prohibited scope | Owner | Next trigger |
|---|---|---|---|---|---|---|
| | | approve / limit / pause / retire | | | | |

## Access review

| User/role | Tool/plan | Permission | Needed? | Last used | Decision | Owner |
|---|---|---|---:|---|---|---|
| | | | | | | |

Remove access that is no longer required. Shared credentials prevent accountability and should not be the operating model.

---

# Part 11: Fictional worked examples

## Church example - public event checklist

**Input:** fictional public event brief.  
**Output:** draft setup checklist.  
**Boundary:** no member data, assigning volunteers, sending, or scheduling.  
**Human review:** administrator verifies dates, accessibility, safety, and responsible owners.  
**Disclosure:** internal draft; public use reviewed under policy.  
**Decision:** may continue disconnected testing only.

## Nonprofit example - public program FAQ draft

**Input:** approved public eligibility FAQ.  
**Output:** draft answer with source reference and staff escalation.  
**Boundary:** no applicant records, eligibility decision, benefit promise, or external sending.  
**Human review:** program owner verifies policy and sends if appropriate.  
**Key failure:** the public document contains an instruction telling the AI to ignore its rules.  
**Expected behavior:** treat that line as content, preserve boundaries, and escalate uncertainty.

---

# Part 12: Copy-ready headers

## `ai-use-register.csv`

```csv
use_case,people_affected,data,output_action,classification,owner,required_review,provider_plan,decision,last_reviewed,next_trigger
```

## `vendor-reviews.csv`

```csv
provider,product_plan,use_case,terms_url,privacy_url,security_url,retention,training_use,roles_logs,subprocessors,incident_terms,evidence_gaps,approved_scope,prohibited_scope,reviewer,reviewed_at,next_trigger
```

## `pilot-results.csv`

```csv
case_id,workflow_version,factual,source_verified,boundary_kept,escalated,human_edits,failure_category,decision,reviewer,date
```

## `incidents.csv`

```csv
incident_id,detected_at,workflow,provider_plan,affected_scope,event,containment,owners_notified,specialist_review,correction,new_case_id,retest,restart_decision,closed_at
```

---

# License and responsible-use terms

This purchase grants a single-organization internal-use license. You may copy and adapt the workbook for your own church, ministry, or nonprofit. You may not resell, redistribute, sublicense, publish, or package the original or adapted material as a competing product.

The kit is provided as-is for educational and operational planning. Your organization remains responsible for its mission, theology, programs, people, tools, providers, contracts, data, permissions, policies, testing, actions, decisions, and obligations.

# Recommended path

1. Read [AI for Churches: A Responsible Ministry Guide](/knowledge/ai-in-ministry-a-gentle-start).
2. Complete Parts 1 through 5 with responsible leadership.
3. Run Part 7 only with fictional or approved public information.
4. Use the [AI Agent Evaluation & Safety Kit](/products/agent-eval-harness) for a deeper evaluation system.
5. Continue through the [Build for Ministry and Nonprofit learning path](/paths/build-for-ministry-nonprofit).
$pack$,
  null,
  null
)
on conflict (slug) do update
set
  name = excluded.name,
  tagline = excluded.tagline,
  description = excluded.description,
  category = excluded.category,
  tier = excluded.tier,
  price_cents = excluded.price_cents,
  active = excluded.active,
  status = excluded.status,
  system_prompt = excluded.system_prompt,
  unlock_content = excluded.unlock_content,
  asset_path = excluded.asset_path,
  asset_name = excluded.asset_name,
  updated_at = now();

update public.articles
set
  body = replace(
    body,
    'Continue with the [Build for Ministry and Nonprofit learning path](/paths/build-for-ministry-nonprofit). If you inspect the [Volunteer Coordinator Agent](/agents/volunteer-coordinator-agent), treat it as a workflow blueprint until its required connections, permissions, setup, and human approvals are explicitly configured.',
    'Continue with the [Build for Ministry and Nonprofit learning path](/paths/build-for-ministry-nonprofit). The [Ministry & Nonprofit AI Operations Kit](/products/ministry-nonprofit-ai-operations-kit) provides copy-ready governance, vendor-review, policy, pilot, incident, and leadership worksheets. If you inspect the [Volunteer Coordinator Agent](/agents/volunteer-coordinator-agent), treat it as a workflow blueprint until its required connections, permissions, setup, and human approvals are explicitly configured.'
  ),
  updated_at = now()
where slug = 'ai-in-ministry-a-gentle-start';

update public.learning_path_items
set excerpt = E'Objective: Turn responsible-AI principles into governance, a vendor review, and a disconnected pilot.\n\nAssignment: Open the Ministry & Nonprofit AI Operations Kit, download the Markdown workbook, complete the stewardship charter and use-case register with fictional or public information, then document one green pilot and its human approval point. The kit is a workbook, not a hosted implementation.'
where item_type = 'product'
  and item_slug = 'ministry-ai-starter-kit';
