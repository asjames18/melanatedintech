// Lightweight client-side event tracking.
// Buffers events to localStorage and dispatches a window event so any sink
// (custom hook, future server function, third-party SDK) can subscribe.

export type AnalyticsEvent = {
  name: string;
  ts: number;
  props: Record<string, unknown>;
};

const STORAGE_KEY = "mit:analytics:events";
const MAX_BUFFER = 200;

function isBrowser() {
  return typeof window !== "undefined";
}

export function trackEvent(name: string, props: Record<string, unknown> = {}) {
  if (!isBrowser()) return;
  const event: AnalyticsEvent = { name, ts: Date.now(), props };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    list.push(event);
    if (list.length > MAX_BUFFER) list.splice(0, list.length - MAX_BUFFER);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore storage errors (quota, private mode)
  }
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
