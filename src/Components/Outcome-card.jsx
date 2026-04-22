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

function OutcomeCard({ lines, className, containerClassName, showTopRightPlusIcon = false }) {
  const [linkDraftByCard, setLinkDraftByCard] = useState({});
  const [savedLinkByCard, setSavedLinkByCard] = useState({});
  const [openTooltipCardKey, setOpenTooltipCardKey] = useState(null);

  const handleDraftChange = (cardKey, value) => {
    setLinkDraftByCard((previous) => ({
      ...previous,
      [cardKey]: value,
    }));
  };

  const handleSaveLink = (cardKey) => {
    const normalizedLink = normalizeExternalUrl(linkDraftByCard[cardKey]);
    if (!normalizedLink) {
      return;
    }

    setSavedLinkByCard((previous) => ({
      ...previous,
      [cardKey]: normalizedLink,
    }));
    setLinkDraftByCard((previous) => ({
      ...previous,
      [cardKey]: normalizedLink,
    }));
  };

  return (
    <div className={containerClassName}>
      {lines.map((line, index) => {
        const cardKey = `${line}-${index}`;
        const { bullets, statement } = splitOutcomeText(line);
        const draftLink = linkDraftByCard[cardKey] ?? "";
        const hasSavedLink = Boolean(savedLinkByCard[cardKey]);

        return (
          <div key={cardKey} className={`outcome-card-item outcome-rich-content ${className ?? ""}`}>
            {showTopRightPlusIcon ? (
              <div className="outcome-card-top-right-control">
                <button
                  type="button"
                  className="outcome-card-top-right-icon"
                  onClick={() =>
                    setOpenTooltipCardKey((previous) => (previous === cardKey ? null : cardKey))
                  }
                  aria-label="Add outcome link"
                  aria-expanded={openTooltipCardKey === cardKey}
                >
                  <FontAwesomeIcon icon={faLink} style={{ color: "rgb(70, 147, 207)" }} />
                </button>
                <div
                  className={`outcome-card-link-tooltip ${openTooltipCardKey === cardKey ? "is-open" : ""}`}
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
                    onChange={(event) => handleDraftChange(cardKey, event.target.value)}
                  />
                  <button
                    className="outcome-card-link-button"
                    type="button"
                    onClick={() => handleSaveLink(cardKey)}
                  >
                    Add
                  </button>
                  {hasSavedLink ? (
                    <a
                      className="outcome-card-link-preview"
                      href={savedLinkByCard[cardKey]}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open link
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
            {statement ? <span className="outcome-rich-statement">{statement}</span> : null}
            {bullets.length > 0 ? (
              <ul className="outcome-rich-bullets">
                {bullets.map((bullet, bulletIndex) => (
                  <li key={`outcome-${index}-bullet-${bulletIndex}`}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default OutcomeCard;
