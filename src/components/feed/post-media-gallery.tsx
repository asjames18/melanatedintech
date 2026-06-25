import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Renders up to 4 post images in a responsive grid. `urls` is a parallel array
 *  of resolved signed URLs (or null while loading). */
export function PostMediaGallery({ urls }: { urls: (string | null)[] }) {
  const count = urls.filter(Boolean).length;
  if (count === 0) return null;

  const grid =
    count === 1
      ? "grid-cols-1"
      : count === 2
        ? "grid-cols-2"
        : count === 3
          ? "grid-cols-2"
          : "grid-cols-2";

  return (
    <div className={cn("grid gap-1 overflow-hidden rounded-xl", grid)}>
      {urls.map((u, i) => (
        <MediaCell key={i} url={u} index={i} count={count} />
      ))}
    </div>
  );
}

function MediaCell({ url, index, count }: { url: string | null; index: number; count: number }) {
  const [loaded, setLoaded] = useState(false);
  if (!url) return null;
  // Make the 3rd image span both rows when there are exactly 3 images (Twitter-ish).
  const span = count === 3 && index === 0 ? "row-span-2" : "";
  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden bg-muted",
        span,
        count === 1 && "aspect-video",
      )}
    >
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
      <img
        src={url}
        alt=""
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
