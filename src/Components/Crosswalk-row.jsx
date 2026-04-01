import DroppableArea from "./Droppable-area";
import MatchesList from "./Matches-list";

function CrosswalkRow({
  line,
  matchedIds,
  matchedLines,
  note,
  onNoteChange,
  onRemoveMatch,
  rowId,
}) {
  return (
    <>
      <p className="outcome-card-item crosswalk-syll-card">{line}</p>
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
