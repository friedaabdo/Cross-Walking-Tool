import { normalizeToArray } from "./collections";

const escapeCsvCell = (value) => {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
};

const toFileSafeSegment = (value, fallback) => {
  const text = String(value ?? "").trim();
  if (!text) {
    return fallback;
  }

  return text
    .replace(/[<>:"/\\|?*]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

function downloadCrosswalkCsv({
  ccTitle,
  certById,
  certLines,
  draggedOnceById,
  leTitle,
  matchesByRow,
  notesByRow,
  syllLines,
}) {
  const matchedIdSet = new Set(
    Object.values(matchesByRow).flatMap((value) => normalizeToArray(value))
  );

  const horizontalHeader = [`${leTitle || "Learning Experience"} Outcome`, "Dragged", "Currently Matched"];
  const horizontalRows = certLines.map((line, index) => {
    const certId = `cert-${index}`;
    const dragged = draggedOnceById?.[certId] ? "Yes" : "No";
    const currentlyMatched = matchedIdSet.has(certId) ? "Yes" : "No";

    return [line, dragged, currentlyMatched];
  });

  const crosswalkHeader = [`${ccTitle || "Syllabus"} Outcome`, "Matches", "Notes"];

  const rows = syllLines.map((line, index) => {
    const rowId = `drop-${index}`;
    const matchedLines = normalizeToArray(matchesByRow[rowId])
      .map((matchedId) => certById[matchedId])
      .filter(Boolean);

    return [line, matchedLines.join("\r\n"), notesByRow[rowId] ?? ""];
  });

  const csvContent = [
    horizontalHeader,
    ...horizontalRows,
    [],
    crosswalkHeader,
    ...rows,
  ]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = `crosswalk-export-${toFileSafeSegment(leTitle, "learning-experience")}-${toFileSafeSegment(ccTitle, "syllabus")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

export default downloadCrosswalkCsv;
