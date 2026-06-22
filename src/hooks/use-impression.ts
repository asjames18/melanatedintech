import { useEffect, useRef } from "react";

/**
 * Fires `onImpression` once when the element is ≥`threshold` visible.
 * Returns a ref to attach to the tracked element.
 */
export function useImpression<T extends HTMLElement = HTMLDivElement>(
  onImpression: () => void,
  { threshold = 0.5, key }: { threshold?: number; key?: string } = {},
) {
  const ref = useRef<T | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !firedRef.current) {
            firedRef.current = true;
            onImpression();
            observer.disconnect();
          }
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, threshold]);

  return ref;
}
