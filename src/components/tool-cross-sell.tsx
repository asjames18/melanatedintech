import { Link } from "@tanstack/react-router";
import { ArrowRight, Bot, Package, Wrench } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const PATHS = [
  {
    to: "/agents" as const,
    Icon: Bot,
    title: "Browse ready-made agents",
    body: "Skip the build — production agents for ministries, sales, support, and creators.",
  },
  {
    to: "/products" as const,
    Icon: Package,
    title: "Ship faster with starter kits",
    body: "Blueprints, prompt libraries, and SOPs you can lift and adapt today.",
  },
  {
    to: "/strategy-sprint" as const,
    Icon: Wrench,
    title: "Get it built with you",
    body: "The two-week Agent Strategy Sprint turns your idea into a working plan.",
  },
];

/** Conversion band for tool pages: routes engaged tool users toward the catalog. */
export function ToolCrossSell({ tool }: { tool: string }) {
  return (
    <div className="mt-12 rounded-2xl border border-border bg-muted/30 p-6 sm:p-8">
      <p className="text-xs font-medium uppercase tracking-wider text-primary">Next step</p>
      <h2 className="mt-2 font-display text-xl font-semibold sm:text-2xl">
        Put what you just built to work.
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {PATHS.map(({ to, Icon, title, body }) => (
          <Link
            key={to}
            to={to}
            onClick={() => trackEvent("tool_cross_sell_clicked", { tool, target: to })}
            className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg"
          >
            <Icon className="h-5 w-5 text-primary" />
            <h3 className="mt-3 font-display text-base font-semibold">{title}</h3>
            <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{body}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Explore{" "}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
