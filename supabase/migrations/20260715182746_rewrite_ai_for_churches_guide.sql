-- Recorded remotely as migration version 20260715182746.
-- Build the primary church/ministry pillar around stewardship, privacy, and
-- human ownership. The duplicate article becomes an unpublished editorial row.

update public.articles
set
  title = 'AI for Churches: A Responsible Ministry Guide',
  excerpt = 'A practical guide to using AI in church operations while protecting pastoral care, confidential data, theological integrity, and human accountability.',
  category = 'Church & Ministry',
  read_minutes = 9,
  body = $article$
Churches can use AI responsibly for low-risk support work such as drafting public announcements, organizing approved nonconfidential notes, preparing checklists, and creating volunteer-role materials. AI should not replace pastoral presence, spiritual discernment, safeguarding, counseling, or consequential decisions about people or money. Start with fictional or public data, require a named human reviewer, document what the tool may access and do, and test the workflow before connecting church systems.

*Reviewed July 15, 2026. This is operational education, not legal, privacy, security, theological, or pastoral advice. Your church should involve the qualified leaders and advisers responsible for those areas.*

## Begin with the stewardship test

The first question is not, "What can this tool automate?" Ask:

> Does this use return time and attention to people while preserving dignity, trust, truth, and accountable human care?

That question changes the first pilot. A tool that formats a public event checklist is different from a system that reads prayer requests, scores people, recommends pastoral responses, or automatically contacts a grieving family.

AI can assist a ministry. It cannot hold a relationship, assume spiritual responsibility, understand a person's full context, or be accountable to a congregation. Keep those distinctions visible in the workflow, the policy, and the language used with members.

## Sort use cases by consequence

The categories below are a starting discussion tool, not a substitute for your church's legal, safeguarding, denominational, insurance, or privacy review.

### Green: start with support work

Good first experiments use public, fictional, or approved nonconfidential information and produce a draft that a person reviews.

- Reformat a public event announcement for different channels.
- Turn an approved public calendar into a checklist.
- Draft a volunteer-role description without member data.
- Summarize a nonconfidential planning document.
- Create questions for a public Bible-study topic, with a ministry leader checking theology and sources.
- Organize supply lists or room-setup instructions.

The AI output remains a draft. A named person checks dates, facts, tone, accessibility, theology where applicable, and whether the communication should be sent at all.

### Yellow: require stronger review and controls

These uses may involve personal information, private systems, people-facing messages, or decisions that could affect participation. Do not move into this category simply because a green pilot worked.

- Drafting individualized follow-up from approved contact data.
- Summarizing internal meeting notes.
- Analyzing attendance or program trends.
- Helping prepare volunteer schedules.
- Searching an internal policy library.
- Categorizing incoming requests for a staff member.

Before a yellow use, define the minimum data needed, vendor terms, access roles, retention, review point, error path, and person who can stop it. Volunteer coordination becomes higher risk when it involves children, vulnerable people, transport, background-check status, keys, credentials, or safeguarding restrictions.

### Red: keep the judgment and relationship human

Do not delegate these responsibilities to an AI system:

- pastoral counseling, crisis response, or spiritual direction;
- interpreting confessions, prayer requests, or care notes to decide a response;
- child safety or safeguarding decisions;
- discipline, membership, hiring, dismissal, or eligibility decisions;
- deciding who receives benevolence or financial assistance;
- approving payments, changing giving records, or moving money;
- making legal, medical, mental-health, or financial recommendations; or
- sending a sensitive personal message without responsible human judgment.

AI may sometimes help an authorized person with low-risk clerical preparation around a sensitive process, but the person remains the decision-maker and should not expose confidential content without an approved basis and control set.

## Inventory the data before choosing a tool

Church records can contain information that people shared in trust: contact details, family relationships, giving history, prayer requests, counseling notes, disability or health information, immigration concerns, background checks, child information, and security plans.

For the proposed workflow, write down:

| Question | Decision to record |
|---|---|
| What exact fields are needed? | Remove everything not required |
| Where does the data come from? | Name the approved system and owner |
| Who may see the input and output? | Use role-based access, not a shared login |
| Does the provider retain or use content? | Verify the current terms for the exact plan |
| Where are logs, backups, and exports kept? | Set access and retention rules |
| How can data be corrected or deleted? | Document the responsible person and process |
| What happens if the tool is unavailable or wrong? | Keep a safe manual path |

Do not paste private ministry data into a general-purpose AI account because the interface feels conversational. Treat the tool as an external system until the responsible people have reviewed the exact product, plan, settings, and agreement.

