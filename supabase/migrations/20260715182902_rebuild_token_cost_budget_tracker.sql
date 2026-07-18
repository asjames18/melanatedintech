-- Recorded remotely as migration version 20260715182902.
-- Replace frozen model prices and character-count estimates with a durable,
-- measured-usage cost and budget workbook.

update public.products
set
  name = 'AI Agent Cost & Budget Workbook',
  tagline = 'Calculate full workflow cost and set practical run and period limits.',
  description = $description$
**Version 1.0 - reviewed July 15, 2026**

A free, provider-neutral workbook for estimating and recording the full operating cost of an AI agent workflow. It separates model usage from retrieval, paid tools, infrastructure, retries, evaluation, and human review so you can calculate cost per accepted outcome instead of relying on the price of one prompt.

## Included

- Current-pricing source links for OpenAI, Anthropic, and Google
- Provider-rate and measured-usage worksheets
- Full run-cost and cost-per-accepted-outcome formulas
- Per-run, daily, and monthly budget-limit templates
- Tool, retry, evaluation, and human-review cost records
- Copy-ready CSV headers and a fictional worked example
- Weekly cost-review scorecard

## Delivery format

The workbook is displayed on this page and can be downloaded as a `.md` file. Copy its tables into your spreadsheet or operations system.

## Important boundary

The workbook does not fetch provider prices, count tokens, connect billing accounts, enforce limits, or provide financial advice. Enter current prices from the official provider pages and measured usage from your provider or framework. Character-count estimates may help early planning but are not a substitute for actual usage records.
$description$,
  category = 'Evaluation',
  tier = 'free',
  price_cents = null,
  active = true,
  status = 'published',
  system_prompt = $prompt$
You are the guide for the AI Agent Cost & Budget Workbook. Help the user map one workflow, enter current provider rates and measured usage, calculate full run cost, and define per-run and period limits.

Do not provide remembered model prices. Direct the user to the provider's current official pricing page and ask for the exact billing unit. Distinguish actual usage from estimates. Include retrieval, tools, infrastructure, retries, evaluation, and human review. Treat example figures as fictional operational planning, not financial advice.
$prompt$,
  unlock_content = $pack$
# AI Agent Cost & Budget Workbook

**Version 1.0**  
**Reviewed:** July 15, 2026  
**Price:** Free  
**Delivery:** Markdown workbook  

Use this workbook to calculate the full operating cost of one AI agent workflow and define limits your team can monitor. Start from current provider rates and measured usage. Do not rely on a model-price table copied into an old article or template.

> This workbook is for operational planning, not financial advice. It does not connect provider accounts, fetch live pricing, count tokens, enforce spending limits, or guarantee savings.

## Step 1: Name the valuable outcome

Choose a unit that represents completed work, such as an approved research brief, correctly classified document, resolved support case, or reviewed draft.

```text
Workflow:
Workflow version:
Owner:
Primary user:
Attempted run means:
Accepted outcome means:
Rejected or failed outcome means:
Human reviewer:
Review date:
```

Measure cost per accepted outcome. A cheap request that produces rejected work, repeated retries, or heavy correction may not be a cheap workflow.

## Step 2: Record current provider rates

Use the exact billing categories and units on the provider's official page. Rates, models, context rules, caching, tools, and batch options change.

- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)
- [Anthropic Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Google Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)

```text
Provider:
Model or service identifier:
Pricing page URL:
Rate checked on:
Billing currency:
Billing unit:
Standard input rate:
Cached input rate, if applicable:
Output rate:
Tool/search/media/storage rates:
Long-context or tier conditions:
Batch or asynchronous conditions:
Reviewer:
```

Do not assume every provider uses the same token unit or categories. Copy the unit exactly as displayed.

## Step 3: Measure one representative run

Use usage returned by the provider, SDK, framework, or approved observability system. Keep estimated values visibly labeled.

| Field | Actual or estimate? | Value | Source |
|---|---|---:|---|
| Input usage | | | |
| Cached input usage | | | |
| Output usage | | | |
| Model requests | | | |
| Retrieval/search calls | | | |
| External tool calls | | | |
| Storage or infrastructure | | | |
| Retries | | | |
| Evaluator requests | | | |
| Human review minutes | | | |
| Accepted outcome? | | yes/no | |

Character count divided by a fixed number is only a rough planning estimate. Tokenization varies by model, language, formatting, and content. Replace estimates with actual reported usage before using the result for an operating decision.

## Step 4: Calculate model-request cost

Adapt the categories to the provider's rate card.

```text
input cost = input usage / billing unit x input rate

cached input cost = cached input usage / billing unit x cached input rate

output cost = output usage / billing unit x output rate

model request cost = input cost + cached input cost + output cost
```

If the provider bills reasoning, images, audio, search, storage, or other services separately, add those categories instead of forcing them into text-token fields.

## Step 5: Calculate total run cost

```text
total model cost = sum of every model request in the run

total run cost =
  total model cost
  + retrieval and search cost
  + external tool and API cost
  + infrastructure and storage cost
  + retry cost
  + evaluation cost
  + human review and correction cost
```

