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
};

/** Compact reaction bar: shows total count + a popover picker for the 5 kinds.
 *  Kinds the viewer has already reacted with are highlighted. */
export function ReactionBar({ counts, mine, onToggle, disabled, size = "sm" }: Props) {
  const [open, setOpen] = useState(false);
  const total = REACTION_KINDS.reduce((acc, k) => acc + (counts[k] ?? 0), 0);
  const pad = size === "md" ? "px-3 py-1.5" : "px-2.5 py-1.5";

  // Show the top reaction kind's emoji + total, defaulting to 👍 when none yet.
  const topKind = REACTION_KINDS.find((k) => (counts[k] ?? 0) > 0) ?? "like";
  const topEmoji = REACTION_META[topKind].emoji;
  const reacted = mine.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full text-xs font-medium transition-colors",
            pad,
            reacted
              ? "text-primary hover:bg-primary/10"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
            disabled && "opacity-50",
          )}
          aria-label="React"
        >
          <span className="text-sm leading-none">{topEmoji}</span>
          {total > 0 && <span>{total}</span>}
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
