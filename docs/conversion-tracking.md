# Conversion tracking plan

## Measurement Readiness & Signal Quality Index

Initial score: **58/100 — Unreliable**

- Decision alignment: 18/25
- Event model clarity: 10/20
- Data accuracy and integrity: 12/20
- Conversion definition quality: 10/15
- Attribution and context: 4/10
- Governance and maintenance: 4/10

The existing server-backed event pipeline was usable, but the acquisition source and funnel stages
were not defined. The implementation in this build raises the estimated readiness to **78/100 —
Usable with Gaps**. Production validation and consent-state review remain required before making
high-stakes budget decisions.

## Tracking plan

| Event                                   | Description                          | Properties                                      | Trigger                     | Decision supported                         |
| --------------------------------------- | ------------------------------------ | ----------------------------------------------- | --------------------------- | ------------------------------------------ |
| `funnel_landing_viewed`                 | First landing in a browser session   | `source`, `campaign`, `landingPath`             | First site layout mount     | Compare LinkedIn, X, and other traffic     |
| `start_small_viewed`                    | Visitor sees the funnel landing page | attribution                                     | `/start-small` mount        | Measure qualified landing traffic          |
| `fit_finder_started`                    | Visitor begins the finder            | `surface`, attribution                          | Landing CTA or first answer | Find landing-to-start drop-off             |
| `fit_finder_completed`                  | Recommendations are displayed        | answer count, role, risk, timeline, attribution | Show recommendations        | Measure finder completion and segment fit  |
| `fit_finder_recommendation_clicked`     | A recommended resource is selected   | item type, slug, attribution                    | Result-card click           | Learn which recommendations create action  |
| `starter_kit_email_captured`            | Email capture succeeds               | role, high-intent flag, attribution             | Starter-kit form success    | Measure result-to-lead conversion          |
| `starter_kit_downloaded`                | Personalized file is downloaded      | role, high-intent flag, attribution             | Download action             | Measure lead-to-value completion           |
| `strategy_sprint_clicked`               | High-intent CTA is selected          | surface, attribution                            | Fit Finder results CTA      | Measure assisted-service intent            |
| `strategy_sprint_application_started`   | Visitor moves to the application     | surface, attribution                            | Sprint CTA                  | Find page-to-application drop-off          |
| `strategy_sprint_application_submitted` | Application is stored                | fixed surface only                              | Application success         | Count qualified sprint leads               |
| `contact_submission_completed`          | General contact is stored            | fixed surface only                              | Contact success             | Count general inbound leads                |
| `agent_clicked`                         | Agent detail is selected             | slug, surface                                   | Agent card click            | Identify agent interest                    |
| `product_clicked`                       | Product detail is selected           | slug, surface                                   | Product card click          | Identify product interest                  |
| `unlock_clicked`                        | Purchase intent begins               | item type, slug, surface                        | Unlock click                | Diagnose detail-to-checkout drop-off       |
| `checkout_started`                      | Stripe checkout is created           | item type, slug                                 | Checkout opens              | Measure successful checkout starts         |
| `purchase_completed`                    | Paid session grants access           | item type, slug                                 | Checkout confirmation       | Count completed purchases                  |
| `waitlist_joined`                       | Waitlist signup succeeds             | source, fixed interest label                    | Waitlist form success       | Verify footer and item waitlist conversion |

No email address, name, organization, message, or other free-text form field is sent to analytics.

## Conversions

| Conversion            | Event                                   | Counting                               | Used by           |
| --------------------- | --------------------------------------- | -------------------------------------- | ----------------- |
| Fit Finder completion | `fit_finder_completed`                  | Every completed recommendation request | Growth, content   |
| Starter-kit download  | `starter_kit_downloaded`                | Every explicit download                | Growth            |
| Contact lead          | `contact_submission_completed`          | Successful stored submission           | Sales             |
| Sprint application    | `strategy_sprint_application_submitted` | Successful stored application          | Sales, leadership |
| Purchase              | `purchase_completed`                    | Confirmed paid unlock                  | Revenue           |

## Attribution links

Use lowercase UTMs and preserve the route as the landing page:

- LinkedIn: `/start-small?utm_source=linkedin&utm_medium=social&utm_campaign=first_useful_agent`
- X: `/start-small?utm_source=x&utm_medium=social&utm_campaign=first_useful_agent`

## Production validation

1. Verify each event once in the browser development console and the `analytics_events` table.
2. Confirm no duplicate completion events in a normal session.
3. Test LinkedIn and X URLs in a private window and verify `source` persistence through the funnel.
4. Test mobile and desktop Fit Finder completion, email capture, and download.
5. Complete one Stripe test-mode purchase and confirm `unlock_clicked`, `checkout_started`, and
   `purchase_completed` appear in order.
6. Test consent behavior against the production privacy policy and deployment region requirements.

Owner: site operator. Review this plan whenever a funnel step, form, or analytics destination changes.
