/**
 * Editorial layer over the AI Radar feed.
 *
 * The aggregator in `ai-radar.functions.ts` answers "what was published?".
 * This answers "who does it affect, how urgently, and where do they go next on
 * this site?" — and it does so with keyword rules and arithmetic we can point
 * at, never a model's opinion and never a hand-written placeholder item.
 */

/**
 * Radar tracks mirror the four Knowledge Hub tracks, so a track chip can
 * deep-link into the matching article filter. `category` must stay in sync with
 * the `articles.category` values used by /knowledge.
 */
export type RadarTrackId = "build" | "operate" | "secure" | "decide";

/** How urgently someone running agents today should care. */
export type RadarSignal = "act" | "watch" | "context";

export const RADAR_TRACKS = {
  build: {
    id: "build",
    label: "Build",
    category: "Getting Started",
    blurb: "Shipping a first working agent loop.",
    nextStep: { label: "Plan it in Agent Architect", to: "/tools/agent-architect" },
  },
  operate: {
    id: "operate",
    label: "Operate",
    category: "Evaluation",
    blurb: "Measuring quality, cost, and live behavior.",
    nextStep: { label: "Score it in Eval Studio", to: "/tools/eval-studio" },
  },
  secure: {
    id: "secure",
    label: "Secure",
    category: "Agent Security",
    blurb: "Permissions, approval gates, and injection defense.",
    nextStep: { label: "Run the Prompt Guard Auditor", to: "/tools/prompt-guard-auditor" },
  },
  decide: {
    id: "decide",
    label: "Decide",
    category: "Business Strategy",
    blurb: "Model choice, pricing, and the business case.",
    nextStep: {
      label: "Price it in the Token Cost Calculator",
      to: "/tools/token-cost-calculator",
    },
  },
} as const;

export const RADAR_SIGNALS = {
  act: {
    label: "Act",
    blurb: "Something changed that can break or re-price a running agent.",
  },
  watch: {
    label: "Watch",
    blurb: "A release or launch worth a look before your next build.",
  },
  context: {
    label: "Context",
    blurb: "Research and analysis that shapes the longer view.",
  },
} as const;

export const RADAR_TRACK_IDS = ["build", "operate", "secure", "decide"] as const;
export const RADAR_SIGNAL_IDS = ["act", "watch", "context"] as const;

/**
 * Rules are evaluated in order and the first match wins, so the most
 * consequential reading of an item comes first: a security story about pricing
 * is a security story.
 */
const TRACK_RULES: Array<{ track: RadarTrackId; pattern: RegExp }> = [
  {
    track: "secure",
    pattern:
      /prompt[\s-]?injection|jailbreak|guardrail|red[\s-]?team|vulnerab|exploit|\bcve\b|sandbox escape|exfiltrat|data leak|malicious|supply chain|permission|privacy|compliance|eu ai act|\bnist\b|governance|\bsafety\b|alignment/i,
  },
  {
    track: "decide",
    pattern:
      /pricing|price|\bcost|cheaper|per (?:token|million)|deprecat|sunset|end[\s-]of[\s-]life|\broi\b|budget|vendor|licens|acquisition|funding|enterprise adoption|market share/i,
  },
  {
    track: "operate",
    pattern:
      /\beval|benchmark|observability|monitor|tracing|regression|latency|throughput|reliability|hallucinat|failure mode|context (?:window|rot|compression)|\bmemory\b|retrieval quality|\btest(?:ing)?\b/i,
  },
  {
    track: "build",
    pattern:
      /\bmcp\b|model context protocol|tool (?:use|call)|function calling|\bsdk\b|\bapi\b|framework|tutorial|how to|building|integrat|workflow|orchestrat|multi[\s-]?agent|\brag\b|fine[\s-]?tun|open[\s-]?source/i,
  },
];

const ACT_PATTERN =
  /deprecat|sunset|end[\s-]of[\s-]life|breaking change|price (?:cut|drop|increase|change)|shutting down|discontinu|retire|vulnerab|\bcve\b|exploit|prompt[\s-]?injection|security advisory|data leak|incident|outage/i;

