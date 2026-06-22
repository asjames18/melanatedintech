
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'member');
CREATE TYPE public.agent_tier AS ENUM ('free', 'premium', 'custom');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =========================
-- profiles
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are readable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =========================
-- user_roles
-- =========================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger after both tables exist
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- agents
-- =========================
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  tier agent_tier NOT NULL DEFAULT 'free',
  price_cents INTEGER,
  image_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.agents TO anon, authenticated;
GRANT ALL ON public.agents TO service_role;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active agents are public" ON public.agents FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins manage agents" ON public.agents FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- articles
-- =========================
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL,
  read_minutes INTEGER NOT NULL DEFAULT 5,
  published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published articles are public" ON public.articles FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins manage articles" ON public.articles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- products
-- =========================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tier agent_tier NOT NULL DEFAULT 'free',
  price_cents INTEGER,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active products are public" ON public.products FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- services
-- =========================
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  outcomes TEXT[] NOT NULL DEFAULT '{}',
  starting_price_cents INTEGER,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active services are public" ON public.services FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins manage services" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- waitlist_signups
-- =========================
CREATE TABLE public.waitlist_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT,
  interest TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email, source)
);
GRANT INSERT ON public.waitlist_signups TO anon, authenticated;
GRANT SELECT ON public.waitlist_signups TO authenticated;
GRANT ALL ON public.waitlist_signups TO service_role;
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can join waitlist" ON public.waitlist_signups FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read waitlist" ON public.waitlist_signups FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- contact_messages
-- =========================
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  topic TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read contact" ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- saved_agents
-- =========================
CREATE TABLE public.saved_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_agents TO authenticated;
GRANT ALL ON public.saved_agents TO service_role;
ALTER TABLE public.saved_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved agents" ON public.saved_agents FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================
-- SEED DATA
-- =========================
INSERT INTO public.agents (slug, name, tagline, category, tier, capabilities, featured, description) VALUES
('ministry-ops-agent', 'Ministry Ops Agent', 'Run your church operations on autopilot.', 'Church & Ministry', 'premium', ARRAY['Sermon prep','Volunteer scheduling','Member follow-up','Event planning'], true,
'Ministry Ops Agent helps pastors and ministry leaders automate the back-office work that drains time — from sermon research and outline drafting to volunteer scheduling, first-time-guest follow-up, and event logistics. Built with memory, skills, and MCP-aware tools for real church workflows.'),
('sermon-research-agent', 'Sermon Research Agent', 'Deep biblical research in minutes, not hours.', 'Church & Ministry', 'free', ARRAY['Scripture cross-reference','Original language insight','Outline drafting','Illustration discovery'], false,
'Hand the Sermon Research Agent a passage and a theme — it returns cross-references, original-language notes, outline options, and illustrations grounded in trusted sources.'),
('small-business-cfo', 'Small Business CFO Agent', 'A CFO-in-your-pocket for solopreneurs.', 'Business', 'premium', ARRAY['Cash-flow analysis','Pricing strategy','Vendor reviews','Monthly reporting'], true,
'The Small Business CFO Agent watches your numbers daily, flags risks early, and produces a clean monthly report you can actually use to make decisions.'),
('lead-gen-agent', 'Lead Gen Agent', 'Find, qualify, and warm-intro prospects 24/7.', 'Sales', 'premium', ARRAY['ICP research','List building','Personalized outreach','CRM updates'], true,
'Lead Gen Agent finds matches to your ideal customer profile, drafts personalized first-touches, and keeps your CRM clean — so your pipeline never runs dry.'),
('creator-studio-agent', 'Creator Studio Agent', 'From idea to shipped post — without burning out.', 'Creators', 'premium', ARRAY['Content ideation','Script drafting','Thumbnail concepts','Multi-platform repurposing'], true,
'Creator Studio Agent takes a single idea and turns it into a publishable long-form script, short-form hooks, captions, and platform-specific repurposing.'),
('research-agent', 'Deep Research Agent', 'Multi-source research you can actually cite.', 'Research', 'free', ARRAY['Source triangulation','Citation tracking','Brief drafting','Bias checks'], false,
'Deep Research Agent triangulates sources, tracks citations inline, and writes a structured brief you can hand to a stakeholder without rewriting.'),
('customer-support-agent', 'Customer Support Agent', 'First-line support that actually resolves issues.', 'Customer Service', 'premium', ARRAY['Ticket triage','Knowledge-base answers','Refund workflows','Tone-matched replies'], false,
'A support agent that reads your knowledge base, your tone, and your refund policy — and resolves tier-1 tickets without sending customers in circles.'),
('personal-chief-of-staff', 'Personal Chief of Staff', 'Your calendar, inbox, and brain — orchestrated.', 'Productivity', 'premium', ARRAY['Inbox triage','Meeting prep','Daily brief','Follow-up tracking'], true,
'Personal Chief of Staff agent runs your day: triages inbox, preps you for every meeting, and chases the follow-ups you forgot.');

