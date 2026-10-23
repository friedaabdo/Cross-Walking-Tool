import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { normalizeToArray } from "./collections";

const MARGIN = 36;
const HEADER_FILL = [0, 61, 120];

// The built-in PDF fonts only cover Latin-1 plus a few typographic marks; anything else would print as garbage.
// Character codes keep this file plain ASCII.
const BULLET = String.fromCharCode(0x2022);
const EXTRA_SUPPORTED_CODES = new Set([0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x2026, 0x20ac, 0x2122]);
const SYMBOL_REPLACEMENTS = new Map([
  [0x2192, "->"],
  [0x2265, ">="],
  [0x2264, "<="],
  [0x2260, "!="],
  [0x2011, "-"],
  [0x2212, "-"],
  [0x200b, ""],
  [0xa0, " "],
  [0x09, " "],
]);

const toPdfChar = (character) => {
  const code = character.codePointAt(0);
  const isSupported =
    code === 0x0a || (code >= 0x20 && code <= 0x7e) || (code >= 0xa1 && code <= 0xff) || EXTRA_SUPPORTED_CODES.has(code);

  return isSupported ? character : (SYMBOL_REPLACEMENTS.get(code) ?? "?");
};

const toPdfText = (value) =>
  Array.from(String(value ?? "").replace(/\r/g, "").replace(/^- /gm, `${BULLET} `), toPdfChar).join("");

const buildTable = (doc, { startY, head, body, columnStyles }) => {
  autoTable(doc, {
    startY,
    head: [head],
    body,
    theme: "grid",
    margin: { left: MARGIN, right: MARGIN, bottom: 40 },
    styles: { font: "helvetica", fontSize: 9, cellPadding: 5, overflow: "linebreak", valign: "top" },
    headStyles: { fillColor: HEADER_FILL, textColor: 255, fontStyle: "bold" },
    columnStyles,
    rowPageBreak: "avoid",
  });

  return doc.lastAutoTable.finalY;
};

const addHeading = (doc, text, y) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  let headingY = y;

  if (headingY > pageHeight - 90) {
    doc.addPage();
    headingY = MARGIN + 12;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(text, MARGIN, headingY);

  return headingY + 8;
};

export const buildCrosswalkPdf = ({
  leTitle,
  ccTitle,
  certLines,
  certOutcomeRows = [],
  syllLines,
  syllOutcomeRows = [],
  matchesByRow = {},
  notesByRow = {},
}) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const textWidth = pageWidth - MARGIN * 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Crosswalk", MARGIN, MARGIN + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const summary = doc.splitTextToSize(
    toPdfText(
      `Learning experience: ${leTitle || "Not specified"}\nCUNY course: ${ccTitle || "Not specified"}\nCreated: ${new Date().toLocaleDateString()}`,
    ),
    textWidth,
  );
  doc.text(summary, MARGIN, MARGIN + 28);

  const certCategory = (index) => certOutcomeRows[index]?.category ?? "";
  const certHasCategories = certLines.some((_, index) => certCategory(index));
  const syllHasCategories = syllLines.some((_, index) => syllOutcomeRows[index]?.category);

  let y = addHeading(doc, "Learning Experience Outcomes", MARGIN + 28 + summary.length * 12 + 14);

  y = buildTable(doc, {
    startY: y,
    head: certHasCategories ? ["#", "Category", "Outcome"] : ["#", "Outcome"],
    body: certLines.map((line, index) => {
      const outcome = toPdfText(line);
      return certHasCategories ? [index + 1, toPdfText(certCategory(index)), outcome] : [index + 1, outcome];
    }),
    columnStyles: { 0: { cellWidth: 28 }, ...(certHasCategories ? { 1: { cellWidth: 150 } } : {}) },
  });

  y = addHeading(doc, "Crosswalk: Course Outcomes and Matches", y + 24);

  const matchesText = (rowId) =>
    normalizeToArray(matchesByRow[rowId])
      .map((matchedId) => Number(String(matchedId).replace("cert-", "")))
      .filter((index) => certLines[index] !== undefined)
      .map((index) => toPdfText(`${index + 1}. ${certLines[index]}`))
      .join("\n\n");

  buildTable(doc, {
    startY: y,
    head: syllHasCategories
      ? ["Category", "Course Learning Outcome", "Matches (numbered as above)", "Notes"]
      : ["Course Learning Outcome", "Matches (numbered as above)", "Notes"],
    body: syllLines.map((line, index) => {
      const rowId = `drop-${index}`;
      const cells = [toPdfText(line), matchesText(rowId) || "-", toPdfText(notesByRow[rowId])];
      return syllHasCategories ? [toPdfText(syllOutcomeRows[index]?.category), ...cells] : cells;
    }),
    columnStyles: syllHasCategories ? { 0: { cellWidth: 110 } } : {},
  });

  const pageCount = doc.getNumberOfPages();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - MARGIN, pageHeight - 18, { align: "right" });
  }

  return doc;
};

export const downloadCrosswalkPdf = (data) => {
  const safeTitle =
    (data.ccTitle || data.leTitle || "crosswalk")
      .trim()
      .replace(/[<>:"/\\|?*]/g, "-")
      .replace(/\s+/g, "-")
      .slice(0, 100) || "crosswalk";

  buildCrosswalkPdf(data).save(`${safeTitle}.pdf`);
};
