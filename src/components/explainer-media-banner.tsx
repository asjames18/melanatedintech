import { useState } from "react";
import { Download, Video, Mic, Sparkles, FileText, Check } from "lucide-react";

interface ExplainerMediaBannerProps {
  title: string;
  subtitle?: string;
  videoUrl?: string;
  audioUrl?: string;
  sourcePackUrl?: string;
  sourcePackText?: string;
  posterUrl?: string;
}

export function ExplainerMediaBanner({
  title,
  subtitle = "Interactive Audio & Video Explainer — Melanated in Tech",
  videoUrl,
  audioUrl,
  sourcePackUrl,
  sourcePackText,
  posterUrl,
}: ExplainerMediaBannerProps) {
  const [activeTab, setActiveTab] = useState<"video" | "audio" | "source">(
    videoUrl ? "video" : audioUrl ? "audio" : "source",
  );
  const [copied, setCopied] = useState(false);

  const handleCopySource = () => {
    if (sourcePackText) {
      navigator.clipboard.writeText(sourcePackText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 border-b border-border bg-muted/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 rounded-xl bg-muted p-1 ring-1 ring-border">
          {videoUrl && (
            <button
              onClick={() => setActiveTab("video")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeTab === "video"
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              <span>Watch Video</span>
            </button>
          )}

          {audioUrl && (
            <button
              onClick={() => setActiveTab("audio")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeTab === "audio"
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
              <span>Listen Audio</span>
            </button>
          )}

          {(sourcePackUrl || sourcePackText) && (
            <button
              onClick={() => setActiveTab("source")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeTab === "source"
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Episode Notes</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        {activeTab === "video" && videoUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-border">
            {videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? (
              <iframe
                src={videoUrl}
                title={title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={videoUrl}
                poster={posterUrl}
                controls
                className="h-full w-full object-cover"
              />
            )}
          </div>
        )}

        {activeTab === "audio" && audioUrl && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-muted/30 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-primary/20">
              <Mic className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Audio Overview</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Listen to a multi-host breakdown of this topic
              </p>
            </div>

            <audio src={audioUrl} controls className="mt-2 w-full max-w-md" />
          </div>
        )}

        {activeTab === "source" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Episode Reference Notes</p>
                <p className="text-xs text-muted-foreground">
                  Read or copy the underlying reference notes and show summary.
                </p>
              </div>
              <div className="flex gap-2">
                {sourcePackText && (
                  <button
                    onClick={handleCopySource}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <FileText className="h-3.5 w-3.5" />
                    )}
                    <span>{copied ? "Copied!" : "Copy Notes"}</span>
                  </button>
                )}
                {sourcePackUrl && (
                  <a
                    href={sourcePackUrl}
                    download
                    className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download File</span>
                  </a>
                )}
              </div>
            </div>

            {sourcePackText && (
              <pre className="max-h-60 overflow-y-auto rounded-xl border border-border bg-muted/20 p-4 text-xs font-mono text-foreground whitespace-pre-wrap">
                {sourcePackText}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
