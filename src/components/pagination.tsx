import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  label: string;
  onChange: (page: number) => void;
};

function pageWindow(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const set = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const sorted = Array.from(set).filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) out.push("…");
  }
  return out;
}

export function Pagination({ page, pageCount, total, pageSize, label, onChange }: Props) {
  if (total === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const items = pageWindow(page, pageCount);

  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Showing <span className="font-medium text-foreground">{start}–{end}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> {label}
      </p>
      {pageCount > 1 && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            onClick={() => onChange(page - 1)}
            disabled={page <= 1}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-background px-3 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          {items.map((it, i) =>
            it === "…" ? (
              <span key={`e${i}`} className="px-2 text-xs text-muted-foreground">…</span>
            ) : (
              <button
                key={it}
                onClick={() => onChange(it)}
                aria-current={it === page ? "page" : undefined}
                className={`h-9 min-w-9 rounded-lg border px-3 text-xs transition-colors ${
                  it === page
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {it}
              </button>
            ),
          )}
          <button
            onClick={() => onChange(page + 1)}
            disabled={page >= pageCount}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-background px-3 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
