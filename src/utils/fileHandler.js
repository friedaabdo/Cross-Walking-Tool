import { PDFParse } from "pdf-parse";
import { outcomeGroupsToHtml } from "./outcomeText";

const MAX_SYLLABUS_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const PDF_WORKER_URL =
  "https://cdn.jsdelivr.net/npm/pdf-parse@2.4.5/dist/pdf-parse/web/pdf.worker.mjs";

/**
 * Handles file upload validation and conversion to data URL
 * @param {File} file - The file to process
 * @param {number} maxSizeBytes - Maximum allowed file size in bytes
 * @returns {Promise<string>} - Data URL of the file
 * @throws {Error} - If file is too large or fails to read
 */
export const handleFileUpload = async (file, maxSizeBytes = MAX_SYLLABUS_FILE_SIZE_BYTES) => {
  if (!file) return null;

  // Validate file size
  if (file.size > maxSizeBytes) {
    const maxSizeMb = maxSizeBytes / (1024 * 1024);
    throw new Error(`File is too large. Please upload a file smaller than ${maxSizeMb} MB.`);
  }

  // Read file as data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      resolve(dataUrl);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read uploaded file"));
    };

    reader.readAsDataURL(file);
  });
};

export const extractPdfText = async (file) => {
  const isPdf =
    file?.type === "application/pdf" || file?.name?.toLowerCase().endsWith(".pdf");

  if (!file || !isPdf) {
    throw new Error("Please upload a PDF file to extract text.");
  }

  PDFParse.setWorker(PDF_WORKER_URL);

  const parser = new PDFParse({
    data: new Uint8Array(await file.arrayBuffer()),
  });

  try {
    const result = await parser.getText();
    console.log("PDF parser result:", result);
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
};

// Sends the extracted syllabus text to the Foundry agent (through our server) and returns the agent's JSON object.
export const parseSyllabusWithAgent = async (text) => {
  const response = await fetch("/api/syllabus/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "The syllabus agent request failed.");
  }

  return payload.result;
};

const asText = (value) => String(value ?? "").trim();

// Capitalizes the first letter and drops trailing ";" or "," (syllabi often write outcomes as "understand X;").
const tidyOutcomeText = (value) => {
  const text = asText(value).replace(/[;,\s]+$/, "");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Campus and department may come back as a string or an array of strings; the form takes one.
const firstText = (value) => asText(Array.isArray(value) ? value[0] : value);

// outcomes is [{ header, lines }]. A flat list of strings (older agent instructions) is treated as one headerless group.
const toOutcomeGroups = (outcomes) => {
  if (!Array.isArray(outcomes)) return [];

  const groups = outcomes.filter((item) => item && typeof item === "object" && Array.isArray(item.lines));
  if (groups.length) return groups;

  return [{ header: null, lines: outcomes.map((item) => (typeof item === "string" ? item : item?.text)) }];
};

const tidyOutcomeLine = (line) =>
  /^-\s+/.test(line) ? `- ${tidyOutcomeText(line.replace(/^-\s+/, ""))}` : tidyOutcomeText(line);

const outcomesToHtml = (outcomes) =>
  outcomeGroupsToHtml(
    toOutcomeGroups(outcomes).map(({ header, lines }) => ({
      header: asText(header) ? tidyOutcomeText(header) : null,
      lines: lines.map(asText).filter(Boolean).map(tidyOutcomeLine),
    })),
  );

// The agent returns { formData: { title, courseCode, description, campus, department, outcomes } } with null for anything it can't find.
export const agentResultToForm = (result) => {
  const data = result?.formData ?? {};

  return {
    fields: {
      title: asText(data.title),
      courseCode: asText(data.courseCode),
      description: asText(data.description),
    },
    campusName: firstText(data.campus),
    departmentName: firstText(data.department),
    outcomesDraft: outcomesToHtml(data.outcomes),
  };
};

const NAME_FILLER_WORDS = new Set([
  "cuny", "the", "of", "at", "and", "department", "dept", "division", "school", "college", "university",
]);

const nameWords = (value) =>
  asText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !NAME_FILLER_WORDS.has(word));

// Returns the one item whose name matches `target` (ignoring filler like "CUNY" or "Department of"); null when there is no match or it is ambiguous.
export const matchByName = (items, getName, target) => {
  const wanted = nameWords(target);
  if (!wanted.length) return null;

  const candidates = items
    .map((item) => ({ item, words: nameWords(getName(item)) }))
    .filter(({ words }) => words.length);
  const sameWords = candidates.filter(
    ({ words }) => words.length === wanted.length && wanted.every((word) => words.includes(word)),
  );
  if (sameWords.length === 1) return sameWords[0].item;

  const overlapping = candidates.filter(
    ({ words }) => wanted.every((word) => words.includes(word)) || words.every((word) => wanted.includes(word)),
  );
  return overlapping.length === 1 ? overlapping[0].item : null;
};

export { MAX_SYLLABUS_FILE_SIZE_BYTES };
