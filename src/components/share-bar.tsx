import { useState } from "react";
import { Check, Link as LinkIcon, Share2 } from "lucide-react";
import { toast } from "sonner";

type Props = { title: string; text?: string; className?: string };

export function ShareBar({ title, text, className }: Props) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy link");
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // user dismissed or unsupported — fall through to copy
      }
    }
    copy();
  }

  const enc = encodeURIComponent;
  const xUrl = `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`;
  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
  const mailUrl = `mailto:?subject=${enc(title)}&body=${enc((text ? text + "\n\n" : "") + url)}`;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      <button
        onClick={nativeShare}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        aria-label="Share"
      >
        <Share2 className="h-3.5 w-3.5" /> Share
      </button>
      <button
        onClick={copy}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        aria-label="Copy link"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-accent2" /> : <LinkIcon className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <span className="mx-1 hidden h-5 w-px bg-border sm:inline-block" />
      <ShareLink href={xUrl} label="Share on X">𝕏</ShareLink>
      <ShareLink href={liUrl} label="Share on LinkedIn">in</ShareLink>
      <ShareLink href={fbUrl} label="Share on Facebook">f</ShareLink>
      <ShareLink href={mailUrl} label="Email this">@</ShareLink>
    </div>
  );
}

function ShareLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="inline-grid h-9 w-9 place-items-center rounded-lg border border-border bg-background text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </a>
  );
}
