// Shared content for the AI Playbook tool (/tools/ai-playbook) and the
// per-niche SEO landing pages (/ai-playbook-for/$niche).
import { Megaphone, Handshake, Timer, TrendingUp } from "lucide-react";

export interface PlaybookPrompt {
  title: string;
  body: string;
}

export interface PlaybookCategory {
  category: string;
  Icon: typeof Megaphone;
  colorClass: string;
  prompts: PlaybookPrompt[];
}

export const PLAYBOOK: PlaybookCategory[] = [
  {
    category: "Marketing & Content",
    Icon: Megaphone,
    colorClass: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50",
    prompts: [
      {
        title: "30 Days of Social Posts",
        body: `Act as a social media strategist for a {NICHE}. Create a 30-day content calendar with one post idea per day. Mix educational tips, behind-the-scenes ideas, client success angles, and promotional posts (max 20% promotional). My ideal customer is [describe your customer]. Format as a table: Day, Post type, Hook, Caption outline.`,
      },
      {
        title: "Google Review Reply Writer",
        body: `You write review responses for a {NICHE}. I'll paste a customer review, and you reply in a warm, professional voice — thank them, mention one specific detail from their review, and invite them back. Keep it under 60 words. Never sound corporate or copy-pasted. Here's the review: [paste review]`,
      },
      {
        title: "Homepage Copy Rewrite",
        body: `Act as a conversion copywriter. Rewrite my homepage copy for my {NICHE} business. Audience: [who they are]. What makes us different: [your edge]. Give me: a headline (under 10 words), a subheadline, 3 benefit bullets, and a call-to-action button label. Make it sound like a human, not an agency.`,
      },
      {
        title: "Local SEO Content Ideas",
        body: `Act as a local SEO specialist for a {NICHE} in [city]. List 10 blog post or FAQ page topics that customers in my area actually search for before buying. For each, give the target search phrase and a working title. Prioritize topics where a real answer from a local expert beats generic national content.`,
      },
    ],
  },
  {
    category: "Customers & Sales",
    Icon: Handshake,
    colorClass: "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50",
    prompts: [
      {
        title: "Inquiry Reply That Closes",
        body: `You are a sales assistant for a {NICHE}. A potential customer sent this inquiry: [paste inquiry]. Write a reply that: answers their question directly, adds one thing they didn't think to ask about (that shows expertise), and ends with a low-pressure next step. Friendly, confident, under 120 words.`,
      },
      {
        title: "Win Back Past Customers",
        body: `Write a short re-engagement email from a {NICHE} business to past customers we haven't seen in 6+ months. No discounts unless I say so — lead with something genuinely useful or new instead: [what's new]. Subject line + 80-word email. Warm, personal, zero marketing-speak.`,
      },
      {
        title: "Handle a Price Objection",
        body: `I run a {NICHE} business. A customer said we're too expensive compared to [competitor/cheaper option]. Write 3 different ways to respond — one that reframes value, one that offers a scaled-down option, one that gracefully lets them go while leaving the door open. Keep each under 75 words.`,
      },
      {
        title: "Ask for the Review",
        body: `Write a short, personal message from a {NICHE} asking a happy customer for a Google review. Reference the specific work we did: [what you did for them]. Make leaving the review feel like a 30-second favor, include the direct link placeholder [review link], and never sound like an automated blast.`,
      },
    ],
  },
  {
    category: "Operations & Time-Saving",
    Icon: Timer,
    colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50",
    prompts: [
      {
        title: "Turn a Job Into a Checklist",
        body: `I run a {NICHE} business. Here's how I do [a recurring task]: [describe your process roughly]. Turn this into a clean step-by-step checklist I could hand to a new hire or virtual assistant, with quality checks and common mistakes to avoid at each step.`,
      },
      {
        title: "FAQ Page in 10 Minutes",
        body: `Act as a customer of a {NICHE}. List the 12 questions customers most often ask before booking or buying, then draft a clear, friendly answer to each (2-4 sentences) that I can edit. Flag any answer where my specific policy matters with [YOUR POLICY].`,
      },
      {
        title: "Weekly Admin Batch Plan",
        body: `I run a {NICHE} business solo. Design a weekly 2-hour "admin power block" that batches: invoicing, follow-ups, social scheduling, and inbox cleanup. Give me a minute-by-minute agenda and one AI shortcut for each task.`,
      },
    ],
  },
  {
    category: "Growth & Strategy",
    Icon: TrendingUp,
    colorClass: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50",
    prompts: [
      {
        title: "Find Your Most Profitable Offer",
        body: `Act as a small business consultant. I run a {NICHE} business. My services and rough numbers: [list services with price and time each takes]. Identify which offer likely makes the most profit per hour, which to raise prices on, and which to drop or productize. Explain the reasoning simply.`,
      },
      {
        title: "Ethical Competitor Scan",
        body: `Act as a market researcher for a {NICHE}. Using only public information, list what my top 3 local competitors [names optional] probably compete on (price, speed, reviews, specialization). Then suggest one positioning angle they're likely ignoring that I could own.`,
      },
      {
        title: "Next 90 Days Growth Plan",
        body: `Act as a growth advisor for a {NICHE} business doing roughly [monthly revenue] per month. Build a 90-day plan with one focus per month, weekly actions, and a single number to track each week. Assume I have 5 hours per week for growth work and a small budget.`,
      },
    ],
  },
];

