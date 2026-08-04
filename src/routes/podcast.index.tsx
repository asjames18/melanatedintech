import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { buildSeoMeta, breadcrumbLd, ldScript, podcastSeriesLd } from "@/lib/seo";
import {
  PODCAST,
  PODCAST_EPISODES,
  RELEASED_EPISODES,
  episodeCode,
  formatDuration,
  formatEpisodeDate,
  isReleased,
  isoDuration,
  type PodcastEpisode,
} from "@/lib/podcast";
import { Mic, Radio, Clock, Rss, Check, FileText, Volume2, CalendarClock } from "lucide-react";

const FEED_PATH = "/podcast/feed.xml";
const FEED_URL = `https://melanatedintech.com${FEED_PATH}`;

export const Route = createFileRoute("/podcast/")({
  head: () => {
    const seo = buildSeoMeta({
      title: "Melanated In Tech Podcast — Weekly AI Audio Deep Dives",
      description:
        "Weekly audio deep dives into building, deploying, and benefiting from AI agents in plain English.",
      url: "/podcast",
      image: PODCAST.ogImage,
    });
    return {
      meta: seo.meta,
      links: [
        ...seo.links,
        { rel: "alternate", type: "application/rss+xml", href: FEED_URL, title: PODCAST.title },
      ],
      scripts: [
        ldScript(
          podcastSeriesLd({
            name: PODCAST.title,
            description: PODCAST.description,
            url: "/podcast",
            feedUrl: FEED_PATH,
            image: PODCAST.image,
            episodes: RELEASED_EPISODES.map((ep) => ({
              name: ep.title,
              description: ep.summary,
              episodeNumber: ep.episodeNumber,
              datePublished: ep.publishedAt,
              duration: ep.durationSeconds ? isoDuration(ep.durationSeconds) : undefined,
              audioUrl: ep.audioUrl,
            })),
          }),
        ),
        ldScript(breadcrumbLd([{ name: "Podcast", path: "/podcast" }])),
      ],
    };
  },
  component: PodcastIndex,
});

