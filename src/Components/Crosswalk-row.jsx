import DroppableArea from "./Droppable-area";
import MatchesList from "./Matches-list";
import { useLayoutEffect, useRef } from "react";

const splitOutcomeText = (text) => {
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
  const notesRef = useRef(null);

  const resizeNotes = (element = notesRef.current) => {
    if (!element) {
      return;
    }

    element.style.height = "0px";
    element.style.height = `${element.scrollHeight}px`;
  };

  useLayoutEffect(() => {
    resizeNotes();
  }, [note]);

  return (
    <>
      <div className="outcome-card-item crosswalk-syll-card">
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
        ref={notesRef}
        placeholder="Add notes here..."
        value={note}
        onInput={(event) => {
          resizeNotes(event.currentTarget);
        }}
        onFocus={(event) => {
          resizeNotes(event.currentTarget);
        }}
        onChange={(event) => {
          onNoteChange(rowId, event.target.value);
          requestAnimationFrame(() => {
            resizeNotes(event.target);
          });
        }}
      />
    </>
  );
}

export default CrosswalkRow;
