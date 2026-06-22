type Props = { count?: number; variant?: "agent" | "article" | "product" };

export function CardSkeleton({ variant = "agent" }: { variant?: Props["variant"] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 animate-pulse">
      {variant === "article" ? (
        <>
          <div className="mb-4 h-32 w-full rounded-lg bg-muted/60" />
          <div className="h-3 w-20 rounded bg-muted/60" />
          <div className="mt-3 h-5 w-4/5 rounded bg-muted/60" />
          <div className="mt-2 h-4 w-full rounded bg-muted/60" />
          <div className="mt-2 h-4 w-3/4 rounded bg-muted/60" />
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted/60" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted/60" />
              <div className="h-3 w-1/2 rounded bg-muted/60" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded bg-muted/60" />
            <div className="h-3 w-5/6 rounded bg-muted/60" />
          </div>
          <div className="mt-5 flex gap-2">
            <div className="h-6 w-16 rounded-full bg-muted/60" />
            <div className="h-6 w-20 rounded-full bg-muted/60" />
            <div className="h-6 w-14 rounded-full bg-muted/60" />
          </div>
        </>
      )}
    </div>
  );
}

export function SkeletonGrid({ count = 6, variant = "agent" }: Props) {
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}

export function ListingPendingShell({ variant = "agent", label }: Props & { label: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted/60" />
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-muted/60" />
          ))}
        </div>
      </div>
      <SkeletonGrid variant={variant} />
      <p className="sr-only">Loading {label}…</p>
    </div>
  );
}
