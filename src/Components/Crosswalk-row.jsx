import DroppableArea from "./Droppable-area";
import MatchesList from "./Matches-list";
import { splitOutcomeText } from "../utils/outcomeText";
import "./outcome-rich.css";

function CrosswalkRow({
  line,
  matchedIds,
  matchedLines,
  note,
  onNoteChange,
  onRemoveMatch,
  rowId,
}) {
  const { bullets, statement } = splitOutcomeText(line);

  return (
    <>
      <div className="outcome-card-item crosswalk-syll-card outcome-rich-content">
        {statement ? <span className="outcome-rich-statement">{statement}</span> : null}
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
