import { useEffect, useState } from "react";
import {
  Activity,
  BellRing,
  Bot,
  Calculator,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Database,
  PhoneMissed,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { SERVICE_SYSTEMS, type ServiceSystemSlug } from "@/lib/service-systems";
import { trackEvent } from "@/lib/analytics";

type SimulationMessage = {
  actor: "Customer" | "System" | "Team";
  time: string;
  text: string;
  event?: string;
};

type DemoScenario = {
  business: string;
  contact: string;
  trigger: string;
  averageValue: number;
  monthlyOpportunities: number;
  recoveryRate: number;
  messages: SimulationMessage[];
};

const SCENARIOS: Record<ServiceSystemSlug, DemoScenario> = {
  "revenue-recovery": {
    business: "Sunline Air & Heating",
    contact: "Jordan, homeowner",
    trigger: "Missed call · 7:42 PM",
    averageValue: 425,
    monthlyOpportunities: 32,
    recoveryRate: 18,
    messages: [
      {
        actor: "System",
        time: "7:43 PM",
        text: "Hi Jordan—this is Sunline Air & Heating. Sorry we missed you. Are you without cooling right now? Reply STOP to opt out.",
        event: "Response sent in 54 seconds",
      },
      {
        actor: "Customer",
        time: "7:44 PM",
        text: "Yes. The AC stopped this afternoon and the house is 84 degrees.",
        event: "Urgent service need identified",
      },
      {
        actor: "System",
        time: "7:44 PM",
        text: "I can help get this to the on-call team. Is there any smoke, burning smell, or electrical sparking?",
        event: "Safety rule applied",
      },
      {
        actor: "Team",
        time: "7:46 PM",
        text: "New qualified lead: no safety warning, 33870 ZIP, available 8–10 AM. Tap to approve the appointment.",
        event: "Human approval requested",
      },
      {
        actor: "System",
        time: "7:48 PM",
        text: "You’re confirmed for tomorrow between 8–10 AM. We’ll text when the technician is on the way.",
        event: "Service visit booked",
      },
    ],
  },
  "estimate-recovery": {
    business: "Cypress Coast Painting",
    contact: "Morgan, homeowner",
    trigger: "$4,800 estimate viewed · 2 days ago",
    averageValue: 4800,
    monthlyOpportunities: 12,
    recoveryRate: 12,
    messages: [
      {
        actor: "System",
        time: "10:02 AM",
        text: "Hi Morgan—did any questions come up while reviewing your exterior-painting estimate? I can get the right person to help.",
        event: "Follow-up sent on schedule",
      },
      {
        actor: "Customer",
        time: "10:18 AM",
        text: "We like it. We’re mainly wondering how soon the work could start.",
        event: "Timing objection detected",
      },
      {
        actor: "System",
        time: "10:18 AM",
        text: "Thanks—that needs a confirmed answer from the team. I’ve sent your question to Maya, who prepared the estimate.",
        event: "No invented availability",
      },
      {
        actor: "Team",
        time: "10:31 AM",
        text: "We can begin the week of September 14. I’ve held the opening until tomorrow afternoon.",
        event: "Salesperson takes over",
      },
      {
        actor: "System",
        time: "10:36 AM",
        text: "Estimate accepted. Deposit request and next steps have been sent.",
        event: "Accepted job attributed",
      },
    ],
  },
  "route-retention": {
    business: "Highlands Pool Works",
    contact: "Avery, pool owner",
    trigger: "One-time cleanup completed · yesterday",
    averageValue: 165,
    monthlyOpportunities: 45,
    recoveryRate: 20,
    messages: [
      {
        actor: "System",
        time: "9:15 AM",
        text: "Hi Avery—thanks for choosing Highlands Pool Works. Would you like details on keeping the pool maintained weekly?",
        event: "Post-service follow-up triggered",
      },
      {
        actor: "Customer",
        time: "9:22 AM",
        text: "Yes, what does weekly service include?",
        event: "Recurring-service interest identified",
      },
      {
        actor: "System",
        time: "9:22 AM",
        text: "The team will confirm the plan and price for your pool. Would Tuesday or Thursday usually work better?",
        event: "Preference captured—not promised",
      },
      {
        actor: "Team",
        time: "9:40 AM",
        text: "Thursday fits Route 3. Approve the $165 monthly plan and send the service agreement?",
        event: "Route capacity verified",
      },
      {
        actor: "System",
        time: "9:46 AM",
        text: "Your Thursday service plan is confirmed. Your first recurring visit is September 3.",
        event: "Recurring plan started",
      },
    ],
  },
  "client-recovery": {
    business: "Polished & Co. Studio",
    contact: "Taylor, returning client",
    trigger: "No future appointment · 6 weeks after visit",
    averageValue: 95,
    monthlyOpportunities: 60,
    recoveryRate: 16,
    messages: [
      {
        actor: "System",
        time: "11:05 AM",
        text: "Hi Taylor—ready for your next gel manicure with Nia? Here are her openings this week. Reply STOP to opt out.",
        event: "Rebooking window reached",
      },
      {
        actor: "Customer",
        time: "11:11 AM",
        text: "Does she have anything after 5 on Thursday?",
        event: "Booking intent identified",
      },
      {
        actor: "System",
        time: "11:11 AM",
        text: "Nia has 5:30 PM available Thursday. The $25 deposit is applied to your service. Would you like that time?",
        event: "Live availability presented",
      },
      {
        actor: "Customer",
        time: "11:13 AM",
        text: "Yes, book it.",
        event: "Client confirms",
      },
      {
        actor: "System",
        time: "11:14 AM",
        text: "You’re booked for Thursday at 5:30 PM. Your deposit receipt and appointment details are ready.",
        event: "Appointment and deposit recorded",
      },
    ],
  },
};

type OperationConfig = {
  recordLabel: string;
  workingStatus: string;
  approvalStatus: string;
  completeStatus: string;
  actions: string[];
  milestones: Array<{ label: string; reachedAt: number }>;
  fields: Array<{
    label: string;
    value: string;
    completeValue?: string;
    reachedAt: number;
    Icon: LucideIcon;
  }>;
  workflow: Array<{ label: string; reachedAt: number }>;
  completion: string;
  installed: string[];
};

const OPERATIONS: Record<ServiceSystemSlug, OperationConfig> = {
  "revenue-recovery": {
    recordLabel: "Recovered lead record",
    workingStatus: "Qualifying",
    approvalStatus: "Awaiting approval",
    completeStatus: "Booked",
    actions: [
      "Reply as the customer",
      "Run the safety screen",
      "Notify the on-call team",
      "Approve and book the visit",
    ],
    milestones: [
      { label: "Fast response", reachedAt: 0 },
      { label: "Need qualified", reachedAt: 1 },
      { label: "Human control", reachedAt: 3 },
      { label: "Service visit booked", reachedAt: 4 },
    ],
    fields: [
      { label: "Source", value: "Missed call", reachedAt: 0, Icon: PhoneMissed },
      { label: "Need", value: "No cooling", reachedAt: 1, Icon: Activity },
      { label: "Safety", value: "Screen clear", reachedAt: 2, Icon: ShieldCheck },
      { label: "Team", value: "Alert delivered", reachedAt: 3, Icon: BellRing },
      {
        label: "CRM stage",
        value: "New opportunity",
        completeValue: "Visit booked",
        reachedAt: 3,
        Icon: Database,
      },
      { label: "Appointment", value: "Tomorrow · 8–10 AM", reachedAt: 4, Icon: CalendarCheck2 },
    ],
    workflow: [
      { label: "Missed call", reachedAt: 0 },
      { label: "Instant response", reachedAt: 0 },
      { label: "Qualification", reachedAt: 1 },
      { label: "Human approval", reachedAt: 3 },
      { label: "Booking", reachedAt: 4 },
      { label: "Attribution", reachedAt: 4 },
    ],
    completion:
      "The customer received a fast response, the need was qualified, the team kept control of availability, and the booked visit was attributed to the missed-call workflow.",
    installed: [
      "Customer-facing response sequence",
      "Safety and qualification rules",
      "Human alert and takeover point",
      "CRM, booking, and outcome log",
    ],
  },
  "estimate-recovery": {
    recordLabel: "Estimate opportunity record",
    workingStatus: "Following up",
    approvalStatus: "Team responding",
    completeStatus: "Accepted",
    actions: [
      "Show the customer reply",
      "Classify the objection",
      "Let the salesperson respond",
      "Accept and request deposit",
    ],
    milestones: [
      { label: "Follow-up sent", reachedAt: 0 },
      { label: "Question captured", reachedAt: 1 },
      { label: "Sales takeover", reachedAt: 3 },
      { label: "Estimate accepted", reachedAt: 4 },
    ],
    fields: [
      { label: "Source", value: "Estimate viewed", reachedAt: 0, Icon: Activity },
      { label: "Question", value: "Start date", reachedAt: 1, Icon: Smartphone },
      { label: "Routing", value: "Salesperson needed", reachedAt: 2, Icon: ShieldCheck },
      { label: "Team", value: "Maya responded", reachedAt: 3, Icon: UserRound },
      {
        label: "Pipeline",
        value: "Decision pending",
        completeValue: "Estimate accepted",
        reachedAt: 3,
        Icon: Database,
      },
      { label: "Next step", value: "Deposit requested", reachedAt: 4, Icon: CircleDollarSign },
    ],
    workflow: [
      { label: "Estimate viewed", reachedAt: 0 },
      { label: "Timed follow-up", reachedAt: 0 },
      { label: "Objection detected", reachedAt: 1 },
      { label: "Sales takeover", reachedAt: 3 },
      { label: "Acceptance", reachedAt: 4 },
      { label: "Deposit", reachedAt: 4 },
    ],
    completion:
      "The estimate received a scheduled follow-up, the customer’s timing question reached the right salesperson, and the accepted job advanced to a deposit request with its source recorded.",
    installed: [
      "Estimate-age follow-up schedule",
      "Reply and objection classification",
      "Salesperson alert and takeover",
      "Acceptance, deposit, and pipeline log",
    ],
  },
  "route-retention": {
    recordLabel: "Recurring service opportunity",
    workingStatus: "Nurturing",
    approvalStatus: "Checking route",
    completeStatus: "Plan active",
    actions: [
      "Show customer interest",
      "Capture route preference",
      "Verify route capacity",
      "Activate the recurring plan",
    ],
    milestones: [
      { label: "Follow-up sent", reachedAt: 0 },
      { label: "Interest captured", reachedAt: 1 },
      { label: "Route approved", reachedAt: 3 },
      { label: "Recurring plan active", reachedAt: 4 },
    ],
    fields: [
      { label: "Source", value: "Visit completed", reachedAt: 0, Icon: Activity },
      { label: "Interest", value: "Weekly service", reachedAt: 1, Icon: Smartphone },
      { label: "Preference", value: "Thursday", reachedAt: 2, Icon: CalendarCheck2 },
      { label: "Route", value: "Route 3 verified", reachedAt: 3, Icon: ShieldCheck },
      {
        label: "Customer stage",
        value: "Plan pending",
        completeValue: "Recurring customer",
        reachedAt: 3,
        Icon: Database,
      },
      { label: "Plan", value: "$165 monthly", reachedAt: 4, Icon: CircleDollarSign },
    ],
    workflow: [
      { label: "Visit complete", reachedAt: 0 },
      { label: "Plan offer", reachedAt: 0 },
      { label: "Preference", reachedAt: 2 },
      { label: "Route approval", reachedAt: 3 },
      { label: "Plan activated", reachedAt: 4 },
      { label: "Retention logged", reachedAt: 4 },
    ],
    completion:
      "A completed one-time visit became a recurring-service conversation, route capacity stayed under team control, and the approved monthly plan was recorded as a retention outcome.",
    installed: [
      "Post-service follow-up trigger",
      "Recurring-plan interest capture",
      "Route-capacity approval point",
      "Plan activation and retention log",
    ],
  },
  "client-recovery": {
    recordLabel: "Client rebooking record",
    workingStatus: "Re-engaging",
    approvalStatus: "Confirming",
    completeStatus: "Rebooked",
    actions: [
      "Show the client reply",
      "Present available time",
      "Confirm the appointment",
      "Record booking and deposit",
    ],
    milestones: [
      { label: "Rebooking sent", reachedAt: 0 },
      { label: "Intent captured", reachedAt: 1 },
      { label: "Time confirmed", reachedAt: 3 },
      { label: "Appointment booked", reachedAt: 4 },
    ],
    fields: [
      { label: "Source", value: "Rebooking window", reachedAt: 0, Icon: Activity },
      { label: "Intent", value: "Thursday after 5", reachedAt: 1, Icon: Smartphone },
      { label: "Availability", value: "5:30 PM open", reachedAt: 2, Icon: CalendarCheck2 },
      { label: "Client", value: "Confirmed", reachedAt: 3, Icon: UserRound },
      {
        label: "Booking",
        value: "Appointment pending",
        completeValue: "Thursday · 5:30 PM",
        reachedAt: 3,
        Icon: Database,
      },
      { label: "Deposit", value: "$25 recorded", reachedAt: 4, Icon: CircleDollarSign },
    ],
    workflow: [
      { label: "Rebooking due", reachedAt: 0 },
      { label: "Client outreach", reachedAt: 0 },
      { label: "Availability", reachedAt: 2 },
      { label: "Confirmation", reachedAt: 3 },
      { label: "Deposit", reachedAt: 4 },
      { label: "Rebooking logged", reachedAt: 4 },
    ],
    completion:
      "A client without a future appointment received a timely reminder, selected verified availability, confirmed the booking, and completed the deposit step without staff chasing the conversation.",
    installed: [
      "Rebooking-window trigger",
      "Availability and preference flow",
      "Confirmation and reminder rules",
      "Deposit, booking, and reactivation log",
    ],
  },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SystemDemo({
  initialSystem = "route-retention",
  compact = false,
  ctaHref,
  showCta = true,
  businessName,
}: {
  initialSystem?: ServiceSystemSlug;
  compact?: boolean;
  ctaHref?: string;
  showCta?: boolean;
  businessName?: string;
}) {
  const [selected, setSelected] = useState<ServiceSystemSlug>(initialSystem);
  const [activeStep, setActiveStep] = useState(0);
  const [started, setStarted] = useState(false);
  const system = SERVICE_SYSTEMS.find((item) => item.slug === selected) ?? SERVICE_SYSTEMS[0];
  const scenario = SCENARIOS[selected];
  const operation = OPERATIONS[selected];
  const displayBusiness = businessName?.trim() || scenario.business;
  const [monthlyOpportunities, setMonthlyOpportunities] = useState(scenario.monthlyOpportunities);
  const [averageValue, setAverageValue] = useState(scenario.averageValue);

  useEffect(() => {
    setSelected(initialSystem);
  }, [initialSystem]);

  useEffect(() => {
    setActiveStep(0);
    setStarted(false);
    setMonthlyOpportunities(scenario.monthlyOpportunities);
    setAverageValue(scenario.averageValue);
  }, [scenario]);

  useEffect(() => {
    trackEvent("systems_page_viewed", {
      service_model: initialSystem,
      surface: compact ? "home_demo" : "systems_demo",
    });
  }, [compact, initialSystem]);

  const recoveredCount = Math.max(
    1,
    Math.round(monthlyOpportunities * (scenario.recoveryRate / 100)),
  );
  const illustrativeOpportunity = recoveredCount * averageValue;
  const shownMessages = scenario.messages.slice(0, activeStep + 1);
  const completed = activeStep === scenario.messages.length - 1;
  const resolvedCta = ctaHref ?? `/get-a-demo?system=${selected}`;
  const nextAction = operation.actions[activeStep] ?? "Continue the recovery";

  const milestones = operation.milestones.map((milestone) => ({
    label: milestone.label,
    reached: activeStep >= milestone.reachedAt,
  }));

  function choose(slug: ServiceSystemSlug) {
    setSelected(slug);
    trackEvent("service_model_selected", {
      service_model: slug,
      surface: compact ? "home_demo" : "systems_demo",
    });
  }

  function advance() {
    if (!started) {
      setStarted(true);
      trackEvent("demo_started", {
        service_model: selected,
        surface: compact ? "home_demo" : "systems_demo",
      });
    }
    const next = Math.min(activeStep + 1, scenario.messages.length - 1);
    setActiveStep(next);
    if (next === scenario.messages.length - 1) {
      trackEvent("demo_completed", {
        service_model: selected,
        outcome: system.demoEvent,
      });
    }
  }

  function restart() {
    setActiveStep(0);
    setStarted(false);
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl">
      <div className="border-b border-border bg-muted/40 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Full {system.shortTitle.toLowerCase()} experience
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {businessName?.trim()
                ? `Configured as a demonstration for ${displayBusiness}.`
                : "Choose a service model and run the customer and operations journey."}
            </p>
          </div>
          <span className="hidden rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
            Sample business + data
          </span>
        </div>
        <div
          className="mt-4 flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Select a recovery system demo"
        >
          {SERVICE_SYSTEMS.map((item) => (
            <button
              key={item.slug}
              type="button"
              role="tab"
              aria-selected={selected === item.slug}
              onClick={() => choose(item.slug)}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${selected === item.slug ? "bg-foreground text-background" : "border border-border bg-background text-muted-foreground hover:text-foreground"}`}
            >
              {item.shortTitle}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`grid ${compact ? "xl:grid-cols-[1.05fr_0.95fr]" : "lg:grid-cols-[1.08fr_0.92fr]"}`}
      >
        <div className="bg-slate-950 p-4 text-white sm:p-7">
          <div className="mx-auto max-w-xl overflow-hidden rounded-[1.75rem] border border-white/15 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{displayBusiness}</p>
                  <p className="text-xs text-white/55">Customer conversation</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Live
              </span>
            </div>

            <div className="min-h-[390px] p-4 sm:p-5">
              <div className="mb-4 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
                <span className="font-semibold">Trigger:</span> {scenario.trigger}
              </div>
              <div className="space-y-3" aria-live="polite">
                {shownMessages.map((message, index) => {
                  const isCustomer = message.actor === "Customer";
                  const isTeam = message.actor === "Team";
                  return (
                    <div
                      key={`${message.time}-${message.text}`}
                      className={`animate-in fade-in slide-in-from-bottom-2 ${isCustomer ? "ml-8 flex justify-end" : "mr-5"}`}
                    >
                      <div
                        className={`max-w-[92%] rounded-2xl px-3.5 py-3 ${
                          isCustomer
                            ? "rounded-br-md bg-blue-600"
                            : isTeam
                              ? "rounded-bl-md border border-amber-300/25 bg-amber-300/10"
                              : "rounded-bl-md bg-white/10"
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/55">
                          {isTeam ? (
                            <UserRound className="h-3 w-3" />
                          ) : isCustomer ? null : (
                            <Bot className="h-3 w-3" />
                          )}
                          {message.actor} · {message.time}
                        </div>
                        <p className="text-sm leading-relaxed text-white/90">
                          {message.text.replaceAll(scenario.business, displayBusiness)}
                        </p>
                      </div>
                      {index === activeStep && message.event ? (
                        <p
                          className={`mt-1.5 text-[11px] text-emerald-300 ${isCustomer ? "text-right" : ""}`}
                        >
                          <Check className="mr-1 inline h-3 w-3" /> {message.event}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-white/10 p-4">
              {!completed ? (
                <button
                  type="button"
                  onClick={advance}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
                >
                  {nextAction}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex flex-1 items-center gap-2 rounded-xl bg-emerald-400/15 px-4 py-3 text-sm font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> {system.demoEvent} and attributed
                </div>
              )}
              <button
                type="button"
                onClick={restart}
                aria-label="Restart simulation"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15 text-white/65 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Live business operations view
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold">{system.demoLabel}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The automation moves routine follow-up forward while your team controls safety, pricing,
            availability, and exceptions.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2">
            {milestones.map((milestone) => (
              <div
                key={milestone.label}
                className={`rounded-xl border p-3 transition-colors ${milestone.reached ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/30"}`}
              >
                <div className="flex items-center gap-2">
                  {milestone.reached ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-muted-foreground/40" />
                  )}
                  <span className="text-xs font-semibold">{milestone.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {operation.recordLabel}
                </p>
                <p className="mt-1 font-semibold">{scenario.contact}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${completed ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200" : "bg-amber-500/10 text-amber-800 dark:text-amber-200"}`}
              >
                {completed
                  ? operation.completeStatus
                  : activeStep >= 3
                    ? operation.approvalStatus
                    : operation.workingStatus}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-border text-xs sm:grid-cols-3">
              {operation.fields.map(({ label, value, completeValue, reachedAt, Icon }) => {
                const reached = activeStep >= reachedAt;
                const shownValue = completed && completeValue ? completeValue : value;
                return (
                  <div key={label} className="bg-background p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </div>
                    <p
                      className={`mt-1 font-semibold ${reached ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {reached ? shownValue : "Pending"}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Simulated workflow
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium">
                {operation.workflow.map((step, index) => {
                  const reached = step.reachedAt <= activeStep;
                  return (
                    <div key={step.label} className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 ${reached ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                      >
                        {step.label}
                      </span>
                      {index < operation.workflow.length - 1 ? (
                        <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {completed ? (
            <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-display text-lg font-semibold">Recovery completed</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {operation.completion}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                {operation.installed.map((item) => (
                  <p
                    key={item}
                    className="flex items-center gap-2 rounded-lg bg-background px-3 py-2"
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> {item}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <Calculator className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Estimate your recovery opportunity</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Adjust the sample numbers. We use a conservative {scenario.recoveryRate}% recovery
                  assumption—not a promise of results.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-xs font-medium text-muted-foreground">
                Monthly opportunities
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={monthlyOpportunities}
                  onChange={(event) =>
                    setMonthlyOpportunities(Math.max(1, Number(event.target.value) || 1))
                  }
                  className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                Average customer value
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="1000000"
                    value={averageValue}
                    onChange={(event) =>
                      setAverageValue(Math.max(1, Number(event.target.value) || 1))
                    }
                    className="h-10 w-full rounded-lg border border-input bg-background pl-7 pr-3 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </label>
            </div>
            <div className="mt-4 flex items-end justify-between gap-4 rounded-xl bg-background p-4">
              <div>
                <p className="text-xs text-muted-foreground">Illustrative monthly opportunity</p>
                <p className="mt-1 font-display text-3xl font-semibold text-foreground">
                  {formatCurrency(illustrativeOpportunity)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">If approximately</p>
                <p className="font-semibold text-foreground">{recoveredCount} are recovered</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <p className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-primary" /> Human alerts at defined points
            </p>
            <p className="flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4 text-primary" /> Outcome source recorded
            </p>
          </div>

          {showCta ? (
            <a
              href={resolvedCta}
              onClick={() =>
                trackEvent("demo_cta_clicked", {
                  service_model: selected,
                  illustrative_opportunity_band:
                    illustrativeOpportunity < 2500
                      ? "under_2500"
                      : illustrativeOpportunity < 10000
                        ? "2500_9999"
                        : "10000_plus",
                })
              }
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3.5 text-sm font-semibold text-background hover:opacity-90"
            >
              Get my 30-day recovery plan <ChevronRight className="h-4 w-4" />
            </a>
          ) : null}
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
            Browser-based demonstration with fictional customer data and simulated integrations. No
            text, booking, or CRM record is created. Your proposal will use verified rules, baseline
            data, and approved software.
          </p>
        </div>
      </div>
    </div>
  );
}
