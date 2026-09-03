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
      /\bmcp\b|model context protocol|tool (?:use|call)|function calling|\bsdk\b|tutorial|how to build|getting started|quickstart|workflow|orchestrat|multi[\s-]?agent|\brag\b|retrieval[\s-]augmented|fine[\s-]?tun|prompt engineering/i,
  },
];

/**
 * Where an item lands when no keyword rule matches. Most headlines match
 * nothing — "Introducing WeatherNext 3" contains no track vocabulary at all —
 * so the fallback decides the majority of the page. Keying it to the category
 * the aggregator already assigned beats sending everything to one track:
 * research is something you evaluate, a model or an industry story is something
 * you decide about, and tooling is something you build with.
 */
const CATEGORY_FALLBACK_TRACK: Record<string, RadarTrackId> = {
  research: "operate",
  models: "decide",
  industry: "decide",
  agents: "build",
  developer: "build",
};

const ACT_PATTERN =
  /deprecat|sunset|end[\s-]of[\s-]life|breaking change|price (?:cut|drop|increase|change)|shutting down|discontinu|retire|vulnerab|\bcve\b|exploit|prompt[\s-]?injection|security advisory|data leak|incident|outage/i;

const WATCH_PATTERN =
  /release|launch|announc|now available|introduc|\bga\b|beta|preview|new model|open[\s-]?sourc|version \d/i;

export function classifyTrack(text: string, category?: string): RadarTrackId {
  for (const rule of TRACK_RULES) {
    if (rule.pattern.test(text)) return rule.track;
  }
  return (category && CATEGORY_FALLBACK_TRACK[category]) || "build";
}

export function classifySignal(text: string): RadarSignal {
  if (ACT_PATTERN.test(text)) return "act";
  if (WATCH_PATTERN.test(text)) return "watch";
  return "context";
}

/**
 * Source weights encode editorial trust, not volume: a vendor's own release
 * note outranks a comment-section headline about it, and a status-page
 * incident outranks both. Keys are the `source` strings the aggregator
 * assigns; anything unlisted lands on DEFAULT_SOURCE_WEIGHT rather than being
 * dropped, so adding a feed never silently buries it.
 */
const SOURCE_WEIGHT: Record<string, number> = {
  // Service incidents and catalog changes: the things that break or re-price a
  // running agent today.
  "OpenAI Status": 1,
  "Anthropic Status": 1,
  OpenRouter: 1,
  "Hugging Face Models": 0.9,

  // First-party vendor announcements.
  "OpenAI News": 0.95,
  "Google DeepMind": 0.95,
  "Mistral AI": 0.92,
  Qwen: 0.92,
  "Google AI": 0.9,
  Ollama: 0.9,
  "Together AI": 0.88,
  Replicate: 0.85,
  "Hugging Face Blog": 0.9,
  "Google Research": 0.8,

  // SDK and runtime release notes.
  "anthropic-sdk-python": 0.9,
  "openai-python": 0.88,
  "typescript-sdk": 0.85,
  "python-sdk": 0.85,
  servers: 0.85,
  transformers: 0.82,
  vllm: 0.82,
  ollama: 0.82,
  "llama.cpp": 0.8,

  // Analysis and community.
  "Simon Willison Weblog": 0.85,
  "Hugging Face Papers": 0.75,
  "Hacker News": 0.8,
  "Latent Space": 0.72,
  "Import AI": 0.7,
  "Ahead of AI": 0.7,
  ArXiv: 0.7,

  // Press: useful context, rarely something to act on this week.
  "MIT Technology Review": 0.62,
  "Ars Technica AI": 0.6,
  "TechCrunch AI": 0.58,
  "The Verge AI": 0.58,
  "VentureBeat AI": 0.55,
  "AWS Machine Learning": 0.6,
  "NVIDIA Blog": 0.55,

  "Dev.to": 0.5,
};
const DEFAULT_SOURCE_WEIGHT = 0.6;

