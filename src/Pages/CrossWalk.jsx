import DraggableCard from "../Components/Draggable-card";
import "./CrossWalk.css";
import { DragDropProvider } from "@dnd-kit/react";
import DroppableArea from "../Components/Droppable-area";
import { Fragment, useMemo, useState } from "react";


function CrossWalk({ certLines, syllLines }) {
  const [matchesByRow, setMatchesByRow] = useState({});
  const [notesByRow, setNotesByRow] = useState({});

  const normalizeMatches = (value) =>
    Array.isArray(value) ? value : value ? [value] : [];

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
      const matchesForRow = normalizeMatches(next[dropId]);

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

  const getMatchesForRow = (rowId) => {
    return normalizeMatches(matchesByRow[rowId]);
  };

  const escapeCsvCell = (value) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const handleExportCsv = () => {
    const header = ["Syllabus Outcome", "Matches", "Notes"];

    const rows = syllLines.map((line, index) => {
      const rowId = `drop-${index}`;
      const matchedLines = getMatchesForRow(rowId)
        .map((matchedId) => certById[matchedId])
        .filter(Boolean);

      return [line, matchedLines.join("\r\n"), notesByRow[rowId] ?? ""];
    });

    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
      .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = `crosswalk-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
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
          const matchedIds = getMatchesForRow(rowId);
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
              <textarea
                placeholder="Add notes here..."
                value={notesByRow[rowId] ?? ""}
                onChange={(event) => {
                  const { value } = event.target;
                  setNotesByRow((previous) => ({ ...previous, [rowId]: value }));
                }}
              />
            </Fragment>
          );
        })}
      </div>
    </div>
     <div id="columns-actions">
        <button type="button" id="export-csv-button" onClick={handleExportCsv}>
          Export CSV
        </button>
      </div>
    </DragDropProvider>
  );
}
export default CrossWalk;
