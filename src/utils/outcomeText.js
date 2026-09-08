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

export const splitOutcomeDisplayParts = (text) => {
  const { bullets, statement } = splitOutcomeText(text);

  return {
    bullets,
    heading: "",
    statementBody: statement,
  };
};

export const encodeOutcomeForCsv = (text) => String(text ?? "");

export const decodeOutcomeFromCsv = (text) => String(text ?? "");

const getHeaderTextFromNode = (node) => {
  const boldNode = node.querySelector?.("strong, b");
  if (!boldNode) {
    return "";
  }

  const text = node.textContent?.trim() ?? "";
  const boldText = boldNode.textContent?.trim() ?? "";
  return text && text === boldText ? text : "";
};

export const parseInputToOutcomeSections = (value) => {
  if (!value) {
    return [];
  }

  if (!value.includes("<")) {
    const sections = [];
    let currentSection = null;

    const startSection = () => {
      currentSection = { header: "", lines: [] };
      sections.push(currentSection);
    };

    const ensureSection = () => {
      if (!currentSection) {
        startSection();
      }

      return currentSection;
    };

    String(value)
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "")
      .forEach((line) => {
        if (/^-\s+/.test(line)) {
          const section = ensureSection();
          section.lines.push(line);
          return;
        }

        startSection();
        currentSection.lines.push(line);
      });

    return sections;
  }

  const container = document.createElement("div");
  container.innerHTML = value;

  const sections = [];
  let currentHeader = "";
  let currentSection = null;

  const startSection = (header) => {
    currentHeader = header;
    currentSection = null;
  };

  const startLineSection = (line) => {
    currentSection = { header: currentHeader, lines: [line] };
    sections.push(currentSection);
  };

  const appendBulletToCurrentSection = (line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      return;
    }

    if (currentSection) {
      currentSection.lines.push(trimmedLine);
      return;
    }

    startLineSection(trimmedLine);
  };

  Array.from(container.children).forEach((node) => {
    const tag = node.tagName.toLowerCase();
    const headerText = getHeaderTextFromNode(node);

    if (headerText) {
      startSection(headerText);
      return;
    }

    if (tag === "ul" || tag === "ol") {
      const bullets = Array.from(node.querySelectorAll("li"))
        .map((li) => li.textContent?.trim() ?? "")
        .filter((item) => item !== "");

      if (bullets.length === 0) {
        return;
      }

      bullets.forEach((item) => appendBulletToCurrentSection(`- ${item}`));
      return;
    }

    const blockText = node.textContent?.trim() ?? "";
    if (!blockText) {
      return;
    }

    startLineSection(blockText);
  });

  return sections;
};

export const parseInputToOutcomeLines = (value) => {
  if (!value) {
    return [];
  }

  if (!value.includes("<")) {
    return String(value)
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
  }

  const container = document.createElement("div");
  container.innerHTML = value;

  const lines = [];
  let currentLine = "";

  const pushCurrentLine = () => {
    const trimmed = currentLine.trim();
    if (trimmed) {
      lines.push(trimmed);
    }
    currentLine = "";
  };

  Array.from(container.children).forEach((node) => {
    const tag = node.tagName.toLowerCase();

    if (tag === "ul" || tag === "ol") {
      const bullets = Array.from(node.querySelectorAll("li"))
        .map((li) => li.textContent?.trim() ?? "")
        .filter((item) => item !== "");

      if (bullets.length === 0) {
        return;
      }

      const bulletText = bullets.map((item) => `- ${item}`).join("\n");
      currentLine = currentLine ? `${currentLine}\n${bulletText}` : bulletText;
      return;
    }

    const blockText = node.textContent?.trim() ?? "";
    if (!blockText) {
      return;
    }

    if (currentLine) {
      pushCurrentLine();
    }

    currentLine = blockText;
  });

  pushCurrentLine();
  return lines;
};
