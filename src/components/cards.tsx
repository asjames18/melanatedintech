import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Bot, BookOpen, Package, Wrench } from "lucide-react";
import { categoryVisual } from "@/lib/category-style";
import { trackEvent } from "@/lib/analytics";

export type Tier = "free" | "premium" | "custom";

type ArticleLabel = "Checklist" | "Playbook" | "Field Guide" | "Scorecard";

export function TierBadge({ tier }: { tier: Tier }) {
  const styles = {
    free: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    premium: "bg-primary/10 text-primary",
    custom: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  } as const;
  const label = tier === "free" ? "Free" : tier === "premium" ? "Premium" : "Custom";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[tier]}`}>
      {label}
    </span>
  );
}

function articleLabel(title: string, excerpt: string): ArticleLabel {
  const text = `${title} ${excerpt}`.toLowerCase();
  if (text.includes("scorecard") || text.includes("calculator") || text.includes("roi")) {
    return "Scorecard";
  }
  if (text.includes("checklist") || text.includes("what to capture") || text.includes("never")) {
    return "Checklist";
  }
  if (text.includes("field guide") || text.includes("weekly") || text.includes("teardown")) {
    return "Field Guide";
  }
  return "Playbook";
}

export function AgentCard({
  slug,
  name,
  tagline,
  category,
  tier,
  featured,
  capabilities,
}: {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  tier: Tier;
  featured?: boolean;
  capabilities?: string[] | null;
}) {
  const { Icon, className } = categoryVisual(category, Bot);
  return (
    <Link
      to="/agents/$slug"
      params={{ slug }}
      onClick={() => trackEvent("agent_clicked", { itemSlug: slug, surface: "card" })}
      className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${className}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-2">
          {featured && (
            <span className="inline-flex rounded-full bg-accent2/15 px-2 py-0.5 text-xs font-medium text-accent2">
              Featured
            </span>
          )}
          <TierBadge tier={tier} />
        </div>
      </div>
      <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">{category}</p>
      <h3 className="mt-1 font-display text-lg font-semibold">{name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
      {capabilities && capabilities.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {capabilities.slice(0, 3).map((c) => (
            <li key={c} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {c}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 flex items-center gap-1 text-sm font-medium text-primary">
        View agent{" "}
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export function ArticleCard({
  slug,
  title,
  excerpt,
  category,
  read_minutes,
}: {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  read_minutes: number;
}) {
  const label = articleLabel(title, excerpt);
  return (
    <Link
      to="/knowledge/$slug"
      params={{ slug }}
      className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <BookOpen className="h-3.5 w-3.5" />
        <span>{category}</span>
        <span>-</span>
        <span>{read_minutes} min read</span>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold leading-snug">{title}</h3>
        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          {label}
        </span>
      </div>
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{excerpt}</p>
      <div className="mt-6 flex items-center gap-1 text-sm font-medium text-primary">
        Read article{" "}
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export function ProductCard({
  slug,
  name,
  tagline,
  category,
  tier,
}: {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  tier: Tier;
}) {
  const { Icon, className } = categoryVisual(category, Package);
  return (
    <Link
      to="/products/$slug"
      params={{ slug }}
      onClick={() => trackEvent("product_clicked", { itemSlug: slug, surface: "card" })}
      className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${className}`}>
          <Icon className="h-5 w-5" />
        </div>
        <TierBadge tier={tier} />
      </div>
      <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">{category}</p>
      <h3 className="mt-1 font-display text-lg font-semibold">{name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
      <div className="mt-6 flex items-center gap-1 text-sm font-medium text-primary">
        View details{" "}
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export function ServiceCard({
  name,
  tagline,
  outcomes,
  price,
}: {
  name: string;
  tagline: string;
  outcomes: string[];
  price?: string;
}) {
  return (
    <div className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <Wrench className="h-5 w-5" />
        </div>
        {price && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {price}
          </span>
        )}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
      <ul className="mt-4 space-y-1.5 text-sm">
        {outcomes.map((o) => (
          <li key={o} className="flex items-start gap-2 text-muted-foreground">
            <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent2" />
            {o}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center gap-1 text-sm font-medium text-primary">
        View service{" "}
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </div>
  );
}
