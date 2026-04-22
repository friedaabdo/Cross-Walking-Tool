/**
 * Parse CSV content and extract crosswalk data
 * Reverses the structure created by csvExport.js
 */

// Robust CSV parser that handles quoted cells containing newlines
function parseCsvRows(csvContent) {
  const rows = [];
  let currentRow = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentCell += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Cell separator (only if not in quotes)
      currentRow.push(currentCell);
      currentCell = "";
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      // Row separator (only if not in quotes)
      currentRow.push(currentCell);
      currentCell = "";
      // Add all rows including empty ones
      rows.push(currentRow);
      currentRow = [];
      // Skip \r\n combination
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
    } else {
      currentCell += char;
    }
  }

  // Handle last cell/row
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows;
}

function parseCsvContent(csvContent) {
  const rows = parseCsvRows(csvContent);

  if (rows.length < 4) {
    throw new Error("CSV file appears to be invalid or incomplete");
  }

  let rowIndex = 0;
  let learningExperienceDescription = "";
  let learningExperienceLink = "";
  let syllabusFileName = "";
  let syllabusFileDataUrl = "";
  let cunyCourseDescription = "";

  // Parse optional metadata rows at top of file.
  while (rowIndex < rows.length && rows[rowIndex]?.[0]?.trim() === "Meta") {
    const key = rows[rowIndex]?.[1]?.trim();
    const value = rows[rowIndex]?.[2] ?? "";

    if (key === "Learning Experience URL") {
      learningExperienceLink = value;
    } else if (key === "Learning Experience Description") {
      learningExperienceDescription = value;
    } else if (key === "Syllabus File Name") {
      syllabusFileName = value;
    } else if (key === "Syllabus File Data URL") {
      syllabusFileDataUrl = value;
    } else if (key === "CUNY Course Description") {
      cunyCourseDescription = value;
    }

    rowIndex++;
  }

  // Skip optional empty spacer rows after metadata.
  while (rowIndex < rows.length && rows[rowIndex].every((cell) => !cell.trim())) {
    rowIndex++;
  }

  // Parse horizontal section (Learning Experience outcomes)
  const horizontalHeader = rows[rowIndex];
  if (!horizontalHeader[0]?.includes("Outcome")) {
    throw new Error("Expected Learning Experience Outcome header in first row");
  }

  // Extract LE title from header
  const leTitle = horizontalHeader[0].replace(" Outcome", "").trim();

  rowIndex++;

  const certLines = [];
  const certOutcomeLinks = {};
  const draggedOnceById = {};

  // Parse horizontal data rows until we find an empty row or the crosswalk header
  while (rowIndex < rows.length) {
    const row = rows[rowIndex];
    const isEmptyRow = row.every((cell) => !cell.trim());

    if (isEmptyRow) {
      // Found separator row
      rowIndex++;
      break;
    }

    // Check if this might be the crosswalk header instead
    if (row[0]?.includes("Outcome") && row[1]?.includes("Matches")) {
      break;
    }

    const outcomeText = row[0]?.trim() || "";
    const dragged = row[1]?.trim() || "No";
    const link = row[3]?.trim() || "";

    if (outcomeText) {
      const certIndex = certLines.length;
      const certId = `cert-${certIndex}`;
      certLines.push(outcomeText);
      draggedOnceById[certId] = dragged === "Yes";
      if (link) {
        certOutcomeLinks[certIndex] = link;
        certOutcomeLinks[`line:${outcomeText}`] = link;
      }
    }

    rowIndex++;
  }

  // Skip any remaining empty rows
  while (rowIndex < rows.length) {
    const row = rows[rowIndex];
    const isEmptyRow = row.every((cell) => !cell.trim());
    if (!isEmptyRow) break;
    rowIndex++;
  }

  // Parse crosswalk section (Syllabus outcomes)
  if (rowIndex >= rows.length) {
    throw new Error("Could not find crosswalk section in CSV");
  }

  const crosswalkHeader = rows[rowIndex];
  if (!crosswalkHeader[0]?.includes("Outcome")) {
    throw new Error(
      `Expected Syllabus Outcome header at row ${rowIndex}, got: ${crosswalkHeader[0]}`
    );
  }

  // Extract CC title from header
  const ccTitle = crosswalkHeader[0].replace(" Outcome", "").trim();

  rowIndex++;

  const syllLines = [];
  const syllOutcomeLinks = {};
  const matchesByRow = {};
  const notesByRow = {};

  // Parse crosswalk data rows
  while (rowIndex < rows.length) {
    const row = rows[rowIndex];
    const isEmptyRow = row.every((cell) => !cell.trim());

    if (isEmptyRow) {
      rowIndex++;
      continue;
    }

    const outcomeText = row[0]?.trim() || "";
    const matchesText = row[1]?.trim() || "";
    const notesText = row[2]?.trim() || "";
    const link = row[3]?.trim() || "";

    if (outcomeText) {
      const syllIndex = syllLines.length;
      const rowId = `drop-${syllIndex}`;
      syllLines.push(outcomeText);

      // Parse matches (can be multiple, separated by newlines)
      const matchedOutcomes = matchesText
        .split(/\r\n|\r|\n/)
        .map((m) => m.trim())
        .filter(Boolean);

      // Map matched outcomes back to certIds
      const matchedIds = [];
      for (const matchedOutcome of matchedOutcomes) {
        const certIndex = certLines.indexOf(matchedOutcome);
        if (certIndex !== -1) {
          matchedIds.push(`cert-${certIndex}`);
        }
      }

      if (matchedIds.length > 0) {
        matchesByRow[rowId] = matchedIds;
      }

      if (notesText) {
        notesByRow[rowId] = notesText;
      }

      if (link) {
        syllOutcomeLinks[syllIndex] = link;
        syllOutcomeLinks[`line:${outcomeText}`] = link;
      }
    }

    rowIndex++;
  }

  return {
    leTitle,
    learningExperienceDescription,
    ccTitle,
    cunyCourseDescription,
    learningExperienceLink,
    syllabusFileName,
    syllabusFileDataUrl,
    certLines,
    syllLines,
    certOutcomeLinks,
    syllOutcomeLinks,
    matchesByRow,
    notesByRow,
    draggedOnceById,
  };
}

export function importCrosswalkCsv(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const data = parseCsvContent(content);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}
