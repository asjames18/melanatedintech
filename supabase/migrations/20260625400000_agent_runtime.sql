-- Agent runtime: add model selection and system prompt to agents so users can
-- actually chat with AI agents instead of just reading static markdown packs.

alter table public.agents
  add column if not exists model text not null default 'gpt-4o-mini',
  add column if not exists system_prompt text,
  add column if not exists max_tokens integer not null default 1000,
  add column if not exists temperature numeric(3,2) not null default 0.7;

-- Index for filtering by model.
create index if not exists agents_model_idx on public.agents (model);
