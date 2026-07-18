-- Recorded remotely as migration version 20260715182656.
-- Replace the aging named-model/price roundup with a durable, evaluation-led
-- selection framework. Current catalogs remain linked as dated vendor data.

update public.articles
set
  title = 'How to Choose the Right AI Model for Your Workflow',
  excerpt = 'Compare AI models using real test cases, quality gates, total workflow cost, latency, privacy, tool use, and lifecycle—not an aging leaderboard.',
  category = 'Implementation',
  read_minutes = 7,
  body = $article$
Choose an AI model by testing several candidates on the same representative tasks, then selecting the least expensive option that meets your required quality, safety, latency, privacy, tool-use, and support constraints. Treat model names, context limits, availability, and prices as dated vendor data—not permanent facts—and repeat the evaluation when the workflow or model changes.

*Reviewed July 15, 2026. Model catalogs, limits, and prices change frequently; verify every candidate using the linked vendor documentation.*

## Why generic “best model” lists fail

A model can perform well on a public benchmark and still be the wrong choice for your workflow. Your inputs may be longer, messier, more specialized, or more sensitive. Your agent may need reliable structured output or tool selection rather than a polished essay.

Generic tables also decay quickly. Providers release new versions, change aliases, retire models, adjust limits, and update pricing. A durable decision comes from a repeatable evaluation process, not a screenshot of one month’s catalog.

## Start with the job, not the model

Write one sentence that defines the work:

> Given a customer question and an approved policy, classify the request, draft a sourced response, and route uncertain cases to a person.

Then write the conditions that make the output acceptable:

- Uses only approved information.
- Selects the correct route or tool.
- Produces the required structure.
- Refuses or escalates sensitive requests.
- Completes within the user’s acceptable wait time.
- Fits the organization’s data, deployment, and budget rules.

If you cannot describe a passing result, you cannot compare models meaningfully.

## Build a representative test set

Use the same test cases for every candidate. Include:

- Common easy requests.
- Ambiguous or incomplete requests.
- Long or noisy inputs.
- Edge cases and conflicting instructions.
- Requests that should be refused or escalated.
- Tool errors and missing data.
- Inputs from the actual languages and formats your users provide.

Start small enough to review carefully, then expand as real failures appear. The [golden-set guide](/knowledge/agent-evaluation-golden-set) explains how to maintain these cases over time.

## Apply pass/fail gates before preferences

Some requirements are not tradeoffs. A model that fails them should not advance simply because it is fast or inexpensive.

| Gate | Example question |
|---|---|
| Task quality | Does it complete the workflow correctly on required cases? |
| Safety | Does it respect refusal, escalation, and approval rules? |
| Structured output | Does it reliably return the schema your application validates? |
| Tool behavior | Does it select allowed tools and provide valid arguments? |
| Data/privacy | Can it be used under your organization’s data policy and provider terms? |
| Availability | Is it supported in the regions, account tier, and interface you need? |
| Lifecycle | Is the version stable enough for the intended deployment period? |

Only compare cost, speed, tone, and convenience among candidates that pass the required gates.

## Measure workflow quality, not vibes

Record observable outcomes for each test:

- Task completed: yes or no.
- Factual or source errors.
- Correct tool selected.
- Valid output structure.
- Boundary or policy violation.
- Human edit required.
- Response time.
- Input and output usage.
- Number of model calls, retries, and tool calls.

Use a human-written rubric for subjective qualities such as clarity or usefulness. Keep examples of passing and failing outputs so reviewers apply the rubric consistently.

