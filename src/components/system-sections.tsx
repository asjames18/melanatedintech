import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, CircleDollarSign, MapPin, ShieldCheck } from "lucide-react";
import { ENGAGEMENT_STEPS, SERVICE_SYSTEMS } from "@/lib/service-systems";

export function SystemsGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {SERVICE_SYSTEMS.map((system, index) => (
        <Link
          key={system.slug}
          to="/systems/$slug"
          params={{ slug: system.slug }}
          className="group flex flex-col rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg sm:p-7"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            System 0{index + 1} · {system.eyebrow}
          </span>
          <h3 className="mt-3 font-display text-2xl font-semibold">{system.title}</h3>
          <p className="mt-3 leading-relaxed text-muted-foreground">{system.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {system.industries.map((industry) => (
              <span
                key={industry}
                className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground"
              >
                {industry}
              </span>
            ))}
          </div>
          <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            See the system{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      ))}
    </div>
  );
}

export function PilotOffer() {
  const inclusions = [
    "One defined revenue leak",
    "One business location",
    "One primary scheduling or CRM platform",
    "One primary communication channel",
    "Configuration, testing, staff handoff, and 30 days of monitoring",
    "Baseline and completion report",
  ];
  return (
    <div className="grid overflow-hidden rounded-3xl border border-border bg-foreground text-background lg:grid-cols-[1.1fr_0.9fr]">
      <div className="p-7 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-background/60">
          Fixed-scope implementation
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
          30-Day Recovery Pilot
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-background/70">
          Prove one useful workflow against one measurable revenue leak before expanding. Production
          configuration begins after the deposit and required account access are received.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {inclusions.map((item) => (
            <div key={item} className="flex gap-2 text-sm text-background/85">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {item}
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-background/15 bg-background/5 p-7 lg:border-l lg:border-t-0 sm:p-10">
        <p className="text-sm text-background/60">Starting at</p>
        <p className="mt-1 font-display text-5xl font-semibold">$1,500</p>
        <p className="mt-2 text-sm text-background/70">
          50% deposit · 50% at launch or the agreed acceptance milestone
        </p>
        <Link
          to="/get-a-demo"
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-background px-5 py-3 text-sm font-semibold text-foreground hover:opacity-90"
        >
          Get a relevant demo <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-4 text-xs leading-relaxed text-background/55">
          Third-party software and usage charges are separate. Results depend on lead volume, offer
          quality, staff follow-through, and other business conditions.
        </p>
      </div>
    </div>
  );
}

export function EngagementProcess() {
  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {ENGAGEMENT_STEPS.map((step, index) => (
        <div key={step} className="rounded-2xl border border-border bg-card p-4">
          <span className="text-xs font-semibold text-primary">0{index + 1}</span>
          <p className="mt-2 font-display font-semibold">{step}</p>
        </div>
      ))}
    </div>
  );
}

export function CommercialTrust() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        {
          Icon: ShieldCheck,
          title: "Bounded automation",
          body: "Human takeover, consent, opt-out handling, and deterministic rules are designed into critical steps.",
        },
        {
          Icon: CircleDollarSign,
          title: "Measured business events",
          body: "Track qualified inquiries, accepted estimates, recurring plans, or repeat bookings—not vague AI activity.",
        },
        {
          Icon: MapPin,
          title: "Florida based, nationwide",
          body: "Based in Sebring and serving Highlands County and Florida first, with qualified engagements available across the U.S.",
        },
      ].map(({ Icon, title, body }) => (
        <div key={title} className="rounded-2xl border border-border bg-card p-5">
          <Icon className="h-5 w-5 text-primary" />
          <h3 className="mt-3 font-display text-lg font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </div>
      ))}
    </div>
  );
}
