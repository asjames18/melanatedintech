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
  let activeTag: string | undefined;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const search = useSearch({ from: "/community/" });
    activeTag = (search as { tag?: string }).tag;
  } catch {
    // This component is rendered only for the community route today.
  }

  const activeTopic = TOPICS.find((topic) => topic.tag === activeTag) ?? TOPICS[0];

  return (
    <>
      <details className="group sm:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
          <span>Browse topics</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
            {activeTopic.icon}
            {activeTopic.label}
            <span className="ml-1 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true">⌄</span>
          </span>
        </summary>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {TOPICS.map((topic) => {
            const isActive = topic.tag === activeTag || (!topic.tag && !activeTag);
            return (
              <Link
                key={topic.label}
                to="/community"
                search={topic.tag ? { tag: topic.tag } : {}}
                className={cn(
                  "flex min-h-10 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-muted",
                )}
              >
                {topic.icon}
                <span className="truncate">{topic.label}</span>
              </Link>
            );
          })}
        </div>
      </details>

      <div className="relative hidden sm:block">
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TOPICS.map((topic) => {
            const isActive = topic.tag === activeTag || (!topic.tag && !activeTag);
            return (
              <Link
                key={topic.label}
                to="/community"
                search={topic.tag ? { tag: topic.tag } : {}}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-muted",
                )}
              >
                {topic.icon}
                {topic.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
