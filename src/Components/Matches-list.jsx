import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { splitOutcomeText } from "../utils/outcomeText";
import "./outcome-rich.css";

function MatchesList({ matchedIds, matchedLines, onRemove }) {
  if (matchedLines.length === 0) {
    return <span className="drop-placeholder">Drop outcome here</span>;
  }

  return (
    <div className="matches-list">
      {matchedLines.map((matchedLine, matchedIndex) => {
        const { bullets, statement } = splitOutcomeText(matchedLine);

        return (
          <div
            key={matchedIds[matchedIndex]}
            className="draggable-card-item crosswalk-match-card"
          >
            <FontAwesomeIcon
              className="close-icon"
              icon={faCircleXmark}
              onClick={() => onRemove(matchedIds[matchedIndex])}
            />
            <div className="outcome-rich-content">
              {statement ? <span className="outcome-rich-statement">{statement}</span> : null}
              {bullets.length > 0 ? (
                <ul className="outcome-rich-bullets">
                  {bullets.map((bullet, index) => (
                    <li key={`${matchedIds[matchedIndex]}-bullet-${index}`}>{bullet}</li>
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
