import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { splitOutcomeDisplayParts } from "../utils/outcomeText";
import "./OutcomeRich.css";

function MatchesList({ matchedIds, matchedLines, matchedOutcomeRows = [], onRemove }) {
  if (matchedLines.length === 0) {
    return <span className="drop-placeholder">Drop outcome here</span>;
  }

  return (
    <div className="matches-list">
      {matchedLines.map((matchedLine, matchedIndex) => {
        const matchedId = matchedIds[matchedIndex];
        const certIndex = matchedId?.startsWith("cert-") ? matchedId.slice(5) : "";
        const category = certIndex ? matchedOutcomeRows[Number(certIndex)]?.category : "";
        const { bullets, heading, statementBody } = splitOutcomeDisplayParts(matchedLine);

        return (
          <div
            key={matchedId}
            className="draggable-card-item crosswalk-match-card"
          >
            <FontAwesomeIcon
              className="close-icon"
              icon={faCircleXmark}
              onClick={() => onRemove(matchedId)}
            />
            <div className="outcome-rich-content">
              {category || heading ? (
                <div className="outcome-rich-heading">
                  <strong>{category || heading}</strong>
                </div>
              ) : null}
              {statementBody ? <span className="outcome-rich-statement">{statementBody}</span> : null}
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
