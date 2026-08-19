export type ServiceSystemSlug =
  | "revenue-recovery"
  | "estimate-recovery"
  | "route-retention"
  | "client-recovery";

export type SolutionSlug =
  | "home-field-services"
  | "project-estimate-businesses"
  | "recurring-property-services"
  | "beauty-personal-care";

export type DemoStep = {
  time: string;
  actor: "Customer" | "System" | "Team";
  title: string;
  detail: string;
};

export type ServiceSystem = {
  slug: ServiceSystemSlug;
  solutionSlug: SolutionSlug;
  eyebrow: string;
  title: string;
  shortTitle: string;
  summary: string;
  industries: string[];
  leaks: string[];
  outcomes: string[];
  demoLabel: string;
  demoEvent: string;
  steps: DemoStep[];
};

export const SERVICE_SYSTEMS: ServiceSystem[] = [
  {
    slug: "revenue-recovery",
    solutionSlug: "home-field-services",
    eyebrow: "Urgent service businesses",
    title: "Revenue Recovery System",
    shortTitle: "Revenue Recovery",
    summary:
      "Respond to missed and after-hours inquiries, collect the right details, and move qualified customers toward a booked appointment with a clear human handoff.",
    industries: ["HVAC", "Plumbing", "Electrical", "Restoration"],
    leaks: ["Missed calls", "Slow web-lead response", "After-hours inquiries"],
    outcomes: ["Faster first response", "More qualified bookings", "Visible human escalations"],
    demoLabel: "Urgent inquiry to booked visit",
    demoEvent: "Booked service visit",
    steps: [
      {
        time: "0:00",
        actor: "Customer",
        title: "A call is missed",
        detail: "A homeowner calls after hours about an AC that stopped cooling.",
      },
      {
        time: "0:01",
        actor: "System",
        title: "Permission-based response",
        detail:
          "A text identifies the business, acknowledges the missed call, and offers help or an opt-out.",
      },
      {
        time: "0:03",
        actor: "Customer",
        title: "Need is qualified",
        detail:
          "The customer confirms the service address, urgency, and preferred appointment window.",
      },
      {
        time: "0:04",
        actor: "Team",
        title: "Urgent cases escalate",
        detail:
          "Safety-sensitive or high-priority answers alert the on-call person instead of relying on AI.",
      },
      {
        time: "0:06",
        actor: "System",
        title: "Booking is recorded",
        detail: "The approved slot is confirmed and the source is attached to the customer record.",
      },
    ],
  },
  {
    slug: "estimate-recovery",
    solutionSlug: "project-estimate-businesses",
    eyebrow: "Estimate-driven businesses",
    title: "Estimate Recovery System",
    shortTitle: "Estimate Recovery",
    summary:
      "Keep quoted work from disappearing into an inbox with a consistent follow-up sequence, customer responses, and timely alerts for the sales team.",
    industries: ["Roofing", "Remodeling", "Painting", "Fencing"],
    leaks: ["Unanswered estimates", "Inconsistent follow-up", "Stalled opportunities"],
    outcomes: ["Consistent follow-up", "Clear objection signals", "More accepted estimates"],
    demoLabel: "Delivered estimate to accepted job",
    demoEvent: "Estimate accepted",
    steps: [
      {
        time: "Day 0",
        actor: "System",
        title: "Estimate delivered",
        detail:
          "The customer receives the estimate, next steps, and a direct way to ask a question.",
      },
      {
        time: "Day 2",
        actor: "System",
        title: "Helpful follow-up",
        detail:
          "A short message checks whether the customer has questions without inventing urgency.",
      },
      {
        time: "Day 2",
        actor: "Customer",
        title: "An objection appears",
        detail: "The customer asks about timing or available payment options.",
      },
      {
        time: "Day 2",
        actor: "Team",
        title: "Salesperson takes over",
        detail: "The opportunity and conversation summary are sent to the assigned salesperson.",
      },
      {
        time: "Day 3",
        actor: "System",
        title: "Decision is recorded",
        detail: "Acceptance, loss reason, or a new follow-up date is stored for reporting.",
      },
    ],
  },
  {
    slug: "route-retention",
    solutionSlug: "recurring-property-services",
    eyebrow: "Recurring property services",
    title: "Route & Retention System",
    shortTitle: "Route & Retention",
    summary:
      "Turn one-time work into recurring service, bring seasonal customers back, and fill route gaps with timely, permission-based follow-up.",
    industries: ["Landscaping", "Cleaning", "Pest control", "Pool service"],
    leaks: ["One-time customers", "Seasonal churn", "Open route capacity"],
    outcomes: ["More recurring plans", "Timely reactivation", "Healthier route density"],
    demoLabel: "Completed visit to recurring plan",
    demoEvent: "Recurring plan started",
    steps: [
      {
        time: "Day 0",
        actor: "Team",
        title: "Service is completed",
        detail: "A fictional Sebring pool company closes a one-time cleanup visit.",
      },
      {
        time: "Day 1",
        actor: "System",
        title: "Follow-up is triggered",
        detail: "The customer receives a thank-you and the relevant recurring-care option.",
      },
      {
        time: "Day 1",
        actor: "Customer",
        title: "Customer requests details",
        detail: "They select frequency and ask for the next available service date.",
      },
      {
        time: "Day 1",
        actor: "Team",
        title: "Route fit is confirmed",
        detail: "Staff verify pricing and capacity before any schedule is committed.",
      },
      {
        time: "Day 2",
        actor: "System",
        title: "Plan and attribution recorded",
        detail: "The recurring booking and recovery source are saved for the monthly report.",
      },
    ],
  },
  {
    slug: "client-recovery",
    solutionSlug: "beauty-personal-care",
    eyebrow: "Appointment businesses",
    title: "Client Recovery System",
    shortTitle: "Client Recovery",
    summary:
      "Reduce empty chairs with deposits, reminders, waitlist offers, rebooking prompts, and thoughtful reactivation for clients who have not returned.",
    industries: ["Barbershops", "Hair salons", "Nail professionals", "Beauty studios"],
    leaks: ["No-shows", "Empty cancellations", "Clients who do not rebook"],
    outcomes: ["Protected appointment time", "Faster waitlist fills", "More repeat bookings"],
    demoLabel: "Booking to repeat appointment",
    demoEvent: "Next appointment booked",
    steps: [
      {
        time: "Booking",
        actor: "Customer",
        title: "Appointment requested",
        detail:
          "A client selects a service and agrees to the visible deposit and cancellation policy.",
      },
      {
        time: "48 hours",
        actor: "System",
        title: "Reminder sent",
        detail: "The client can confirm, reschedule, or cancel without calling the shop.",
      },
      {
        time: "Cancellation",
        actor: "System",
        title: "Waitlist is offered the slot",
        detail: "Eligible clients receive a limited, permission-based opening notification.",
      },
      {
        time: "Checkout",
        actor: "Team",
        title: "Service completed",
        detail: "Staff mark the visit complete in the existing booking platform.",
      },
      {
        time: "After visit",
        actor: "System",
        title: "Rebooking prompt",
        detail: "The client receives the appropriate timing and link for their next appointment.",
      },
    ],
  },
];