const WATCH_PATTERN =
  /release|launch|announc|now available|introduc|\bga\b|beta|preview|new model|open[\s-]?sourc|version \d/i;

export function classifyTrack(text: string): RadarTrackId {
  for (const rule of TRACK_RULES) {
    if (rule.pattern.test(text)) return rule.track;
  }
  return "build";
}

export function classifySignal(text: string): RadarSignal {
  if (ACT_PATTERN.test(text)) return "act";
  if (WATCH_PATTERN.test(text)) return "watch";
  return "context";
}

/**
 * Source weights encode editorial trust, not volume: a primary release feed
 * outranks a comment-section headline even when the headline is louder. Keys
 * are the `source` strings the aggregator assigns; anything unlisted lands on
 * DEFAULT_SOURCE_WEIGHT rather than being dropped.
 */
const SOURCE_WEIGHT: Record<string, number> = {
  "Hugging Face Blog": 0.95,
  "Hugging Face": 0.85,
  "Simon Willison Weblog": 0.85,
  "Hacker News": 0.8,
  ArXiv: 0.7,
  "VentureBeat AI": 0.6,
  "Dev.to": 0.5,
};
const DEFAULT_SOURCE_WEIGHT = 0.6;

/** Popularity ceilings used to squash each source's native score into 0..1. */
const SCORE_CEILING: Record<string, number> = {
  "Hacker News": 400,
  "Dev.to": 150,
  "Hugging Face": 300,
};
const DEFAULT_SCORE_CEILING = 200;

const HALF_LIFE_DAYS = 7;

/**
 * Blended ordering score. Recency halves every week, and popularity can at most
 * double an item's weight — so a fresh release is never buried under an older
 * thread that happens to carry a big number.
 */
export function rankItem(input: {
  source: string;
  publishedAt: string;
  score?: number;
  now?: number;
}): number {
  const now = input.now ?? Date.now();
  const published = new Date(input.publishedAt).getTime();
  if (!Number.isFinite(published)) return 0;

  const ageDays = Math.max(0, (now - published) / 86_400_000);
  const recency = 2 ** (-ageDays / HALF_LIFE_DAYS);
  const ceiling = SCORE_CEILING[input.source] ?? DEFAULT_SCORE_CEILING;
  const popularity = input.score ? Math.min(1, input.score / ceiling) : 0;
  const weight = SOURCE_WEIGHT[input.source] ?? DEFAULT_SOURCE_WEIGHT;

  return weight * recency * (0.5 + 0.5 * popularity);
}

/** Strips protocol, `www.`, tracking params, and trailing slash for dedup. */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    for (const key of [...parsed.searchParams.keys()]) {
      if (/^(?:utm_|ref$|source$|fbclid$|gclid$)/i.test(key)) parsed.searchParams.delete(key);
    }
    const host = parsed.host.replace(/^www\./i, "");
    const path = parsed.pathname.replace(/\/+$/, "");
    return `${host}${path}${parsed.search}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Keeps the highest-ranked copy of each story. The same release routinely
 * surfaces on Hacker News, a vendor blog, and Dev.to within an hour; comparing
 * raw URL strings (different query params, trailing slashes) misses all of it.
 */
export function dedupeRanked<T extends { url: string; title: string; rank: number }>(
  items: T[],
): T[] {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const out: T[] = [];

  for (const item of [...items].sort((a, b) => b.rank - a.rank)) {
    const url = normalizeUrl(item.url);
    const title = normalizeTitle(item.title);
    if (seenUrls.has(url) || (title.length > 12 && seenTitles.has(title))) continue;
    seenUrls.add(url);
    seenTitles.add(title);
    out.push(item);
  }

  return out;
}

/**
 * Stable id for feed entries whose source gives us nothing durable. A hash of
 * the URL keeps React keys and cross-refresh dedup stable; the previous
 * `Date.now()`-based ids changed on every fetch.
 */
export function stableId(prefix: string, seed: string): string {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `${prefix}-${(hash >>> 0).toString(36)}`;
}
