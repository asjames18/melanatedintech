type MetaTag = Record<string, string>;

export type SeoInput = {
  title: string;
  description?: string;
  url?: string;
  type?: "website" | "article" | "product";
  image?: string | null;
  siteName?: string;
};

const DEFAULT_SITE = "Melanated In Tech";

/**
 * Build a consistent meta[] array for TanStack Start `head()`.
 * Includes Open Graph + Twitter Card + canonical-friendly defaults.
 */
export function buildSeoMeta(input: SeoInput): MetaTag[] {
  const { title, description, url, type = "website", image, siteName = DEFAULT_SITE } = input;
  const meta: MetaTag[] = [
    { title },
    { property: "og:title", content: title },
    { property: "og:type", content: type },
    { property: "og:site_name", content: siteName },
    { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: title },
  ];
  if (description) {
    meta.push({ name: "description", content: description });
    meta.push({ property: "og:description", content: description });
    meta.push({ name: "twitter:description", content: description });
  }
  if (url) meta.push({ property: "og:url", content: url });
  if (image) {
    meta.push({ property: "og:image", content: image });
    meta.push({ name: "twitter:image", content: image });
  }
  return meta;
}