[Google Cloud’s generative AI documentation](https://docs.cloud.google.com/vertex-ai/generative-ai/docs) describes evaluation against criteria tied to human judgment. The provider’s current tools are one implementation option; the broader principle is to evaluate the full application against your own task.

## Establish a quality baseline first

For a new workflow, begin with a capable candidate that gives you a strong quality baseline. Once the instructions, tools, and tests work, compare smaller or less expensive candidates using the same evaluation set.

OpenAI’s [practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/) recommends establishing an evaluation baseline, meeting the accuracy requirement, and then optimizing cost and latency where smaller models still satisfy that requirement.

This sequence helps separate two problems:

1. The workflow or instructions are poorly designed.
2. The candidate model cannot meet the requirement.

Starting with the cheapest option can make those failures difficult to diagnose.

## Calculate total workflow cost

Do not compare only the advertised input-token rate. Calculate what one completed workflow actually uses:

```text
total run cost =
  all model input and output usage
  + retrieval or search charges
  + tool/API charges
  + retries and evaluator calls
  + infrastructure and storage
  + human review time
```

A model with a lower unit price can cost more if it requires repeated calls, produces longer outputs, selects the wrong tools, or creates more human rework.

Use the provider’s current pricing page and record the checked date in your evaluation. Do not copy a price into a permanent comparison table without a review process.

## Measure latency the way users experience it

Record at least:

- Time to first visible response when streaming matters.
- Time to final usable output.
- Time for the complete tool loop.
- Slowest reasonable case, not just the average.
- Error and timeout rate.

An internal overnight workflow can tolerate different latency from a customer-facing assistant. Write the requirement before testing.

## Treat context length as a limit, not a strategy

A large context window does not guarantee that a model will use every part of a long prompt accurately. Test the document lengths and layouts you expect. Retrieval, chunking, summarization, or a better information structure may outperform sending everything on every run.

Track how quality changes as inputs grow. Also calculate the cost and latency of the larger context.

## Check tools and structured output directly

If your application depends on tool calls or JSON, test those behaviors separately from prose quality.

For every tool:

- Validate the tool name selected.
- Validate required and optional arguments.
- Reject unexpected fields.
- Test missing, ambiguous, and malicious inputs.
- Simulate tool errors and timeouts.
- Confirm the agent stops or escalates after the retry limit.

Do not give a candidate production permissions merely to test whether it can format a call. Use mocks, sandboxes, or read-only test systems first.

## Review privacy, security, and operational fit

Model selection is also a vendor and deployment decision. Document:

- What prompts, outputs, metadata, and files the provider processes.
- Retention and training/data-use settings.
- Region and data-residency options.
- Access controls and audit logs.
- Contractual and regulatory requirements.
- Rate limits and expected capacity.
- Version pinning, aliases, retirement policy, and migration notice.
- Support and incident communication.

A technically strong result does not override a required privacy or compliance gate.

## Record the exact version and review date

Do not write only a family name such as “Provider Model Pro.” Record the exact model identifier or version used in the test, the API/interface, configuration, test-set version, and date.

Provider catalogs often distinguish current, legacy, and retired versions. For example, Google directs users to its [model catalog](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models) and [release notes](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/release-notes) for current availability and lifecycle changes.

Re-run the evaluation when:

- You change the model or version.
- The provider changes an alias.
- Instructions, tools, or retrieval change.
- The input distribution changes.
- A new failure pattern appears.
- Pricing or latency materially affects the business case.

## Use routing only after one path works

Different tasks may eventually justify different models. A simple classification step may not need the same capability as a difficult synthesis step.

Do not begin with a complicated router. First make one end-to-end path measurable. Add routing only when your tests show a repeatable benefit and you can evaluate routing mistakes.

## A reusable model decision record

Save this information with every selection:

```text
Workflow:
Decision owner:
Decision date:
Review date:
Candidate and exact version:
Provider/API:
Test-set version:
Required pass/fail gates:
Quality results:
Safety results:
Structured-output/tool results:
Median and slow-case latency:
Total cost per completed workflow:
Data/privacy review:
Known failure patterns:
Fallback and rollback:
Reason selected:
```

This record makes future replacement easier and prevents the team from relying on memory.

## Seven-step selection process

1. Define one workflow and its passing outcome.
2. Build representative tests and safety cases.
3. Set non-negotiable quality, privacy, and operational gates.
4. Establish a baseline with a capable candidate.
5. Test other candidates on the same cases and configuration.
6. Compare total workflow cost, user-experienced latency, and human rework among candidates that pass.
7. Record the exact version, decision, limitations, and next review date.

The [Model Playground](/tools/model-playground) can help with an early non-sensitive prompt comparison. It is not a production benchmark: provider routing, free-model availability, tool behavior, and workload conditions may differ. Run final tests through the interface and configuration you intend to deploy.

## Frequently asked questions

### Should I always choose the most capable model?

No. Use a capable model to establish what good performance looks like, then test whether smaller or less expensive candidates meet the same requirements. Select from the candidates that pass.

### Should I choose the cheapest model?

Not from unit price alone. Compare total cost per successful workflow, including retries, tool calls, evaluators, infrastructure, and human rework.

### Can a public leaderboard choose for me?

No. A leaderboard can identify candidates, but your inputs, tools, policies, and failure costs determine whether a model fits the workflow.

### How often should I reevaluate?

Set a regular interval appropriate to the workflow and reevaluate whenever the model version, instructions, tools, data, or requirements change. High-change model catalogs should be checked more frequently than durable process guidance.

### Should one agent use several models?

Only after one measurable path works. Routing can reduce cost or improve task fit, but it introduces another component that can fail and must be evaluated.

## Primary sources

- [OpenAI: A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- [Google Cloud: Generative AI on Vertex AI](https://docs.cloud.google.com/vertex-ai/generative-ai/docs)
- [Google Cloud: Model catalog and lifecycle](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models)
- [Google Cloud: Generative AI release notes](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/release-notes)

Next, build or refresh the [golden set](/knowledge/agent-evaluation-golden-set) that will make your model comparison repeatable.
$article$,
  updated_at = now()
where slug = 'choosing-the-right-model';