export const SOLUTIONS = [
  {
    slug: "home-field-services" as const,
    title: "Home & Field Services",
    description:
      "Recover time-sensitive calls and web inquiries for HVAC, plumbing, electrical, restoration, and related teams.",
    systemSlug: "revenue-recovery" as const,
  },
  {
    slug: "project-estimate-businesses" as const,
    title: "Project & Estimate Businesses",
    description:
      "Create consistent follow-up for roofing, remodeling, painting, fencing, and other quoted work.",
    systemSlug: "estimate-recovery" as const,
  },
  {
    slug: "recurring-property-services" as const,
    title: "Recurring Property Services",
    description:
      "Strengthen recurring revenue and route density for landscaping, cleaning, pest control, and pool service.",
    systemSlug: "route-retention" as const,
  },
  {
    slug: "beauty-personal-care" as const,
    title: "Beauty & Personal Care",
    description:
      "Protect appointment revenue and increase repeat visits for barbershops, salons, nail professionals, and studios.",
    systemSlug: "client-recovery" as const,
  },
];

export const ENGAGEMENT_STEPS = [
  "Qualify",
  "Demo",
  "Proposal",
  "Deposit",
  "Implementation",
  "Optimization",
];

export function getServiceSystem(slug: string) {
  return SERVICE_SYSTEMS.find((system) => system.slug === slug);
}

export function getSolution(slug: string) {
  return SOLUTIONS.find((solution) => solution.slug === slug);
}
