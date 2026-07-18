-- Recorded remotely as migration version 20260715182739.
-- Consolidate two overlapping evaluation articles into one current, risk-based
-- guide. Keep the old row as an unpublished draft while its public route 301s.

update public.articles
set
  title = 'How to Evaluate an AI Agent: A Practical Evals Guide',
  excerpt = 'Build practical AI agent evals that test outcomes, tool use, safety, cost, latency, and regressions before and after launch.',
  category = 'Evaluation',
  read_minutes = 9,
  body = $article$
Evaluate an AI agent by turning its real job, boundaries, and likely failures into repeatable test cases. Score the final answer, tool choices and arguments, policy compliance, escalation behavior, latency, cost, and human rework. Run the same cases before and after every meaningful change, investigate failures by category, and set release criteria based on the consequence of failure rather than a universal pass-rate target.

*Reviewed July 15, 2026.*

## What an agent evaluation must observe

A model evaluation may focus on one response. An agent evaluation usually has more to inspect because the system can choose tools, make several requests, change state, recover from errors, and ask a person for approval.

Evaluate observable behavior:

- the input and allowed context;
- the final output;
- tool selections and arguments;
- actions attempted, completed, blocked, or escalated;
- sources or records used;
- errors, retries, and stop conditions;
- latency and total operating cost; and
- the real outcome after human review.

Do not ask for hidden chain-of-thought. A useful trace records decisions and actions that the system exposes for operations: which tool ran, what approved data it accessed, what status it returned, and why the workflow stopped.

## Define one unit of success

Write the agent's job as an observable outcome. For example:

> Given an approved return-policy source and a fictional customer request, create an accurate draft, cite the relevant rule, collect only the required fields, and escalate exceptions without sending or changing a record.

Then define success dimensions. A single score can hide a dangerous failure, so keep important dimensions separate:

| Dimension | Example question |
|---|---|
| Outcome | Did the workflow produce the intended usable result? |
| Factuality | Is each material claim supported by the allowed source? |
| Instruction following | Did the output use the required format and scope? |
| Tool behavior | Did it choose the allowed tool with valid arguments? |
| Safety | Did it avoid prohibited data and irreversible actions? |
| Escalation | Did it hand uncertain or restricted cases to the right person? |
| Efficiency | What did an accepted outcome cost in time, usage, and review? |

For each dimension, specify what passes, what fails, and what evidence the grader may use.

## Create a failure taxonomy

Name the failures you care about before testing. This turns a vague red score into a useful repair queue.

Common categories include:

- unsupported or incorrect claim;
- missing required information;
- wrong or unnecessary tool;
- invalid tool arguments;
- unauthorized action attempt;
- failed or missing escalation;
- privacy or data-handling violation;
- prompt-injection compliance;
- broken output structure;
- excessive loop, retry, latency, or cost; and
- excessive human rework.

Give safety-critical categories their own release rule. An average can look healthy while hiding a rare action the system must never take.

## Build representative cases from real work

Begin with the distribution the agent will actually see, then deliberately add difficult and high-consequence cases. There is no universal minimum number that makes an agent safe.

Include:

1. **Routine cases** that represent common work.
2. **Messy cases** with incomplete, ambiguous, or conflicting information.
3. **Boundary cases** that are outside scope or require a person.
4. **Tool failures** such as timeouts, empty results, duplicate records, or denied access.
5. **Adversarial cases** that try to override instructions or misuse tools.
6. **Previously observed failures** from testing, review, and production incidents.

Use fictional or properly governed data. Do not copy sensitive customer, employee, donor, health, legal, or financial records into an evaluation system without an approved purpose, access model, and retention policy.

The [golden-set guide](/knowledge/agent-evaluation-golden-set) explains how to maintain the reusable case library.

## Use a test-case record

Store cases in a versioned table, JSON file, spreadsheet, or evaluation platform. The tool matters less than a clear schema.

```text
case_id:
workflow_version:
risk_tier:
input:
allowed_context:
allowed_tools:
actions_requiring_approval:
expected_properties:
prohibited_results:
reference_evidence:
grading_method:
failure_category:
case_owner:
last_reviewed:
```

Avoid prescribing one perfect paragraph as the only acceptable answer when several outputs could satisfy the job. Expected properties and prohibited results are often more durable than exact text matching.

## Grade with the simplest reliable method

Use multiple layers. Expensive or subjective grading should not replace checks that ordinary code can perform exactly.

### Deterministic checks

Use code for properties such as valid JSON, required fields, allowed status values, citation presence, maximum call count, schema compliance, tool name, and whether approval occurred before an action.

These checks are fast and repeatable, but a correctly shaped answer can still be wrong.

### Reference-based checks

Compare extracted facts, classifications, calculations, or selected records with a trusted reference. Keep the reference current and record who approved it.

### Rubric grading

Use a short rubric for qualities such as completeness, groundedness, tone, or usefulness. Define each score with observable criteria. Pairwise comparison between two outputs can be easier to calibrate than an unexplained one-to-ten score.

### Human review

People should grade a sample, disagreements, novel failures, and high-risk cases. Track reviewer disagreement; it may reveal that the rubric or success definition is unclear.

### Model graders

A model grader can help at scale, but it is another model, not an objective authority. Give it the same evidence and rubric a person would use. Compare its judgments with qualified human judgments before relying on it, then recalibrate when the task, rubric, or grader changes.

OpenAI's current evaluation guidance recommends task-specific evals, logging, automation where possible, and continuous evaluation. Anthropic similarly recommends specific, measurable success criteria and multidimensional evaluation. Both approaches support starting from the task rather than copying a generic benchmark.

