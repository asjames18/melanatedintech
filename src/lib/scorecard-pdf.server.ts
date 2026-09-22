/**
 * Branded Workflow Opportunity Scorecard PDF.
 * Pure Uint8Array / Web Crypto–safe — Cloudflare Workers compatible (no Node fs).
 * Logo bytes are pre-bundled Flate RGB (see scorecard-pdf-logo.ts).
 * Never include Sprint planning-signal dollar amounts.
 */
import {
  type ScorecardAnswers,
  type ScorecardResult,
  BUYER_ROLE_LABELS,
} from "@/lib/scorecard-scoring";
import { SCORECARD_PDF_FILENAME } from "@/lib/scorecard-commerce";
import { SCORECARD_PDF_LOGO } from "@/lib/scorecard-pdf-logo";

/** Brand colors matching thank-you UI / site warm palette. */
const COLORS = {
  ivory: { r: 0.9686, g: 0.9529, b: 0.9333 }, // #f7f3ee
  card: { r: 0.9804, g: 0.9725, b: 0.9608 }, // #faf8f5
  espresso: { r: 0.1686, g: 0.1294, b: 0.0941 }, // #2b2118
  copper: { r: 0.5412, g: 0.3529, b: 0.1686 }, // #8a5a2b
  muted: { r: 0.5451, g: 0.4784, b: 0.4078 }, // #8b7a68
  border: { r: 0.898, g: 0.8627, b: 0.8235 }, // #e5dcd2
  calloutFill: { r: 0.9686, g: 0.9333, b: 0.8784 }, // warm copper wash
  white: { r: 1, g: 1, b: 1 },
} as const;

type Rgb = { r: number; g: number; b: number };

