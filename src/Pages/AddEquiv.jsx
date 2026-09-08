import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import InputLine from "../Components/InputLine.jsx";
import Textarea from "../Components/Textarea.jsx";
import OutcomeCard from "../Components/OutcomeCard.jsx";
import { parseInputToOutcomeSections } from "../utils/outcomeText";
import "./CreateTemplate.css";

function Add_Equiv({
  cunyCourseTitle,
  setCunyCourseTitle,
  cunyCourseDescription,
  setCunyCourseDescription,
  syllabusFileUrl,
  setSyllabusFileUrl,
  syllabusFileName,
  setSyllabusFileName,
  outcomes,
  setOutcomes,
  outcomesDraft,
  setOutcomesDraft,
  clearCrosswalkDraft,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const courseId = queryParams.get("courseId");
  const experienceId = queryParams.get("experienceId");
 

  const handleParseOutcomes = () => {
    const parsedOutcomes = parseInputToOutcomeSections(outcomesDraft);
    setOutcomes(parsedOutcomes);
  };

  const buildOutcomesPayload = (sections) => {
    const items = [];

    (sections || []).forEach((sec) => {
      const header = sec?.header ?? "";
      const lines = Array.isArray(sec?.lines) ? sec.lines : sec?.line ? [sec.line] : [];

      let lastItem = null;

      lines.forEach((rawLine) => {
        const line = String(rawLine ?? "").trim();
        if (!line) {
          return;
        }

        if (/^[-]\s+/.test(line)) {
          if (lastItem) {
            lastItem.outcomeText = `${lastItem.outcomeText}\n${line}`;
          } else {
            const item = { outcomeText: line, category: String(header).trim() || null };
            items.push(item);
            lastItem = item;
          }
        } else {
          const item = { outcomeText: line, category: String(header).trim() || null };
          items.push(item);
          lastItem = item;
        }
      });
    });

    return items;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!courseId) {
      console.error("Missing courseId in Add_Equiv URL");
      return;
    }

    if (!experienceId) {
      console.error("Missing experienceId in Add_Equiv URL");
      return;
    }

    const outcomesPayload = buildOutcomesPayload(outcomes);

    axios
      .put(`/api/cuny-courses/${courseId}`, {
        title: cunyCourseTitle,
        description: cunyCourseDescription,
        syllabusFileName,
        syllabusFileUrl,
      })
      .then(() =>
        axios.post("/api/outcomes/course", {
          courseId,
          outcomes: outcomesPayload,
        })
      )
      .then(() => {
        clearCrosswalkDraft?.();
        navigate(`/crosswalk?courseId=${courseId}&experienceId=${experienceId}&matchId=${queryParams.get("matchId") ?? ""}`);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div id="create-template">
      <h1>Add CUNY Course Page</h1>
      <p>Create a possible equivalency that can be crosswalked to a learning experience.</p>

      <div className="main-data">
        <h4>CUNY Course</h4>

        <label htmlFor="cunyCourseTitle">Course Title:</label>
        <InputLine
          placeholder="ex. PSY 101"
          value={cunyCourseTitle}
          onChange={(event) => setCunyCourseTitle(event.target.value)}
        />

        <label htmlFor="cunyCourseDescription">Course Description:</label>
        <textarea
          className="home-description-textarea"
          placeholder="Enter a description of the CUNY course"
          value={cunyCourseDescription}
          onChange={(event) => setCunyCourseDescription(event.target.value)}
          rows={4}
        />

        <label htmlFor="syllabusFileName">Syllabus File Name:</label>
        <InputLine
          placeholder="ex. psy101_syllabus.pdf"
          value={syllabusFileName}
          onChange={(event) => setSyllabusFileName(event.target.value)}
        />

        <label htmlFor="syllabusFileUrl">Syllabus Link / File URL:</label>
        <InputLine
          placeholder="https://example.com/syllabus.pdf"
          value={syllabusFileUrl}
          onChange={(event) => setSyllabusFileUrl(event.target.value)}
        />
      </div>

      <div className="outcomes-input">
        <h4>Possible Equivalency Outcomes</h4>
        <Textarea pageName="Possible Equivalency Outcomes" value={outcomesDraft} onChange={setOutcomesDraft} />
        <button onClick={handleParseOutcomes}>Parse Outcomes</button>
      </div>

      <div className="outcomes-display">
        <OutcomeCard sections={outcomes} />
      </div>

      <button onClick={handleSubmit}>Start Crosswalking!</button>
    </div>
  );
}

export default Add_Equiv;