import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  PhoneCall,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { LegalIntakeAuditForm } from "@/components/legal-intake-audit-form";
import { buildSeoMeta, breadcrumbLd, ldScript } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import { funnelAttribution } from "@/components/funnel-attribution";

export const Route = createFileRoute("/legal-intake")({
  head: () => ({
    ...buildSeoMeta({
      title: "24/7 AI Client Intake for Small Law Firms | Melanated In Tech",
      description:
        "Melanated In Tech answers every call your firm can't — nights, weekends, busy weekdays. AI intake that qualifies the matter, captures conflict-check details, and books consultations straight into your calendar. Start with a free 7-Day Missed-Case Audit.",
      url: "/legal-intake",
    }),
    scripts: [
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Legal Intake", path: "/legal-intake" },
        ]),
      ),
    ],
  }),
  component: LegalIntake,
});

const STEPS = [
  {
    Icon: PhoneCall,
    title: "We answer — in seconds",
    body: "Every call your office can't take is answered in under 10 seconds. The AI identifies itself as an AI assistant on every call, plainly and up front.",
  },
  {
    Icon: Scale,
    title: "We qualify and capture",
    body: "Matter type, incident details, injuries, insurance, and full conflict-check information — everything your intake sheet asks for, asked the way you'd ask it.",
  },
  {
    Icon: CalendarCheck,
    title: "We book and write it up",
    body: "Qualified callers are booked straight into your consultation calendar. Everything lands in your CRM — MyCase, PracticePanther, Filevine, or our simple pipeline if you don't use one.",
  },
  {
    Icon: MessageSquare,
    title: "We follow up",
    body: "Qualified leads who don't book get a professional follow-up sequence. Nothing slips through because nobody called back.",
  },
];

const REPORT_ITEMS = [
  "Total after-hours & overflow inquiries",
  "Cases that would've been lost under your current setup",
  "Estimated fee value at risk",
  "Your callback time vs. the 7-minute standard",
  "Every recording & transcript — yours to keep",
];

const FAQS = [
  [
    "Will this mess with my phones?",
    "No. Daytime answered calls never touch us. Only after-hours and no-answer calls route to the intake line, via conditional forwarding your carrier sets up in about two minutes — and reverses just as fast.",
  ],
  [
    "What about client confidentiality?",
    "We capture only what your intake sheet already collects on a first call. Data is encrypted, access-logged, never used for any other purpose, and never used to train AI models. You own everything.",
  ],
  [
    "Which CRMs do you work with?",
    "MyCase, PracticePanther, and Filevine — plus a simple built-in pipeline if your firm doesn't use a CRM yet. If you're on Clio, their Grow AI already covers intake inside the Clio ecosystem; we're built for everyone else, and we'll tell you that straight.",
  ],
  [
    "Does the AI pretend to be human?",
    "Never. It identifies itself as an AI assistant at the start of every call. That's both the ethical standard and, in several states, the legal one.",
  ],
  [
    "What happens after the 7-day audit?",
    "We walk through your report together on a 20-minute call. If the numbers justify it, the 30-day pilot is $1,500. If they don't, you keep the report and we part friends.",
  ],
  [
    "Do you give legal advice or handle documents?",
    "Never. Intake only: qualify the matter, capture details, book the consultation. Anything resembling advice or documents stays with your attorneys.",
  ],
];