For a consistent internal human-review estimate:

```text
review cost = review minutes / 60 x organization-selected loaded hourly cost
```

Use a planning rate chosen by your organization. There is no universal hourly rate.

## Step 6: Calculate cost per accepted outcome

```text
cost per accepted outcome =
  total cost of all attempted runs / number of accepted outcomes
```

Include failed and rejected runs in total attempted cost. Otherwise retries and poor quality disappear from the metric.

## Step 7: Define limits

### Per-run limits

```text
Maximum model calls:
Maximum tool calls:
Maximum retries:
Maximum elapsed time:
Maximum estimated run cost:
Stop behavior:
Escalation destination:
Person who may override:
```

### Period limits

```text
Daily warning level:
Daily hard limit, if application-enforced:
Monthly warning level:
Monthly hard limit, if application-enforced:
Scope: workflow / user / team / customer / environment
Alert recipients:
Review owner:
Safe behavior when limit is reached:
```

A provider budget notification may be delayed and may not stop requests. Verify current behavior and enforce critical limits in your own application when a predictable stop is required.

### Action limits

Budget controls do not replace action controls. List actions that require a person even when the run is within budget.

| Action | Human approval? | Approver | Evidence shown before approval |
|---|---:|---|---|
| Send externally | | | |
| Change a record | | | |
| Delete/archive | | | |
| Spend money | | | |
| Change access | | | |

## Step 8: Compare configurations fairly

Use the same representative cases and acceptance criteria.

| Measure | Baseline | Candidate | Difference |
|---|---:|---:|---:|
| Attempted runs | | | |
| Accepted outcomes | | | |
| Acceptance rate | | | |
| Model cost | | | |
| Tool/infrastructure cost | | | |
| Review and rework cost | | | |
| Cost per accepted outcome | | | |
| Median latency | | | |
| Safety or boundary failures | | | |

A candidate is not better merely because model spend is lower. Check quality, safety, latency, escalation, and human rework.

## Fictional example

These figures are fictional and demonstrate the method only.

Configuration A attempts 40 runs. Model, retrieval, and tool charges total $8.40. Review and correction are estimated at $21.60. Thirty-two outcomes are accepted.

```text
cost per accepted outcome = ($8.40 + $21.60) / 32
                          = $0.9375
```

Configuration B attempts the same 40 cases. Technical charges fall to $6.20, but review and correction rise to $29.80. Twenty-eight outcomes are accepted.

```text
cost per accepted outcome = ($6.20 + $29.80) / 28
                          = $1.2857
```

Configuration B costs less at the API layer and more per accepted outcome. Your calculation will depend on current rates, measured usage, workflow quality, and the internal planning method used for review.

## Weekly cost review

| Week | Attempts | Accepted | Total technical cost | Review cost | Cost/accepted outcome | Retries/outcome | Largest change | Owner action |
|---|---:|---:|---:|---:|---:|---:|---|---|
| | | | | | | | | |

Review:

- the most expensive workflow branch;
- unexplained increases in calls, retries, or output;
- rejected work and human corrections;
- pricing or billing-unit changes;
- tool and infrastructure costs outside the model bill;
- alerts that fired or failed to fire; and
- one controlled optimization experiment.

## Copy-ready CSV headers

### `provider-rates.csv`

```csv
provider,service_identifier,pricing_url,checked_at,currency,billing_unit,input_rate,cached_input_rate,output_rate,other_rate_notes,reviewer
```

### `agent-runs.csv`

```csv
run_id,timestamp,workflow_version,provider,service_identifier,input_usage,cached_input_usage,output_usage,model_calls,tool_calls,retries,retrieval_cost,tool_cost,infrastructure_cost,evaluation_cost,review_minutes,review_cost,total_cost,outcome_status
```

### `budget-limits.csv`

```csv
workflow_version,scope,per_run_warning,per_run_hard_limit,daily_warning,daily_hard_limit,monthly_warning,monthly_hard_limit,stop_behavior,alert_recipients,owner,last_reviewed
```

## Quality checks before using the calculation

- [ ] Provider rates came from the current official page.
- [ ] Billing units match the page.
- [ ] Actual usage is separated from estimates.
- [ ] Every model request in a multi-step run is included.
- [ ] Search, retrieval, tools, storage, and infrastructure are included.
- [ ] Failed runs and retries remain in attempted cost.
- [ ] Human review uses an organization-selected method.
- [ ] Accepted outcome has a documented quality definition.
- [ ] Alerts are not mislabeled as hard stops.
- [ ] The owner and safe stop behavior are documented.

## License

You may copy and adapt this free workbook for internal use by your organization. Do not resell or redistribute the workbook as a competing template product. It is provided as-is without a warranty or guarantee of savings.

## Continue learning

Read [AI Agent Cost Control: A Practical Budgeting Playbook](/knowledge/ai-agent-cost-control-playbook) for the methodology and use the [Evaluate Your Agent learning path](/paths/evaluate-your-agent) to connect cost with quality and safety.
$pack$,
  asset_path = null,
  asset_name = null,
  updated_at = now()
where slug = 'token-cost-budget-tracker';
