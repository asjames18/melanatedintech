import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Resolve signed URLs for one or more paths stored in the private `post-media`
 * bucket. Pass an array of storage paths; returns a parallel array of URLs (or
 * null where resolution failed). Refreshes hourly.
 */
export function usePostMediaUrls(paths: string[] | null | undefined): (string | null)[] {
  const [urls, setUrls] = useState<(string | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    const list = (paths ?? []).filter(Boolean);
    if (list.length === 0) {
      setUrls([]);
      return;
    }
    async function load() {
      const results = await Promise.all(
        list.map(async (p) => {
          const { data, error } = await supabase.storage
            .from("post-media")
            .createSignedUrl(p, 60 * 60);
          return error ? null : (data?.signedUrl ?? null);
        }),
      );
      if (!cancelled) setUrls(results);
    }
    load();
    const t = setInterval(load, 1000 * 60 * 60);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [JSON.stringify(paths)]);

  return urls;
}