/** Popularity ceilings used to squash each source's native score into 0..1. */
const SCORE_CEILING: Record<string, number> = {
  "Hacker News": 400,
  "Dev.to": 150,
  "Hugging Face Papers": 300,
  "Hugging Face Models": 2000,
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

/**
 * Categories docs/daily-content-agent-spec.md marks as mandatory human review.
 * An item whose text touches one of these is held for an admin rather than
 * published straight to the page — not because the source is suspect, but
 * because these are the subjects where amplifying a bad headline costs the most.
 *
 * Returns the reason to store on the row, or null to publish.
 */
const HOLD_RULES: Array<{ reason: string; pattern: RegExp }> = [
  {
    reason: "legal or regulatory claim",
    pattern:
      /\blawsuit|\bsued?\b|court|settlement|subpoena|regulat|legislat|\bban(?:ned|ning)?\b|copyright|liabilit|antitrust|\bfined?\b/i,
  },
  {
    reason: "health or medical claim",
    pattern: /\bmedical|\bhealth(?:care)?\b|diagnos|patient|clinical|\bfda\b|therap|mental health/i,
  },
  {
    reason: "political or election content",
    pattern:
      /\belection|\bvoting\b|\bvoter|campaign trail|congress|senate|parliament|president(?:ial)?\b|political part/i,
  },
  {
    reason: "hiring or workforce claim",
    pattern: /\blayoff|\bfir(?:ed|ing)\b|\bhiring\b|job cuts|workforce reduction|replace(?:s|d)? workers/i,
  },
  {
    reason: "financial advice or market claim",
    pattern: /\bstock\b|\bshares\b|\bipo\b|valuation|market cap|invest(?:or|ment)s?\b|\bearnings\b/i,
  },
  {
    reason: "ministry or faith content",
    pattern: /\bchurch\b|\bministry\b|\bfaith\b|congregation|\bpastor|religio/i,
  },
];

export function holdReasonFor(text: string): string | null {
  for (const rule of HOLD_RULES) {
    if (rule.pattern.test(text)) return rule.reason;
  }
  return null;
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
 * Words that carry no identity in a headline. Dropped before fingerprinting so
 * "OpenAI Launches GPT-6" and "OpenAI launches the GPT-6 model" collapse.
 */
const TITLE_STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from", "has",
  "have", "how", "in", "is", "it", "its", "of", "on", "or", "that", "the",
  "their", "this", "to", "was", "were", "what", "when", "which", "who", "why",
  "will", "with", "you", "your", "new", "now", "says", "said", "can", "could",
  "just", "more", "most", "than", "then", "into", "over", "after", "about",
]);

/** Significant lowercase tokens of a headline, deduplicated. */
export function titleTokens(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((word) => word.length > 2 && !TITLE_STOPWORDS.has(word)),
  );
}

/**
 * Order-insensitive fingerprint of a headline, stored on the row so a later
 * ingest can check for the same story without re-reading every title. Catches
 * rearranged or repunctuated restatements; titleSimilarity catches the rest.
 */
export function titleFingerprint(title: string): string {
  const tokens = [...titleTokens(title)].sort();
  return stableId("t", tokens.length ? tokens.join(" ") : normalizeTitle(title));
}

/** Jaccard overlap of two headlines' significant tokens, 0..1. */
export function titleSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return shared / (a.size + b.size - shared);
}

/**
 * Above this, two headlines are treated as the same story. Tuned for the real
 * failure mode with this many feeds: one model launch covered by TechCrunch,
 * The Verge, Ars and SiliconANGLE inside an hour, each with its own wording for
 * what a reader would call a single item.
 */
export const TITLE_DUPLICATE_THRESHOLD = 0.6;

/** True when `title` restates a story already represented in `seen`. */
export function isNearDuplicateTitle(
  title: string,
  seen: Iterable<Set<string>>,
  threshold = TITLE_DUPLICATE_THRESHOLD,
): boolean {
  const tokens = titleTokens(title);
  // Very short headlines are too thin to compare safely; the exact fingerprint
  // still covers them.
  if (tokens.size < 4) return false;
  for (const other of seen) {
    if (titleSimilarity(tokens, other) >= threshold) return true;
  }
  return false;
}

/**
 * Keeps the highest-ranked copy of each story.
 *
 * Three passes, cheapest first: exact URL, exact token fingerprint, then
 * Jaccard overlap against the headlines already kept. With eighty-odd feeds the
 * same launch arrives from a vendor blog, four outlets and Hacker News inside
 * an hour, and comparing raw URL strings catches almost none of it.
 */
export function dedupeRanked<T extends { url: string; title: string; rank: number }>(
  items: T[],
): T[] {
  const seenUrls = new Set<string>();
  const seenFingerprints = new Set<string>();
  const seenTokens: Set<string>[] = [];
  const out: T[] = [];

  for (const item of [...items].sort((a, b) => b.rank - a.rank)) {
    const url = normalizeUrl(item.url);
    if (seenUrls.has(url)) continue;

    const fingerprint = titleFingerprint(item.title);
    if (seenFingerprints.has(fingerprint)) continue;

    if (isNearDuplicateTitle(item.title, seenTokens)) continue;

    seenUrls.add(url);
    seenFingerprints.add(fingerprint);
    seenTokens.push(titleTokens(item.title));
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
