/**
 * Public preview of a pack.
 *
 * Every pack is free but claimed with an account, so the full body is served only
 * to a signed-in holder. Without a public excerpt, 87 product pages would carry
 * nothing but a tagline for a crawler to index — the packs are the site's real
 * content, and hiding all of it to capture emails trades away the growth engine.
 *
 * This returns the opening of the pack: enough prose to be a genuine page, cut at
 * a paragraph boundary so it never ends mid-sentence.
 */

const DEFAULT_BUDGET = 1400;
/**
 * Target size for a short pack's excerpt, so its page is still worth indexing.
 * A target, not a guarantee: a code fence or paragraph boundary below it wins,
 * because a pack whose body is mostly one prompt should preview as its framing
 * text rather than leak the deliverable being claimed.
 */
const MIN_SHORT_PREVIEW = 300;
/** Characters always held back from a short pack, so the claim is worth making. */
const SHORT_RESERVE = 120;

/** Index of the last unclosed ``` fence in `text`, or -1 when all are balanced. */
function unclosedFenceIndex(text: string): number {
  let searchFrom = 0;
  let lastOpen = -1;
  let open = false;

  for (;;) {
    const next = text.indexOf("```", searchFrom);
    if (next === -1) break;
    open = !open;
    lastOpen = open ? next : -1;
    searchFrom = next + 3;
  }

  return open ? lastOpen : -1;
}

export type PackPreview = {
  /** Markdown safe to render publicly. Empty when there is nothing to show. */
  preview: string;
  /** True when content was withheld, so the UI can invite a claim. */
  truncated: boolean;
};

export function buildPackPreview(
  content: string | null | undefined,
  budget = DEFAULT_BUDGET,
): PackPreview {
  // Some packs are stored with CRLF endings. Without normalizing, the paragraph
  // search below never matches (`"\r\n\r\n".indexOf("\n\n")` is -1) and those
  // packs get cut mid-sentence at a raw character offset.
  const body = (content ?? "").replace(/\r\n/g, "\n").trim();
  if (!body) return { preview: "", truncated: false };
  if (body.length <= budget) {
    // Short packs would be given away whole, which defeats the claim. Show the
    // opening instead — at least MIN_SHORT_PREVIEW characters so the page is
    // still worth indexing, but always stopping short of the end so something
    // is genuinely reserved for the claim.
    const target = Math.min(
      Math.max(Math.floor(body.length / 2), MIN_SHORT_PREVIEW),
      body.length - SHORT_RESERVE,
    );
    const opening = cutAtParagraph(body, Math.max(target, 0));
    return { preview: opening, truncated: opening.length < body.length };
  }

  return { preview: cutAtParagraph(body, budget), truncated: true };
}

/**
 * Trim to at most `budget` characters, preferring a blank-line boundary, and
 * never leaving a code fence open — an unbalanced ``` would swallow the rest of
 * the page when the markdown renders.
 */
function cutAtParagraph(body: string, budget: number): string {
  let slice = body.slice(0, budget);

  const openFence = unclosedFenceIndex(slice);
  if (openFence !== -1) {
    // Dropping back to before the fence is cleanest, but a pack that opens with
    // a code block would then preview as a couple of words. When cutting back
    // costs most of the excerpt, keep the partial block and close it instead —
    // truncated code still reads as content, an unclosed fence eats the page.
    if (openFence >= budget * 0.4) {
      slice = slice.slice(0, openFence);
    } else {
      return `${slice.trimEnd()}\n\`\`\``;
    }
  }

  const breakAt = slice.lastIndexOf("\n\n");
  // Only honor a paragraph break that keeps most of the budget; otherwise a pack
  // whose first break comes late would preview as a single line.
  if (breakAt > slice.length * 0.4) slice = slice.slice(0, breakAt);

  return dropDanglingHeading(slice.trimEnd());
}

/**
 * Remove a trailing heading. Cutting at a paragraph break often lands right after
 * a `## Section` line, leaving a heading that promises content the excerpt does
 * not include — it reads as a rendering bug rather than a deliberate stop.
 */
function dropDanglingHeading(text: string): string {
  const lines = text.split("\n");
  while (lines.length > 1 && /^\s*#{1,6}\s/.test(lines[lines.length - 1])) {
    lines.pop();
  }
  return lines.join("\n").trimEnd();
}
