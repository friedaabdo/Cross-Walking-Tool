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

      const currentMatches = next[dropId];
      const matchesForRow = Array.isArray(currentMatches)
        ? currentMatches
        : currentMatches
          ? [currentMatches]
          : [];

      if (!matchesForRow.includes(draggedId)) {
        next[dropId] = [...matchesForRow, draggedId];
      }

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
          const currentMatches = matchesByRow[rowId];
          const matchedIds = Array.isArray(currentMatches)
            ? currentMatches
            : currentMatches
              ? [currentMatches]
              : [];
          const matchedLines = matchedIds
            .map((matchedId) => certById[matchedId])
            .filter(Boolean);

          return (
            <Fragment key={`row-${index}`}>
              <p className="outcome-card-item crosswalk-syll-card">{line}</p>
              <DroppableArea id={rowId}>
                {matchedLines.length > 0 ? (
                  <div className="matches-list">
                    {matchedLines.map((matchedLine, matchedIndex) => (
                      <p
                        key={matchedIds[matchedIndex]}
                        className="draggable-card-item crosswalk-match-card"
                      >
                        {matchedLine}
                      </p>
                    ))}
                  </div>
                ) : (
                  <span className="drop-placeholder">Drop outcome here</span>
                )}
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
