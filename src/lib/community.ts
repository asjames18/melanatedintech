/** Fixed set of discussion categories — shared by the new-thread form (the
 *  dropdown) and the server-side validation, so a post can't land in a
 *  free-text bucket. */
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
