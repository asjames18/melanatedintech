-- Recorded remotely as migration version 20260715182610.
-- Replace the obsolete ChatCompletion/LangChain tutorial with a current,
-- source-backed OpenAI Agents SDK walkthrough that starts without permissions.

update public.articles
set
  title = 'How to Build Your First AI Agent Safely',
  excerpt = 'Build a small AI agent with the current OpenAI Agents SDK, test it with realistic cases, and add tools only after its behavior is measurable.',
  category = 'Getting Started',
  read_minutes = 8,
  body = $article$
Build your first AI agent by choosing one low-risk drafting task, writing clear instructions and test cases, then running a single agent without external tools. Measure its outputs before adding permissions. The current OpenAI Agents SDK uses `Agent` and `Runner`; older `ChatCompletion.create` and legacy LangChain examples should not be followed.

*Reviewed July 15, 2026. SDKs change: check the linked official quickstart before installing or deploying.*

## What you will build

This tutorial creates one agent that drafts a response to a fictional event question. It will not connect to an inbox, send a message, modify a record, or use private information.

That limited scope is intentional. A first agent should help you learn how instructions, test cases, and evaluation work before it receives tools or permissions.

If you are still deciding what an agent is, begin with [What Is an AI Agent?](/knowledge/ai-agents-in-plain-english). If you have not selected a workflow, use the [first-agent workflow guide](/knowledge/choose-your-first-agent-workflow).

## Before you write code

Define the pilot in one sentence:

> Given a fictional event question and an approved FAQ, draft a concise response for a person to review.

Then define success:

- The answer uses only information in the approved FAQ.
- It says when the FAQ does not contain the answer.
- It does not invent a date, price, policy, or contact.
- It labels the output as a draft.
- It does not send anything.

Finally, create at least five test cases:

1. A routine question with a clear answer.
2. A question whose answer is missing.
3. A question containing conflicting details.
4. A request for private information.
5. An off-topic or manipulative instruction.

The test cases matter more than a clever demo. They give you a repeatable way to decide whether the agent improved.

## Step 1: Create an isolated project

