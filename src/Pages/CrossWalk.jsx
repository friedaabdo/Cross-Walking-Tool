import DraggableCard from "../Components/Draggable-card";
import "./CrossWalk.css";
import { DragDropProvider } from "@dnd-kit/react";
import { Fragment, useMemo } from "react";
import CrosswalkRow from "../Components/Crosswalk-row";
import useCrosswalkState from "../hooks/useCrosswalkState";
import downloadCrosswalkCsv from "../utils/csvExport";

function CrossWalk({ certLines, syllLines, leTitle, ccTitle }) {
  const {
    draggedOnceById,
    notesByRow,
    handleDragEnd,
    handleNotesChange,
    handleRemoveMatch,
    getMatchesForRow,
    matchesByRow,
  } = useCrosswalkState();

  const certById = useMemo(
    () => Object.fromEntries(certLines.map((line, index) => [`cert-${index}`, line])),
    [certLines]
  );

  const handleCertWheel = (event) => {
    const container = event.currentTarget;
    // event.preventDefault();
    event.stopPropagation();
    container.scrollLeft += event.deltaY + event.deltaX;
  };

  const handleExportCsv = () => {
    downloadCrosswalkCsv({ certById, matchesByRow, notesByRow, syllLines });
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div id="crosswalk-div">
        <div id="horizontal-div">
        <h2>{leTitle} Outcomes</h2>
        <div id="crosswalk-cert-div" onWheelCapture={handleCertWheel}>
          {certLines.map((line, index) => {
            const certId = `cert-${index}`;
            const draggedClass = draggedOnceById[certId]
              ? "crosswalk-cert-card-dragged"
              : "";

            return (
              <DraggableCard
                key={index}
                id={certId}
                className={`crosswalk-cert-card ${draggedClass}`}
                line={line}
              />
            );
          })}
        </div>
      </div>

     

      <div id="columns-div">
        <h2 className="grid-heading">{ccTitle} Outcomes</h2>
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
              <CrosswalkRow
                line={line}
                matchedIds={matchedIds}
                matchedLines={matchedLines}
                note={notesByRow[rowId] ?? ""}
                onNoteChange={handleNotesChange}
                onRemoveMatch={handleRemoveMatch}
                rowId={rowId}
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