function LegalIntake() {
  useEffect(() => {
    trackEvent("legal_intake_page_viewed", { ...funnelAttribution() });
  }, []);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-foreground text-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,color-mix(in_oklch,var(--color-accent)_22%,transparent),transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
            <Sparkles className="h-3.5 w-3.5" /> 24/7 AI client intake for small law firms
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Never miss another case.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-background/70 sm:text-xl">
            Melanated In Tech answers every call your firm can&apos;t — nights, weekends, and busy
            weekdays. Our AI intake qualifies the matter, captures conflict-check details, and books
            the consultation straight into your calendar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <a href="#apply">
                Get the free 7-Day Missed-Case Audit <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background"
            >
              <a href="#how">How it works</a>
            </Button>
          </div>
          <div className="mt-14 grid gap-6 border-t border-background/15 pt-8 sm:grid-cols-3">
            {[
              ["78%", "of legal clients hire the first attorney who responds"],
              ["~40%", "of small firms actually answer the phone"],
              ["7 min", "response converts 80% better than 30+ minutes"],
            ].map(([stat, label]) => (
              <div key={label}>
                <p className="font-display text-3xl font-semibold text-accent">{stat}</p>
                <p className="mt-1 text-sm text-background/60">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">The problem</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            The math of a missed call
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            It&apos;s 8:47 PM on a Saturday. Someone just got rear-ended and they&apos;re calling
            lawyers. If your office doesn&apos;t answer, they call the next firm — and most of them
            hire whoever responds first.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                Icon: FileText,
                stat: "$5K–$50K+",
                title: "One missed PI case",
                body: "A single signed personal-injury case can be worth thousands to tens of thousands in fees. That's what's at stake every time a call goes to voicemail.",
              },
              {
                Icon: PhoneCall,
                stat: "$1,300+",
                title: "To acquire one signed case",
                body: "Firms spend heavily on Google Ads to generate calls — then lose them to voicemail after hours. You're paying for calls you never answer.",
              },
              {
                Icon: Clock,
                stat: "0",
                title: "Cases a message service signs",
                body: "Answering services take messages. Voicemail takes messages. Neither qualifies a matter, checks conflicts, or books a consultation while the caller is still deciding.",
              },
            ].map(({ Icon, stat, title, body }) => (
              <article
                key={title}
                className="rounded-2xl border border-border bg-card p-7 shadow-sm"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-5 font-display text-3xl font-semibold text-primary">{stat}</p>
                <h3 className="mt-2 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-24 border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            How it works
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            Your intake team, around the clock
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            One system, set up for your firm, answering every after-hours and overflow call.
            Here&apos;s what happens on each one:
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ Icon, title, body }, index) => (
              <article
                key={title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-2xl font-semibold text-muted-foreground/40">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Free audit */}
      <section id="audit" className="scroll-mt-24 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 rounded-3xl bg-foreground px-6 py-10 text-background sm:px-10 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                The free 7-Day Missed-Case Audit
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                Before you spend a dollar, see your own numbers.
              </h2>
              <p className="mt-4 leading-relaxed text-background/70">
                We route your after-hours calls through our intake for seven days. You change
                nothing about your daytime phones. Then we show you exactly what came in — and what
                would have been lost.
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  [
                    "Setup takes 15 minutes.",
                    "We give you a tracking number; conditional forwarding handles the rest. Reverses in two minutes.",
                  ],
                  ["Seven days of real calls,", "answered, qualified, and transcribed."],
                  [
                    "A written report",
                    "with inquiries captured, cases that would've been lost, and the fee value at stake — using your average case value.",
                  ],
                ].map(([lead, rest]) => (
                  <li key={lead} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="text-background/80">
                      <strong className="font-semibold text-background">{lead}</strong> {rest}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                size="lg"
                className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <a href="#apply">
                  See if you qualify <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="rounded-2xl bg-card p-7 text-card-foreground shadow-xl">
              <h3 className="font-display text-xl font-semibold">Your audit report includes</h3>
              <ul className="mt-5 space-y-3.5">
                {REPORT_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-border pt-5 text-sm">
                <strong className="font-semibold">Free. No obligation.</strong>{" "}
                <span className="text-muted-foreground">
                  If the numbers don&apos;t justify a pilot, we part friends and you keep the
                  report.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ethics */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-primary/30 bg-accent/20 p-8 sm:p-10">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">
                Built for the bar rules, not around them.
              </h2>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {[
                [
                  "Disclosure by default.",
                  "The AI identifies itself as an AI assistant at the start of every call — the standard Florida, Utah, and California guidance expects.",
                ],
                [
                  "Intake only.",
                  "It never gives legal advice, never quotes fees, never touches a legal document, and never forms an attorney-client relationship. You set the qualification criteria; the system follows them.",
                ],
                [
                  "Confidential by design.",
                  "Intake details are encrypted, access-logged, used for nothing else, and never used to train models. Disclosure wording is configured for your state before go-live.",
                ],
              ].map(([title, body]) => (
                <div key={title}>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-24 border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Pricing</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            One pilot. One retainer. No maze.
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            Start with a fixed-scope pilot. Stay because it&apos;s paying for itself.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                30-Day Pilot
              </p>
              <p className="mt-3 font-display text-4xl font-semibold">
                $1,500{" "}
                <span className="text-base font-normal text-muted-foreground">one-time setup</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {[
                  "One intake flow, tuned to your practice",
                  "One location, one CRM integration",
                  "After-hours + overflow call coverage",
                  "Qualification, conflict capture & booking",
                  "Baseline report: before vs. after",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" size="lg" className="mt-8 w-full">
                <a href="#apply">Start with the free audit</a>
              </Button>
            </article>
            <article className="relative flex flex-col rounded-2xl border-2 border-primary bg-card p-8 shadow-xl">
              <span className="absolute -top-3.5 left-8 rounded-full bg-primary px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
                The engine
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Managed Intake Retainer
              </p>
              <p className="mt-3 font-display text-4xl font-semibold">
                $1,500 <span className="text-base font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {[
                  "24/7 AI intake — every call, every time",
                  "Qualification, booking & CRM write-up",
                  "SMS follow-up for unbooked leads",
                  "Monthly intake report: calls, bookings, value captured",
                  "Ongoing tuning of your intake flow",
                  "Month-to-month. Cancel anytime.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="mt-8 w-full">
                <a href="#apply">
                  Get the free audit <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </article>
          </div>
          <p className="mt-8 max-w-3xl text-sm text-muted-foreground">
            Priced against what firms already pay: $300–$1,500/month for answering services that
            only take messages, ~$4,000+/month loaded cost for in-house intake staff. If the system
            isn&apos;t paying for itself, cancel — the transcripts and data stay yours.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">FAQ</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">Fair questions</h2>
          <div className="mt-8 space-y-4">
            {FAQS.map(([q, a]) => (
              <details key={q} className="rounded-2xl border border-border bg-card p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg font-semibold">
                  {q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Apply */}
      <section id="apply" className="scroll-mt-24 border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-primary">
            Get the free audit
          </p>
          <h2 className="mx-auto mt-2 max-w-2xl text-center font-display text-3xl font-semibold sm:text-4xl">
            Find out what missed calls are costing you.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Tell us about your firm. If you&apos;re a fit, we&apos;ll set up your 7-day audit —
            free, no obligation.
          </p>
          <div className="mt-10">
            <LegalIntakeAuditForm />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
            Every missed call is a case that went somewhere else.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-background/70">
            Find out exactly how many — and what they&apos;re worth — free, in seven days.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <a href="#apply">
              Get the free 7-Day Missed-Case Audit <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
