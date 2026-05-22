// create a react page with a text box input and submit button.
import "./OutcomesInput.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faLink } from "@fortawesome/free-solid-svg-icons";
import Textarea from "../Components/textarea";
import ConfirmationArea from "../Components/confirmationArea";
import Button from "../Components/button";
import { useNavigate } from "react-router-dom";

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

const parseInputToOutcomeLines = (value) => {
  if (!value) {
    return [];
  }

  if (!value.includes("<")) {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
  }

  const container = document.createElement("div");
  container.innerHTML = value;

  const lines = [];
  let currentLine = ""; // content of the card being built
  let currentHeading = ""; // active heading text
  let baseCardCreated = false; // whether we've created the first card under current heading
  const HEADING_TOKEN = "||HEADING||";

  const pushCurrentLine = () => {
    const trimmed = currentLine.trim();
    if (trimmed) {
      lines.push(trimmed);
    }
    currentLine = "";
  };

  Array.from(container.children).forEach((node) => {
    const tag = node.tagName.toLowerCase();

    // detect bold/heading nodes: explicit tags, header tags, or fully-bold wrapped content
    const isBoldTag = tag === "b" || tag === "strong" || /^h[1-6]$/.test(tag);
    const innerBold =
      node.querySelector &&
      node.querySelector("b, strong, span[style*='font-weight: bold'], span[style*='font-weight:700'], span[style*='font-weight: 700']");
    const nodeText = node.textContent?.trim() ?? "";
    const innerBoldText = innerBold?.textContent?.trim() ?? "";
    const isHeadingNode = isBoldTag || (innerBoldText && nodeText === innerBoldText);

    if (isHeadingNode) {
      // flush any existing card
      pushCurrentLine();
      // start a new heading context
      currentHeading = node.textContent?.trim() ?? "";
      baseCardCreated = false;
      currentLine = "";
      return;
    }

    if (tag === "ul" || tag === "ol") {
      const bullets = Array.from(node.querySelectorAll("li"))
        .map((li) => li.textContent?.trim() ?? "")
        .filter((item) => item !== "");

      if (bullets.length === 0) {
        return;
      }

      // If there's an active currentLine (card in progress), append bullets to it
      const bulletText = bullets.map((item) => `- ${item}`).join("\n");
      if (currentLine) {
        currentLine = `${currentLine}\n${bulletText}`;
      } else if (currentHeading) {
        // start a new card with the heading and bullets (mark heading token)
        currentLine = `${HEADING_TOKEN}${currentHeading}\n${bulletText}`;
        baseCardCreated = true;
      } else {
        // no heading context: start a plain bullets card
        currentLine = bulletText;
      }
      return;
    }

    const blockText = node.textContent?.trim() ?? "";
    if (!blockText) {
      return;
    }

    // Non-bullet block handling
    if (currentHeading && !baseCardCreated) {
      // first card under heading: include heading + this block (mark heading token)
      currentLine = `${HEADING_TOKEN}${currentHeading}\n${blockText}`;
      baseCardCreated = true;
      return;
    }

    if (currentHeading && baseCardCreated) {
      // subsequent non-bullet under same heading: finalize previous card,
      // then start a new card for this block (allow bullets to attach later)
      pushCurrentLine();
      currentLine = `${HEADING_TOKEN}${currentHeading}\n${blockText}`;
      baseCardCreated = true;
      return;
    }

    // No active heading context: each block becomes its own card
    if (currentLine) {
      pushCurrentLine();
    }
    currentLine = blockText;
  });

  pushCurrentLine();
  return lines;
};

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
  const isCertificatePage = pageName.toLowerCase() === "learning experience";
  const lines = isCertificatePage ? certLines : syllLines;
  const setLines = isCertificatePage ? setCertLines : setSyllLines;
  const title = isCertificatePage ? leTitle || "Learning Experience" : ccTitle || "CUNY Course";
  const hasLearningExperienceLink =
    isCertificatePage && Boolean((learningExperienceLink || "").trim());
  const resolvedLearningExperienceLink = normalizeExternalUrl(
    learningExperienceLink,
  );
  const hasSyllabusFile = !isCertificatePage && Boolean(syllabusFileUrl);
  const hasSubmitted = lines.length > 0;
  const inputValue = draftValue || lines.join("\n");

  const handleInputChange = (value) => {
    setDraftValue(value);
  };

  const handleSubmit = () => {
    
    const submittedLines = parseInputToOutcomeLines(inputValue);
    setLines(submittedLines);
  };

  const navigate = useNavigate();
  const navigateToSyllabus = () => {
    navigate("/syllabus");
  };
  const navigateToCrosswalk = () => {
    navigate("/crosswalk");
  };

  const handleConfirmNavigation = () => {
    if (isCertificatePage) {
      navigateToSyllabus();
      return;
    }

    navigateToCrosswalk();
  };

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
      {/* if it is a certificate page show the learning experience description */}
      {isCertificatePage && <p>{learningExperienceDescription}</p>}
      {/* if it is a syllabus page show the cunycourse description */}
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
          <Textarea
            pageName={title}
            value={inputValue}
            onChange={handleInputChange}
          />
          <p>Once you’ve added all the information, hit submit and on the next page, you will be able to review and edit how the items you’ve entered will appear on the crosswalk. 
</p>
          <div className="outcomes-input-actions">
            <Button onClick={handleBackNavigation} text="Back" />
            <Button onClick={handleSubmit} text="Submit" />
          </div>
        </section>

        {hasSubmitted && (
          <section className="outcomes-confirmation-panel">
            <ConfirmationArea
              pageName={pageName}
              title={title}
              lines={lines}
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
