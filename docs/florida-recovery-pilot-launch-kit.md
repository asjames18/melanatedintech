# Florida Recovery Pilot Launch Kit

Updated: August 11, 2026

## First commercial wedge

Concentrate the first outbound cycle on owner-led landscaping, cleaning, pest-control, and pool-service businesses in Sebring, Avon Park, Lake Placid, Highlands County, and adjacent Central Florida markets. Accept qualified inbound work nationwide, but keep outbound personalization local until the first repeatable case studies exist.

The offer is the **30-Day Recovery Pilot, starting at $1,500**:

- One measurable revenue leak.
- One location or business unit.
- One primary scheduling or CRM platform.
- One primary communication channel.
- Configuration, testing, staff handoff, and 30 days of monitoring.
- A baseline and completion report.
- 50% deposit before implementation and 50% at launch or the agreed acceptance milestone.
- Third-party software and usage charges billed separately.

Managed Automation Care starts at $500 per month after a successful pilot.

## Qualification rules

Score each opportunity before offering a live demo. A score of 7–10 is a strong fit, 5–6 needs a tightly bounded scope, and 0–4 should remain in nurture.

| Signal | Points | Evidence |
| --- | ---: | --- |
| Owner-led team with roughly 2–20 employees | 2 | Public team information or prospect confirmation |
| At least 50 relevant inquiries or active customers per month | 2 | Qualification form |
| Clear recurring, follow-up, route-gap, or reactivation leak | 2 | Qualification form and demo discussion |
| Existing CRM, field-service, or booking platform | 1 | Qualification form |
| Wants implementation within 90 days | 1 | Qualification form |
| Budget begins at $1,500 | 1 | Qualification form |
| Staff member owns escalations and exceptions | 1 | Proposal review |

Disqualify or pause opportunities that require revenue guarantees, bulk messaging without consent, unsafe autonomous decisions, credential sharing outside approved access, or a custom platform before the first workflow has been proven.

## Personalized outreach sequence

Do not mass-send the same message. Confirm the business is operating, verify its public contact method, and include one observation from its own website.

### Day 0 — short relevance message

Subject: `A follow-up idea for [Business Name]`

> Hi [Name], I’m based in Sebring and noticed that [specific service/recurring offer from their website]. I build small recovery systems for local service companies—things like turning completed one-time work into recurring service, reactivating seasonal customers, or following up when a quote goes quiet.
>
> I made a short fictional workflow that shows the customer and staff handoffs without claiming it is your current process: [relevant demo URL]. If that leak exists for your team, the fixed-scope pilot starts at $1,500. Would it be useful for me to map one workflow to the software you already use?

### Day 3 — operational example

> One practical example for [Business Name]: after a completed [service], the system can wait for the approved interval, offer the relevant recurring option, and send interested replies to a person before anything is committed. The result tracked is a recurring plan—not opens or AI activity. Here is the 90-second version: [demo URL].

### Day 7 — scope and price clarity

> The 30-day pilot is intentionally narrow: one leak, one location, one main platform, and one primary channel. It starts at $1,500 with a 50% deposit. If that does not match your priorities, no problem—just reply “not now” and I’ll close the loop.

### Day 14 — final follow-up

> I’m closing the loop on this. If recovering [specific event] becomes a priority later, the demo will stay available here: [demo URL]. I won’t continue following up unless you ask me to.

Honor every opt-out immediately. Do not use purchased consumer lists or imply an existing relationship.

## Demo-to-deposit workflow

1. Prospect completes `/get-a-demo` or replies to personalized outreach.
2. Review the admin lead record and score the opportunity.
3. Set the lead to `reviewing`, then `qualified` when it reaches the fit threshold.
4. Send the relevant fictional demo and mark `demo_sent`.
5. Confirm the leak, platform, owner, consent rules, escalation path, and measurable event.
6. Create the fixed-scope invoice in the existing invoice manager and link its invoice number to the lead.
7. Set `proposal_sent`, then `deposit_pending` when the payment link is delivered.
8. Stripe confirmation advances the linked opportunity and records the non-identifying `deposit_paid` event.
9. Do not request production credentials or begin configuration before payment and written scope acceptance.

## Proposal template

Every proposal must state:

- Business outcome: the single event being improved.
- Baseline: how the current event count and follow-up delay will be measured.
- Trigger: the exact system or staff action that starts the workflow.
- Allowed actions: approved messages, timing windows, and data updates.
- Human handoffs: conditions that stop automation and notify staff.
- Systems in scope: one primary platform and approved communication provider.
- Exclusions: additional locations, channels, call answering, data cleanup, and custom integrations not explicitly listed.
- Acceptance: test scenarios, staff approval, and the launch milestone.
- Commercial terms: starting price, 50/50 payment, third-party charges, change requests, and no revenue guarantee.
- Data handling: minimum necessary access, retention, credential ownership, consent, and opt-out responsibilities.

## Delivery checklist

### Before configuration

- Record the baseline and success event.
- Confirm the customer owns all production accounts.
- Use delegated access or a password manager; never request credentials by email.
- Document messaging consent source, quiet hours, opt-out keywords, and A2P requirements where applicable.
- Identify safety-sensitive, pricing, scheduling, and complaint cases that always reach a person.
- Confirm native platform features before adding custom automation.

### Before launch

- Test happy path, opt-out, invalid contact data, duplicate trigger, provider outage, delayed event, and human escalation.
- Confirm idempotency so the same customer event does not send duplicate messages.
- Confirm failure alerts have an owner and response expectation.
- Verify analytics contain service model and event status only—not names, emails, phone numbers, or message content.
- Obtain written approval of final templates, timing, and staff handoff.

### During the 30 days

- Review failures and escalations at least twice weekly.
- Report attempted contacts, successful responses, staff handoffs, and measured business events separately.
- Do not attribute revenue that cannot be tied to the agreed workflow event.
- Log scope requests for a later proposal instead of silently expanding the pilot.

### Completion

- Compare the completion period with the documented baseline and note limitations.
- Deliver a workflow map, account/access inventory, message templates, exception list, and monitoring summary.
- Offer Managed Automation Care from $500 per month only when continued monitoring has a clear owner and value.

## Launch metrics

Track weekly:

- Prospects researched and individually contacted.
- Demo-page visits and completions.
- Qualification submissions.
- Qualified-opportunity rate.
- Proposals and deposits.
- Median days from first contact to deposit.
- Pilot delivery hours and third-party cost.
- Measured recovery events by system.
- Pilots converted to managed care.
- Loss reasons and repeated objections.

The first expansion decision should use deposits, delivery effort, and recovered events—not page traffic alone.

## Starter list usage

The companion file [`highlands-county-starter-prospects.csv`](./highlands-county-starter-prospects.csv) contains public businesses discovered through current web research. It is a research queue, not a mailing list. Verify current ownership, team size, contact preferences, software, and fit before outreach. Directory-only entries are marked lower confidence.
