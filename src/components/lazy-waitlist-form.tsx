import { lazy, Suspense, useEffect, useRef, useState } from "react";

const WaitlistForm = lazy(() =>
  import("./waitlist-form").then((mod) => ({ default: mod.WaitlistForm })),
);

export function LazyWaitlistForm({
  source,
  compact = false,
}: {
  source: string;
  compact?: boolean;
}) {
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready) return;

    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      const timer = window.setTimeout(() => setReady(true), 4000);
      return () => window.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ready]);

  return (
    <div ref={ref}>
      {ready ? (
        <Suspense fallback={<WaitlistFallback compact={compact} />}>
          <WaitlistForm source={source} compact={compact} />
        </Suspense>
      ) : (
        <WaitlistFallback compact={compact} />
      )}
    </div>
  );
}

function WaitlistFallback({ compact }: { compact: boolean }) {
  return (
    <div
      className={compact ? "flex w-full gap-2" : "flex w-full max-w-md flex-col gap-2 sm:flex-row"}
      aria-hidden="true"
    >
      <input
        type="email"
        disabled
        placeholder="you@example.com"
        className="h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground opacity-70"
      />
      <span className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-80">
        Join waitlist
      </span>
    </div>
  );
}
