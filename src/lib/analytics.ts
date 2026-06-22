// Lightweight client-side event tracking.
// Buffers events to localStorage, dispatches a window event for live sinks,
// and debounce-flushes the buffer to the server via recordEvents().

import { recordEvents } from "./analytics.functions";

export type AnalyticsEvent = {
  name: string;
  ts: number;
  props: Record<string, unknown>;
};

const STORAGE_KEY = "mit:analytics:events";
const SESSION_KEY = "mit:analytics:session";
const PENDING_KEY = "mit:analytics:pending";
const MAX_BUFFER = 200;
const FLUSH_DELAY_MS = 4000;
const MAX_BATCH = 50;

function isBrowser() {
  return typeof window !== "undefined";
}

function getSessionId(): string {
  if (!isBrowser()) return "ssr";
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        (crypto?.randomUUID?.() as string | undefined) ??
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

function loadPending(): AnalyticsEvent[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

function savePending(list: AnalyticsEvent[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(list));
  } catch {
    /* ignore quota */
  }
}

let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;

async function flushNow() {
  if (!isBrowser() || flushing) return;
  const pending = loadPending();
  if (pending.length === 0) return;
  flushing = true;
  const batch = pending.slice(0, MAX_BATCH);
  // Optimistically drop the batch — if the request fails we re-queue.
  savePending(pending.slice(batch.length));
  try {
    const sessionId = getSessionId();
    await recordEvents({
      data: {
        events: batch.map((e) => ({
          name: e.name,
          props: e.props,
          session_id: sessionId,
          occurred_at: new Date(e.ts).toISOString(),
        })),
      },
    });
  } catch {
    // Re-queue and back off; we'll retry on the next tracked event.
    const next = loadPending();
    savePending([...batch, ...next]);
  } finally {
    flushing = false;
    // If more arrived while we flushed, schedule another pass.
    if (loadPending().length > 0) scheduleFlush();
  }
}

function scheduleFlush() {
  if (!isBrowser()) return;
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushNow();
  }, FLUSH_DELAY_MS);
}

if (isBrowser()) {
  // Best-effort flush when the user is leaving.
  window.addEventListener("pagehide", () => void flushNow());
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flushNow();
  });
}

export function trackEvent(name: string, props: Record<string, unknown> = {}) {
  if (!isBrowser()) return;
  const event: AnalyticsEvent = { name, ts: Date.now(), props };

  // Historical local buffer (kept for any existing consumers).
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    list.push(event);
    if (list.length > MAX_BUFFER) list.splice(0, list.length - MAX_BUFFER);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }

  // Server-bound queue.
  try {
    const pending = loadPending();
    pending.push(event);
    if (pending.length > MAX_BUFFER) pending.splice(0, pending.length - MAX_BUFFER);
    savePending(pending);
  } catch {
    /* ignore */
  }
  scheduleFlush();

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", name, props);
  }
  window.dispatchEvent(new CustomEvent("mit:analytics", { detail: event }));
}

export function getAnalyticsEvents(): AnalyticsEvent[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearAnalyticsEvents() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function flushAnalyticsNow() {
  return flushNow();
}
