import DroppableArea from "./DroppableArea.jsx";
import MatchesList from "./MatchesList.jsx";
import { splitOutcomeDisplayParts } from "../utils/outcomeText";
import "./OutcomeRich.css";

function CrosswalkRow({
  line,
  category,
  matchedIds,
  matchedLines,
  matchedOutcomeRows,
  note,
  onNoteChange,
  onRemoveMatch,
  rowId,
}) {
  const { bullets, heading, statementBody } = splitOutcomeDisplayParts(line);

  return (
    <>
      <div className="outcome-card-item crosswalk-syll-card outcome-rich-content">
        {category || heading ? (
          <div className="outcome-rich-heading">
            <strong>{category || heading}</strong>
          </div>
        ) : null}
        {statementBody ? <span className="outcome-rich-statement">{statementBody}</span> : null}
        {bullets.length > 0 ? (
          <ul className="outcome-rich-bullets">
            {bullets.map((bullet, index) => (
              <li key={`syll-${rowId}-${index}`}>{bullet}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <DroppableArea id={rowId}>
        <MatchesList
          matchedIds={matchedIds}
          matchedLines={matchedLines}
          matchedOutcomeRows={matchedOutcomeRows}
          onRemove={(matchedId) => onRemoveMatch(rowId, matchedId)}
        />
      </DroppableArea>
      <textarea
        placeholder="Add notes here..."
        value={note}
        onChange={(event) => {
          onNoteChange(rowId, event.target.value);
        }}
      />
    </>
  );
}

export default CrosswalkRow;
