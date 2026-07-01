import { Link, useSearch } from "@tanstack/react-router";
import { Sparkles, HelpCircle, BookOpen, Users, Megaphone, Star, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

const TOPICS = [
  { label: "All", tag: undefined, icon: <Sparkles className="h-3.5 w-3.5" /> },
  { label: "Questions", tag: "questions", icon: <HelpCircle className="h-3.5 w-3.5" /> },
  { label: "Show & Tell", tag: "show-and-tell", icon: <Star className="h-3.5 w-3.5" /> },
  { label: "Resources", tag: "resources", icon: <BookOpen className="h-3.5 w-3.5" /> },
  { label: "Hiring", tag: "hiring", icon: <Users className="h-3.5 w-3.5" /> },
  { label: "Feedback", tag: "feedback", icon: <Megaphone className="h-3.5 w-3.5" /> },
  { label: "#AI-Agents", tag: "AI-Agents", icon: <Hash className="h-3.5 w-3.5" /> },
  { label: "#Prompts", tag: "Prompts", icon: <Hash className="h-3.5 w-3.5" /> },
  { label: "#Templates", tag: "Templates", icon: <Hash className="h-3.5 w-3.5" /> },
  { label: "#NoCode", tag: "NoCode", icon: <Hash className="h-3.5 w-3.5" /> },
  { label: "#Career", tag: "Career", icon: <Hash className="h-3.5 w-3.5" /> },
];

export function StoriesBar() {
  // Read current tag from URL search params (best-effort — works on community route)
  let activeTag: string | undefined;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const search = useSearch({ from: "/community/" });
    activeTag = (search as { tag?: string }).tag;
  } catch {
    // not on the community route, skip
  }

  return (
    <div className="relative">
      {/* Gradient fade on right edge */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent z-10" />

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TOPICS.map((topic) => {
          const isActive = topic.tag === activeTag || (!topic.tag && !activeTag);
          return (
            <Link
              key={topic.label}
              to="/community"
              search={topic.tag ? { tag: topic.tag } : {}}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-muted"
              )}
            >
              {topic.icon}
              {topic.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
