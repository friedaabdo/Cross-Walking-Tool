import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

function MatchesList({ matchedIds, matchedLines, onRemove }) {
  if (matchedLines.length === 0) {
    return <span className="drop-placeholder">Drop outcome here</span>;
  }

  return (
    <div className="matches-list">
      {matchedLines.map((matchedLine, matchedIndex) => (
        <p
          key={matchedIds[matchedIndex]}
          className="draggable-card-item crosswalk-match-card"
        >
          <FontAwesomeIcon
            className="close-icon"
            icon={faCircleXmark}
            onClick={() => onRemove(matchedIds[matchedIndex])}
          />
          {matchedLine}
        </p>
      ))}
    </div>
  );
}

export default MatchesList;
