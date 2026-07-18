-- Replace the canonical workflow-selection article with an evidence-backed,
-- internally linked guide and reusable scorecard. The older duplicate remains
-- unpublished and redirects to this slug at the application layer.

update public.articles
set
  title = 'Choose Your First Agent Workflow: A Practical Scorecard',
  excerpt = 'Use this evidence-backed scorecard to choose a narrow, measurable, reviewable first AI-agent workflow without automating a high-risk decision too early.',
  category = 'Getting Started',
  body = $article$
# Choose Your First Agent Workflow: A Practical Scorecard

Choose a first AI-agent workflow that is repeated, narrow, measurable, and easy for a person to review before anything happens. Prefer draft-only work with stable inputs and reversible outcomes. If a rules-based automation can solve it reliably, use that instead of an agent.

This is a workflow-selection guide, not a recommendation to automate every task. OpenAI's [practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/) recommends validating that a use case actually needs judgment, exceptions, or unstructured information; otherwise, deterministic automation may be enough.

If the distinction between an agent and a chatbot is still unclear, begin with [What Is an AI Agent?](/knowledge/ai-agents-in-plain-english). Then use the scorecard below before connecting a model to business systems.

## Start with the work, not the technology

A useful candidate can be described without naming a model or vendor:

- **Trigger:** What starts the work?
- **Owner:** Who is accountable for the result today?
- **Inputs:** Which approved documents, records, or messages are required?
- **Output:** What reviewable artifact should exist at the end?
- **Boundary:** What must the AI never decide or do?
- **Escalation:** When should it stop and ask a person?
- **Measure:** How will you know whether the output is useful and safe?

OpenAI's July 2026 [AI workflow starter worksheet](https://academy.openai.com/en/public/clubs/champions-ecqup/resources/ai-workflow-starter-worksheet-2026-07-07) uses a similar work-first approach: identify the real workflow, owner, users, beginning and end, human boundaries, and escalation conditions before building.

## The first-workflow scorecard

Score each candidate from 1 to 3. These are planning prompts, not universal performance thresholds.

| Criterion | 1 point | 2 points | 3 points |
|---|---|---|---|
| Frequency | Occasional | Weekly | Daily or more often |
| Input stability | Inputs change widely | Mixed structure | Consistent, approved inputs |
| Reviewability | Expert must reconstruct the answer | Reviewer needs several checks | Reviewer can compare output with source material quickly |
| Reversibility | Mistake creates lasting harm | Correction takes effort | Draft can be edited or discarded |
| Outcome clarity | Success is subjective | A proxy can be measured | Correctness or acceptance can be scored |
| Permission scope | Broad write access | Limited write access | Read-only or draft-only |

Add the six values for a maximum illustrative score of 18.

- **15-18:** Strong pilot candidate, assuming the workflow is useful and lawful.
- **11-14:** Narrow the task, permissions, or output before testing.
- **6-10:** Keep it manual, use ordinary automation, or redesign the workflow first.

The total is not enough by itself. Reject a candidate that scores 1 for reversibility or permission scope, even if its total is high. NIST's [AI Risk Management Framework Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) calls for teams to define the supported task, document human oversight, and map risks across the system. Treat those as design requirements, not cleanup after launch.

## Worked example: two support workflows

Imagine a small business comparing two candidates. The scores below are examples; your process, data, policies, and risk tolerance may produce different results.

### Candidate A: issue customer refunds automatically

| Criterion | Example score | Reason |
|---|---:|---|
| Frequency | 2 | Refund requests occur weekly |
| Input stability | 2 | Orders are structured, but customer explanations vary |
| Reviewability | 1 | Policy, payment, and fulfillment history must be checked |
| Reversibility | 1 | Money may leave the account |
| Outcome clarity | 2 | Eligibility rules exist, but exceptions matter |
| Permission scope | 1 | The workflow needs a financial write action |
| **Total** | **9/18** | **Do not use as a first autonomous workflow** |

### Candidate B: classify a support request and prepare a draft reply

| Criterion | Example score | Reason |
|---|---:|---|
| Frequency | 3 | Requests arrive daily |
| Input stability | 2 | Messages vary, but categories and policies are known |
| Reviewability | 3 | A support person compares the draft with the request |
| Reversibility | 3 | An unsent draft can be edited or discarded |
| Outcome clarity | 2 | Category accuracy and draft acceptance can be tracked |
| Permission scope | 3 | The system reads approved context and saves a draft only |
| **Total** | **16/18** | **Reasonable pilot candidate with human approval** |

The second candidate teaches retrieval, classification, instruction design, output validation, and review without giving the system authority to contact a customer on its own.

## Copy-and-use workflow brief

Use this template for the highest-scoring candidate:

```text
Workflow name:
Current owner:
Trigger:
Approved inputs:
Required output:
Human reviewer:
Actions the AI may take:
Actions the AI may never take:
Stop or escalation conditions:
Five normal test cases:
Five difficult or incomplete test cases:
Acceptance measure:
Maximum run cost or time:
Pilot start and end dates:
```

The case counts are examples. The important part is testing normal, edge, and incomplete inputs before expanding permissions. Use [How to Evaluate an AI Agent](/knowledge/evaluating-agents-evals) to turn those cases into a repeatable evaluation set.

## A safe first-pilot sequence

1. **Write the brief.** State one outcome and one owner. The [agent brief guide](/knowledge/write-agent-brief-that-works) provides a fuller specification.
2. **Keep the first version draft-only.** Do not let it send, delete, purchase, approve, or change a system of record.
3. **Use the smallest permission set.** Read only the data required for the task.
4. **Test before connecting live actions.** Include straightforward cases, missing information, conflicting instructions, and prompt-injection attempts.
5. **Record evidence.** Track acceptance, edits, rejections, cost, latency, and the reason for every escalation.
6. **Review failures weekly.** Improve instructions and safeguards based on observed failures rather than assumptions.

OpenAI's agent guide describes human intervention as especially important early in deployment and for high-risk actions. OWASP's [Agentic AI threats and mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/) provides an additional threat-modeling reference for systems that can plan, use tools, or act with greater autonomy.

For implementation steps after selection, continue with [How to Build Your First AI Agent Safely](/knowledge/building-your-first-agent). You can also use the free [Agent Launch Planner](/products/agent-launch-planner) to capture the brief and pilot decisions.

## When not to choose an agent

Use a simpler approach when the workflow is fully defined by stable rules, needs exact repeatability, has too little volume to justify maintenance, or cannot be reviewed safely. Do not use an early agent pilot to make final legal, medical, financial, employment, ministry, or safety decisions.

Choosing a smaller first workflow is not thinking small. It is how you create evidence that earns permission for the next step.

## Sources and review notes

- [A practical guide to building agents - OpenAI](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- [AI workflow starter worksheet - OpenAI Academy](https://academy.openai.com/en/public/clubs/champions-ecqup/resources/ai-workflow-starter-worksheet-2026-07-07)
- [AI Risk Management Framework Core - NIST](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/)
- [Agentic AI: Threats and Mitigations - OWASP](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/)

Sources checked July 16, 2026. Review this guide by September 14, 2026, or sooner if the linked agent-building or risk-management guidance changes.
$article$,
  published = true,
  status = 'published'::public.publish_status,
  scheduled_at = null,
  updated_at = now()
where slug = 'choose-your-first-agent-workflow';

update public.articles
set read_minutes = greatest(
  1,
  ceil(
    coalesce(array_length(regexp_split_to_array(trim(body), E'\\s+'), 1), 0) / 200.0
  )::integer
)
where slug = 'choose-your-first-agent-workflow';
