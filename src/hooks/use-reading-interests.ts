import { useEffect, useState, useCallback } from "react";

const KEY = "mit:reading-interests:v1";
const MAX_RECENT = 20;

export type Interests = {
  /** category -> visit count */
  categories: Record<string, number>;
  /** recently viewed article slugs, newest first */
  recent: string[];
};

const empty: Interests = { categories: {}, recent: [] };

function read(): Interests {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<Interests>;
    return {
      categories: parsed.categories ?? {},
      recent: parsed.recent ?? [],
    };
  } catch {
    return empty;
  }
}

function write(next: Interests) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private mode */
  }
}

export function useReadingInterests() {
  const [interests, setInterests] = useState<Interests>(empty);

  useEffect(() => {
    setInterests(read());
  }, []);

  const recordVisit = useCallback((slug: string, category: string | null | undefined) => {
    setInterests((prev) => {
      const recent = [slug, ...prev.recent.filter((s) => s !== slug)].slice(0, MAX_RECENT);
      const categories = { ...prev.categories };
      if (category) categories[category] = (categories[category] ?? 0) + 1;
      const next = { categories, recent };
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    write(empty);
    setInterests(empty);
  }, []);

  return { interests, recordVisit, clear };
}

/** Score by weight of category in interests (0 if none). */
export function interestScore(categories: Record<string, number>, category: string | null | undefined) {
  if (!category) return 0;
  return categories[category] ?? 0;
}

/** Top N categories by visit count. */
export function topCategories(categories: Record<string, number>, n = 3): string[] {
  return Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([c]) => c);
}
