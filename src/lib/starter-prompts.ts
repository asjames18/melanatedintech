/**
 * One-tap starter prompts for the chat empty state, keyed by agent category.
 * Kept data-only on purpose: no logic, just three short generic openers per
 * category so a first-time buyer never faces a blank box. Covers all nine
 * live agent categories (verified against the /agents page); unknown
 * categories get null — the chat simply keeps its plain empty state.
 */
const PROMPTS: Record<string, string[]> = {
  "Customer Service": [
    "Draft a friendly reply to an unhappy customer",
    "Summarize this complaint in one line for my team",
    "Turn this review into a public response",
  ],
  "Data & Analytics": [
    "What should I look at in my sales data this month?",
    "Help me design a simple weekly report",
    "Explain a metric like I'm new to analytics",
  ],
  Productivity: [
    "Draft my plan for today from these tasks",
    "Rewrite this email to be shorter and clearer",
    "Turn these notes into an action list",
  ],
  Marketing: [
    "Outline a launch plan for my new offer",
    "Give me 5 headline ideas for my landing page",
    "Turn this feature into a benefit-driven pitch",
  ],
  Finance: [
    "Explain cash flow in plain English",
    "Help me set up a simple monthly budget",
    "What should I look at in my books this week?",
  ],
  Community: [
    "Help me write a warm welcome post",
    "Give me ideas to re-engage a quiet community",
    "Draft a short weekly update for my members",
  ],
  "Agent Governance": [
    "Help me write a simple usage policy for my AI agent",
    "What checks should I run before launching an AI agent?",
    "Draft an incident checklist for agent failures",
  ],
  Recruiting: [
    "Write a clear job post for this role",
    "Give me 5 interview questions for a candidate",
    "Summarize what to look for in resumes",
  ],
};

export function starterPromptsFor(
  category: string | null | undefined,
): string[] | null {
  if (!category) return null;
  return PROMPTS[category] ?? null;
}