function PodcastIndex() {
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode>(
    RELEASED_EPISODES[0] ?? PODCAST_EPISODES[0],
  );
  const [copiedFeed, setCopiedFeed] = useState(false);
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"player" | "notes">("player");

  const released = isReleased(selectedEpisode);

  const handleCopyFeed = () => {
    navigator.clipboard.writeText(FEED_URL);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2000);
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(selectedEpisode.sourcePackText);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const handleSelectEpisode = (ep: PodcastEpisode) => {
    setSelectedEpisode(ep);
    setIsPlaying(false);
    setActiveTab(isReleased(ep) ? "player" : "notes");
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Weekly Audio Podcast"
        title="Melanated In Tech Podcast."
        description="Weekly audio deep dives into building, deploying, and benefiting from AI agents in plain English."
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Subscribe Bar */}
        <div className="mb-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">
                Subscribe to Weekly Audio Episodes
              </h2>
              <p className="text-sm text-muted-foreground">
                Paste the RSS feed into Apple Podcasts, Overcast, Pocket Casts, or any podcast app.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopyFeed}
              className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground transition hover:bg-secondary/80"
            >
              {copiedFeed ? (
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Rss className="h-4 w-4 text-primary" />
              )}
              <span>{copiedFeed ? "RSS Copied!" : "Copy RSS Feed"}</span>
            </button>
            <a
              href={FEED_PATH}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground transition hover:bg-secondary/80"
            >
              <FileText className="h-4 w-4 text-primary" />
              <span>Open Feed</span>
            </a>
          </div>
        </div>

        {/* Featured Audio Player Section */}
        <section className="mb-14">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Mic className="h-4 w-4" />
              <span>
                Episode {episodeCode(selectedEpisode.episodeNumber)} —{" "}
                {released ? "Featured Audio Episode" : "Upcoming Episode"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatEpisodeDate(selectedEpisode.publishedAt)}
            </span>
          </div>

          {/* Audio Player Container */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {/* Header Bar */}
            <div className="flex flex-col gap-3 border-b border-border bg-muted/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  {released ? <Mic className="h-5 w-5" /> : <CalendarClock className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedEpisode.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {released
                      ? `Melanated in Tech Audio Episode · ${formatDuration(selectedEpisode.durationSeconds!)}`
                      : `Melanated in Tech Audio Episode · Publishing ${formatEpisodeDate(selectedEpisode.publishedAt)}`}
                  </p>
                </div>
              </div>

              {/* View Selector */}
              <div className="flex items-center gap-1 rounded-xl bg-muted p-1 ring-1 ring-border">
                <button
                  onClick={() => setActiveTab("player")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    activeTab === "player"
                      ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>{released ? "Listen Episode" : "Release Date"}</span>
                </button>
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    activeTab === "notes"
                      ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Episode Summary</span>
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6">
              {activeTab === "player" ? (
                <div className="flex flex-col items-center justify-center gap-6 rounded-xl border border-border bg-muted/30 p-8 text-center">
                  {/* Waveform Graphic Animation */}
                  <div className="flex h-12 items-center justify-center gap-1.5">
                    {[40, 70, 30, 90, 50, 80, 100, 60, 85, 45, 95, 30, 75, 60, 80].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all duration-300 ${
                          released ? "bg-primary" : "bg-muted-foreground/30"
                        } ${isPlaying ? "animate-pulse" : ""}`}
                        style={{
                          height: `${isPlaying ? h : Math.max(20, h * 0.4)}%`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>

                  <div>
                    <h4 className="font-display text-xl font-semibold text-foreground">
                      {selectedEpisode.title}
                    </h4>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {selectedEpisode.summary}
                    </p>
                  </div>

                  {released ? (
                    <audio
                      src={selectedEpisode.audioUrl}
                      controls
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      className="w-full max-w-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-foreground">
                        <CalendarClock className="h-3.5 w-3.5 text-primary" />
                        Audio drops {formatEpisodeDate(selectedEpisode.publishedAt)}
                      </span>
                      <p className="max-w-sm text-xs text-muted-foreground">
                        Subscribe to the RSS feed above and this episode lands in your podcast app
                        the moment it publishes.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Episode Overview & Reference Notes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        The source document this episode was built from —{" "}
                        <span className="font-mono">{selectedEpisode.sourcePackTitle}</span>
                      </p>
                    </div>
                    <button
                      onClick={handleCopyNotes}
                      className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      {copiedNotes ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <FileText className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedNotes ? "Copied!" : "Copy Notes"}</span>
                    </button>
                  </div>

                  <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-muted/20 p-4 font-mono text-xs text-foreground">
                    {selectedEpisode.sourcePackText}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Episode Catalog */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                All Weekly Episodes
              </h2>
              <p className="text-sm text-muted-foreground">
                Browse our complete weekly audio podcast archive.
              </p>
            </div>
            <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              {RELEASED_EPISODES.length} live · {PODCAST_EPISODES.length - RELEASED_EPISODES.length}{" "}
              upcoming
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PODCAST_EPISODES.map((ep) => {
              const isSelected = ep.id === selectedEpisode.id;
              const epReleased = isReleased(ep);
              return (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => handleSelectEpisode(ep)}
                  className={`group flex flex-col justify-between rounded-2xl border p-6 text-left transition-all duration-300 ${
                    isSelected
                      ? "border-primary bg-accent/40 shadow-md ring-1 ring-primary/20"
                      : "border-border bg-card hover:-translate-y-1 hover:border-foreground/20 hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono font-semibold text-primary">
                        EPISODE {episodeCode(ep.episodeNumber)}
                      </span>
                      <div className="flex items-center gap-1">
                        {epReleased && ep.durationSeconds ? (
                          <>
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatDuration(ep.durationSeconds)}</span>
                          </>
                        ) : (
                          <>
                            <CalendarClock className="h-3.5 w-3.5" />
                            <span>{formatEpisodeDate(ep.publishedAt)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <h3 className="mt-3 font-display text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                      {ep.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {ep.summary}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                    <div className="flex flex-wrap gap-1">
                      {ep.topics.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <span
                      className={`shrink-0 text-xs font-semibold ${
                        isSelected
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {!epReleased ? "Coming soon" : isSelected ? "Listening" : "Listen →"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
