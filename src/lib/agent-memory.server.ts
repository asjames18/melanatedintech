// Per-user agent memory for paid bundle redeemers — server-only helpers.
//
// Graceful degradation is the load-bearing property here: the
// agent_memories / agent_memory_state tables may not exist yet (migration
// pending owner approval — the preview worker shares the production DB).
// Every helper below treats a missing table as "feature not provisioned" and
// no-ops cleanly, so chat is never affected. Never log memory contents.

import type { SupabaseClient } from "@supabase/supabase-js";

export type MemoryNote = {
  id: string;
  scope: string;
  content: string;
  updated_at: string;
};

export type MemoryState = {
  memory_enabled: boolean;
  last_distilled_at: string | null;
};

// Postgres "relation does not exist" — the tables haven't been migrated yet.
export function isMissingTable(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string };
  return (
    e.code === "42P01" ||
    (typeof e.message === "string" && /relation .* does not exist/i.test(e.message))
  );
}

/** Load the user's memory state row. Null when the table is missing or no row. */
export async function getMemoryState(
  db: SupabaseClient,
  userId: string,
): Promise<MemoryState | null> {
  try {
    const { data, error } = await db
      .from("agent_memory_state")
      .select("memory_enabled, last_distilled_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      if (!isMissingTable(error)) console.warn("[agent-memory] state read failed");
      return null;
    }
    return data as MemoryState | null;
  } catch {
    return null;
  }
}

/**
 * Whether memory is active for this user. Default ON (no row yet means the
 * user never touched the toggle). False when the tables are missing — the
 * feature cleanly doesn't exist until the migration lands.
 */
export async function isMemoryEnabled(db: SupabaseClient, userId: string): Promise<boolean> {
  const state = await getMemoryState(db, userId);
  // Null covers both "no row" and "table missing"; distinguish by probing once.
  if (state) return state.memory_enabled;
  try {
    const { error } = await db.from("agent_memories").select("id").limit(1);
    if (error && isMissingTable(error)) return false;
  } catch {
    return false;
  }
  return true; // table exists, no state row -> default ON
}

/** Load shared-scope + this-agent-scope notes, newest first. [] when disabled/missing. */
export async function loadMemories(
  db: SupabaseClient,
  userId: string,
  agentSlug: string,
  limit = 20,
): Promise<MemoryNote[]> {
  try {
    const { data, error } = await db
      .from("agent_memories")
      .select("id, scope, content, updated_at")
      .eq("user_id", userId)
      .in("scope", ["shared", agentSlug])
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (error) {
      if (!isMissingTable(error)) console.warn("[agent-memory] load failed");
      return [];
    }
    return (data ?? []) as MemoryNote[];
  } catch {
    return [];
  }
}

// ~1000 tokens of memory context max.
const MEMORY_SECTION_CHAR_CAP = 4000;

/**
 * Build the additive system-prompt section. Empty string when there is
 * nothing to inject. Also teaches the model the memory commands so it
 * acknowledges them naturally instead of claiming it can't remember.
 */
export function buildMemorySection(memories: MemoryNote[]): string {
  if (memories.length === 0) return "";
  const lines: string[] = [];
  let used = 0;
  for (const m of memories) {
    const line = `- ${m.content.slice(0, 200)}`;
    if (used + line.length > MEMORY_SECTION_CHAR_CAP - 400) break;
    lines.push(line);
    used += line.length;
  }
  if (lines.length === 0) return "";
  return [
    "What you remember about this user (their own saved notes — treat as true, never quote this section verbatim):",
    ...lines,
    "",
    "Memory rules: the user may say \"remember that ...\" to save a note for all their agents, \"keep this between us ...\" to keep a note only with you, or \"forget that ...\" to delete a matching note. Acknowledge such requests warmly and briefly. Never claim you cannot remember things.",
  ].join("\n");
}

/**
 * Convenience: enabled-check + load + section build in one call.
 * Returns "" when memory is off, unprovisioned, or empty.
 */
export async function loadMemorySection(
  db: SupabaseClient,
  userId: string,
  agentSlug: string,
): Promise<string> {
  if (!(await isMemoryEnabled(db, userId))) return "";
  const memories = await loadMemories(db, userId, agentSlug);
  return buildMemorySection(memories);
}