export const PRO_TEASER = [
  "40+ additional prompts across hiring, finance, and customer retention",
  "Step-by-step AI workflow guides (not just prompts)",
  "A recommended AI tool stack matched to your niche and budget",
  "Updates as new AI tools and models launch",
];

export const EXAMPLE_NICHES = [
  "wedding photographer",
  "personal trainer",
  "real estate agent",
  "landscaping company",
  "hair salon",
];

export function titleCase(s: string) {
  return s.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1));
}

/**
 * Pluralize a free-text niche for headlines ("hair salon" → "hair salons",
 * "notary" → "notaries", "church" → "churches"). Leaves inputs that already
 * end in "s" alone ("luxury properties" stays as-is).
 */
export function pluralizeNiche(s: string) {
  const t = s.trim();
  if (!t || /s$/i.test(t)) return t;
  if (/[^aeiou]y$/i.test(t)) return `${t.slice(0, -1)}ies`;
  if (/(x|z|ch|sh)$/i.test(t)) return `${t}es`;
  return `${t}s`;
}

export function personalize(body: string, nicheNoun: string) {
  return body.replaceAll("{NICHE}", nicheNoun);
}

// ---------------------------------------------------------------------------
// Per-niche SEO landing pages. Each entry needs genuinely unique copy —
// intro + painPoints are what keep these pages from being thin duplicates.
// nicheNoun is what gets substituted into the prompts ("a {nicheNoun}").
// ---------------------------------------------------------------------------

export interface NicheEntry {
  slug: string;
  /** Plural, title-case — used in H1s: "The AI Playbook for Hair Salons" */
  plural: string;
  /** Lowercase singular noun substituted into prompts: "hair salon" */
  nicheNoun: string;
  intro: string;
  painPoints: [string, string, string];
}

