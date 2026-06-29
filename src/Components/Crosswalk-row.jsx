import DroppableArea from "./Droppable-area";
import MatchesList from "./Matches-list";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { splitOutcomeText } from "../utils/outcomeText";
import "./outcome-rich.css";

function CrosswalkRow({
  line,
  matchedIds,
  matchedLines,
  certOutcomeLinks,
  syllabusLinkUrl,
  note,
  onNoteChange,
  onRemoveMatch,
  rowId,
}) {
  const { bullets, statement } = splitOutcomeText(line);

  return (
    <>
      <div className="outcome-card-item crosswalk-syll-card outcome-rich-content">
        {syllabusLinkUrl ? (
          <a
            className="crosswalk-card-link-icon"
            href={syllabusLinkUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open syllabus outcome link"
            title="Open linked file"
          >
            <FontAwesomeIcon icon={faLink} className="icon-primary" />
          </a>
        ) : null}
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
          certOutcomeLinks={certOutcomeLinks}
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
