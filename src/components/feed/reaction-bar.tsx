import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { REACTION_KINDS, REACTION_META, type ReactionKind } from "@/lib/community";
import { cn } from "@/lib/utils";

type Props = {
  counts: Record<string, number>;
  mine: string[];
  onToggle: (kind: ReactionKind) => void | Promise<void>;
  disabled?: boolean;
  size?: "sm" | "md";
  compact?: boolean;
};

/** Compact reaction bar: shows total count + a popover picker for the 5 kinds.
 *  Kinds the viewer has already reacted with are highlighted. */
export function ReactionBar({ counts, mine, onToggle, disabled, size = "sm", compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const total = REACTION_KINDS.reduce((acc, k) => acc + (counts[k] ?? 0), 0);
  const pad = size === "md" ? "px-3 py-1.5" : "px-2.5 py-1.5";

  const reacted = mine.length > 0;
  const myReactionKind = reacted ? (mine[0] as ReactionKind) : null;
  const buttonEmoji = myReactionKind ? REACTION_META[myReactionKind].emoji : "👍";
  const buttonLabel = myReactionKind ? REACTION_META[myReactionKind].label : "React";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.02] border",
            pad,
            reacted
              ? "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
              : "border-border/60 hover:bg-muted hover:border-border text-muted-foreground hover:text-foreground",
            disabled && "opacity-50 pointer-events-none",
          )}
          aria-label="React"
        >
          {compact ? (
            <>
              <span className="text-sm leading-none select-none">{buttonEmoji}</span>
              <span>{buttonLabel}</span>
            </>
          ) : (
            <>
              {total > 0 ? (
                <div className="flex items-center -space-x-1.5 shrink-0 mr-1 select-none">
                  {REACTION_KINDS.filter((k) => (counts[k] ?? 0) > 0)
                    .slice(0, 3)
                    .map((k) => (
                      <span
                        key={k}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-card border border-background text-[11px] shadow-sm ring-1 ring-border/5"
                        title={REACTION_META[k].label}
                      >
                        {REACTION_META[k].emoji}
                      </span>
                    ))}
                </div>
              ) : (
                <span className="text-sm leading-none mr-1 select-none">{buttonEmoji}</span>
              )}
              <span>{total > 0 ? total : "React"}</span>
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" collisionPadding={8} className="w-auto p-1.5">
        <div className="flex items-center gap-0.5">
          {REACTION_KINDS.map((k) => {
            const has = mine.includes(k);
            return (
              <button
                key={k}
                type="button"
                title={REACTION_META[k].label}
                onClick={async () => {
                  await onToggle(k);
                  setOpen(false);
                }}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full text-lg transition-transform hover:scale-110",
                  has && "bg-primary/10 ring-1 ring-primary/30",
                )}
              >
                {REACTION_META[k].emoji}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