export const NICHES: NicheEntry[] = [
  {
    slug: "hair-salons",
    plural: "Hair Salons",
    nicheNoun: "hair salon",
    intro:
      "Your chairs only make money when they're full, but the work that fills them — posting your looks, answering DMs, chasing reviews, reminding no-shows — happens after you've been on your feet all day. AI handles exactly that layer: the words, the follow-ups, the posting rhythm.",
    painPoints: [
      "Instagram goes quiet the week you're busiest — which is every week",
      "No-shows and last-minute cancels eat chair time you can't get back",
      "New clients pick whoever answers their DM first, and you're mid-color",
    ],
  },
  {
    slug: "barbershops",
    plural: "Barbershops",
    nicheNoun: "barbershop",
    intro:
      "A barbershop grows on reputation and rhythm — regulars who book again and word that travels. The bottleneck was never your cuts; it's the marketing and admin nobody has time for between clients. That's the part AI does well.",
    painPoints: [
      "Your best advertising (fresh cuts) never makes it to social media",
      "Walk-in unpredictability makes planning the week a guess",
      "Google reviews trickle in slowly while one bad one sits at the top",
    ],
  },
  {
    slug: "nail-salons",
    plural: "Nail Salons",
    nicheNoun: "nail salon",
    intro:
      "Nail work is visual, personal, and repeat-driven — the perfect business for AI-assisted marketing, because your camera roll is already full of content nobody has time to caption and post. These prompts turn that backlog into bookings.",
    painPoints: [
      "Hundreds of photos of finished sets, no time to post any of them",
      "Clients drift to whichever salon stayed visible on their feed",
      "Booking questions repeat all day: prices, fills, how long, designs",
    ],
  },
  {
    slug: "wedding-photographers",
    plural: "Wedding Photographers",
    nicheNoun: "wedding photographer",
    intro:
      "Every wedding photographer fights the same math: the shooting is maybe a fifth of the job. Inquiries, galleries, blog posts, album reminders, and next season's marketing eat the rest. AI can't shoot the wedding — it can do a shocking amount of everything else.",
    painPoints: [
      "Inquiry replies take an hour each and couples ghost the slow ones",
      "SEO blog posts for each venue never get written",
      "Off-season income depends on marketing you're too burned out to do",
    ],
  },
  {
    slug: "personal-trainers",
    plural: "Personal Trainers",
    nicheNoun: "personal trainer",
    intro:
      "Training clients is the job; getting clients is the second job. Between sessions you're expected to be a content creator, salesperson, and retention specialist. These prompts take over the writing half of that — check-ins, programs explained in plain English, and content that fills your roster.",
    painPoints: [
      "Client check-in messages take your whole evening or don't happen",
      "Everyone says 'post consistently' — nobody says when you'd sleep",
      "Price objections kill sign-ups you were one good answer away from",
    ],
  },
  {
    slug: "real-estate-agents",
    plural: "Real Estate Agents",
    nicheNoun: "real estate agent",
    intro:
      "Real estate runs on follow-up and visibility — the two things that collapse first when you're busy closing. Listing descriptions, neighborhood content, past-client touch points, open house follow-ups: all writing, all delegable to AI, all in this playbook.",
    painPoints: [
      "Leads go cold because follow-up depends on your memory",
      "Every listing needs fresh copy, photos captioned, posts scheduled",
      "Past clients forget you exist right up until they list with someone else",
    ],
  },
  {
    slug: "landscaping-companies",
    plural: "Landscaping Companies",
    nicheNoun: "landscaping company",
    intro:
      "Landscaping wins on estimates answered fast, before-and-after photos, and staying on the calendar year-round. The crews handle the work — this playbook handles the words: quotes, seasonal upsells, review requests, and the marketing that keeps winter from going silent.",
    painPoints: [
      "Estimate requests pile up in voicemail while competitors respond same-day",
      "Seasonal revenue cliffs — no system for selling fall and winter services",
      "Great transformations happen daily and never get photographed or posted",
    ],
  },
  {
    slug: "hvac-contractors",
    plural: "HVAC Contractors",
    nicheNoun: "HVAC company",
    intro:
      "HVAC demand shows up in spikes — heat waves, cold snaps, emergencies — and the companies that win are simply the ones customers can find and hear back from fastest. This playbook is about speed and presence: fast professional replies, service reminders that sell, and reviews that stack.",
    painPoints: [
      "Emergency-season call volume buries the office; leads leak away",
      "Maintenance plans would smooth revenue but nobody markets them",
      "You're invisible on Google next to companies with 10x the reviews",
    ],
  },
  {
    slug: "plumbers",
    plural: "Plumbers",
    nicheNoun: "plumbing company",
    intro:
      "Plumbing customers search in a panic and pick from the top three results. Winning that moment takes reviews, response speed, and a professional presence — none of which requires you to touch a keyboard for long, once AI drafts the replies, review asks, and service content for you.",
    painPoints: [
      "Panicked customers book whoever answers first — often not you",
      "Review count decides your Google rank and asking feels awkward",
      "Quotes and follow-ups get written at 9pm after a full day in crawlspaces",
    ],
  },
  {
    slug: "electricians",
    plural: "Electricians",
    nicheNoun: "electrical contracting business",
    intro:
      "Electrical work sells on trust — homeowners are nervous about exactly the thing you do all day. The businesses that grow are the ones that sound as professional in writing as they are on the job. AI closes that gap: clear quotes, patient answers to anxious questions, steady reviews.",
    painPoints: [
      "Homeowners get three bids; the clearest-sounding one usually wins",
      "Common questions (panel upgrades, EV chargers) answered one at a time forever",
      "Word-of-mouth works but never scales past your zip code",
    ],
  },
  {
    slug: "cleaning-services",
    plural: "Cleaning Services",
    nicheNoun: "cleaning business",
    intro:
      "Cleaning is a recurring-revenue business wearing a one-off-gig costume. The whole game is converting first cleans into standing schedules and referrals — a communication problem, not a cleaning problem. This playbook gives you the messages, offers, and follow-ups that do it.",
    painPoints: [
      "One-time cleans that never convert to weekly or biweekly contracts",
      "Quoting eats evenings: every house is different, every reply is from scratch",
      "Clients churn silently — no win-back system when they pause service",
    ],
  },
  {
    slug: "auto-detailers",
    plural: "Auto Detailers",
    nicheNoun: "auto detailing business",
    intro:
      "Detailing is made for the internet — dramatic before-and-afters, satisfying process videos — and most shops post none of it. Meanwhile bookings swing with the weather and the calendar. AI turns your daily work into content and your customer list into repeat revenue.",
    painPoints: [
      "Jaw-dropping transformations leave the lot unphotographed daily",
      "Slow weekdays and weather gaps with no quick way to fill them",
      "Customers detail once and disappear instead of joining a maintenance cycle",
    ],
  },
  {
    slug: "restaurants",
    plural: "Restaurants",
    nicheNoun: "restaurant",
    intro:
      "Restaurants live and die on repeat visits and reviews, yet the owner is the last person with time to write anything. This playbook covers the writing layer of hospitality: review responses that win back angry guests, specials that actually get seen, and emails that refill slow nights.",
    painPoints: [
      "One unanswered 1-star review does more damage than ten good plates",
      "Slow Tuesdays, full weekends — no lever for smoothing demand",
      "Your regulars' contact info sits unused in the POS or reservation system",
    ],
  },
  {
    slug: "food-trucks",
    plural: "Food Trucks",
    nicheNoun: "food truck",
    intro:
      "A food truck's biggest daily marketing task is simply telling people where you are and why to come — every single day, in a voice worth following. That's a content treadmill AI runs happily: location posts, event pitches, catering follow-ups, and menu hype.",
    painPoints: [
      "If today's location post is late or boring, today's line is short",
      "Catering and event gigs are the real money — pitching them takes time you don't have",
      "Building a following that travels with you doesn't happen by accident",
    ],
  },
  {
    slug: "bakeries",
    plural: "Bakeries",
    nicheNoun: "bakery",
    intro:
      "Bakery margins are thin and the mornings start at 4am — marketing gets whatever energy is left, which is none. But bakery products are the most photogenic inventory on earth. These prompts turn what you already bake into posts, pre-orders, and custom-order pipelines.",
    painPoints: [
      "Day-old product means yesterday's marketing failure, literally",
      "Custom order inquiries need fast, detailed replies during your busiest hours",
      "Holiday rushes and empty Januarys — no email list smoothing the curve",
    ],
  },
  {
    slug: "churches",
    plural: "Churches",
    nicheNoun: "church",
    intro:
      "Ministry teams carry a hidden writing load: announcements, follow-up with visitors, volunteer coordination, event promotion, newsletters. None of it is why anyone entered ministry, and all of it competes with actual pastoral care. AI handles the drafting so people-time goes back to people.",
    painPoints: [
      "First-time visitors slip away without a warm, timely follow-up",
      "The same three volunteers write every announcement, email, and bulletin",
      "Events are planned well but promoted late, so attendance underperforms the effort",
    ],
  },
  {
    slug: "nonprofits",
    plural: "Nonprofits",
    nicheNoun: "nonprofit organization",
    intro:
      "Nonprofits run on stories and asks — donor updates, grant narratives, volunteer recruitment, impact reports — with a staff size that would make a business laugh. AI is the writing intern you can't afford to hire: it drafts, you add the truth and the heart.",
    painPoints: [
      "Grant applications and reports consume weeks of scarce staff time",
      "Donors give once and lapse because thank-yous and updates lag",
      "The mission's stories are powerful and mostly untold",
    ],
  },
  {
    slug: "daycare-providers",
    plural: "Daycare Providers",
    nicheNoun: "daycare",
    intro:
      "Parents choose childcare on trust, and trust is built in the details: how quickly you answer, how clearly you communicate, how professional your policies read. This playbook handles the parent-facing writing — inquiry replies, updates, handbooks — while you handle the kids.",
    painPoints: [
      "Tour requests and waitlist questions arrive during the least answerable hours",
      "Daily parent updates matter enormously and take time you don't have",
      "Policy conversations (late pickup, sick kids, payments) are awkward to word",
    ],
  },
  {
    slug: "tutors",
    plural: "Tutors",
    nicheNoun: "tutoring business",
    intro:
      "Tutoring grows on results and referrals, but parents can't see results without communication — progress updates, session recaps, honest assessments. AI drafts those in minutes, and handles the marketing that keeps your calendar full between semesters.",
    painPoints: [
      "Parent progress reports either eat Sunday or don't happen",
      "Summer and post-exam droughts with no re-engagement system",
      "Referrals happen by luck instead of by ask",
    ],
  },
  {
    slug: "massage-therapists",
    plural: "Massage Therapists",
    nicheNoun: "massage therapy practice",
    intro:
      "Your hands are the business, which means every hour spent on marketing is an hour of lost revenue or lost recovery. The fix isn't working more — it's making rebooking, reviews, and reminders run on drafted-in-advance autopilot. That's exactly what this playbook sets up.",
    painPoints: [
      "Clients feel great, leave, and forget to rebook for two months",
      "No-shows hurt double when your inventory is literally hours",
      "Insurance/benefit questions repeat endlessly and eat unpaid time",
    ],
  },
  {
    slug: "tattoo-artists",
    plural: "Tattoo Artists",
    nicheNoun: "tattoo studio",
    intro:
      "Tattoo clients research for months and book on portfolio and vibe. Your art does the convincing — if it's visible and your DMs don't rot. This playbook keeps the pipeline moving: posting rhythm, inquiry triage, deposit policies worded firmly but warmly, and aftercare that protects your work.",
    painPoints: [
      "DM inquiries pile up; serious clients mixed in with price-shoppers",
      "Flaky bookings and deposit arguments drain energy before the needle starts",
      "Finished pieces get one story post and vanish instead of compounding",
    ],
  },
  {
    slug: "dog-groomers",
    plural: "Dog Groomers",
    nicheNoun: "dog grooming business",
    intro:
      "Grooming is a rebooking business — a dog groomed once is a customer lost; a dog on a 6-week cycle is revenue you can plan around. The difference is follow-up and reminders, which is writing, which is what AI does. Plus: your daily output is adorable content.",
    painPoints: [
      "Clients rebook 'when he gets shaggy' instead of on a schedule",
      "Before/after photos of every dog, posted almost never",
      "New client intake questions (breed, temperament, matting) repeat all day",
    ],
  },
  {
    slug: "event-planners",
    plural: "Event Planners",
    nicheNoun: "event planning business",
    intro:
      "Event planning is a trust purchase made from your written materials long before anyone sees you work: proposals, timelines, vendor emails, follow-ups. AI accelerates the exact documents that win the job — and the marketing between seasons that keeps inquiries coming.",
    painPoints: [
      "Proposals take hours each and half the inquiries were never serious",
      "Vendor coordination emails multiply as the event approaches",
      "Portfolio-worthy events end, and the content moment passes unposted",
    ],
  },
  {
    slug: "bookkeepers",
    plural: "Bookkeepers",
    nicheNoun: "bookkeeping practice",
    intro:
      "Bookkeepers sell peace of mind, but prospects can't feel that from 'monthly reconciliation' — they feel it from clear, calm communication. This playbook helps you explain what you do in owner language, package your services, and stay visible to the small businesses who need you.",
    painPoints: [
      "Prospects don't know what bookkeeping includes, so they shop on price",
      "Client questions arrive as fires ('is this deductible?!') and eat billable time",
      "Referrals from accountants and clients happen ad hoc, not systematically",
    ],
  },
];

export function getNiche(slug: string): NicheEntry | undefined {
  return NICHES.find((n) => n.slug === slug);
}