/** Map common Unicode punctuation to WinAnsi/ASCII for Helvetica. */
function toWinAnsi(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
    .replace(/[\u2013\u2014\u2015]/g, "-")
    .replace(/[\u2022\u00B7\u2219]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    // Keep printable Latin-1 only (tab/CR/LF already collapsed by wrapLine).
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");
}

function pdfEscape(text: string): string {
  return toWinAnsi(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapLine(text: string, maxChars: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function rgbOp(c: Rgb, fill: boolean): string {
  const n = `${c.r.toFixed(4)} ${c.g.toFixed(4)} ${c.b.toFixed(4)}`;
  return fill ? `${n} rg` : `${n} RG`;
}

function decodeFlateBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

type TextStyle = "title" | "section" | "body" | "bodyBold" | "meta" | "footer" | "scoreBig" | "label";

type ContentBlock =
  | { kind: "space"; h: number }
  | { kind: "rule" }
  | { kind: "scoreCallout" }
  | { kind: "text"; style: TextStyle; text: string; color?: "espresso" | "muted" | "copper" };

function buildBlocks(answers: ScorecardAnswers, result: ScorecardResult): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const body = (
    text: string,
    opts?: { bold?: boolean; color?: "espresso" | "muted" | "copper" },
  ) => {
    for (const part of wrapLine(text, 88)) {
      blocks.push({
        kind: "text",
        style: opts?.bold ? "bodyBold" : "body",
        text: part,
        color: opts?.color ?? "espresso",
      });
    }
  };
  const section = (label: string) => {
    blocks.push({ kind: "space", h: 10 });
    blocks.push({ kind: "text", style: "section", text: label, color: "espresso" });
    blocks.push({ kind: "space", h: 4 });
  };

  blocks.push({
    kind: "text",
    style: "meta",
    text: `Prepared for: ${answers.buyer_name} (${BUYER_ROLE_LABELS[answers.buyer_role]})`,
    color: "espresso",
  });
  blocks.push({ kind: "text", style: "meta", text: `Company: ${answers.company_name}`, color: "espresso" });
  blocks.push({ kind: "text", style: "meta", text: `Email: ${answers.buyer_email}`, color: "muted" });
  blocks.push({ kind: "space", h: 10 });
  blocks.push({ kind: "scoreCallout" });

  section("1. The workflow");
  body(answers.workflow_one_liner.trim());
  blocks.push({ kind: "space", h: 4 });
  body(`Starts: ${answers.workflow_start.trim()}`, { color: "muted" });
  body(`Ends: ${answers.workflow_end.trim()}`, { color: "muted" });

  section("2. Opportunity score");
  body(`Score: ${result.opportunityScore} / 100  |  Band: ${result.band}`, { bold: true });
  blocks.push({ kind: "space", h: 3 });
  body(result.bandCopy);
  blocks.push({ kind: "space", h: 3 });
  body(result.scoreDisclaimer, { color: "muted" });

  section("3. Time / money leak themes");
  body("(inferred from your inputs — not measured ROI)", { color: "muted" });
  blocks.push({ kind: "space", h: 4 });
  if (result.leakThemes.length === 0) {
    body("No leak themes selected.");
  } else {
    for (const theme of result.leakThemes) {
      body(theme.title, { bold: true });
      body(theme.body);
      blocks.push({ kind: "space", h: 4 });
    }
  }

  section("4. First AI-worker candidate");
  body(result.aiWorkerCandidate);
  blocks.push({ kind: "space", h: 3 });
  body(result.humanApprovalCallout);
  blocks.push({ kind: "space", h: 3 });
  body(result.systemHint, { color: "muted" });

  section("5. Sprint fit");
  body(`Result: ${result.sprintFit}`, { bold: true });
  blocks.push({ kind: "space", h: 3 });
  body(result.sprintFitCopy);

  section("6. Recommended next step");
  body(result.nextStepLine);
  blocks.push({ kind: "space", h: 3 });
  body(`Learn more: https://melanatedintech.com${result.nextStepPath}`, { color: "copper" });

  section("7. What this Scorecard is not");
  body(result.whatThisIsNot);

  blocks.push({ kind: "space", h: 12 });
  body(`Filename: ${SCORECARD_PDF_FILENAME}`, { color: "muted" });

  return blocks;
}

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN_X = 48;
const HEADER_H = 72;
const FOOTER_H = 42;
const CONTENT_TOP = PAGE_H - HEADER_H - 8;
const CONTENT_BOTTOM = FOOTER_H + 16;

function styleMetrics(style: TextStyle): { font: "F1" | "F2"; size: number; leading: number } {
  switch (style) {
    case "title":
      return { font: "F2", size: 14, leading: 18 };
    case "section":
      return { font: "F2", size: 11, leading: 15 };
    case "bodyBold":
      return { font: "F2", size: 10, leading: 14 };
    case "body":
      return { font: "F1", size: 10, leading: 14 };
    case "meta":
      return { font: "F1", size: 9.5, leading: 13 };
    case "label":
      return { font: "F2", size: 8, leading: 11 };
    case "scoreBig":
      return { font: "F2", size: 22, leading: 26 };
    case "footer":
      return { font: "F1", size: 8, leading: 10 };
  }
}

function estimateBlockHeight(block: ContentBlock): number {
  if (block.kind === "space") return block.h;
  if (block.kind === "rule") return 10;
  if (block.kind === "scoreCallout") return 78;
  return styleMetrics(block.style).leading;
}

function paginate(blocks: ContentBlock[]): ContentBlock[][] {
  const pages: ContentBlock[][] = [];
  let current: ContentBlock[] = [];
  let y = CONTENT_TOP;

  const flush = () => {
    if (current.length) pages.push(current);
    current = [];
    y = CONTENT_TOP;
  };

  for (const block of blocks) {
    const h = estimateBlockHeight(block);
    if (y - h < CONTENT_BOTTOM && current.length) {
      flush();
    }
    // Keep score callout from orphaning alone at bottom with no room
    if (block.kind === "scoreCallout" && y - h < CONTENT_BOTTOM) {
      flush();
    }
    current.push(block);
    y -= h;
  }
  flush();
  if (pages.length === 0) pages.push([{ kind: "text", style: "title", text: "Workflow Opportunity Scorecard" }]);
  return pages;
}

function drawHeader(ops: string[], dateIso: string, logoName: string): void {
  // Ivory page wash
  ops.push(rgbOp(COLORS.ivory, true));
  ops.push(`0 0 ${PAGE_W} ${PAGE_H} re`);
  ops.push("f");

  // Logo (display ~138 × 28)
  const logoDisplayW = 138;
  const logoDisplayH = (SCORECARD_PDF_LOGO.height / SCORECARD_PDF_LOGO.width) * logoDisplayW;
  const logoX = MARGIN_X;
  const logoY = PAGE_H - 28 - logoDisplayH;
  ops.push("q");
  ops.push(`${logoDisplayW.toFixed(2)} 0 0 ${logoDisplayH.toFixed(2)} ${logoX} ${logoY.toFixed(2)} cm`);
  ops.push(`/${logoName} Do`);
  ops.push("Q");

  // Product name + date on the right of header band
  const titleX = MARGIN_X + logoDisplayW + 14;
  ops.push(rgbOp(COLORS.espresso, true));
  ops.push("BT");
  ops.push("/F2 11 Tf");
  ops.push(`${titleX} ${(logoY + logoDisplayH - 12).toFixed(2)} Td`);
  ops.push(`(${pdfEscape("Workflow Opportunity Scorecard")}) Tj`);
  ops.push("ET");

  ops.push(rgbOp(COLORS.muted, true));
  ops.push("BT");
  ops.push("/F1 9 Tf");
  ops.push(`${titleX} ${(logoY + logoDisplayH - 26).toFixed(2)} Td`);
  ops.push(`(${pdfEscape(`Melanated In Tech - ${dateIso}`)}) Tj`);
  ops.push("ET");

  // Copper accent rule under header
  const ruleY = PAGE_H - HEADER_H + 4;
  ops.push(rgbOp(COLORS.copper, true));
  ops.push(`${MARGIN_X} ${ruleY} ${PAGE_W - MARGIN_X * 2} 1.5 re`);
  ops.push("f");
}

function drawFooter(ops: string[], pageIndex: number, pageCount: number): void {
  const ruleY = FOOTER_H + 6;
  ops.push(rgbOp(COLORS.border, true));
  ops.push(`${MARGIN_X} ${ruleY} ${PAGE_W - MARGIN_X * 2} 0.75 re`);
  ops.push("f");

  ops.push(rgbOp(COLORS.muted, true));
  ops.push("BT");
  ops.push("/F1 8 Tf");
  ops.push(`${MARGIN_X} 22 Td`);
  ops.push(`(${pdfEscape("melanatedintech.com  |  antonio@melanatedintech.com")}) Tj`);
  ops.push("ET");

  const pageLabel = `Page ${pageIndex + 1} of ${pageCount}`;
  // Approximate right-align: ~4.2pt per char at 8pt Helvetica
  const approxW = pageLabel.length * 4.2;
  ops.push("BT");
  ops.push("/F1 8 Tf");
  ops.push(`${(PAGE_W - MARGIN_X - approxW).toFixed(2)} 22 Td`);
  ops.push(`(${pdfEscape(pageLabel)}) Tj`);
  ops.push("ET");
}

function drawScoreCallout(
  ops: string[],
  yTop: number,
  result: ScorecardResult,
): number {
  const boxH = 72;
  const boxY = yTop - boxH;
  const boxW = PAGE_W - MARGIN_X * 2;

  // Fill
  ops.push(rgbOp(COLORS.calloutFill, true));
  ops.push(rgbOp(COLORS.copper, false));
  ops.push("1.5 w");
  ops.push(`${MARGIN_X} ${boxY} ${boxW} ${boxH} re`);
  ops.push("B");

  // Left copper bar
  ops.push(rgbOp(COLORS.copper, true));
  ops.push(`${MARGIN_X} ${boxY} 4 ${boxH} re`);
  ops.push("f");

  ops.push(rgbOp(COLORS.copper, true));
  ops.push("BT");
  ops.push("/F2 8 Tf");
  ops.push(`${MARGIN_X + 14} ${(boxY + boxH - 16).toFixed(2)} Td`);
  ops.push(`(${pdfEscape("OPPORTUNITY SCORE")}) Tj`);
  ops.push("ET");

  ops.push(rgbOp(COLORS.espresso, true));
  ops.push("BT");
  ops.push("/F2 22 Tf");
  ops.push(`${MARGIN_X + 14} ${(boxY + boxH - 42).toFixed(2)} Td`);
  ops.push(`(${pdfEscape(`${result.opportunityScore} / 100`)}) Tj`);
  ops.push("ET");

  ops.push(rgbOp(COLORS.espresso, true));
  ops.push("BT");
  ops.push("/F2 11 Tf");
  ops.push(`${MARGIN_X + 150} ${(boxY + boxH - 38).toFixed(2)} Td`);
  ops.push(`(${pdfEscape(`Band: ${result.band}`)}) Tj`);
  ops.push("ET");

  ops.push(rgbOp(COLORS.muted, true));
  ops.push("BT");
  ops.push("/F1 10 Tf");
  ops.push(`${MARGIN_X + 14} ${(boxY + 14).toFixed(2)} Td`);
  ops.push(`(${pdfEscape(`Sprint fit: ${result.sprintFit}`)}) Tj`);
  ops.push("ET");

  return boxY - 8;
}

function renderPageContent(
  pageBlocks: ContentBlock[],
  result: ScorecardResult,
  dateIso: string,
  pageIndex: number,
  pageCount: number,
  logoName: string,
): string {
  const ops: string[] = [];
  drawHeader(ops, dateIso, logoName);
  drawFooter(ops, pageIndex, pageCount);

  let y = CONTENT_TOP;
  for (const block of pageBlocks) {
    if (block.kind === "space") {
      y -= block.h;
      continue;
    }
    if (block.kind === "rule") {
      ops.push(rgbOp(COLORS.border, true));
      ops.push(`${MARGIN_X} ${(y - 2).toFixed(2)} ${PAGE_W - MARGIN_X * 2} 0.6 re`);
      ops.push("f");
      y -= 10;
      continue;
    }
    if (block.kind === "scoreCallout") {
      y = drawScoreCallout(ops, y, result);
      continue;
    }

    const m = styleMetrics(block.style);
    const color =
      block.color === "copper"
        ? COLORS.copper
        : block.color === "muted"
          ? COLORS.muted
          : COLORS.espresso;
    // Baseline for Td is roughly y - size * 0.8 from top of line box
    const baseline = y - m.size;
    ops.push(rgbOp(color, true));
    ops.push("BT");
    ops.push(`/${m.font} ${m.size} Tf`);
    ops.push(`${MARGIN_X} ${baseline.toFixed(2)} Td`);
    ops.push(`(${pdfEscape(block.text)}) Tj`);
    ops.push("ET");
    y -= m.leading;
  }

  return ops.join("\n");
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

function encodeUtf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

/**
 * Build a branded multi-page PDF from scorecard content.
 * Returns raw PDF bytes.
 */
export function generateScorecardPdf(
  answers: ScorecardAnswers,
  result: ScorecardResult,
  opts?: { generatedAt?: Date },
): Uint8Array {
  const dateIso = (opts?.generatedAt ?? new Date()).toISOString().slice(0, 10);
  const blocks = buildBlocks(answers, result);
  const pages = paginate(blocks);

  const logoFlate = decodeFlateBase64(SCORECARD_PDF_LOGO.flateBase64);
  const logoName = "Im1";

  type Obj = { id: number; bytes: Uint8Array };
  const objects: Obj[] = [];
  const add = (body: string | Uint8Array): number => {
    const id = objects.length + 1;
    objects.push({ id, bytes: typeof body === "string" ? encodeUtf8(body) : body });
    return id;
  };

  const catalogId = add("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesId = add("PLACEHOLDER_PAGES");
  const fontId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBoldId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  // Image XObject (binary stream)
  const imgDict = encodeUtf8(
    `<< /Type /XObject /Subtype /Image /Width ${SCORECARD_PDF_LOGO.width} /Height ${SCORECARD_PDF_LOGO.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${logoFlate.length} >>\nstream\n`,
  );
  const imgEnd = encodeUtf8("\nendstream");
  const imageId = add(concatBytes([imgDict, logoFlate, imgEnd]));

  const pageIds: number[] = [];
  for (let i = 0; i < pages.length; i++) {
    const streamText = renderPageContent(pages[i]!, result, dateIso, i, pages.length, logoName);
    const streamBytes = encodeUtf8(streamText);
    const contentId = add(
      concatBytes([
        encodeUtf8(`<< /Length ${streamBytes.length} >>\nstream\n`),
        streamBytes,
        encodeUtf8("\nendstream"),
      ]),
    );
    const pageId = add(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontId} 0 R /F2 ${fontBoldId} 0 R >> /XObject << /${logoName} ${imageId} 0 R >> >> >>`,
    );
    pageIds.push(pageId);
  }

  const kids = pageIds.map((id) => `${id} 0 R`).join(" ");
  objects[pagesId - 1]!.bytes = encodeUtf8(
    `<< /Type /Pages /Kids [${kids}] /Count ${pageIds.length} >>`,
  );

  void catalogId;

  const header = encodeUtf8("%PDF-1.4\n");
  const parts: Uint8Array[] = [header];
  const offsets: number[] = [0];
  let pos = header.length;

  for (const obj of objects) {
    offsets.push(pos);
    const prefix = encodeUtf8(`${obj.id} 0 obj\n`);
    const suffix = encodeUtf8("\nendobj\n");
    parts.push(prefix, obj.bytes, suffix);
    pos += prefix.length + obj.bytes.length + suffix.length;
  }

  const xrefPos = pos;
  let xref = `xref\n0 ${objects.length + 1}\n`;
  xref += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\n`;
  xref += `startxref\n${xrefPos}\n%%EOF`;
  parts.push(encodeUtf8(xref));

  return concatBytes(parts);
}

export function pdfToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}
