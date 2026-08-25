import type { ReactNode } from "react";

// Inline formatting: **bold**, `code`, and [text](url). Parsed in one pass so the
// three can't overlap-collide. Anything unmatched is emitted as plain text.
const INLINE = /(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\))/g;

/** URL schemes a link in pack, article, prompt, or model-authored text may use. */
const ALLOWED_SCHEMES = new Set(["http", "https", "mailto"]);

type SafeLink = { href: string; newTab: boolean };

/**
 * Resolve a markdown link target to something safe to put in `href`.
 *
 * Markdown reaching this renderer is not all first-party: seller-authored agent
 * and product descriptions, user-authored public prompts, and raw model output
 * in the chat widget all flow through it. Returning null means "render the link
 * text as plain text" — the words survive, the navigation does not.
 */
function safeHref(raw: string): SafeLink | null {
  // Browsers ignore control characters when parsing a scheme: a NUL or TAB
  // inside "java<ctrl>script:" is dropped by the parser and the URL still runs.
  // Strip them before deciding anything.
  // eslint-disable-next-line no-control-regex -- matching them is the point
  const cleaned = raw.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (!cleaned) return null;

  // Protocol-relative (`//evil.com`) starts with "/" but leaves the site, so it
  // must not be waved through as an internal path.
  if (cleaned.startsWith("//")) return null;
  if (cleaned.startsWith("/") || cleaned.startsWith("#")) {
    return { href: cleaned, newTab: false };
  }

  const scheme = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(cleaned);
  // No scheme at all is a relative path — same-origin, safe.
  if (!scheme) return { href: cleaned, newTab: false };

  const name = scheme[1].toLowerCase();
  if (!ALLOWED_SCHEMES.has(name)) return null;
  // mailto hands off to a mail client; only real navigation gets a new tab.
  return { href: cleaned, newTab: name !== "mailto" };
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[2] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-b${i}`} className="font-semibold text-foreground">
          {m[2]}
        </strong>,
      );
    } else if (m[3] !== undefined) {
      nodes.push(
        <code
          key={`${keyPrefix}-c${i}`}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
        >
          {m[3]}
        </code>,
      );
    } else if (m[4] !== undefined) {
      // Site paths navigate in the same tab; external links open a new tab so the
      // visitor never loses the site. A target we can't vouch for renders as
      // plain text rather than a link — see safeHref.
      const link = safeHref(m[5]);
      if (link) {
        nodes.push(
          <a
            key={`${keyPrefix}-a${i}`}
            href={link.href}
            {...(link.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
          >
            {m[4]}
          </a>,
        );
      } else {
        nodes.push(m[4]);
      }
    }
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/**
 * Minimal but correct Markdown renderer for article bodies. Supports headings
 * (#, ##, ###), unordered (-) and ordered (1.) lists, blockquotes (>), and the
 * inline formatting above. Intentionally tiny - no external dependency.
 */
function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

export function Markdown({ md }: { md: string }) {
  // Some stored content uses CRLF. Splitting on "\n" alone leaves a trailing
  // "\r" on every line, which defeats the closing-fence and table-separator
  // checks below (they test the end of the line) and renders a stray character.
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: ReactNode[] = [];
  let ul: string[] | null = null;
  let ol: { value: number; text: string }[] | null = null;

  const flushUl = () => {
    if (ul) {
      const key = `ul-${out.length}`;
      out.push(
        <ul key={key} className="my-4 list-disc space-y-1.5 pl-5 text-muted-foreground">
          {ul.map((it, i) => (
            <li key={i}>{renderInline(it, `${key}-${i}`)}</li>
          ))}
        </ul>,
      );
      ul = null;
    }
  };
  const flushOl = () => {
    if (ol) {
      const key = `ol-${out.length}`;
      out.push(
        <ol key={key} className="my-4 list-decimal space-y-1.5 pl-5 text-muted-foreground">
          {ol.map((it, i) => (
            <li key={i} value={it.value}>{renderInline(it.text, `${key}-${i}`)}</li>
          ))}
        </ol>,
      );
      ol = null;
    }
  };
  const flush = () => {
    flushUl();
    flushOl();
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    // Fenced code block: ``` ... ```
    if (raw.trimStart().startsWith("```")) {
      flush();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      out.push(
        <pre
          key={out.length}
          className="my-4 overflow-x-auto rounded-lg border border-border bg-muted p-4 text-sm"
        >
          <code className="font-mono">{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    // Table: a |pipe| header row followed by a |---|---| separator row.
    if (
      line.startsWith("|") &&
      i + 1 < lines.length &&
      /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(lines[i + 1])
    ) {
      flush();
      const header = splitTableRow(line);
      i++; // consume the separator row
      const rows: string[][] = [];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith("|")) {
        i++;
        rows.push(splitTableRow(lines[i]));
      }
      const key = `tbl-${out.length}`;
      out.push(
        <div key={key} className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {header.map((h, hi) => (
                  <th key={hi} className="px-3 py-2 font-semibold">
                    {renderInline(h, `${key}-h${hi}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} className="border-b border-border/60">
                  {r.map((c, ci) => (
                    <td key={ci} className="px-3 py-2 text-muted-foreground">
                      {renderInline(c, `${key}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (line.startsWith("# ")) {
      flush();
      out.push(
        <h1 key={out.length} className="mt-8 font-display text-3xl font-semibold">
          {renderInline(line.slice(2), `h1-${out.length}`)}
        </h1>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flush();
      out.push(
        <h2 key={out.length} className="mt-8 font-display text-2xl font-semibold">
          {renderInline(line.slice(3), `h2-${out.length}`)}
        </h2>,
      );
      continue;
    }
    if (line.startsWith("### ")) {
      flush();
      out.push(
        <h3 key={out.length} className="mt-6 font-display text-xl font-semibold">
          {renderInline(line.slice(4), `h3-${out.length}`)}
        </h3>,
      );
      continue;
    }
    if (line.startsWith("> ")) {
      flush();
      out.push(
        <blockquote
          key={out.length}
          className="my-4 border-l-2 border-primary/40 pl-4 italic text-muted-foreground"
        >
          {renderInline(line.slice(2), `bq-${out.length}`)}
        </blockquote>,
      );
      continue;
    }
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      flushUl();
      (ol ??= []).push({ value: parseInt(olMatch[1], 10), text: olMatch[2] });
      continue;
    }
    if (line.startsWith("- ")) {
      flushOl();
      (ul ??= []).push(line.slice(2));
      continue;
    }
    flush();
    out.push(
      <p key={out.length} className="mt-4 leading-relaxed text-muted-foreground">
        {renderInline(line, `p-${out.length}`)}
      </p>,
    );
  }
  flush();
  return <>{out}</>;
}
