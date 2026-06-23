import {
  Bot,
  Megaphone,
  TrendingUp,
  Briefcase,
  Church,
  HeartHandshake,
  CheckCircle2,
  Headphones,
  Microscope,
  Palette,
  BookOpen,
  Cpu,
  Boxes,
  Wrench,
  Brain,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface CategoryVisual {
  Icon: LucideIcon;
  /** Tailwind classes for an icon container (background + text color). */
  className: string;
}

// Full literal class strings so Tailwind's scanner keeps them in the build.
const PALETTE = [
  "bg-violet-500/12 text-violet-600 dark:text-violet-300",
  "bg-blue-500/12 text-blue-600 dark:text-blue-300",
  "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
  "bg-amber-500/12 text-amber-600 dark:text-amber-300",
  "bg-rose-500/12 text-rose-600 dark:text-rose-300",
  "bg-cyan-500/12 text-cyan-600 dark:text-cyan-300",
  "bg-fuchsia-500/12 text-fuchsia-600 dark:text-fuchsia-300",
  "bg-indigo-500/12 text-indigo-600 dark:text-indigo-300",
] as const;

// Known categories get a meaningful icon; everything else falls back to the
// section default (Bot / Package / BookOpen) passed by the caller.
const ICONS: Record<string, LucideIcon> = {
  Marketing: Megaphone,
  Sales: TrendingUp,
  Business: Briefcase,
  "Church & Ministry": Church,
  "Nonprofit & Ministry": HeartHandshake,
  Productivity: CheckCircle2,
  "Customer Service": Headphones,
  Research: Microscope,
  Creators: Palette,
  "Local AI": Cpu,
  MCP: Boxes,
  "Agent Memory": Brain,
  Memory: Brain,
  Safety: ShieldCheck,
  "Tool Design": Wrench,
  Skills: Boxes,
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Deterministic icon + color for a content category, so the marketplace and
 * knowledge hub read as visually distinct instead of one repeated gray icon.
 */
export function categoryVisual(category: string, fallback: LucideIcon = Bot): CategoryVisual {
  return {
    Icon: ICONS[category] ?? fallback,
    className: PALETTE[hash(category) % PALETTE.length],
  };
}