The [NIST Privacy Framework](https://www.nist.gov/privacy-framework) is a voluntary, organization-level tool for identifying and managing privacy risk. It can help leadership ask systematic questions without pretending that one checklist creates legal compliance.

## Review the vendor, not only the demo

A useful vendor review asks for evidence about:

- whether prompts, files, outputs, and feedback are used to train or improve models;
- retention defaults and available controls;
- deletion and export processes;
- encryption, authentication, roles, and administrator controls;
- audit logs and incident notification;
- subprocessors and data locations;
- integrations and the permissions each connection receives;
- differences between free, individual, team, nonprofit, and enterprise plans;
- contractual commitments versus marketing statements; and
- how the church can disable access and retrieve its information.

Terms and features change. Record the plan name, review date, reviewer, source links, and approved settings. Recheck when the provider, plan, integration, or use case changes.

Do not accept a vague claim that a product is "secure," "private," or "compliant" as the full review. Security and compliance depend on configuration, contract, workflow, data, jurisdiction, and the church's own practices.

## Put a person at every consequential boundary

For each workflow, name:

- the ministry owner;
- the data owner;
- the person who reviews output;
- the actions the tool cannot take;
- the actions requiring approval;
- the escalation destination;
- the person who can pause the workflow; and
- the schedule for reviewing performance and access.

Approval should apply to a specific visible action. "A person is somewhere in the process" is not enough. If a draft will be sent, the reviewer should see the recipient, content, attachments, and channel before approving it.

Read [Human-in-the-Loop Patterns for AI Agents](/knowledge/human-in-the-loop-patterns-for-agents) and [Guardrails and Safety](/knowledge/guardrails-and-safety) before connecting email, calendars, member systems, or messaging platforms.

## Run a disconnected first pilot

Choose one green use case and keep it away from live systems.

1. **Write the outcome.** Example: turn an approved fictional event brief into a staff checklist.
2. **Write the boundaries.** Public or fictional data only; draft only; no sending, scheduling, or record changes.
3. **Choose an owner and reviewer.** One person owns the result and can stop the pilot.
4. **Build representative tests.** Include missing dates, conflicting instructions, unclear ownership, and a request to invent information.
5. **Score observable behavior.** Check facts, source use, format, invented details, escalation, review time, and usefulness.
6. **Document failures.** Revise one part of the workflow and rerun the same cases.
7. **Decide whether to stop, continue, or seek a stronger review.** A promising draft does not authorize access to member data.

Use [How to Evaluate an AI Agent](/knowledge/evaluating-agents-evals) to build the test record.

## Write a short church AI-use policy

A first policy can be brief if it makes real decisions. Include:

1. **Purpose:** Why the church uses AI and the values that govern it.
2. **Approved uses:** Named tools, plans, teams, and use cases.
3. **Prohibited uses:** Pastoral, safeguarding, financial, personnel, and data boundaries.
4. **Data rules:** What may never be entered and who approves exceptions.
5. **Human review:** Who owns accuracy, theology, tone, and action approval.
6. **Transparency:** When staff, volunteers, members, or the public will be told.
7. **Security and incidents:** Access, logs, reporting, pause, and response steps.
8. **Review cadence:** Who revisits the policy and vendor settings.

The policy should cover staff and volunteers. Train people with examples, because "do not enter sensitive information" can mean different things to different users.

The [AI Policy Template Pack](/products/ai-policy-template-pack) can provide a starting structure, but leadership and qualified advisers should adapt it to the church's actual systems, obligations, and theology.

## Protect theological integrity and trust

AI can summarize inaccurately, invent citations, flatten denominational differences, or reproduce a familiar interpretation without understanding why it matters. For teaching and sermon support:

- verify every quotation and reference in the original source;
- distinguish direct quotation, summary, and AI suggestion;
- check the context around a verse or historical claim;
- use sources your ministry considers responsible;
- keep discernment, authorship, and final teaching with the human leader; and
- do not present generated language as a testimony, lived experience, or pastoral insight the leader did not have.

Transparency does not require a dramatic disclaimer on every internal checklist. It does require honesty where AI materially shapes a public message, personal interaction, or decision. Define that line in the church's policy and make it understandable to the congregation.

## Measure ministry fit, not only speed

Review the pilot with both operational and trust measures:

- accepted drafts and rejected drafts;
- factual or theological corrections;
- human review minutes;
- invented details or unsupported claims;
- inappropriate actions or missing escalations;
- privacy, access, or security incidents;
- staff and volunteer feedback;
- member confusion or complaints; and
- whether the workflow returned time to relational ministry.

If people spend more time correcting generic language, defending a confusing interaction, or managing risk, the tool has not served the mission even if it generated text quickly.

Continue with the [Build for Ministry and Nonprofit learning path](/paths/build-for-ministry-nonprofit). If you inspect the [Volunteer Coordinator Agent](/agents/volunteer-coordinator-agent), treat it as a workflow blueprint until its required connections, permissions, setup, and human approvals are explicitly configured.

## Frequently asked questions

### What is the best first AI use for a church?

Choose a low-risk drafting or organizing task that uses public, fictional, or approved nonconfidential information. A public-event checklist or volunteer-role description is safer than personal follow-up or member-data analysis.

### Can AI write sermons?

It can generate language and assist with research, but the ministry leader remains responsible for interpretation, sources, discernment, authorship, and what is taught. Verify every quotation and factual claim in the original source.

### Can a church put prayer requests into an AI tool?

Treat prayer requests as sensitive. Do not enter them into a general AI service. Any proposed use involving confidential care information needs explicit review of purpose, consent or other authority, vendor terms, access, retention, security, and the church's legal and pastoral responsibilities.

### Can AI schedule volunteers?

It can help prepare a draft from approved availability data. A responsible person should review assignments, conflicts, safeguarding restrictions, qualifications, and communications before anything is finalized or sent.

### Does using a business or enterprise AI plan make the workflow compliant?

No plan name creates universal compliance. Review the current contract, settings, data flow, integrations, laws, insurance requirements, and church practices with qualified people.

## Primary sources and frameworks

- [NIST: AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [NIST: Generative AI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence)
- [NIST: Privacy Framework](https://www.nist.gov/privacy-framework)
- [OpenAI: A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
$article$,
  author_id = coalesce(
    (select id from public.authors where slug = 'mit-editorial' limit 1),
    author_id
  ),
  updated_at = now()
where slug = 'ai-in-ministry-a-gentle-start';

update public.articles
set
  published = false,
  status = 'draft'::public.publish_status,
  scheduled_at = null,
  updated_at = now()
where slug = 'ai-agents-for-ministry';

update public.learning_path_items
set item_slug = 'ai-in-ministry-a-gentle-start'
where item_type = 'article'
  and item_slug = 'ai-agents-for-ministry';
