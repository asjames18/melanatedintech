-- Recorded remotely as migration version 20260715182535.
-- Refresh the primary “what is an AI agent” pillar with a direct answer,
-- primary sources, practical examples, safety boundaries, and cluster links.

update public.articles
set
  title = 'What Is an AI Agent? A Plain-English Guide',
  excerpt = 'Learn what an AI agent is, how it differs from a chatbot or fixed automation, when to use one, and where human approval still belongs.',
  category = 'Getting Started',
  body = $article$
An AI agent is software that uses an AI model to decide which steps and tools to use toward a goal, observes the results, and continues within defined limits. Unlike a basic chatbot, an agent can manage part of a workflow—but people still need to control permissions, review sensitive actions, and measure results.

*Reviewed July 15, 2026.*

## What makes an AI agent different?

A chatbot primarily responds to a message. A fixed automation follows steps that a person defined in advance. An AI agent can choose among allowed steps or tools based on the current situation.

That distinction matters more than the label a vendor uses.

| System | How it works | Good fit | Main limitation |
|---|---|---|---|
| Chatbot | Responds to a user message | Questions, drafting, explanations | Usually waits for the next prompt |
| Fixed automation | Follows predetermined rules | Stable, repeatable processes | Struggles when inputs vary beyond its rules |
| AI agent | Uses a model to choose steps and tools within boundaries | Variable, multi-step work where judgment helps | Can make incorrect choices and needs evaluation and oversight |

