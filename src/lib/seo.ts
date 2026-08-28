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
      "Revenue recovery systems for local service businesses, plus a practical AI marketplace, knowledge hub, products, and tools.",
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: DEFAULT_SITE,
    url: SITE_URL,
    description:
      "Lead, estimate, route, and client recovery systems for service businesses, plus practical AI tools and knowledge.",
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

export function serviceLd(service: {
  name: string;
  description: string;
  url: string;
  areaServed?: string[];
  priceFrom?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: absoluteUrl(service.url),
    provider: { "@type": "Organization", name: DEFAULT_SITE, url: SITE_URL },
    areaServed: (service.areaServed ?? ["Florida", "United States"]).map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    offers: service.priceFrom
      ? {
          "@type": "Offer",
          priceCurrency: "USD",
          price: service.priceFrom.toFixed(2),
          description: "Starting price for a fixed-scope 30-day Recovery Pilot",
        }
      : undefined,
  };
}

/** PodcastSeries JSON-LD with a PodcastEpisode for each released episode. */
export function podcastSeriesLd(p: {
  name: string;
  description: string;
  url: string;
  feedUrl: string;
  image?: string | null;
  episodes: {
    name: string;
    description: string;
    episodeNumber: number;
    datePublished: string;
    duration?: string;
    audioUrl?: string | null;
  }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: p.name,
    description: p.description,
    url: absoluteUrl(p.url),
    webFeed: absoluteUrl(p.feedUrl),
    image: absoluteUrl(p.image ?? "/og-default.png"),
    author: { "@type": "Organization", name: DEFAULT_SITE },
    publisher: { "@type": "Organization", name: DEFAULT_SITE },
    hasPart: p.episodes.map((e) => ({
      "@type": "PodcastEpisode",
      name: e.name,
      description: e.description,
      episodeNumber: e.episodeNumber,
      datePublished: e.datePublished,
      duration: e.duration,
      url: absoluteUrl(p.url),
      associatedMedia: e.audioUrl
        ? { "@type": "MediaObject", contentUrl: absoluteUrl(e.audioUrl) }
        : undefined,
    })),
  };
}

/**
 * FAQPage JSON-LD. Only emit this when the same questions and answers are
 * visible on the page — Google treats schema-only FAQ content as a violation
 * and it is the fastest way to lose the rich result entirely.
 */
export function faqLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
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

/** SoftwareApplication JSON-LD for interactive tools. */
export function softwareAppLd(s: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: s.name,
    description: s.description,
    url: absoluteUrl(s.url),
    applicationCategory: s.applicationCategory ?? "DeveloperApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0.00",
      priceCurrency: "USD",
    },
    author: { "@type": "Organization", name: DEFAULT_SITE },
  };
}
