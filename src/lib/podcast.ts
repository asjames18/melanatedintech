// Episode reference notes are imported from the actual NotebookLM source packs
// in src/content/podcast-sources/ rather than retyped here. Those documents are
// what the audio was generated from, so importing them keeps the on-page notes
// from drifting away from what the episode actually says.
import introSource from "@/content/podcast-sources/00-podcast-intro.md?raw";
import homepageSource from "@/content/podcast-sources/01-homepage-and-mission.md?raw";
import toolsMcpSource from "@/content/podcast-sources/02-ai-tools-and-mcp-architecture.md?raw";
import ministrySource from "@/content/podcast-sources/03-ministry-and-nonprofit-ai.md?raw";

export interface PodcastEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  subtitle: string;
  /** ISO date (YYYY-MM-DD). Formatted for display with formatEpisodeDate. */
  publishedAt: string;
  /** Runtime in seconds. Only known once the episode is recorded. */
  durationSeconds?: number;
  /** Site-absolute path to the audio file. Omitted until the episode is recorded. */
  audioUrl?: string;
  /** Byte size of audioUrl. Required by the RSS <enclosure length> attribute. */
  audioBytes?: number;
  /** MIME type of audioUrl. Defaults to audio/mp4 (.m4a). */
  audioType?: string;
  summary: string;
  topics: string[];
  /** Filename in src/content/podcast-sources/ that this episode is built from. */
  sourcePackTitle: string;
  sourcePackText: string;
}

/**
 * Show-level metadata for the /podcast page and the RSS feed at
 * /podcast/feed.xml. `image` is the 1400x1400 square cover required by Apple
 * Podcasts and Spotify; regenerate it with `npm run generate:podcast-art`.
 * `ogImage` is the 1200x630 social card for the page itself.
 */
export const PODCAST = {
  title: "Melanated in Tech Podcast",
  subtitle: "Practical AI Agents in Plain English",
  description:
    "Weekly audio deep dives into building, deploying, and benefiting from AI agents in plain English. Built for beginners, small business owners, ministries and nonprofits, and developers who want working agents instead of AI hype.",
  author: "Melanated in Tech",
  ownerEmail: "hello@melanatedintech.com",
  language: "en-us",
  /** Apple Podcasts top-level category. */
  category: "Technology",
  explicit: false,
  image: "/podcast/artwork-1400.png",
  ogImage: "/og/podcast.png",
  copyright: `© ${new Date().getFullYear()} Melanated in Tech`,
} as const;

export const PODCAST_EPISODES: PodcastEpisode[] = [
  {
    id: "ep-00-podcast-intro",
    episodeNumber: 0,
    title: "Welcome to the Melanated in Tech Podcast",
    subtitle: "Weekly AI Agent Audio Breakdown — Official Podcast Overview",
    publishedAt: "2026-07-21",
    durationSeconds: 1460,
    audioUrl: "/podcast/Practical_AI_Agents_for_Real_Operators.m4a",
    audioBytes: 47014018,
    audioType: "audio/mp4",
    summary:
      "The opening episode: why Melanated in Tech exists, who it is built for, and how to use it. Our two hosts open with the everyday feeling of AI overwhelm, introduce the platform as a practical home for building agents that hold up past Day 2, tour the five ecosystem hubs, and close with three production agents solving real problems.",
    topics: ["AI Overwhelm", "Who We Serve", "5 Ecosystem Hubs", "Production Agents"],
    sourcePackTitle: "00-podcast-intro.md",
    sourcePackText: introSource,
  },
  {
    id: "ep-01-escaping-ai-hype",
    episodeNumber: 1,
    title: "Escaping AI Hype: How to Build Agents That Actually Work",
    subtitle: "Weekly AI Agent Deep Dive — Episode 01",
    publishedAt: "2026-08-04",
    summary:
      "A walk through the Melanated in Tech mission and platform: what the four knowledge tracks cover, how the five hubs fit together, and how anyone — from a church leader to a solo developer — can start small instead of chasing every headline.",
    topics: [
      "AI Hype vs. Reality",
      "Mission & Philosophy",
      "5 Ecosystem Hubs",
      "Build · Operate · Secure · Decide",
    ],
    sourcePackTitle: "01-homepage-and-mission.md",
    sourcePackText: homepageSource,
  },
  {
    id: "ep-02-tools-mcp-architecture",
    episodeNumber: 2,
    title: "AI Tools, MCP & Agent Architecture",
    subtitle: "Weekly AI Agent Deep Dive — Episode 02",
    publishedAt: "2026-08-11",
    summary:
      "The technical foundation underneath the platform: what Model Context Protocol actually is, why deterministic software testing fails on non-deterministic agents, how golden-set evaluation fixes that, and where token costs quietly balloon.",
    topics: [
      "Model Context Protocol",
      "12 Interactive Tools",
      "Golden-Set Evals",
      "Token Cost & ROI",
    ],
    sourcePackTitle: "02-ai-tools-and-mcp-architecture.md",
    sourcePackText: toolsMcpSource,
  },
  {
    id: "ep-03-ministry-ai-stewardship",
    episodeNumber: 3,
    title: "AI Stewardship for Nonprofits, Ministries & Community Organizations",
    subtitle: "Weekly AI Agent Deep Dive — Episode 03",
    publishedAt: "2026-08-18",
    summary:
      "How mission-driven teams running on limited staff and tight budgets can hand routine administration to AI agents — sermon adaptation, volunteer onboarding, visitor follow-up, and grant writing — with human review and data privacy built in from Day 1.",
    topics: [
      "Ministry & Nonprofit AI",
      "Sermon Adaptation",
      "Volunteer SOPs",
      "Stewardship Guardrails",
    ],
    sourcePackTitle: "03-ministry-and-nonprofit-ai.md",
    sourcePackText: ministrySource,
  },
];

/** An episode is live once its audio file exists. Everything else is upcoming. */
export function isReleased(ep: PodcastEpisode): ep is PodcastEpisode & { audioUrl: string } {
  return Boolean(ep.audioUrl);
}

/** Only released episodes belong in the RSS feed and structured data. */
export const RELEASED_EPISODES = PODCAST_EPISODES.filter(isReleased);

/** Zero-padded episode label that keeps working past episode 9. */
export function episodeCode(episodeNumber: number): string {
  return String(episodeNumber).padStart(2, "0");
}

/** "24 min" / "1 hr 5 min" for on-page display. */
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours} hr ${minutes} min` : `${hours} hr`;
}

/** HH:MM:SS (or M:SS) for itunes:duration. */
export function itunesDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`;
}

/** ISO 8601 duration (PT24M) for schema.org. */
export function isoDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs ? `PT${minutes}M${secs}S` : `PT${minutes}M`;
}

/** Renders the ISO publish date in UTC so it never shifts a day by timezone. */
export function formatEpisodeDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