INSERT INTO public.articles (slug, title, excerpt, category, read_minutes, body) VALUES
('what-is-an-ai-agent', 'What Is an AI Agent, Really?', 'A practical definition that goes beyond the hype — and what separates an agent from a chatbot or a workflow.', 'Fundamentals', 6,
'# What Is an AI Agent, Really?

An AI agent is a system that uses a language model as its reasoning engine to **decide what to do next** in pursuit of a goal — not just to respond to a single prompt.

## Agent vs. Chatbot vs. Workflow

- **Chatbot**: replies to a message. No memory of yesterday. No tools.
- **Workflow**: a fixed pipeline. Always runs the same steps.
- **Agent**: given a goal, chooses tools, recovers from failure, and remembers what matters.

## The four pieces

1. **Reasoning loop** — the model decides the next action.
2. **Tools** — what the agent can actually do (search, write, call APIs).
3. **Memory** — what it remembers between turns and between sessions.
4. **Guardrails** — what it must not do.

If a system is missing any of these four, it''s probably closer to a workflow than an agent.'),
('agent-memory-explained', 'Agent Memory, Explained Without the Jargon', 'Working memory, episodic memory, and semantic memory — how to choose what your agent actually needs.', 'Agent Memory', 8,
'# Agent Memory, Explained

Memory is the difference between an agent that helps once and an agent that gets better the more you use it.

## Three layers worth knowing

- **Working memory** — the current conversation context. Cheap, fast, forgotten.
- **Episodic memory** — specific past events ("on Tuesday the user asked X"). Useful for follow-ups.
- **Semantic memory** — distilled facts ("user prefers concise replies"). Useful forever.

Most teams over-engineer memory. Start with working + a single vector store for semantic. Add episodic only when a real task demands it.'),
('mcp-servers-primer', 'MCP Servers: A Practical Primer', 'Model Context Protocol in plain English — and the three patterns that show up in every real deployment.', 'MCP', 7,
'# MCP Servers: A Practical Primer

MCP (Model Context Protocol) lets agents discover and call tools at runtime through a standard interface.

## Why it matters

Before MCP, every tool integration was bespoke. With MCP, an agent connects to a server and asks "what can you do?" — then uses what fits.

## Three patterns we see constantly

1. **Read-only data servers** — a safe way to give an agent eyes on your data.
2. **Action servers** — sending messages, creating records, calling APIs.
3. **Long-running task servers** — agents kick off jobs and check back later.'),
('multi-agent-systems', 'When You Actually Need Multi-Agent Systems', 'Most problems don''t need a swarm. Here''s how to tell when they do.', 'Agent Architecture', 6,
'# When You Actually Need Multi-Agent Systems

The honest answer: less often than the demos suggest.

## A single agent is enough when

- The task has one clear goal.
- The tools fit in one context window.
- You can describe the success criteria in a paragraph.

## You probably want multiple agents when

- The roles are genuinely different (researcher vs. writer vs. critic).
- You need parallelism for speed.
- The system must keep working when one agent fails.'),
('local-ai-with-ollama', 'Local AI With Ollama: Why It Matters', 'Privacy, cost, and offline capability — when local models are the right call.', 'Local AI', 5,
'# Local AI With Ollama

Running models locally with Ollama isn''t just a privacy story — it changes what kinds of agents you can build.

## What you get

- Zero per-token cost after setup.
- Data never leaves the machine.
- Works without internet.

## What you give up

- Frontier-level reasoning quality (for now).
- Easy scaling across users.'),
('agent-skills-vs-tools', 'Agent Skills vs. Tools: The Distinction That Matters', 'Why the best agent builders separate "what an agent can do" from "what it knows how to do well."', 'Agent Skills', 6,
'# Agent Skills vs. Tools

A **tool** is a capability — "send_email", "search_web".
A **skill** is a packaged way of solving a recurring problem — "respond to a refund request", "write a board update".

Tools are primitives. Skills are playbooks built on top of them. The agents that feel magical have a small set of well-defined skills, not an enormous tool box.');

INSERT INTO public.products (slug, name, tagline, category, tier, description) VALUES
('agent-starter-kit', 'AI Agent Starter Kit', 'Everything you need to ship your first agent this weekend.', 'Starter Kits', 'free',
'A complete starter pack: project structure, base prompts, tool definitions, memory scaffolding, and a deployable example agent. Built on patterns from real production systems.'),
('agent-blueprint-pack', 'Agent Blueprint Pack', '12 production-ready blueprints across business, ministry, and creator use cases.', 'Blueprints', 'premium',
'A library of blueprints — each one a complete plan: goal, tools, memory model, guardrails, evaluation checklist. Lift and adapt.'),
('prompt-library-pro', 'Prompt Library Pro', '300+ tested prompts organized by agent role and task.', 'Prompts', 'premium',
'A working prompt library, not a screenshot dump. Categorized by agent role, with notes on what failed and why we kept what we kept.'),
('sop-library-for-agents', 'SOP Library for AI Agents', 'Standard operating procedures rewritten in a format agents actually follow.', 'SOPs', 'premium',
'Most SOPs were written for humans and confuse agents. This library rewrites the 40 most common business SOPs in agent-readable format.'),
('mcp-collection', 'Curated MCP Collection', 'A vetted list of MCP servers — what they do, what they cost, and what to watch for.', 'MCP', 'free',
'We test MCP servers so you don''t have to. Each entry covers setup time, auth model, rate limits, and the rough edges that aren''t in the docs.'),
('agent-memory-system', 'Agent Memory System', 'A drop-in memory layer with working, episodic, and semantic memory.', 'Memory', 'premium',
'A reference implementation of a three-tier memory system with adapters for the most common vector stores. Includes evaluation harness.');

INSERT INTO public.services (slug, name, tagline, description, outcomes) VALUES
('agent-strategy-sprint', 'Agent Strategy Sprint', 'A two-week sprint to identify and validate your highest-leverage agent.',
'We work with your team to map the workflows in your organization where an AI agent will create real, measurable value — then validate the top candidate with a working prototype.',
ARRAY['Prioritized list of 5 agent opportunities','Working prototype of #1 opportunity','ROI model and rollout plan']),
('custom-agent-build', 'Custom Agent Build', 'We design, build, and deploy a production agent for your business.',
'End-to-end custom agent development: discovery, architecture, build, evaluation harness, deployment, and a handoff your team can actually maintain.',
ARRAY['Production-ready agent','Evaluation suite','Runbook + team handoff','30 days of post-launch support']),
('ministry-ai-implementation', 'Ministry AI Implementation', 'A done-with-you program for churches and ministries adopting AI agents.',
'Designed for ministries: we install practical agents (sermon research, member follow-up, volunteer ops) and train your team in stewardship and ethics alongside the tech.',
ARRAY['3 deployed ministry agents','Team training','Ethical use playbook','Quarterly review']),
('ai-workshop', 'Team AI Workshop', 'A one-day workshop that gets your team building, not just watching.',
'A working workshop — by the end of the day every participant has built and shipped an agent for a real task they own.',
ARRAY['Shared team vocabulary','One shipped agent per person','30-day follow-up office hours']);
