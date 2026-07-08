-- Migration to upgrade learning path items with structured training objectives and assignments.

DO $$
DECLARE
  p1_id uuid;
  p2_id uuid;
  p3_id uuid;
  p4_id uuid;
  p5_id uuid;
BEGIN
  -- Get path IDs
  SELECT id INTO p1_id FROM public.learning_paths WHERE slug = 'start-your-first-agent';
  SELECT id INTO p2_id FROM public.learning_paths WHERE slug = 'secure-your-agent';
  SELECT id INTO p3_id FROM public.learning_paths WHERE slug = 'evaluate-your-agent';
  SELECT id INTO p4_id FROM public.learning_paths WHERE slug = 'build-for-ministry-nonprofit';
  SELECT id INTO p5_id FROM public.learning_paths WHERE slug = 'launch-a-paid-agent-product';

  -- ==========================================
  -- PATH 1: Start Your First Agent
  -- ==========================================

  UPDATE public.learning_path_items
  SET title = 'Understanding the Agent Mindset',
      excerpt = 'Objective: Learn the core components of an AI agent (Goal, Memory, Planning, Tools) and how they differ from simple static LLM prompts.' || chr(10) || chr(10) || 'Assignment: Read the plain-English explanation, review the simple Python loop pseudo-code, and write down the 5 common pitfalls.'
  WHERE path_id = p1_id AND item_type = 'article' AND item_slug = 'ai-agents-in-plain-english';

  UPDATE public.learning_path_items
  SET title = 'Setting Up Your First Workspace',
      excerpt = 'Objective: Prepare your development or low-code environment to build your first working agent pilot.' || chr(10) || chr(10) || 'Assignment: Follow the 30-minute guide to configure your OpenAI or Anthropic API keys, run your first prompt template, and verify connectivity.'
  WHERE path_id = p1_id AND item_type = 'article' AND item_slug = 'your-first-30-minutes-with-an-agent';

  UPDATE public.learning_path_items
  SET title = 'Identifying High-Value Automations',
      excerpt = 'Objective: Select a repetitive, low-risk workflow in your day-to-day operations ripe for agentic automation.' || chr(10) || chr(10) || 'Assignment: Apply the 3D Framework (Dull, Daily, Draft-friendly) to list 3 bottlenecks, then select one to serve as your pilot workflow.'
  WHERE path_id = p1_id AND item_type = 'article' AND item_slug = 'choosing-your-first-agent-workflow';

  UPDATE public.learning_path_items
  SET title = 'Analyze a Sandbox Research Agent',
      excerpt = 'Objective: Study how a live, functional agent structures search queries and compiles customer insights.' || chr(10) || chr(10) || 'Assignment: Launch the Customer Research Agent, inspect its system prompt instruction layout, and run a sample research query.'
  WHERE path_id = p1_id AND item_type = 'agent' AND item_slug = 'customer-research-agent';

  UPDATE public.learning_path_items
  SET title = 'Draft Your Agent Launch Plan',
      excerpt = 'Objective: Document your pilot agent''s scope, inputs, tools, and boundary guidelines.' || chr(10) || chr(10) || 'Assignment: Download the Agent Launch Planner PDF, fill out the 1-page brief for your chosen pilot workflow, and define what success looks like.'
  WHERE path_id = p1_id AND item_type = 'product' AND item_slug = 'agent-launch-planner';

  UPDATE public.learning_path_items
  SET title = 'Submit Your Blueprint for Review',
      excerpt = 'Share the repetitive task you want an agent to help with, what tools it can touch, and what a good result would look like. Invite advice from other builders.'
  WHERE path_id = p1_id AND item_type = 'community_prompt' AND item_slug = 'first-agent-intro';


  -- ==========================================
  -- PATH 2: Secure Your Agent
  -- ==========================================

  UPDATE public.learning_path_items
  SET title = 'Unmasking Prompt Injection Threats',
      excerpt = 'Objective: Understand how unauthorized users or external text inputs can hijack your agent''s system instructions.' || chr(10) || chr(10) || 'Assignment: Read the real-world prompt injection examples, study the indirect injection flow, and learn how hackers bypass system rules.'
  WHERE path_id = p2_id AND item_type = 'article' AND item_slug = 'prompt-injection-in-everyday-language';

  UPDATE public.learning_path_items
  SET title = 'Implementing Production Guardrails',
      excerpt = 'Objective: Learn to establish defensive programming and validation layers around your LLM outputs.' || chr(10) || chr(10) || 'Assignment: Study the implementation of JSON schema validation, output parsing limits, and prompt sanitizers to shield your agent.'
  WHERE path_id = p2_id AND item_type = 'article' AND item_slug = 'keeping-an-agent-safe-in-production';

  UPDATE public.learning_path_items
  SET title = 'Securing Tool and System Connections',
      excerpt = 'Objective: Safely connect your agent to local file systems and databases using Model Context Protocol (MCP).' || chr(10) || chr(10) || 'Assignment: Walk through the security checklist, set up read-only file permissions, and verify your local server ports are locked.'
  WHERE path_id = p2_id AND item_type = 'article' AND item_slug = 'mcp-security-checklist-non-security-teams';

  UPDATE public.learning_path_items
  SET title = 'Designing Human-in-the-Loop Gates',
      excerpt = 'Objective: Build approval gates for sensitive actions like sending emails, spending money, or writing database records.' || chr(10) || chr(10) || 'Assignment: Review the three core Human-in-the-Loop patterns (Manual Review, Threshold-based, and Auditor) and select one for your pilot.'
  WHERE path_id = p2_id AND item_type = 'article' AND item_slug = 'human-in-the-loop-patterns-for-agents';

  UPDATE public.learning_path_items
  SET title = 'Test an Automated Auditor',
      excerpt = 'Objective: Test how an evaluator agent can review system actions against policy compliance logs.' || chr(10) || chr(10) || 'Assignment: Launch the Compliance Ops Agent, send it a sample transcript, and examine how it flags potential security or prompt policy leaks.'
  WHERE path_id = p2_id AND item_type = 'agent' AND item_slug = 'compliance-ops-agent';

  UPDATE public.learning_path_items
  SET title = 'Run a Red-Team Stress Test',
      excerpt = 'Objective: Practice identifying and patching injection vulnerabilities in sample prompts.' || chr(10) || chr(10) || 'Assignment: Download the Drill Cards, attempt to ''break'' the example prompts, and apply the suggested defensive prompt templates.'
  WHERE path_id = p2_id AND item_type = 'product' AND item_slug = 'prompt-injection-drill-cards';

  UPDATE public.learning_path_items
  SET title = 'Peer Review Your Security Boundary',
      excerpt = 'Describe one decision your agent should never make alone and ask the community how they would route human review.'
  WHERE path_id = p2_id AND item_type = 'community_prompt' AND item_slug = 'approval-gates';


  -- ==========================================
  -- PATH 3: Evaluate Your Agent
  -- ==========================================

  UPDATE public.learning_path_items
  SET title = 'Assembling a Golden Test Dataset',
      excerpt = 'Objective: Learn to build a static suite of test cases to benchmark agent accuracy and consistency.' || chr(10) || chr(10) || 'Assignment: Study how to compile 10 to 20 representative user queries alongside their expected ''ideal'' output structures (ground truth).'
  WHERE path_id = p3_id AND item_type = 'article' AND item_slug = 'agent-evaluation-golden-set';

  UPDATE public.learning_path_items
  SET title = 'Quantifying LLM Quality and Accuracies',
      excerpt = 'Objective: Establish scorecards and metrics to grade agent outputs objectively instead of relying on gut feelings.' || chr(10) || chr(10) || 'Assignment: Review the grading metrics (Hallucination rate, Task Success, Tool selection accuracy) and write a simple evaluation script.'
  WHERE path_id = p3_id AND item_type = 'article' AND item_slug = 'measuring-if-your-agent-actually-works';

  UPDATE public.learning_path_items
  SET title = 'Tracking Real-World Runtime Metrics',
      excerpt = 'Objective: Monitor agent behavior, token latencies, and user satisfaction logs once live in production.' || chr(10) || chr(10) || 'Assignment: Read the production telemetry guide, note the key logs to collect, and plan your database dashboard layout.'
  WHERE path_id = p3_id AND item_type = 'article' AND item_slug = 'what-to-measure-after-agent-launch';

  UPDATE public.learning_path_items
  SET title = 'Optimizing Latency and Token Budgets',
      excerpt = 'Objective: Keep API costs predictable and prevent infinite agent reasoning loops from inflating your bills.' || chr(10) || chr(10) || 'Assignment: Apply the cost-reduction strategies: implement caching, swap to smaller models for simple nodes, and add strict loop step limits.'
  WHERE path_id = p3_id AND item_type = 'article' AND item_slug = 'ai-agent-cost-control-playbook';

  UPDATE public.learning_path_items
  SET title = 'Audit a Multi-Step Reasoning Agent',
      excerpt = 'Objective: Observe how token consumption and latencies scale as an agent executes multiple search loops.' || chr(10) || chr(10) || 'Assignment: Run the Research Agent with a complex question, track the number of loops it runs, and inspect its thinking trace logs.'
  WHERE path_id = p3_id AND item_type = 'agent' AND item_slug = 'research-agent';

  UPDATE public.learning_path_items
  SET title = 'Deploy an Automated Test Script',
      excerpt = 'Objective: Set up an automated harness to run your golden set queries and calculate overall success rate.' || chr(10) || chr(10) || 'Assignment: Download the Evaluation Harness package, load your test cases, and analyze the compiled markdown quality report.'
  WHERE path_id = p3_id AND item_type = 'product' AND item_slug = 'agent-eval-harness';

  UPDATE public.learning_path_items
  SET title = 'Share and Refine Test Scenarios',
      excerpt = 'Post three examples your agent should handle well and invite feedback on edge cases you may be missing.'
  WHERE path_id = p3_id AND item_type = 'community_prompt' AND item_slug = 'golden-set-review';


  -- ==========================================
  -- PATH 4: Build For Ministry/Nonprofit
  -- ==========================================

  UPDATE public.learning_path_items
  SET title = 'Theological and Ethical AI Foundations',
      excerpt = 'Objective: Establish boundaries for using AI in faith-based and community-centered organizations without losing trust or human touch.' || chr(10) || chr(10) || 'Assignment: Read the guide on balancing technology with personal pastoral care, noting where AI supports and where it should not go.'
  WHERE path_id = p4_id AND item_type = 'article' AND item_slug = 'ai-in-ministry-a-gentle-start';

  UPDATE public.learning_path_items
  SET title = 'Engaging and Uplifting Volunteers',
      excerpt = 'Objective: Design support automations that empower your team and volunteers rather than making them feel replaced.' || chr(10) || chr(10) || 'Assignment: Study the community flywheel model to see how automated tracking can help organize rosters and highlight volunteer accomplishments.'
  WHERE path_id = p4_id AND item_type = 'article' AND item_slug = 'community-flywheel-for-ai-builders';

  UPDATE public.learning_path_items
  SET title = 'Safety for Vulnerable Workflows',
      excerpt = 'Objective: Ensure all communication sent to community members, donors, or congregants is human-approved.' || chr(10) || chr(10) || 'Assignment: Review the Manual Review and Approval Gate architectures, mapping them specifically to volunteer response drafting.'
  WHERE path_id = p4_id AND item_type = 'article' AND item_slug = 'human-in-the-loop-patterns-for-agents';

  UPDATE public.learning_path_items
  SET title = 'Coordinate Volunteer Schedules',
      excerpt = 'Objective: Examine an agent that digests volunteer availability emails and maps them onto a service roster.' || chr(10) || chr(10) || 'Assignment: Load the Volunteer Coordinator Agent, input sample availability text, and verify that the output spreadsheet table is formatted properly.'
  WHERE path_id = p4_id AND item_type = 'agent' AND item_slug = 'volunteer-coordinator-agent';

  UPDATE public.learning_path_items
  SET title = 'Manage Community Conversations',
      excerpt = 'Objective: Study how to monitor community message boards for moderation and resource mapping.' || chr(10) || chr(10) || 'Assignment: Run the Community Manager Agent with sample discussion threads, checking how it draft answers or flags urgent support needs.'
  WHERE path_id = p4_id AND item_type = 'agent' AND item_slug = 'community-manager-agent';

  UPDATE public.learning_path_items
  SET title = 'Deploy Ministry Templates',
      excerpt = 'Objective: Launch pre-built prompt frameworks and automation cards for church administration and event planning.' || chr(10) || chr(10) || 'Assignment: Download the Ministry AI Starter Kit, select the Volunteer Roster template, and configure it in your workspace.'
  WHERE path_id = p4_id AND item_type = 'product' AND item_slug = 'ministry-ai-starter-kit';

  UPDATE public.learning_path_items
  SET title = 'Define Your Organizational Boundaries',
      excerpt = 'Share who benefits from your workflow, where human care must stay visible, and where automation should stay in the background.'
  WHERE path_id = p4_id AND item_type = 'community_prompt' AND item_slug = 'people-centered-agent';


  -- ==========================================
  -- PATH 5: Launch A Paid Agent/Product
  -- ==========================================

  UPDATE public.learning_path_items
  SET title = 'Converting Services to Automations',
      excerpt = 'Objective: Identify how manual spreadsheets and consulting frameworks can be packaged into interactive agent tools.' || chr(10) || chr(10) || 'Assignment: Review your current client deliverables, extract the step-by-step logic, and design an agent interface outline.'
  WHERE path_id = p5_id AND item_type = 'article' AND item_slug = 'from-spreadsheet-to-agent-tool';

  UPDATE public.learning_path_items
  SET title = 'Pricing Your Agent Subscriptions',
      excerpt = 'Objective: Calculate API costs per user request to set healthy pricing tiers for your commercial agent product.' || chr(10) || chr(10) || 'Assignment: Walk through the cost playbook, calculate worst-case token costs for a multi-step workflow, and design your product''s margin buffer.'
  WHERE path_id = p5_id AND item_type = 'article' AND item_slug = 'ai-agent-cost-control-playbook';

  UPDATE public.learning_path_items
  SET title = 'Customer Value and Retention Telemetry',
      excerpt = 'Objective: Measure product engagement and performance to ensure clients don''t cancel their subscriptions.' || chr(10) || chr(10) || 'Assignment: Select 3 key telemetry metrics (user success rate, average completion time, active usage) to display on your product admin board.'
  WHERE path_id = p5_id AND item_type = 'article' AND item_slug = 'what-to-measure-after-agent-launch';

  UPDATE public.learning_path_items
  SET title = 'Audit Commercial Proposal Drafting',
      excerpt = 'Objective: Study how a business agent takes simple inputs and compiles structured commercial proposals.' || chr(10) || chr(10) || 'Assignment: Run the Proposal Builder Agent with a sample client scope, and analyze how it maps client goals to deliverables.'
  WHERE path_id = p5_id AND item_type = 'agent' AND item_slug = 'proposal-builder-agent';

  UPDATE public.learning_path_items
  SET title = 'Examine Media and Marketing Specialists',
      excerpt = 'Objective: Learn how to build workflows that ingest media files and output marketing campaigns.' || chr(10) || chr(10) || 'Assignment: Ingest a sample transcript into the Podcast Producer Agent, review the generated show notes, and study the parallel task structure.'
  WHERE path_id = p5_id AND item_type = 'agent' AND item_slug = 'podcast-producer-agent';

  UPDATE public.learning_path_items
  SET title = 'Package and License Your Work',
      excerpt = 'Objective: Package prompts and system prompts as reusable, downloadable seller files for the marketplace.' || chr(10) || chr(10) || 'Assignment: Download the template, structure your custom agent prompts as a commercial bundle, and draft its listing description.'
  WHERE path_id = p5_id AND item_type = 'product' AND item_slug = 'proposal-builder-template';

  UPDATE public.learning_path_items
  SET title = 'Pitch Your Paid Offering',
      excerpt = 'Post the problem, buyer, promise, and proof for your paid agent/product idea, then ask what still feels unclear.'
  WHERE path_id = p5_id AND item_type = 'community_prompt' AND item_slug = 'paid-offer-feedback';

END $$;
