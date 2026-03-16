import OutcomeCard from "../Components/Outcome-card";
import DraggableCard from "../Components/Draggable-card";
import "./CrossWalk.css";
import { DragDropProvider } from "@dnd-kit/react";
import DroppableArea from "../Components/Droppable-area";
import { useMemo, useState } from "react";


function CrossWalk({ certLines, syllLines }) {
  const [matchesByRow, setMatchesByRow] = useState({});

  const certById = useMemo(
    () => Object.fromEntries(certLines.map((line, index) => [`cert-${index}`, line])),
    [certLines]
  );

  const handleDragEnd = (event) => {
    if (event.canceled) {
      return;
    }

    const draggedId = event.operation?.source?.id;
    const dropId = event.operation?.target?.id;

    if (!draggedId || !dropId) {
      return;
    }

    setMatchesByRow((previous) => {
      const next = { ...previous };

      Object.keys(next).forEach((rowId) => {
        if (next[rowId] === draggedId) {
          delete next[rowId];
        }
      });

      next[dropId] = draggedId;
      return next;
    });
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div id="crosswalk-div">
        <div id="horizontal-div">
        <h2>Learning Experience Outcomes</h2>
        <div id="crosswalk-cert-div">
          {certLines.map((line, index) => (
            <DraggableCard
              key={index}
              id={`cert-${index}`}
              className="crosswalk-cert-card"
              line={line}
            />
          ))}
        </div>
      </div>

      <div id="columns-div">
        <div id="crosswalk-syll">
          <h2>Syllabus Outcomes</h2>
          <OutcomeCard className="crosswalk-syll-card" lines={syllLines} />
        </div>
        <div id="crosswalk-match-div">
          <h2>Matches</h2>
          <div className="matches">
            {syllLines.map((line, index) => {
              const rowId = `drop-${index}`;
              const matchedId = matchesByRow[rowId];
              const matchedLine = matchedId ? certById[matchedId] : null;

              return (
                <DroppableArea key={index} id={rowId}>
                  {matchedLine || <span className="drop-placeholder">Drop outcome here</span>}
                </DroppableArea>
              );
            })}
          </div>
        </div>
        <div id="crosswalk-notes-div">
          <h2>Notes</h2>
          <div className="notes">
            {syllLines.map((line, index) => (
              <textarea key={index} placeholder="Add notes here..." />
            ))}
          </div>
        </div>
      </div>
    </div>
    </DragDropProvider>
  );
}
export default CrossWalk;