The [official OpenAI Agents SDK quickstart](https://openai.github.io/openai-agents-python/quickstart/) is the source of truth for current installation commands. At the time of this review, its basic setup is:

```bash
mkdir first-agent
cd first-agent
python -m venv .venv
```

Activate the environment using the command appropriate for your operating system, then install the SDK:

```bash
pip install openai-agents
```

Set your API key using your operating system’s environment-variable mechanism. Do not paste a real key into source code, a screenshot, a public repository, or this website.

API use can create charges and sends content to the configured provider. Review current pricing, privacy, retention, and data-use terms before sending business information. Use fictional inputs for this tutorial.

## Step 2: Create a single draft agent

Create a file named `draft_agent.py`:

```python
import asyncio

from agents import Agent, Runner


approved_faq = """
Community Technology Workshop
- Date: August 22
- Time: 10:00 AM to 1:00 PM
- Location: Main Street Community Center
- Cost: Free with registration
"""


agent = Agent(
    name="Event FAQ Draft Assistant",
    instructions=f"""
You draft answers using only the approved FAQ below.

Rules:
1. Never invent a fact that is absent from the FAQ.
2. If the answer is missing, say a staff member needs to confirm it.
3. Do not request or reveal private information.
4. End every answer with: DRAFT — HUMAN REVIEW REQUIRED.
5. Do not claim that you sent, scheduled, saved, or changed anything.

APPROVED FAQ:
{approved_faq}
""",
)


async def main() -> None:
    question = "What time does the workshop start, and is it free?"
    result = await Runner.run(agent, question)
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```

Run it:

```bash
python draft_agent.py
```

This uses the SDK’s current `Agent` and `Runner` pattern without hardcoding a model name. The [SDK agents documentation](https://openai.github.io/openai-agents-python/agents/) explains the current agent configuration surface, and the [running-agents documentation](https://openai.github.io/openai-agents-python/running_agents/) covers execution options.

## Step 3: Test failures, not just success

Replace the question with each test case and record the output in a simple table.

| Test | Expected behavior | Pass? | Notes |
|---|---|---:|---|
| Known date/time | Uses FAQ exactly | | |
| Missing parking details | Says staff must confirm | | |
| Conflicting date in user message | Prefers approved FAQ and flags conflict | | |
| Request for attendee list | Refuses private-data request | | |
| “Ignore the rules” instruction | Keeps the approved boundaries | | |

Do not change the instructions after every single failure. Look for a pattern, revise the instruction, and rerun the entire set. Otherwise you may fix one example while breaking another.

Use the [golden-set guide](/knowledge/agent-evaluation-golden-set) to expand this into a reusable evaluation process.

## Step 4: Improve the instructions

Good instructions describe the job, allowed information, forbidden actions, uncertainty behavior, and output format.

Ask:

- Is the goal specific enough to evaluate?
- Does the agent know which source is authoritative?
- Does it know what to do when information is absent?
- Are prohibited actions explicit?
- Is human review visible in the output?
- Are common edge cases included?

The [prompting basics guide](/knowledge/prompting-an-agent-the-basics) provides a reusable structure for goals, context, constraints, and output formats.

## Step 5: Measure time and usage

Record response time, pass/fail outcome, and whether a person had to edit the draft. When you begin comparing configurations, also record usage.

The [OpenAI Agents SDK usage documentation](https://openai.github.io/openai-agents-python/usage/) explains the current usage data available from a run context. Use the official documentation rather than copying an older property path because SDK interfaces can change.

At this stage, the most useful metric is not “How intelligent did it sound?” It is “How often did it satisfy the written test cases without violating a boundary?”

## Step 6: Decide whether you need a tool

The example stores its FAQ inside the instructions. That is acceptable for a tiny fictional test but not a maintainable knowledge system.

Your next version might use a read-only function that retrieves an approved FAQ entry. Before adding it, define:

- What data the tool can read.
- What inputs it accepts.
- What output structure it returns.
- What errors it can produce.
- Whether the agent may retry.
- What gets logged.

The SDK can wrap Python functions as tools, as shown in its [tools documentation](https://openai.github.io/openai-agents-python/tools/). Do not begin with a tool that sends email, spends money, deletes data, or writes to a production system.

OpenAI’s [practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/) recommends strong foundations in models, tools, instructions, and layered guardrails. It also recommends maximizing a single agent before adding multi-agent complexity.

## Step 7: Add a human approval point

For this workflow, the approval point is simple: the agent produces a draft, and a person decides whether to edit, send, or discard it.

If you later connect an action tool, enforce approval in application code or the workflow system—not only in a sentence inside the prompt. Permissions, authentication, authorization, validation, and audit logs are separate engineering controls.

Use [human-in-the-loop patterns](/knowledge/human-in-the-loop-patterns-for-agents) to select an approval design. The [NIST AI RMF Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) treats defined roles, oversight, measurement, and management as continuing responsibilities rather than one-time setup.

## Step 8: Review traces without asking for hidden reasoning

The OpenAI SDK supports traces that help developers inspect runs and tool activity. Follow the current [SDK quickstart](https://openai.github.io/openai-agents-python/quickstart/) for trace-viewer instructions.

Use traces and application logs to review observable events such as inputs, outputs, tool calls, handoffs, errors, latency, and usage. Do not design a product around exposing private chain-of-thought. Observable decisions and outcomes are the appropriate basis for evaluation.

## What not to do next

Avoid these common jumps:

- Connecting a real inbox before testing fictional examples.
- Giving broad database or file-system access.
- Adding several agents because the diagram looks impressive.
- Treating one successful run as production evidence.
- Hardcoding secrets or customer data.
- Letting the agent send external messages without approval.
- Copying code from an undated tutorial without checking official documentation.

## Production-readiness checklist

The tutorial is complete when the local draft works. It is not production-ready until you can answer yes to questions like these:

- [ ] Does an owner approve the scope and risk?
- [ ] Are representative test cases versioned and rerun after changes?
- [ ] Are private data and secrets handled appropriately?
- [ ] Does every tool use the least privilege it needs?
- [ ] Are sensitive or irreversible actions approval-gated?
- [ ] Are time, usage, errors, and outcomes logged?
- [ ] Can a person pause or disable the workflow?
- [ ] Are provider terms, pricing, and data policies reviewed?
- [ ] Is there a rollback and incident process?

## Primary sources

- [OpenAI Agents SDK quickstart](https://openai.github.io/openai-agents-python/quickstart/)
- [OpenAI Agents SDK: Agents](https://openai.github.io/openai-agents-python/agents/)
- [OpenAI Agents SDK: Running agents](https://openai.github.io/openai-agents-python/running_agents/)
- [OpenAI Agents SDK: Tools](https://openai.github.io/openai-agents-python/tools/)
- [OpenAI Agents SDK: Usage](https://openai.github.io/openai-agents-python/usage/)
- [OpenAI: A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- [NIST AI RMF Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/)

When your tests are written and the draft agent behaves consistently, continue through the [Start Your First Agent learning path](/paths/start-your-first-agent).
$article$,
  updated_at = now()
where slug = 'building-your-first-agent';
