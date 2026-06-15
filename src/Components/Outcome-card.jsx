import "./Outcome-card.css";
import "./outcome-rich.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { splitOutcomeText } from "../utils/outcomeText";

const normalizeExternalUrl = (url) => {
  const trimmedUrl = (url || "").trim();
  if (!trimmedUrl) {
    return "";
  }

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmedUrl) || trimmedUrl.startsWith("//")) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
};

const toLineKey = (line) => `line:${(line || "").trim()}`;

function OutcomeCard({
  lines,
  sections,
  className,
  containerClassName,
  showTopRightPlusIcon = false,
  outcomeLinks,
  setOutcomeLinks,
}) {
  const [linkDraftByCard, setLinkDraftByCard] = useState({});
  const [openTooltipCardKey, setOpenTooltipCardKey] = useState(null);

  const handleDraftChange = (cardKey, value) => {
    setLinkDraftByCard((previous) => ({
      ...previous,
      [cardKey]: value,
    }));
  };

  const handleSaveLink = (cardIndex, line) => {
    const normalizedLink = normalizeExternalUrl(linkDraftByCard[cardIndex]);
    if (!normalizedLink) {
      return;
    }

    if (setOutcomeLinks) {
      setOutcomeLinks((previous) => ({
        ...previous,
        [cardIndex]: normalizedLink,
        [toLineKey(line)]: normalizedLink,
      }));
    }

    setLinkDraftByCard((previous) => ({
      ...previous,
      [cardIndex]: normalizedLink,
    }));
  };

  const normalizedSections = (sections ?? lines.map((line) => ({ header: "", lines: [line] }))).map(
    (section) =>
      typeof section === "string"
        ? { header: "", lines: [section] }
        : {
            header: section?.header ?? "",
            lines: Array.isArray(section?.lines)
              ? section.lines
              : section?.line
                ? [section.line]
                : [],
          },
  );

  return (
    <div className={containerClassName}>
      {normalizedSections.map((section, index) => {
        const sectionKey = `${section.header || section.lines.join("|")}-${index}`;
        const savedLine = section.header || section.lines.join("\n");
        const savedLink = outcomeLinks?.[index] ?? outcomeLinks?.[toLineKey(savedLine)] ?? "";
        const draftLink = linkDraftByCard[index] ?? savedLink;
        const hasSavedLink = Boolean(savedLink);

        return (
          <div key={sectionKey} className={`outcome-card-item outcome-rich-content ${className ?? ""}`}>
            {showTopRightPlusIcon ? (
              <div className="outcome-card-top-right-control">
                <button
                  type="button"
                  className="outcome-card-top-right-icon"
                  onClick={() =>
                    setOpenTooltipCardKey((previous) => (previous === sectionKey ? null : sectionKey))
                  }
                  aria-label="Add outcome link"
                  aria-expanded={openTooltipCardKey === sectionKey}
                >
                  <FontAwesomeIcon icon={faLink} style={{ color: "rgb(70, 147, 207)" }} />
                </button>
                <div
                  className={`outcome-card-link-tooltip ${openTooltipCardKey === sectionKey ? "is-open" : ""}`}
                  role="tooltip"
                >
                  <label className="outcome-card-link-label" htmlFor={`outcome-link-${index}`}>
                    Add outcome link
                  </label>
                  <input
                    id={`outcome-link-${index}`}
                    className="outcome-card-link-input"
                    type="url"
                    placeholder="https://example.com"
                    value={draftLink}
                    onChange={(event) => handleDraftChange(index, event.target.value)}
                  />
                  <button
                    className="outcome-card-link-button"
                    type="button"
                    onClick={() => handleSaveLink(index, savedLine)}
                  >
                    Add
                  </button>
                  {hasSavedLink ? (
                    <a
                      className="outcome-card-link-preview"
                      href={savedLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open link
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}

            {section.header ? (
              <span className="outcome-rich-header">{section.header}</span>
            ) : null}

            {section.lines.map((line, lineIndex) => {
              const { bullets, statement } = splitOutcomeText(line);

              return (
                <div key={`section-${index}-line-${lineIndex}`} className="outcome-rich-line-group">
                  {statement ? <span className="outcome-rich-statement">{statement}</span> : null}
                  {bullets.length > 0 ? (
                    <ul className="outcome-rich-bullets">
                      {bullets.map((bullet, bulletIndex) => (
                        <li key={`outcome-${index}-bullet-${lineIndex}-${bulletIndex}`}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default OutcomeCard;
