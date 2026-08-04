// Shared helpers for the hand-built XML feeds (/podcast/feed.xml,
// /knowledge/feed.xml, /sitemap.xml). Kept dependency-free so the route
// handlers stay cheap to run on the edge.
import { SITE_URL } from "@/lib/site";

/** Makes a site-relative path absolute; passes through full URLs untouched. */
export function absoluteUrl(path: string): string {
  return /^https?:\/\//i.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Escapes the five XML predefined entities for use in text nodes and attributes. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Wraps a value in CDATA, splitting any literal `]]>` so it cannot break out. */
export function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

/**
 * RFC-822 date for RSS <pubDate>. Accepts a full timestamp or a bare
 * YYYY-MM-DD, which is anchored at noon UTC so the date does not slip
 * backwards a day for readers in negative-offset timezones.
 */
export function rfc822(date: string): string {
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T12:00:00Z` : date;
  return new Date(iso).toUTCString();
}

/** Joins XML lines, dropping any that are null/false so branches read cleanly. */
export function xmlLines(lines: (string | null | false | undefined)[]): string {
  return lines.filter(Boolean).join("\n");
}
