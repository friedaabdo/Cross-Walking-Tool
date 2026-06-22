import DraggableCard from "../Components/Draggable-card";
import "./CrossWalk.css";
import { DragDropProvider } from "@dnd-kit/react";
import { Fragment, useMemo } from "react";
import CrosswalkRow from "../Components/Crosswalk-row";
import downloadCrosswalkCsv from "../utils/csvExport";
import { normalizeToArray } from "../utils/collections";
import { useNavigate } from "react-router-dom";
import Button from "../Components/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faLink } from "@fortawesome/free-solid-svg-icons";

const normalizeExternalUrl = (url) => {
  const trimmedUrl = (url || "").trim();
  if (!trimmedUrl) {
    return "";
  }

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmedUrl) || trimmedUrl.startsWith("//")) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
};

const toLineKey = (line) => `line:${(line || "").trim()}`;

function CrossWalk({ 
  certLines, 
  syllLines, 
  certOutcomeLinks,
  syllOutcomeLinks,
  leTitle, 
  learningExperienceDescription,
  learningExperienceLink,
  ccTitle,
  cunyCourseDescription,
  syllabusFileUrl,
  syllabusFileName,
  matchesByRow,
  setMatchesByRow,
  notesByRow,
  setNotesByRow,
  draggedOnceById,
  setDraggedOnceById,
  courseId,
  experienceId,
  matchId,
}) {
  const navigate = useNavigate();
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

  const handleExportCsv = () => {
    downloadCrosswalkCsv({
      ccTitle,
      certById,
      certLines,
      certOutcomeLinks,
      draggedOnceById,
      leTitle,
      learningExperienceDescription,
      learningExperienceLink,
      matchesByRow,
      notesByRow,
      cunyCourseDescription,
      syllabusFileName,
      syllabusFileUrl,
      syllOutcomeLinks,
      syllLines,
    });
  };

  const handleBackNavigation = () => {
    navigate('/syllabus');
  };

  return (
    
    <DragDropProvider onDragEnd={handleDragEnd}>
      <h1>Now you're ready to crosswalk!</h1>
      <p>Here you can drag-and-drop individual items from the horizontal Learning Experience Outcomes menu to the “Matches” column, alongside the appropriate Course Learning Outcomes item.</p>
      <p>Once a Learning Experience Outcome is matched to a Course Learning Outcome, it will turn blue to help you keep track. The same Learning Experience Outcome can be matched against multiple Course Learning Outcomes if appropriate.</p>
      <p>You can add notes and remove matches as needed, and you can always go back to edit the items if you want. </p>
      <p>Note: 
        <ul>
          <li>If you navigate away from or close this page, your progress will be saved by the browser unless you choose to clear it in the home page.
          </li>
          <li>You may also export the crosswalk as a CSV file below at any time and it will save your progress if you choose to work on your crosswalk on a different device.
          </li>
        </ul>

</p>
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
              <FontAwesomeIcon icon={faLink} style={{ color: "rgb(70, 147, 207)" }} />
            </a>
          ) : null}
        </div>
        <div id="crosswalk-cert-div" onWheelCapture={handleCertWheel}>
          {certLines.map((line, index) => {
            const certId = `cert-${index}`;
            const certLink = normalizeExternalUrl(
              certOutcomeLinks?.[index] ?? certOutcomeLinks?.[toLineKey(line)]
            );
            const draggedClass = draggedOnceById[certId]
              ? "crosswalk-cert-card-dragged"
              : "";

            return (
              <DraggableCard
                key={index}
                id={certId}
                className={`crosswalk-cert-card ${draggedClass}`}
                line={line}
                linkUrl={certLink}
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
              aria-label="Open uploaded syllabus file"
              title={syllabusFileName ? `Open ${syllabusFileName}` : "Open uploaded syllabus file"}
            >
              <FontAwesomeIcon icon={faFile} style={{ color: "rgb(70, 147, 207)" }} />
            </a>
          ) : null}
        </div>
        <h2 className="grid-heading">Matches</h2>
        <h2 className="grid-heading">Notes</h2>

        {syllLines.map((line, index) => {
          const rowId = `drop-${index}`;
          const syllLink = normalizeExternalUrl(
            syllOutcomeLinks?.[index] ?? syllOutcomeLinks?.[toLineKey(line)]
          );
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
                certOutcomeLinks={certOutcomeLinks}
                syllabusLinkUrl={syllLink}
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
        <Button text="Back" onClick={handleBackNavigation} />
        <Button text="Export CSV" onClick={handleExportCsv} />
      </div>
    </DragDropProvider>
  );
}
export default CrossWalk;
