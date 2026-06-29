import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faLink } from "@fortawesome/free-solid-svg-icons";
import { splitOutcomeText } from "../utils/outcomeText";
import "./outcome-rich.css";

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

function MatchesList({ matchedIds, matchedLines, certOutcomeLinks, onRemove }) {
  if (matchedLines.length === 0) {
    return <span className="drop-placeholder">Drop outcome here</span>;
  }

  return (
    <div className="matches-list">
      {matchedLines.map((matchedLine, matchedIndex) => {
        const matchedId = matchedIds[matchedIndex];
        const certIndex = matchedId?.startsWith("cert-") ? matchedId.slice(5) : "";
        const matchedLink = normalizeExternalUrl(
          certOutcomeLinks?.[certIndex] ?? certOutcomeLinks?.[toLineKey(matchedLine)]
        );
        const { bullets, statement } = splitOutcomeText(matchedLine);

        return (
          <div
            key={matchedId}
            className="draggable-card-item crosswalk-match-card"
          >
            {matchedLink ? (
              <a
                className="crosswalk-card-link-icon"
                href={matchedLink}
                target="_blank"
                rel="noreferrer"
                aria-label="Open matched outcome link"
                title="Open linked outcome"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <FontAwesomeIcon icon={faLink} className="icon-primary" />
              </a>
            ) : null}
            <FontAwesomeIcon
              className="close-icon"
              icon={faCircleXmark}
              onClick={() => onRemove(matchedId)}
            />
            <div className="outcome-rich-content">
              {statement ? <span className="outcome-rich-statement">{statement}</span> : null}
              {bullets.length > 0 ? (
                <ul className="outcome-rich-bullets">
                  {bullets.map((bullet, index) => (
                    <li key={`${matchedId}-bullet-${index}`}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MatchesList;
