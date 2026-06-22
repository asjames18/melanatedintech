// Backward-compatible wrapper around the generic useInterests hook.
import { useInterests } from "./use-interests";

export { interestScore, topCategories } from "./use-interests";
export type { Interests } from "./use-interests";

export function useReadingInterests() {
  return useInterests("article");
}
