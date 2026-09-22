/**
 * Minimal text PDF generator for the Workflow Opportunity Scorecard.
 * Pure Web Crypto / Uint8Array — safe on Cloudflare Workers (no Node fs).
 * Never include Sprint planning-signal dollar amounts.
 */
import {
  type ScorecardAnswers,
  type ScorecardResult,
  BUYER_ROLE_LABELS,
} from "@/lib/scorecard-scoring";
import { SCORECARD_PDF_FILENAME } from "@/lib/scorecard-commerce";

function pdfEscape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
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

type PdfLine = { text: string; bold?: boolean; gap?: number };

function buildLines(answers: ScorecardAnswers, result: ScorecardResult, dateIso: string): PdfLine[] {
  const lines: PdfLine[] = [];
  const push = (text: string, opts?: { bold?: boolean; gap?: number }) => {
    lines.push({ text, bold: opts?.bold, gap: opts?.gap });
  };
  const pushWrapped = (text: string, opts?: { bold?: boolean; gap?: number }) => {
    for (const part of wrapLine(text, 92)) push(part, opts);
  };

  push("Workflow Opportunity Scorecard", { bold: true, gap: 10 });
  push(`Melanated In Tech · ${dateIso}`, { gap: 6 });
  push(`Prepared for: ${answers.buyer_name} (${BUYER_ROLE_LABELS[answers.buyer_role]})`, {
    gap: 2,
  });
  push(`Company: ${answers.company_name}`, { gap: 2 });
  push(`Email: ${answers.buyer_email}`, { gap: 14 });

  push("1. The workflow", { bold: true, gap: 8 });
  pushWrapped(answers.workflow_one_liner.trim(), { gap: 4 });
  pushWrapped(`Starts: ${answers.workflow_start.trim()}`, { gap: 2 });
  pushWrapped(`Ends: ${answers.workflow_end.trim()}`, { gap: 14 });

  push("2. Opportunity score", { bold: true, gap: 8 });
  push(`Score: ${result.opportunityScore} / 100  ·  Band: ${result.band}`, { bold: true, gap: 6 });
  pushWrapped(result.bandCopy, { gap: 4 });
  pushWrapped(result.scoreDisclaimer, { gap: 14 });

  push("3. Time / money leak themes", { bold: true, gap: 4 });
  push("(inferred from your inputs — not measured ROI)", { gap: 8 });
  if (result.leakThemes.length === 0) {
    push("No leak themes selected.", { gap: 14 });
  } else {
    for (const theme of result.leakThemes) {
      push(theme.title, { bold: true, gap: 4 });
      pushWrapped(theme.body, { gap: 8 });
    }
  }

  push("4. First AI-worker candidate", { bold: true, gap: 8 });
  pushWrapped(result.aiWorkerCandidate, { gap: 6 });
  pushWrapped(result.humanApprovalCallout, { gap: 4 });
  pushWrapped(result.systemHint, { gap: 14 });

  push("5. Sprint fit", { bold: true, gap: 8 });
  push(`Result: ${result.sprintFit}`, { bold: true, gap: 6 });
  pushWrapped(result.sprintFitCopy, { gap: 14 });

  push("6. Recommended next step", { bold: true, gap: 8 });
  pushWrapped(result.nextStepLine, { gap: 4 });
  push(`Learn more: https://melanatedintech.com${result.nextStepPath}`, { gap: 4 });
  push("Questions? antonio@melanatedintech.com", { gap: 14 });

  push("7. What this Scorecard is not", { bold: true, gap: 8 });
  pushWrapped(result.whatThisIsNot, { gap: 10 });

  push(`Filename: ${SCORECARD_PDF_FILENAME}`, { gap: 4 });
  return lines;
}

/**
 * Build a simple multi-page PDF (Helvetica) from scorecard content.
 * Returns raw PDF bytes.
 */
export function generateScorecardPdf(
  answers: ScorecardAnswers,
  result: ScorecardResult,
  opts?: { generatedAt?: Date },
): Uint8Array {
  const dateIso = (opts?.generatedAt ?? new Date()).toISOString().slice(0, 10);
  const contentLines = buildLines(answers, result, dateIso);

  const pageWidth = 612;
  const pageHeight = 792;
  const marginLeft = 50;
  const marginTop = 54;
  const marginBottom = 54;
  const lineHeight = 14;
  const usableHeight = pageHeight - marginTop - marginBottom;
  const linesPerPage = Math.floor(usableHeight / lineHeight);

  const pages: PdfLine[][] = [];
  for (let i = 0; i < contentLines.length; i += linesPerPage) {
    pages.push(contentLines.slice(i, i + linesPerPage));
  }
  if (pages.length === 0) pages.push([{ text: "Workflow Opportunity Scorecard" }]);

  const objects: string[] = [];
  const addObject = (body: string): number => {
    objects.push(body);
    return objects.length;
  };

  // 1: Catalog
  const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
  // 2: Pages placeholder — filled after kids known
  const pagesId = addObject("PLACEHOLDER_PAGES");
  // 3: Font
  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBoldId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  const pageIds: number[] = [];
  const contentIds: number[] = [];

  for (const pageLines of pages) {
    let y = pageHeight - marginTop;
    const ops: string[] = [];
    for (const line of pageLines) {
      const fontRef = line.bold ? fontBoldId : fontId;
      const size = line.bold && line.text.length < 60 ? 12 : 10;
      ops.push("BT");
      ops.push(`/${fontRef === fontBoldId ? "F2" : "F1"} ${size} Tf`);
      ops.push(`${marginLeft} ${y} Td`);
      ops.push(`(${pdfEscape(line.text)}) Tj`);
      ops.push("ET");
      y -= lineHeight + (line.gap ? Math.min(line.gap / 8, 4) : 0);
    }
    const stream = ops.join("\n");
    const contentId = addObject(
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    );
    contentIds.push(contentId);
    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontId} 0 R /F2 ${fontBoldId} 0 R >> >> >>`,
    );
    pageIds.push(pageId);
  }

  const kids = pageIds.map((id) => `${id} 0 R`).join(" ");
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${kids}] /Count ${pageIds.length} >>`;

  // Ensure catalog points at pages (already does)
  void catalogId;

  const byteLen = (s: string) => new TextEncoder().encode(s).length;
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(byteLen(pdf));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefPos = byteLen(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\n`;
  pdf += `startxref\n${xrefPos}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

export function pdfToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}
