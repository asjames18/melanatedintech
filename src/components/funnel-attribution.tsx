import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

const STORAGE_KEY = "mit:funnel-attribution:v1";

function socialSource() {
  const params = new URLSearchParams(window.location.search);
  const tagged = `${params.get("utm_source") ?? ""} ${params.get("ref") ?? ""}`.toLowerCase();
  const haystack = `${tagged} ${document.referrer.toLowerCase()}`;
  if (haystack.includes("linkedin")) return "linkedin";
  if (haystack.includes("twitter") || haystack.includes("x.com")) return "x";
  return "direct_or_other";
}

export function FunnelAttribution() {
  useEffect(() => {
    const source = socialSource();
    const campaign = new URLSearchParams(window.location.search).get("utm_campaign") ?? undefined;
    const record = { source, campaign, landingPath: window.location.pathname };

    try {
      if (!window.sessionStorage.getItem(STORAGE_KEY)) {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record));
        trackEvent("funnel_landing_viewed", record);
      }
    } catch {
      trackEvent("funnel_landing_viewed", record);
    }
  }, []);

  return null;
}

export function funnelAttribution() {
  if (typeof window === "undefined") return { source: "server" };
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw
      ? (JSON.parse(raw) as { source?: string; campaign?: string })
      : { source: "direct_or_other" };
  } catch {
    return { source: "direct_or_other" };
  }
}
