import manifest from "@/lib/og-manifest.json";

type OgSection = keyof typeof manifest;

/**
 * Path to the pre-generated per-page OG image (from `npm run generate:og`),
 * or undefined when none exists so buildSeoMeta falls back to /og-default.png.
 */
export function ogImage(section: OgSection, slug: string): string | undefined {
  return (manifest[section] as string[]).includes(slug) ? `/og/${section}/${slug}.png` : undefined;
}
