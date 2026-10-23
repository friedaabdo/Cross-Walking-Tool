import DraggableCard from "../Components/DraggableCard.jsx";
import "./CrossWalk.css";
import { DragDropProvider } from "@dnd-kit/react";
import { useMemo, useState } from "react";
import CrosswalkRow from "../Components/CrosswalkRow.jsx";
import { downloadCrosswalkPdf } from "../utils/crosswalkPdf";
import { normalizeToArray } from "../utils/collections";
import { saveMatchState } from "../utils/matchDetails";
import { normalizeExternalUrl, openDataUrlInNewTab } from "../utils/links";
import Button from "../Components/Button.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faLink } from "@fortawesome/free-solid-svg-icons";

function CrossWalk({
  certLines,
  syllLines,
  certOutcomeRows = [],
  syllOutcomeRows = [],
  leTitle,
  learningExperienceLink,
  ccTitle,
  syllabusFileUrl,
  syllabusFileName,
  matchesByRow,
  setMatchesByRow,
  notesByRow,
  setNotesByRow,
  draggedOnceById,
  setDraggedOnceById,
  matchId,
  onBack,
}) {
  const [saveStatus, setSaveStatus] = useState("");
  const hasLearningExperienceLink = Boolean((learningExperienceLink || "").trim());
  const resolvedLearningExperienceLink = normalizeExternalUrl(learningExperienceLink);
  const hasSyllabusFile = Boolean(syllabusFileUrl);
  const getMatchesForRow = (rowId) => normalizeToArray(matchesByRow[rowId]);

  const handleDragEnd = (event) => {
    if (event.canceled) {
      return;
    }

    const draggedId = event.operation?.source?.id;
    const dropId = event.operation?.target?.id;

    if (draggedId?.startsWith("cert-")) {
      setDraggedOnceById((previous) => {
        if (previous[draggedId]) {
          return previous;
        }

        return { ...previous, [draggedId]: true };
      });
    }

    if (!draggedId || !dropId) {
      return;
    }

    setMatchesByRow((previous) => {
      const next = { ...previous };
      const matchesForRow = normalizeToArray(next[dropId]);

      if (!matchesForRow.includes(draggedId)) {
        next[dropId] = [...matchesForRow, draggedId];
      }

      return next;
    });
  };

  const handleRemoveMatch = (rowId, matchedId) => {
    setMatchesByRow((previous) => {
      const matchesForRow = normalizeToArray(previous[rowId]);
      const nextMatches = matchesForRow.filter((id) => id !== matchedId);

      if (nextMatches.length === matchesForRow.length) {
        return previous;
      }

      return {
        ...previous,
        [rowId]: nextMatches,
      };
    });
  };

  const handleNotesChange = (rowId, value) => {
    setNotesByRow((previous) => ({ ...previous, [rowId]: value }));
  };

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

  const handleExportPdf = () => {
    try {
      downloadCrosswalkPdf({
        leTitle,
        ccTitle,
        certLines,
        certOutcomeRows,
        syllLines,
        syllOutcomeRows,
        matchesByRow,
        notesByRow,
      });
    } catch (error) {
      console.error("Error exporting crosswalk PDF:", error);
      setSaveStatus("PDF export failed.");
    }
  };

  const handleSave = async () => {
    if (!matchId) {
      setSaveStatus("Missing match id.");
      return;
    }

    try {
      setSaveStatus("Saving...");
      await saveMatchState(matchId, {
        courseOutcomeRows: syllOutcomeRows,
        experienceOutcomeRows: certOutcomeRows,
        matchesByRow,
        notesByRow,
      });
      setSaveStatus("Saved.");
    } catch (error) {
      console.error("Error saving match details:", error);
      setSaveStatus("Save failed.");
    }
  };

  return (
    
    <DragDropProvider onDragEnd={handleDragEnd}>
      <h1>Now you're ready to crosswalk!</h1>
      <p>Here you can drag-and-drop individual items from the horizontal Learning Experience Outcomes menu to the “Matches” column, alongside the appropriate Course Learning Outcomes item.</p>
      <p>Once a Learning Experience Outcome is matched to a Course Learning Outcome, it will turn blue to help you keep track. The same Learning Experience Outcome can be matched against multiple Course Learning Outcomes if appropriate.</p>
      <p>You can add notes and remove matches as needed, and you can always go back to edit the items if you want.</p>
      <div>
        <p>Note:</p>
        <ul>
          <li>Click Save to store your matches and notes. They will be here the next time you open this crosswalk.</li>
          <li>Use Export PDF to download a copy of the crosswalk, including every learning experience outcome and your matches.</li>
        </ul>
      </div>
      <p>This is a brand-new tool, still in development! We appreciate you checking it out, and we welcome your comments to help us improve. If you want to leave any feedback or report any bugs, please click <a href="https://docs.google.com/forms/d/e/1FAIpQLSdh2duwP_A12Wl-CFYIq1GqYRRUTbv9UeBTVfYXu8bBEScf5Q/viewform?usp=dialog" target="_blank" rel="noreferrer">here</a> and fill out the form. Thank you!</p>
      <div id="crosswalk-div">
        <div id="horizontal-div">
        <div className="crosswalk-heading-row">
          <h2>{leTitle || "Learning Experience"} Outcomes</h2>
          
          
          {hasLearningExperienceLink ? (
            <a
              className="crosswalk-title-link"
              href={resolvedLearningExperienceLink}
              target="_blank"
              rel="noreferrer"
              aria-label="Open learning experience link"
              title="Open learning experience"
            >
              <FontAwesomeIcon icon={faLink} className="icon-primary" />
            </a>
          ) : null}
        </div>
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
                category={certOutcomeRows[index]?.category}
              />
            );
          })}
        </div>
      </div>

     

      <div id="columns-div">
        <div className="grid-heading crosswalk-heading-row">
          <h2>{ccTitle} Learning Objectives</h2>
          {hasSyllabusFile ? (
            <a
              className="crosswalk-title-link"
              href={syllabusFileUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => {
                if (syllabusFileUrl.startsWith("data:")) {
                  event.preventDefault();
                  openDataUrlInNewTab(syllabusFileUrl);
                }
              }}
              aria-label="Open uploaded syllabus file"
              title={syllabusFileName ? `Open ${syllabusFileName}` : "Open uploaded syllabus file"}
            >
              <FontAwesomeIcon icon={faFile} className="icon-primary" />
            </a>
          ) : null}
        </div>
        <h2 className="grid-heading">Matches</h2>
        <h2 className="grid-heading">Notes</h2>

        {syllLines.map((line, index) => {
          const rowId = `drop-${index}`;
          const matchedIds = getMatchesForRow(rowId);
          const matchedLines = matchedIds
            .map((matchedId) => certById[matchedId])
            .filter(Boolean);

          return (
            <CrosswalkRow
              key={rowId}
              line={line}
              category={syllOutcomeRows[index]?.category}
              matchedIds={matchedIds}
              matchedLines={matchedLines}
              matchedOutcomeRows={certOutcomeRows}
              note={notesByRow[rowId] ?? ""}
              onNoteChange={handleNotesChange}
              onRemoveMatch={handleRemoveMatch}
              rowId={rowId}
            />
          );
        })}
      </div>
    </div>
     <div id="columns-actions">
        <Button text="Back" onClick={onBack} />
        <Button text="Save" onClick={handleSave} />
        <Button text="Export PDF" onClick={handleExportPdf} />
      </div>
      {saveStatus ? <p>{saveStatus}</p> : null}
    </DragDropProvider>
  );
}
export default CrossWalk;
