import { SITE_URL } from "@/lib/site";

type MetaTag = Record<string, string>;
type LinkTag = { rel: string; href: string; sizes?: string; type?: string };

export type SeoInput = {
  title: string;
  description?: string;
  url?: string;
  type?: "website" | "article" | "product" | "profile";
  image?: string | null;
  siteName?: string;
  /** When true (default), emit a canonical <link> from `url`. */
  canonical?: boolean;
};

const DEFAULT_SITE = "Melanated In Tech";

function absoluteUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Build a consistent meta[] array for TanStack Start `head()`, and a canonical
 * <link> when `url` is provided. URLs are made absolute against SITE_URL so
 * og:url and canonical are Google-friendly. Includes Open Graph + Twitter Card.
 */
export function buildSeoMeta(input: SeoInput): { meta: MetaTag[]; links: LinkTag[] } {
  const {
    title,
    description,
    url,
    type = "website",
    image,
    siteName = DEFAULT_SITE,
    canonical = true,
  } = input;
  const absUrl = absoluteUrl(url);
  const img = absoluteUrl(image ?? "/og-default.png")!;
  const isDefaultImage = !image;
  const meta: MetaTag[] = [
    { title },
    { property: "og:title", content: title },
    { property: "og:type", content: type },
    { property: "og:site_name", content: siteName },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
  ];
  if (description) {
    meta.push({ name: "description", content: description });
    meta.push({ property: "og:description", content: description });
    meta.push({ name: "twitter:description", content: description });
  }
  if (absUrl) meta.push({ property: "og:url", content: absUrl });
  meta.push({ property: "og:image", content: img });
  if (isDefaultImage) {
    meta.push({ property: "og:image:width", content: "1200" });
    meta.push({ property: "og:image:height", content: "630" });
  }
  meta.push({ name: "twitter:image", content: img });
  const links: LinkTag[] = [];
  if (canonical && absUrl) links.push({ rel: "canonical", href: absUrl });
  return { meta, links };
}

/**
 * Convenience for routes that previously spread `buildSeoMeta(...)` into a
 * flat meta array. Returns just the meta[] so existing call sites keep working
 * during migration. Prefer the object form for new routes so you also get links.
 */
export function buildSeoMetaLegacy(input: SeoInput): MetaTag[] {
  return buildSeoMeta(input).meta;
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
    url: SITE_URL,
    logo: `${SITE_URL}/favicon-32.png`,
    sameAs: [
      "https://twitter.com/melanatedintech",
      "https://github.com/melanatedintech",
      "https://www.linkedin.com/company/melanatedintech",
    ],
    description:
      "Marketplace, knowledge hub, products, and services for the people building, deploying, and benefiting from AI agents.",
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: DEFAULT_SITE,
    url: SITE_URL,
    description:
      "AI agent knowledge, marketplace, tools, products, and services for builders, operators, and teams putting agents to work.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
export function articleLd(a: {
  title: string;
  excerpt?: string | null;
  category?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  url?: string | null;
  image?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt ?? undefined,
    articleSection: a.category ?? undefined,
    datePublished: a.published_at ?? undefined,
    dateModified: a.updated_at ?? undefined,
    image: absoluteUrl(a.image ?? "/og-default.png"),
    mainEntityOfPage: a.url ? { "@type": "WebPage", "@id": absoluteUrl(a.url) } : undefined,
    author: { "@type": "Organization", name: DEFAULT_SITE },
    publisher: {
      "@type": "Organization",
      name: DEFAULT_SITE,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon-32.png` },
    },
  };
}

export function productLd(p: {
  name: string;
  tagline?: string | null;
  category?: string | null;
  image?: string | null;
  price_cents?: number | null;
  url?: string | null;
}) {
  const offers =
    p.price_cents != null
      ? {
          "@type": "Offer",
          price: (p.price_cents / 100).toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: p.url ? absoluteUrl(p.url) : undefined,
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

/** BreadcrumbList JSON-LD. Pass an array of { name, path } crumbs. */
export function breadcrumbLd(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/** ProfilePage + Person JSON-LD for /u/$userId author/user profile pages. */
export function profileLd(p: {
  name: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  url: string;
  followersCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: p.name ?? undefined,
      description: p.bio ?? undefined,
      image: p.avatarUrl ?? undefined,
      url: absoluteUrl(p.url),
    },
  };
}

/** DiscussionForumPosting JSON-LD for community threads. */
export function discussionLd(d: {
  title: string | null;
  body: string;
  url: string;
  authorName: string | null;
  createdAt: string;
  replyCount: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: d.title ?? d.body.slice(0, 100),
    text: d.body.slice(0, 500),
    url: absoluteUrl(d.url),
    datePublished: d.createdAt,
    author: { "@type": "Person", name: d.authorName ?? "Community member" },
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/CommentAction",
      userInteractionCount: d.replyCount,
    },
  };
}

/** CollectionPage JSON-LD for tag/topic listing pages. */
export function collectionLd(c: { name: string; url: string; description?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: c.name,
    url: absoluteUrl(c.url),
    description: c.description ?? undefined,
  };
}
