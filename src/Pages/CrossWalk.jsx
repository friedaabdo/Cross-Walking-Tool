import DraggableCard from "../Components/Draggable-card";
import "./CrossWalk.css";
import { DragDropProvider } from "@dnd-kit/react";
import DroppableArea from "../Components/Droppable-area";
import { Fragment, useMemo, useState } from "react";


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

  const handleCertWheel = (event) => {
    const container = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    container.scrollLeft += event.deltaY + event.deltaX;
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div id="crosswalk-div">
        <div id="horizontal-div">
        <h2>Learning Experience Outcomes</h2>
        <div id="crosswalk-cert-div" onWheelCapture={handleCertWheel}>
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
        <h2 className="grid-heading">Syllabus Outcomes</h2>
        <h2 className="grid-heading">Matches</h2>
        <h2 className="grid-heading">Notes</h2>

        {syllLines.map((line, index) => {
          const rowId = `drop-${index}`;
          const matchedId = matchesByRow[rowId];
          const matchedLine = matchedId ? certById[matchedId] : null;

          return (
            <Fragment key={`row-${index}`}>
              <p className="outcome-card-item crosswalk-syll-card">{line}</p>
              <DroppableArea id={rowId}>
                {matchedLine || <span className="drop-placeholder">Drop outcome here</span>}
              </DroppableArea>
              <textarea placeholder="Add notes here..." />
            </Fragment>
          );
        })}
      </div>
    </div>
    </DragDropProvider>
  );
}
export default CrossWalk;
