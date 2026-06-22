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

// ---------- JSON-LD helpers ----------

type JsonLd = Record<string, unknown>;

export function ldScript(data: JsonLd) {
  return { type: "application/ld+json", children: JSON.stringify(data) };
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: DEFAULT_SITE,
    description:
      "Marketplace, knowledge hub, products, and services for the people building, deploying, and benefiting from AI agents.",
  };
}

export function articleLd(a: {
  title: string;
  excerpt?: string | null;
  category?: string | null;
  published_at?: string | null;
  url?: string;
  image?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt ?? undefined,
    articleSection: a.category ?? undefined,
    datePublished: a.published_at ?? undefined,
    image: a.image ?? undefined,
    mainEntityOfPage: a.url ?? undefined,
    author: { "@type": "Organization", name: DEFAULT_SITE },
    publisher: { "@type": "Organization", name: DEFAULT_SITE },
  };
}

export function productLd(p: {
  name: string;
  tagline?: string | null;
  category?: string | null;
  image?: string | null;
  price_cents?: number | null;
  url?: string;
}) {
  const offers =
    p.price_cents != null
      ? {
          "@type": "Offer",
          price: (p.price_cents / 100).toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: p.url ?? undefined,
        }
      : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.tagline ?? undefined,
    category: p.category ?? undefined,
    image: p.image ?? undefined,
    brand: { "@type": "Organization", name: DEFAULT_SITE },
    offers,
  };
}
