export const splitOutcomeText = (text) => {
  const segments = String(text ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item !== "");

  const bullets = segments
    .filter((item) => /^-\s+/.test(item))
    .map((item) => item.replace(/^-\s+/, ""));

  const statement = segments.filter((item) => !/^-\s+/.test(item)).join("\n");

  return { bullets, statement };
};

const HEADING_TOKEN = "||HEADING||";

const splitNonEmptyLines = (text) =>
  String(text ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item !== "");

const decodeHeadingLine = (line) => {
  const trimmed = String(line ?? "").trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.includes(HEADING_TOKEN)) {
    return trimmed.replace(HEADING_TOKEN, "").trim();
  }

  const htmlMatch = trimmed.match(/^<(?:strong|b)>([\s\S]*?)<\/(?:strong|b)>$/i);
  if (htmlMatch?.[1]) {
    return htmlMatch[1].trim();
  }

  const markdownMatch = trimmed.match(/^\*\*([\s\S]*?)\*\*$/);
  if (markdownMatch?.[1]) {
    return markdownMatch[1].trim();
  }

  return "";
};

export const splitOutcomeDisplayParts = (text) => {
  const { bullets, statement } = splitOutcomeText(text);

  if (!statement) {
    return { bullets, heading: "", statementBody: "" };
  }

  const parts = splitNonEmptyLines(statement);
  const headingLineIndex = parts.findIndex((part) => decodeHeadingLine(part) !== "");

  if (headingLineIndex === -1) {
    return { bullets, heading: "", statementBody: statement };
  }

  const lineWithHeading = parts[headingLineIndex];
  const heading = decodeHeadingLine(lineWithHeading);
  const statementBody = parts
    .filter((_, index) => index !== headingLineIndex)
    .join("\n");

  return { bullets, heading, statementBody };
};

export const encodeOutcomeForCsv = (text) => {
  const { bullets, heading, statementBody } = splitOutcomeDisplayParts(text);
  const outputParts = [];

  if (heading) {
    outputParts.push(`<strong>${heading}</strong>`);
  }

  if (statementBody) {
    outputParts.push(statementBody);
  }

  if (bullets.length > 0) {
    outputParts.push(...bullets.map((bullet) => `- ${bullet}`));
  }

  return outputParts.join("\n");
};

export const decodeOutcomeFromCsv = (text) => {
  const lines = splitNonEmptyLines(text);
  if (lines.length === 0) {
    return "";
  }

  const headingLineIndex = lines.findIndex((line) => decodeHeadingLine(line) !== "");
  if (headingLineIndex === -1) {
    return lines.join("\n");
  }

  const heading = decodeHeadingLine(lines[headingLineIndex]);
  const normalizedLines = [...lines];
  normalizedLines[headingLineIndex] = `${HEADING_TOKEN}${heading}`;
  return normalizedLines.join("\n");
};
