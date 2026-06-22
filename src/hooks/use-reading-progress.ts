import { useEffect, useState, useCallback } from "react";

const KEY = "mit:reading-progress:v1";
const MAX = 50;

export type ProgressRow = {
  slug: string;
  title: string;
  percent: number;
  updated_at: number;
};

function read(): ProgressRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX);
  } catch { return []; }
}

function write(rows: ProgressRow[]) {
  try { window.localStorage.setItem(KEY, JSON.stringify(rows.slice(0, MAX))); }
  catch { /* ignore */ }
}

/** Reads + subscribes to the persisted reading-progress map. */
export function useReadingProgressList() {
  const [rows, setRows] = useState<ProgressRow[]>([]);
  useEffect(() => {
    setRows(read());
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) setRows(read()); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return rows;
}

/** Tracks scroll progress on the article page and persists it. */
export function useTrackReadingProgress(slug: string | undefined, title: string | undefined) {
  const [pct, setPct] = useState(0);

  const persist = useCallback((percent: number) => {
    if (!slug || !title) return;
    const next = read().filter((r) => r.slug !== slug);
    next.unshift({ slug, title, percent, updated_at: Date.now() });
    write(next);
  }, [slug, title]);

  useEffect(() => {
    if (!slug) return;
    if (typeof window === "undefined") return;
    let last = 0;
    const onScroll = () => {
      const doc = document.documentElement;
      const top = window.scrollY || doc.scrollTop;
      const height = doc.scrollHeight - doc.clientHeight;
      const ratio = height > 0 ? Math.min(1, Math.max(0, top / height)) : 0;
      const p = Math.round(ratio * 100);
      if (Math.abs(p - last) >= 1) {
        last = p;
        setPct(p);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const t = window.setInterval(() => {
      if (last > 0) persist(last);
    }, 4000);
    const onLeave = () => persist(last);
    window.addEventListener("pagehide", onLeave);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onLeave);
      window.clearInterval(t);
      persist(last);
    };
  }, [slug, persist]);

  return pct;
}
