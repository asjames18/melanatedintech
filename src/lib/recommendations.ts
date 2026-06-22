import { interestScore } from "@/hooks/use-interests";

export { interestScore, topCategories } from "@/hooks/use-interests";

/**
 * Build a "Because you're …" reason string for a recommended item.
 * - If the recommended item shares the source category, return the active phrase.
 * - Else if the user has any history in the recommended item's category, use that.
 * - Else fall back to the caller-provided default.
 */
export function reasonFor({
  categories,
  sourceCategory,
  itemCategory,
  activeVerb = "reading",
  fallback,
}: {
  categories: Record<string, number>;
  sourceCategory: string | null | undefined;
  itemCategory: string | null | undefined;
  activeVerb?: string;
  fallback: string;
}) {
  if (itemCategory && sourceCategory && itemCategory === sourceCategory) {
    return `Because you're ${activeVerb} ${sourceCategory}`;
  }
  if (itemCategory && interestScore(categories, itemCategory) > 0) {
    return `Because you've been exploring ${itemCategory}`;
  }
  return fallback;
}
