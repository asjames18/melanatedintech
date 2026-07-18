import { useState } from "react";
import { HelpCircle, Info, Target, Rocket, ChevronDown, ChevronUp } from "lucide-react";

export interface ToolGuideData {
  whatItIs: string;
  whyUseIt: string;
  howToUse: string[];
}

export function ToolGuide({ guide }: { guide: ToolGuideData }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-8 rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 px-6 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-display text-base font-bold text-foreground">
            How to use this tool (What, Why & Step-by-Step Guide)
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="p-6 pt-4 space-y-6 border-t border-border/60">
          <div className="grid gap-6 md:grid-cols-2">
            {/* What it is */}
            <div className="space-y-1.5 rounded-xl border border-border bg-muted/10 p-4">
              <div className="flex items-center gap-2 font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <Info className="h-4 w-4" /> What it is
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{guide.whatItIs}</p>
            </div>

            {/* Why use it */}
            <div className="space-y-1.5 rounded-xl border border-border bg-muted/10 p-4">
              <div className="flex items-center gap-2 font-semibold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <Target className="h-4 w-4" /> Why use it
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{guide.whyUseIt}</p>
            </div>
          </div>

          {/* How to use */}
          <div className="space-y-2 rounded-xl border border-border bg-muted/10 p-4">
            <div className="flex items-center gap-2 font-semibold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
              <Rocket className="h-4 w-4" /> How to use it (Step-by-Step)
            </div>
            <ol className="space-y-2 text-xs text-muted-foreground">
              {guide.howToUse.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                    {idx + 1}
                  </span>
                  <span className="leading-snug pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