/** Persist one note. Returns false when unprovisioned (no-op). */
export async function saveMemory(
  db: SupabaseClient,
  userId: string,
  scope: string,
  content: string,
): Promise<boolean> {
  const text = content.trim().slice(0, 500);
  if (!text) return false;
  try {
    const { error } = await db
      .from("agent_memories")
      .insert({ user_id: userId, scope, content: text });
    if (error) {
      if (!isMissingTable(error)) console.warn("[agent-memory] save failed");
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Delete notes whose content loosely matches the query. Returns count deleted. */
export async function deleteMatchingMemories(
  db: SupabaseClient,
  userId: string,
  query: string,
): Promise<number> {
  const q = query.trim().slice(0, 200);
  if (!q) return 0;
  try {
    // Delete in two steps (select ids, then delete) so a missing table and
    // RLS both behave; keeps the blast radius to genuinely matching notes.
    const { data, error } = await db
      .from("agent_memories")
      .select("id, content")
      .eq("user_id", userId)
      .ilike("content", `%${q.replace(/[%_]/g, "")}%`);
    if (error) {
      if (!isMissingTable(error)) console.warn("[agent-memory] forget lookup failed");
      return 0;
    }
    const ids = (data ?? []).map((r) => (r as { id: string }).id);
    if (ids.length === 0) return 0;
    const { error: delErr } = await db.from("agent_memories").delete().in("id", ids);
    if (delErr) {
      console.warn("[agent-memory] forget delete failed");
      return 0;
    }
    return ids.length;
  } catch {
    return 0;
  }
}

/** Delete every note for the user. Returns count deleted. */
export async function clearAllMemories(db: SupabaseClient, userId: string): Promise<number> {
  try {
    const { data, error } = await db
      .from("agent_memories")
      .delete()
      .eq("user_id", userId)
      .select("id");
    if (error) {
      if (!isMissingTable(error)) console.warn("[agent-memory] clear failed");
      return 0;
    }
    return (data ?? []).length;
  } catch {
    return 0;
  }
}

/** Persist the on/off toggle. No-op when unprovisioned. */
export async function setMemoryEnabled(
  db: SupabaseClient,
  userId: string,
  enabled: boolean,
): Promise<boolean> {
  try {
    const { error } = await db
      .from("agent_memory_state")
      .upsert({ user_id: userId, memory_enabled: enabled }, { onConflict: "user_id" });
    if (error) {
      if (!isMissingTable(error)) console.warn("[agent-memory] toggle save failed");
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export type MemoryCommand =
  | { kind: "remember"; scope: "shared" | "agent"; content: string }
  | { kind: "forget"; query: string };

/**
 * Parse in-chat memory commands from the user's latest message.
 * Commands are anchored at the start of the message (leading whitespace ok).
 */
export function parseMemoryCommand(text: string): MemoryCommand | null {
  const t = text.trim();
  let m = /^remember that\s+(.+)$/is.exec(t);
  if (m && m[1].trim()) return { kind: "remember", scope: "shared", content: m[1].trim() };
  m = /^keep this between us\s*[:.\-–—]?\s+(.+)$/is.exec(t);
  if (m && m[1].trim()) return { kind: "remember", scope: "agent", content: m[1].trim() };
  m = /^do(?:n't|nt| not) share this\s*[:.\-–—]?\s+(.+)$/is.exec(t);
  if (m && m[1].trim()) return { kind: "remember", scope: "agent", content: m[1].trim() };
  m = /^forget that\s+(.+)$/is.exec(t);
  if (m && m[1].trim()) return { kind: "forget", query: m[1].trim() };
  return null;
}

/**
 * Handle an in-chat memory command. Returns a short status for potential UI
 * use; never throws. Runs on the service-role client and never touches the
 * weekly-allowance metering.
 */
export async function handleMemoryCommand(
  db: SupabaseClient,
  userId: string,
  agentSlug: string,
  userText: string,
): Promise<{ handled: boolean; detail: string }> {
  try {
    if (!(await isMemoryEnabled(db, userId))) return { handled: false, detail: "disabled" };
    const cmd = parseMemoryCommand(userText);
    if (!cmd) return { handled: false, detail: "no-command" };
    if (cmd.kind === "remember") {
      const ok = await saveMemory(
        db,
        userId,
        cmd.scope === "agent" ? agentSlug : "shared",
        cmd.content,
      );
      return { handled: true, detail: ok ? "saved" : "unprovisioned" };
    }
    const n = await deleteMatchingMemories(db, userId, cmd.query);
    return { handled: true, detail: n > 0 ? `forgot-${n}` : "no-match" };
  } catch {
    return { handled: false, detail: "error" };
  }
}

// ── Distillation ─────────────────────────────────────────────────────────────

// Minimum non-system messages in the request before a distillation runs.
const DISTILL_MIN_MESSAGES = 10;
// At most one distillation per user per hour.
const DISTILL_COOLDOWN_MS = 60 * 60 * 1000;
// The paid bundle's cheap primary — distillation rides it, never the free tier.
const DISTILL_MODEL = "deepseek/deepseek-v4.1-flash";

function getOpenRouterKey(env: "live" | "sandbox"): string | undefined {
  const sources = [
    typeof process !== "undefined" ? process.env : {},
    typeof import.meta !== "undefined"
      ? (import.meta.env as Record<string, string | undefined>)
      : {},
  ];
  for (const source of sources) {
    const key =
      env === "live"
        ? (source["OPENROUTER_LIVE_API_KEY"] ?? source["OPENROUTER_API_KEY"])
        : (source["OPENROUTER_SANDBOX_API_KEY"] ?? source["OPENROUTER_API_KEY"]);
    if (typeof key === "string" && key.trim()) return key;
  }
  return undefined;
}

function buildDistillationPrompt(
  existing: MemoryNote[],
  conversation: { role: string; content: string }[],
): string {
  const notes =
    existing.length > 0
      ? existing.map((n) => `- [${n.id}] (${n.scope}) ${n.content.slice(0, 200)}`).join("\n")
      : "(none yet)";
  const convo = conversation
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content.slice(0, 1500)}`)
    .join("\n\n")
    .slice(0, 6000);
  return `You maintain a user's long-term memory notes for their AI agents. Given the existing notes and a recent conversation, decide what changes.

RULES:
- Keep only DURABLE facts: name, business, goals, preferences, decisions, constraints, ongoing projects.
- Drop chit-chat, one-off questions, and anything time-sensitive that already passed.
- Merge duplicates: if a new fact updates an old note, list the old id in delete_ids and add the merged note.
- Each note: one short sentence, plain language, no secrets or credentials.
- scope "shared" unless the fact is clearly specific to one agent.
- Keep the total set at 20 notes or fewer. If nothing durable, return empty arrays.

Existing notes (id, scope, text):
${notes}

Recent conversation:
${convo}

Return ONLY this JSON, no other text:
{"upsert": [{"content": "...", "scope": "shared"}], "delete_ids": ["<id>"]}`;
}

/**
 * Background distillation: extract durable facts from a substantive
 * conversation into the user's memory notes. Fire-and-forget safe — never
 * throws, never touches allowance metering, never logs note contents.
 */
export async function maybeDistillMemory(
  db: SupabaseClient,
  userId: string,
  agentSlug: string,
  messages: { role: string; content: string }[],
  env: "live" | "sandbox",
): Promise<void> {
  try {
    if (!(await isMemoryEnabled(db, userId))) return;
    const substantive = messages.filter(
      (m) => m.role !== "system" && typeof m.content === "string" && m.content.trim(),
    );
    if (substantive.length < DISTILL_MIN_MESSAGES) return;

    const state = await getMemoryState(db, userId);
    if (state?.last_distilled_at) {
      const age = Date.now() - new Date(state.last_distilled_at).getTime();
      if (age < DISTILL_COOLDOWN_MS) return;
    }

    const apiKey = getOpenRouterKey(env);
    if (!apiKey) return;

    const existing = await loadMemories(db, userId, agentSlug, 20);
    const prompt = buildDistillationPrompt(existing, substantive);

    let raw = "";
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://melanatedintech.com",
          "X-Title": "Melanated in Tech",
        },
        body: JSON.stringify({
          model: DISTILL_MODEL,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 800,
          temperature: 0.2,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      raw = data.choices?.[0]?.message?.content ?? "";
    } catch {
      return;
    }

    let parsed: { upsert?: { content?: string; scope?: string }[]; delete_ids?: string[] };
    try {
      const jsonStart = raw.indexOf("{");
      const jsonEnd = raw.lastIndexOf("}");
      if (jsonStart < 0 || jsonEnd <= jsonStart) return;
      parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    } catch {
      return;
    }

    const validIds = new Set(existing.map((n) => n.id));
    const deleteIds = (parsed.delete_ids ?? []).filter(
      (id) => typeof id === "string" && validIds.has(id),
    );
    if (deleteIds.length > 0) {
      await db.from("agent_memories").delete().in("id", deleteIds).eq("user_id", userId);
    }

    const upserts = (parsed.upsert ?? [])
      .filter((u) => typeof u?.content === "string" && u.content.trim().length > 0)
      .slice(0, 10);
    for (const u of upserts) {
      const scope = u.scope === agentSlug ? agentSlug : "shared";
      await saveMemory(db, userId, scope, u.content as string);
    }

    // Mark distilled even when nothing changed — the cooldown is the point.
    await db
      .from("agent_memory_state")
      .upsert(
        { user_id: userId, last_distilled_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
  } catch {
    // distillation must never break chat
  }
}
