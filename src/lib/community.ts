/** Shared constants for the social feed — kept in sync with the DB schema in
 *  supabase/migrations/20260625010000_social_feed.sql. */

export const COMMUNITY_CATEGORIES = [
  "general",
  "questions",
  "show-and-tell",
  "resources",
  "hiring",
  "feedback",
] as const;

export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number];

export const COMMUNITY_CATEGORY_LABELS: Record<CommunityCategory, string> = {
  general: "General",
  questions: "Questions",
  "show-and-tell": "Show & tell",
  resources: "Resources",
  hiring: "Hiring",
  feedback: "Feedback",
};

/** Reaction kinds for posts + replies. Mirrors the CHECK constraint. */
export const REACTION_KINDS = ["like", "love", "celebrate", "insight", "funny"] as const;
export type ReactionKind = (typeof REACTION_KINDS)[number];

export const REACTION_META: Record<ReactionKind, { label: string; emoji: string }> = {
  like: { label: "Like", emoji: "👍" },
  love: { label: "Love", emoji: "❤️" },
  celebrate: { label: "Celebrate", emoji: "🎉" },
  insight: { label: "Insight", emoji: "💡" },
  funny: { label: "Funny", emoji: "😄" },
};

/** Feed tabs available on /community. */
export const FEED_TABS = ["for-you", "following"] as const;
export type FeedTab = (typeof FEED_TABS)[number];

export const FEED_TAB_LABELS: Record<FeedTab, string> = {
  "for-you": "For you",
  following: "Following",
};

/** Max lengths — must match the DB CHECK constraints. */
export const POST_BODY_MAX = 1000;
export const POST_TITLE_MAX = 140;
export const REPLY_BODY_MAX = 2000;
export const POST_MEDIA_MAX = 4;
export const POST_MEDIA_MAX_BYTES = 4 * 1024 * 1024; // 4 MB per image

/** Public author info resolved server-side via the service-role client. */
export type Author = {
  display_name: string | null;
  avatar_url: string | null;
};

export type FeedPost = {
  id: string;
  user_id: string;
  title: string | null;
  body: string;
  category: string;
  media_urls: string[];
  reply_count: number;
  reaction_count: Record<string, number>;
  reactions_by_me: string[];
  locked: boolean;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  author: Author | null;
};

export type FeedReply = {
  id: string;
  post_id: string;
  user_id: string;
  parent_reply_id: string | null;
  body: string;
  path: string;
  depth: number;
  reaction_count: Record<string, number>;
  reactions_by_me: string[];
  created_at: string;
  updated_at: string;
  author: Author | null;
};

export type FeedThread = {
  post: FeedPost;
  replies: FeedReply[];
};

export type FeedPage = {
  posts: FeedPost[];
  next_cursor: string | null;
};

export type TrendingTag = {
  tag: string;
  usage_count: number;
};

export type PublicProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  followers_count: number;
  following_count: number;
  post_count: number;
  is_following: boolean;
};
