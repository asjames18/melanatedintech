-- Recorded remotely as migration version 20260715182420.
-- Phase 1 content truthfulness fixes from the July 15, 2026 content/SEO audit.
-- Align public product promises and learning-path assignments with the current
-- browser experience and Markdown-based fulfillment.

update public.products
set
  tagline = 'Reusable prompt patterns organized by agent role and task.',
  description = E'A concise reference library of reusable prompt patterns for structuring outputs, building plans, and using tools more carefully.\n\n## Included categories\n- **Output shaping:** Patterns for structured JSON, tables, and Markdown.\n- **Planning and decomposition:** Patterns for breaking a goal into reviewable steps.\n- **Refinement loops:** Patterns for critiquing and improving a draft.\n\nDelivered as an online Markdown guide with a `.md` download.',
  updated_at = now()
where slug = 'prompt-library-pro';

update public.products
set
  tagline = 'Reusable core skill patterns for common agent workflows.',
  description = E'A starter reference for designing reusable agent skills in Node and TypeScript.\n\n## Included examples\n- **Scrape and summarize:** Turn fetched web content into a concise outline.\n- **Batch file processing:** Scan and transform supported text files.\n- **Safer SQL execution:** Constrain database operations with validation and an allowlist.\n\nThe current product is delivered as an online Markdown guide with a `.md` download. External services, credentials, deployment, and a hosted integration are not included.',
  updated_at = now()
where slug = 'agent-skill-pack-core';

-- Build for ministry/nonprofit: describe the table and Markdown kit accurately.
update public.learning_path_items
set excerpt = E'Objective: Examine an agent that turns volunteer availability text into a proposed service roster.\n\nAssignment: Open the Volunteer Coordinator Agent, provide fictional sample availability, and review whether its structured schedule table is complete and conflict-free. Do not enter private volunteer information.'
where id = '6d16e7c5-86cb-4a15-af00-1139c8bde19c';

update public.learning_path_items
set excerpt = E'Objective: Apply prompt frameworks and planning cards to church administration and event planning.\n\nAssignment: Open the Ministry AI Starter Kit, read it online or download the Markdown guide, then adapt the volunteer-roster section to a fictional ministry workflow. Keep real congregant and volunteer data out of the exercise.'
where id = '6c7d5de7-e4ef-4d3c-b0ad-61f953caf5aa';

-- Secure your agent: make the drill-card delivery format explicit.
update public.learning_path_items
set excerpt = E'Objective: Practice identifying and reducing injection vulnerabilities in sample prompts.\n\nAssignment: Open the Prompt Injection Drill Cards, read them online or download the Markdown guide, attempt the sample attacks, and document which defensive changes improved the result.'
where id = '1d05aa30-464e-4e66-a8ea-0ebf2f00b1b6';

-- Launch a paid agent product: describe the current Markdown template accurately.
update public.learning_path_items
set excerpt = E'Objective: Organize prompts and agent instructions into a reusable marketplace offer.\n\nAssignment: Open the Proposal Builder Template, read it online or download the Markdown file, then draft an honest contents list, delivery-format statement, license, and listing description for your proposed bundle.'
where id = '09424bfb-6024-4180-b1a2-df568cf9112c';

-- Evaluate your agent: observable logs only; do not promise chain-of-thought.
update public.learning_path_items
set
  title = 'Audit a Multi-Step Research Run',
  excerpt = E'Objective: Observe how response time and visible work change as an agent handles a multi-step question.\n\nAssignment: Run the Research Agent with a non-sensitive test question. Record the final answer, visible source or tool summaries, response time, errors, and number of observable iterations. Do not expect or request private chain-of-thought.'
where id = '734b90c4-b1f2-415a-8bf0-2276cd1db589';

update public.learning_path_items
set
  title = 'Apply the Evaluation Harness Guide',
  excerpt = E'Objective: Turn a small golden set into a repeatable evaluation process.\n\nAssignment: Open the Agent Evaluation Harness, read it online or download the Markdown guide, adapt the sample test structure to your cases, and draft a simple Markdown results report.'
where id = '61455fae-d28f-44d2-8ac6-21c606ca3d12';

-- Start your first agent: route around the obsolete 2023 setup tutorial and
-- replace unavailable system-prompt inspection with an observable behavior test.
update public.learning_path_items
set
  item_slug = 'prompting-an-agent-the-basics',
  title = 'Prepare Your First Agent Session',
  excerpt = E'Objective: Learn how to give an agent a clear goal, context, constraints, and output format before testing a workflow.\n\nAssignment: Read the prompting guide, write one test request with those four parts, and remove any private or customer information before using it.'
where id = '21b4dac1-0a92-4a10-935a-7b6d3454c62c';

update public.learning_path_items
set item_slug = 'choose-your-first-agent-workflow'
where id = '1ed7f89d-62f9-499e-a9a1-0c6afa817ab9';

update public.learning_path_items
set excerpt = E'Objective: Study how an agent turns a research request into a structured output.\n\nAssignment: Launch the Customer Research Agent with a fictional sample question. Record the inputs you supplied, evaluate the output for evidence and unsupported claims, and identify one instruction that would improve the next run.'
where id = '84fdff89-ac15-4aad-afcf-6eef089a3ce7';

update public.learning_path_items
set excerpt = E'Objective: Document your pilot agent’s scope, inputs, tools, boundaries, and success measure.\n\nAssignment: Open the Agent Launch Planner, read it online or download the Markdown file, complete the one-page brief for your chosen pilot workflow, and identify the human approval point.'
where id = '7c6fcd0b-5aca-49c0-985e-e0f25e51b86b';
