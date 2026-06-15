// OutcomesInput page
// - Renders a textarea for entering learning outcomes or syllabus lines
// - Parses and normalizes input (plain text, bullets, or pasted HTML)
// - Shows a confirmation panel with parsed lines and allows navigation
import "./OutcomesInput.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faLink } from "@fortawesome/free-solid-svg-icons";
import Textarea from "../Components/textarea";
import ConfirmationArea from "../Components/confirmationArea";
import Button from "../Components/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { parseInputToOutcomeSections } from "../utils/outcomeText";

// Ensure external links have a valid scheme. If no scheme present, assume https://
const normalizeExternalUrl = (url) => {
  const trimmedUrl = (url || "").trim();
  if (!trimmedUrl) {
    return "";
  }

  // Keep existing schemes (http, https, mailto, etc.) untouched.
  if (
    /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmedUrl) ||
    trimmedUrl.startsWith("//")
  ) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
};

// Parsing handled by shared utilities; see ../utils/outcomeText.js

// The main page component. Props are passed from the top-level App state.
function OutcomesInput({
  pageName,
  certLines,
  setCertLines,
  outcomeLinks,
  setOutcomeLinks,
  syllLines,
  setSyllLines,
  draftValue,
  setDraftValue,
  leTitle,
  learningExperienceLink,
  ccTitle,
  syllabusFileUrl,
  syllabusFileName,
  learningExperienceDescription,
  cunyCourseDescription,
}) {
  // Determine whether this is the Learning Experience (certificate) page or Syllabus page
  const isCertificatePage = pageName.toLowerCase() === "learning experience";

  // Choose which lines and setters to use based on page type
  const lines = isCertificatePage ? certLines : syllLines;
  const setLines = isCertificatePage ? setCertLines : setSyllLines;

  // Compute UI strings and flags
  const title = isCertificatePage ? leTitle || "Learning Experience" : ccTitle || "CUNY Course";
  const hasLearningExperienceLink = isCertificatePage && Boolean((learningExperienceLink || "").trim());
  const resolvedLearningExperienceLink = normalizeExternalUrl(learningExperienceLink);
  const hasSyllabusFile = !isCertificatePage && Boolean(syllabusFileUrl);
  const hasSubmitted = lines.length > 0; // true when there are parsed outcome lines
  const inputValue = draftValue || lines.join("\n"); // textarea value (draft or serialized lines)

  const [parsedSections, setParsedSections] = useState([]);

  // Update the draft textarea value (does not overwrite saved lines until Submit)
  const handleInputChange = (value) => {
    setDraftValue(value);
  };

  // Parse the input and save lines to the appropriate state (cert or syllabus)
  const handleSubmit = () => {
    const sections = parseInputToOutcomeSections(inputValue);

    // Build flat lines while keeping bullets attached to the prior non-bullet line
    const items = [];
    sections.forEach((sec) => {
      let lastItem = null;
      const linesArr = Array.isArray(sec?.lines) ? sec.lines : sec?.line ? [sec.line] : [];
      linesArr.forEach((rawLine) => {
        const line = String(rawLine ?? "").trim();
        if (!line) return;
        if (/^[-]\s+/.test(line)) {
          if (lastItem) {
            lastItem = (lastItem || "") + "\n" + line;
            items[items.length - 1] = lastItem;
          } else {
            // bullet without prior main line -> save as standalone
            items.push(line);
            lastItem = line;
          }
        } else {
          items.push(line);
          lastItem = line;
        }
      });
    });

    setLines(items);
    setParsedSections(sections);
  };

  const navigate = useNavigate();
  // Navigation helpers used after confirming or stepping through pages
  const navigateToSyllabus = () => {
    navigate("/syllabus");
  };
  const navigateToCrosswalk = () => {
    navigate("/crosswalk");
  };

  // When user confirms outcomes, go to the next logical page
  const handleConfirmNavigation = () => {
    if (isCertificatePage) {
      navigateToSyllabus();
      return;
    }

    navigateToCrosswalk();
  };

  // Back button behavior depends on current page
  const handleBackNavigation = () => {
    if (isCertificatePage) {
      navigate("/");
      return;
    }

    navigate("/learning-experience");
  };

  return (
    <div id="outcomes-div">
      <p>Description:</p>
      {/* Show the appropriate description text for the selected page type */}
      {isCertificatePage && <p>{learningExperienceDescription}</p>}
      {!isCertificatePage && <p>{cunyCourseDescription}</p>}
      <p>
        In the box below, input a list of content covered by the credential or training program. This could be learning outcomes, competencies, key topics, or other specific details. 
      </p>
      <p>
       Note:
        <ul>
            <li>Start a new line for each individual outcome or competency.</li>
            <li>If outcomes/competencies should be organized into categories, use the bullet feature to create sub-lines.</li>
        </ul>
      </p>
      {hasSubmitted && (
        <p id='review-note'>
          Review the box on the right to see how the items will appear on the crosswalk. <br />Use the box on the left to make edits. Hit “Submit” see your changes reflected on the right. <br />Once everything looks good, click “Confirm Outcomes” to move to the next page. 
        </p>
      )}

      <div className="outcomes-layout">
        <section className="outcomes-input-panel">
          <div className="outcomes-title-row">
            {/* Page title and optional links (learning experience URL or uploaded syllabus) */}
            <h1>{title} Outcomes, Competencies, Key Topics</h1>
            {hasLearningExperienceLink && (
              <a
                className="outcomes-title-link"
                href={resolvedLearningExperienceLink}
                target="_blank"
                rel="noreferrer"
                aria-label="Open learning experience link"
                title="Open learning experience"
              >
                <FontAwesomeIcon
                  icon={faLink}
                  style={{ color: "rgb(70, 147, 207)" }}
                />
              </a>
            )}
            {hasSyllabusFile && (
              <a
                className="outcomes-title-link"
                href={syllabusFileUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open uploaded syllabus file"
                title={
                  syllabusFileName
                    ? `Open ${syllabusFileName}`
                    : "Open uploaded syllabus file"
                }
              >
                <FontAwesomeIcon
                  icon={faFile}
                  style={{ color: "rgb(70, 147, 207)" }}
                />
              </a>
            )}
            {/*  */}
          </div>
          {/* Main textarea component where users enter/paste outcomes */}
          <Textarea
            pageName={title}
            value={inputValue}
            onChange={handleInputChange}
          />
          <p>Once you’ve added all the information, hit submit and on the next page, you will be able to review and edit how the items you’ve entered will appear on the crosswalk. 
</p>
          {/* Action buttons: go back or submit parsed lines */}
          <div className="outcomes-input-actions">
            <Button onClick={handleBackNavigation} text="Back" />
            <Button onClick={handleSubmit} text="Submit" />
          </div>
        </section>

        {/* Confirmation panel appears after submit and shows parsed lines */}
        {hasSubmitted && (
          <section className="outcomes-confirmation-panel">
            <ConfirmationArea
              pageName={pageName}
              title={title}
              lines={lines}
              sections={parsedSections}
              outcomeLinks={outcomeLinks}
              setOutcomeLinks={setOutcomeLinks}
            />
            <Button
              onClick={handleConfirmNavigation}
              text={`Confirm ${title} Outcomes`}
            />
          </section>
        )}
      </div>
    </div>
  );
}

export default OutcomesInput;