[OpenAI’s practical guide](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/) describes agents as systems that manage workflow execution on a user’s behalf and use tools under defined guardrails. [Anthropic’s discussion of trustworthy agents](https://www.anthropic.com/research/trustworthy-agents) emphasizes that an agent directs its own process and tool use rather than following only a fixed script.

The practical test is simple: **Does the AI only answer, or can it decide what authorized step to take next?**

## The five parts of a useful agent

Most practical agents need five things.

### 1. A goal

The goal defines the outcome, not just the topic. “Help with email” is vague. “Draft replies to routine event questions and route sensitive messages to a staff member” is testable.

### 2. Instructions and boundaries

Instructions explain what the agent should do, what it should never do, what information it may use, and when it must stop. Boundaries are part of the design—not a note added after launch.

### 3. A model

The model interprets the request, selects a next step, and produces an output. The most expensive or newest model is not automatically the best choice. The right model is the one that meets the workflow’s quality, speed, privacy, and cost requirements in testing.

### 4. Tools and data

Tools let an agent retrieve information or take an authorized action. Examples include searching an approved knowledge base, reading a document, creating a draft record, or preparing an email for review.

A tool connection requires separate setup: accounts, credentials, permissions, validation, and monitoring. A prompt by itself does not connect an agent to an inbox, calendar, CRM, database, or payment system.

### 5. Feedback and stopping rules

The agent needs a way to observe whether a step worked. It also needs stopping rules: finish when the outcome is reached, retry only within a limit, and ask a person when confidence is low or the action is sensitive.

## How an agent works step by step

A basic agent loop looks like this:

1. Receive a goal and relevant context.
2. Decide the next permitted step.
3. Use an approved tool or produce a draft.
4. Observe the result or error.
5. Continue, stop, or ask for human review.
6. Record enough information to evaluate what happened.

This loop is useful because real work is not always predictable. It is also risky because a plausible decision can still be wrong. Limit the tools, permissions, retries, spending, and data available to the agent.

## A practical small-team example

Imagine a nonprofit receives event questions through a shared inbox.

A safe first version might:

1. Read a copied, non-sensitive sample message.
2. Classify it as routine, uncertain, or sensitive.
3. Search an approved event FAQ.
4. Draft a response with the source it used.
5. Send the draft to a staff member for approval.
6. Record whether the draft was accepted, edited, or rejected.

The agent does **not** need permission to send messages on day one. Drafting plus human approval provides a useful test while keeping the action reversible.

After the team measures accuracy and common failure cases, it can decide whether any low-risk category should receive more automation. That decision should come from evidence, not excitement.

## When should you use an agent?

An agent may be appropriate when the workflow:

- Has a clear owner and measurable outcome.
- Requires interpreting variable text, documents, or requests.
- Contains several possible next steps.
- Can use a small, well-defined set of tools.
- Has failures that people can detect and reverse.
- Occurs often enough to justify setup and evaluation.

Start with a workflow that is dull, repeated, and draft-friendly. Our [first-agent workflow guide](/knowledge/choose-your-first-agent-workflow) helps narrow the choice.

## When is an agent the wrong choice?

Use a simpler approach when:

- A form, checklist, database query, or fixed rule solves the problem reliably.
- The process is rare or changes before it can be tested.
- Success cannot be defined or reviewed.
- The workflow requires broad access to sensitive systems before it provides value.
- A mistake could immediately harm a person, spend money, create a legal obligation, or alter an important record without meaningful review.

Agents should not be used to avoid defining a broken process. Clarify the work first.

## Where should humans stay involved?

Human review belongs where judgment, accountability, or consequences are high. Common approval points include:

- Sending an external message in the organization’s name.
- Spending or transferring money.
- Deleting or changing important records.
- Making hiring, legal, financial, compliance, health, or pastoral decisions.
- Using sensitive personal or confidential information.
- Acting when evidence is missing or sources disagree.

The [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) treats governance, mapping, measurement, and management as continuing responsibilities across an AI system’s lifecycle. Its [AI RMF Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) also calls for organizations to define roles and responsibilities for human oversight.

Use our [human-in-the-loop patterns](/knowledge/human-in-the-loop-patterns-for-agents) and [guardrails guide](/knowledge/guardrails-and-safety) to design those review points.

## How do you know whether an agent works?

Do not judge an agent from one impressive demonstration. Build a small set of representative examples and record:

- Whether it completed the intended task.
- Whether its facts and sources were correct.
- Whether it selected the right tool.
- Whether it respected boundaries and approval rules.
- How often a person edited or rejected the output.
- How long it took and what it cost.
- Which failure patterns repeated.

The initial target does not need to be a universal percentage. It needs to be an explicit standard your team can defend for that workflow.

## A safe first-agent checklist

Before testing your first agent, write down:

- [ ] One user and one workflow.
- [ ] One measurable definition of success.
- [ ] The information the agent may use.
- [ ] The tools it may access.
- [ ] The actions it may only draft.
- [ ] The actions it must never take.
- [ ] The point where a person approves or takes over.
- [ ] Five to twenty representative test cases.
- [ ] The logs needed to review outputs, tool calls, errors, time, and cost.
- [ ] A named owner who can pause the workflow.

You can use the [prompting basics guide](/knowledge/prompting-an-agent-the-basics) to write the first instruction and the [Start Your First Agent path](/paths/start-your-first-agent) to work through the process.

## Frequently asked questions

### Is ChatGPT an AI agent?

A conversational AI can support agent-like capabilities when it can choose and use tools toward a goal. A normal chat that only answers prompts is better described as a chatbot. The behavior and permissions matter more than the product label.

### Does an AI agent work without a person?

Some low-risk steps can run with limited intervention after testing, but an organization still owns the permissions, monitoring, policies, and outcomes. Sensitive actions should have explicit human review or control.

### Does an agent automatically connect to my business tools?

No. Connections require APIs or other integrations, accounts, credentials, permissions, testing, and ongoing maintenance. A system prompt or agent instruction pack does not create those connections by itself.

### Do I need multiple agents?

Usually not at the beginning. Start with one agent and one clear workflow. Add more agents only when separate responsibilities, permissions, or evaluation criteria make the design easier to control.

### What should my first agent do?

Choose a repeated, low-risk task where the output can remain a draft. Examples include organizing notes, classifying requests, preparing a checklist, or drafting a response for approval.

## Primary sources

- [OpenAI: A practical guide to building AI agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- [Anthropic: Trustworthy agents in practice](https://www.anthropic.com/research/trustworthy-agents)
- [NIST: AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [NIST AI Resource Center: AI RMF Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/)

Ready to move from definition to a small, testable workflow? Follow the [Start Your First Agent learning path](/paths/start-your-first-agent).
$article$,
  read_minutes = greatest(
    1,
    ceil(
      array_length(
        regexp_split_to_array(trim($article$
An AI agent is software that uses an AI model to decide which steps and tools to use toward a goal, observes the results, and continues within defined limits. Unlike a basic chatbot, an agent can manage part of a workflow—but people still need to control permissions, review sensitive actions, and measure results.
$article$),
        E'\\s+'
      ),
      1
    ) / 220.0
  )::integer
  ),
  updated_at = now()
where slug = 'ai-agents-in-plain-english';