## Test the action path, not only the prose

An agent can write a polished answer after taking the wrong action. Capture and grade the path:

- Was the selected tool necessary and allowed?
- Were arguments valid, minimal, and scoped to the right record?
- Did the agent verify a tool result before using it?
- Did retries have a reason and a limit?
- Did the workflow stop when a budget or policy boundary was reached?
- Did a person approve the exact action that was later executed?
- Did the final status match what happened in the external system?

Use mocks or a sandbox for destructive, outward-facing, financial, or permission-changing tools. An evaluation should not email real people, move real money, or edit production data simply to prove that the action path exists.

## Calculate interpretable metrics

Keep raw counts beside percentages, especially with small case sets.

```text
task success rate = successful cases / evaluated cases

safety violation rate = cases with a defined safety violation / evaluated cases

tool selection accuracy = cases with the expected tool decision / cases where a tool decision applies

escalation recall = required escalations correctly escalated / cases that required escalation

cost per accepted outcome = total attempted-run cost / accepted outcomes
```

Also track latency, retries, human review minutes, and failure counts by category. Read the [cost-control playbook](/knowledge/ai-agent-cost-control-playbook) before optimizing for price, because a cheaper configuration can create more rejected work.

Do not adopt a universal target such as a fixed pass rate. A drafting assistant and an agent that can issue refunds have different consequences. Define acceptance thresholds with the workflow owner, security or privacy owner, and any required legal or compliance reviewer.

## Create a risk-based release gate

A practical release decision has several conditions:

- no unresolved failure in a release-blocking safety category;
- the primary outcome metrics meet the workflow's documented requirement;
- performance does not regress beyond an agreed tolerance;
- known limitations and escalation paths are documented;
- cost and latency fit the operating budget;
- logs and alerts are working; and
- an accountable owner can pause the workflow.

NIST's AI Risk Management Framework organizes ongoing work around governance, mapping, measurement, and management. That is a useful reminder that a test result is evidence for a decision, not permanent certification of an agent.

## Run the regression workflow on every change

Version the prompt, tools, model or provider configuration, knowledge source, policies, and eval set. For a meaningful change:

1. Run the current production configuration on the frozen comparison set.
2. Run the candidate on the same cases and environment.
3. Compare each dimension, not only the aggregate score.
4. Inspect every new safety failure and the largest regressions.
5. Record the decision, reviewer, date, and known limitation.
6. Add newly discovered failures to the maintained case library.

Change one important variable at a time when possible. Otherwise you may know that behavior moved without knowing why.

## Continue evaluating after launch

Offline cases cannot represent every real interaction. Production monitoring should add:

- automated policy and schema checks;
- sampled human review;
- user corrections and escalation outcomes;
- tool errors and denied actions;
- cost, latency, and loop anomalies;
- new input clusters not represented in the eval set; and
- an incident path that can pause the workflow.

Do not silently train or evaluate on private production data. Define consent, access, retention, redaction, and reuse rules. See [Agent Logs: What to Capture Before It Breaks](/knowledge/agent-logs-what-to-capture-before-breaks) and [What to Measure After an Agent Launch](/knowledge/what-to-measure-after-agent-launch).

## A small-team starting plan

In the first session:

1. Name one observable outcome and the owner.
2. Define five to eight failure categories, including safety and escalation.
3. Collect a manageable set of representative fictional or approved cases.
4. Add deterministic checks for structure and action boundaries.
5. Write one short rubric for the subjective qualities.
6. Have a person review all initial results and disagreements.
7. Record the baseline before changing the agent.

Expand the set as you discover failures. A smaller maintained set with clear ownership is more useful than a large collection no one reviews.

Continue with the [Evaluate Your Agent learning path](/paths/evaluate-your-agent) and pair evaluation with [Guardrails and Safety](/knowledge/guardrails-and-safety).

## Frequently asked questions

### What is an AI agent eval?

It is a repeatable test that measures whether an agent produces the required outcome while using tools, data, approvals, time, and money within defined boundaries.

### How many evaluation cases do I need?

There is no universal number. Start with enough representative cases to expose the important routine, messy, boundary, failure, and adversarial behaviors, then grow the set from real failures. High-consequence workflows require stronger coverage and review.

### Can another AI grade my agent?

It can assist with rubric-based grading, but calibrate it against qualified human judgments and retain deterministic checks for objective properties. Review disagreements and high-risk cases manually.

### Are offline evals enough?

No. Use offline evals for repeatable comparison and production monitoring for new inputs, incidents, drift, cost, latency, and real outcomes.

### Should I evaluate chain-of-thought?

No. Evaluate observable inputs, tool events, outputs, errors, evidence, approvals, and outcomes. Do not require hidden reasoning traces.

## Primary sources

- [OpenAI: Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)
- [Anthropic: Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
- [NIST: AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
$article$,
  author_id = coalesce(
    (select id from public.authors where slug = 'mit-editorial' limit 1),
    author_id
  ),
  updated_at = now()
where slug = 'evaluating-agents-evals';

-- Remove the duplicate from public article queries while preserving its row for
-- editorial history. The route itself remains a permanent redirect.
update public.articles
set
  published = false,
  status = 'draft'::public.publish_status,
  scheduled_at = null,
  updated_at = now()
where slug = 'measuring-if-your-agent-actually-works';

-- Keep existing learning paths on the canonical article.
update public.learning_path_items
set item_slug = 'evaluating-agents-evals'
where item_type = 'article'
  and item_slug = 'measuring-if-your-agent-actually-works';
