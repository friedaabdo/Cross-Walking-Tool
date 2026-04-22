import { normalizeToArray } from "./collections";

const toLineKey = (line) => `line:${(line ?? "").trim()}`;

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
  certOutcomeLinks,
  draggedOnceById,
  leTitle,
  learningExperienceDescription,
  learningExperienceLink,
  matchesByRow,
  notesByRow,
  cunyCourseDescription,
  syllabusFileName,
  syllabusFileUrl,
  syllOutcomeLinks,
  syllLines,
}) {
  const matchedIdSet = new Set(
    Object.values(matchesByRow).flatMap((value) => normalizeToArray(value))
  );

  const horizontalHeader = [`${leTitle || "Learning Experience"} Outcome`, "Dragged", "Currently Matched", "Link"];
  const horizontalRows = certLines.map((line, index) => {
    const certId = `cert-${index}`;
    const dragged = draggedOnceById?.[certId] ? "Yes" : "No";
    const currentlyMatched = matchedIdSet.has(certId) ? "Yes" : "No";
    const link = certOutcomeLinks?.[index] ?? certOutcomeLinks?.[toLineKey(line)] ?? "";

    return [line, dragged, currentlyMatched, link];
  });

  const crosswalkHeader = [`${ccTitle || "Syllabus"} Outcome`, "Matches", "Notes", "Link"];

  const rows = syllLines.map((line, index) => {
    const rowId = `drop-${index}`;
    const matchedLines = normalizeToArray(matchesByRow[rowId])
      .map((matchedId) => certById[matchedId])
      .filter(Boolean);

    const link = syllOutcomeLinks?.[index] ?? syllOutcomeLinks?.[toLineKey(line)] ?? "";

    return [line, matchedLines.join("\r\n"), notesByRow[rowId] ?? "", link];
  });

  const csvContent = [
    ["Meta", "Learning Experience URL", learningExperienceLink ?? ""],
    ["Meta", "Learning Experience Description", learningExperienceDescription ?? ""],
    ["Meta", "Syllabus File Name", syllabusFileName ?? ""],
    ["Meta", "Syllabus File Data URL", syllabusFileUrl ?? ""],
    ["Meta", "CUNY Course Description", cunyCourseDescription ?? ""],
    [],
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
