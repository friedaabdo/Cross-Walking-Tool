const normalizeMatches = (value) =>
  Array.isArray(value) ? value : value ? [value] : [];

const escapeCsvCell = (value) => {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
};

function downloadCrosswalkCsv({ certById, matchesByRow, notesByRow, syllLines }) {
  const header = ["Syllabus Outcome", "Matches", "Notes"];

  const rows = syllLines.map((line, index) => {
    const rowId = `drop-${index}`;
    const matchedLines = normalizeMatches(matchesByRow[rowId])
      .map((matchedId) => certById[matchedId])
      .filter(Boolean);

    return [line, matchedLines.join("\r\n"), notesByRow[rowId] ?? ""];
  });

  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = `crosswalk-export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

export default downloadCrosswalkCsv;
