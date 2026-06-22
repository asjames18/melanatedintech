import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Resolve a signed URL for a path stored in the private `avatars` bucket.
 * Pass `null` / `undefined` to skip. Refreshes every ~45 minutes.
 */
export function useAvatarUrl(path: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!path) {
      setUrl(null);
      return;
    }
    async function load() {
      const { data, error } = await supabase.storage.from("avatars").createSignedUrl(path!, 60 * 60);
      if (!cancelled) setUrl(error ? null : data?.signedUrl ?? null);
    }
    load();
    const t = setInterval(load, 1000 * 60 * 45);
    return () => { cancelled = true; clearInterval(t); };
  }, [path]);

  return url;
}
