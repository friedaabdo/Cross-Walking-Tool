import "./Create_Template.css";
import axios from "axios";
import InputLine from "../Components/InputLine";
import Textarea from "../Components/textarea";
import OutcomeCard from "../Components/Outcome-card";
import { parseInputToOutcomeSections } from "../utils/outcomeText";
import { useNavigate } from "react-router-dom";

function Create_Template({
  learningExperienceTitle,
  setLearningExperienceTitle,
  learningExperienceDescription,
  setLearningExperienceDescription,
  learningExperienceLink,
  setLearningExperienceLink,
  outcomes,
  setOutcomes,
  outcomesDraft,
  setOutcomesDraft,
}) {
  const handleParseOutcomes = () => {
    const parsedOutcomes = parseInputToOutcomeSections(outcomesDraft);
    setOutcomes(parsedOutcomes);
  };

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    //clear all input fields after submission and navigate to the board page
    event.preventDefault();
    const payload = {
      title: learningExperienceTitle,
      description: learningExperienceDescription,
      link: learningExperienceLink,
      is_template: true,
    };

    const buildOutcomesPayload = (sections) => {
      const items = [];
      (sections || []).forEach((sec) => {
        const header = sec?.header ?? "";
        const lines = Array.isArray(sec?.lines)
          ? sec.lines
          : sec?.line
            ? [sec.line]
            : [];

        let lastItem = null;
        lines.forEach((rawLine) => {
          const line = String(rawLine ?? "").trim();
          if (!line) return;

          if (/^[-]\s+/.test(line)) {
            // bullet: attach to previous non-bullet outcome if present
            if (lastItem) {
              lastItem.outcomeText = `${lastItem.outcomeText}\n${line}`;
            } else {
              // bullet without a prior main line: create standalone bullet outcome
              const item = {
                outcomeText: line,
                category: String(header).trim() || null,
              };
              items.push(item);
              lastItem = item;
            }
          } else {
            // new main line -> create a new outcome
            const item = {
              outcomeText: line,
              category: String(header).trim() || null,
            };
            items.push(item);
            lastItem = item;
          }
        });
      });
      return items;
    };

    axios
      .post("/api/learning-experiences/create-template", payload)
      .then((res) => {
        const experienceId = res.data?.experienceId;
        if (!experienceId) {
          throw new Error(
            "Missing experience id from create-template response",
          );
        }

        const outcomesPayload = buildOutcomesPayload(outcomes);

        return axios.post("/api/outcomes/bulk-replace", {
          experienceId,
          outcomes: outcomesPayload,
        });
      })
      .then((res) => {
        console.log("Saved experience and outcomes", res.data);
        setLearningExperienceTitle("");
        setLearningExperienceDescription("");
        setLearningExperienceLink("");
        setOutcomes([]);
        setOutcomesDraft("");

        navigate("/board");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div id="create-template">
      <h1>Create Template</h1>
      <div className="main-data">
     
        <label htmlFor="learningExperienceTitle">
          Learning Experience Title:
        </label>
        <InputLine
          placeholder="ex. CompTIA Security+"
          value={learningExperienceTitle}
          onChange={(event) => setLearningExperienceTitle(event.target.value)}
        />
        <label htmlFor="learningExperienceDescription">
          Learning Experience Description:
        </label>
        <textarea
          className="home-description-textarea"
          placeholder="Enter a description of the learning experience"
          value={learningExperienceDescription}
          onChange={(event) =>
            setLearningExperienceDescription(event.target.value)
          }
          rows={4}
        />
        <label htmlFor="learningExperienceLink">
          Learning Experience Link:
        </label>
        <InputLine
          placeholder="https://example.com/learning-experience"
          value={learningExperienceLink}
          onChange={(event) => setLearningExperienceLink(event.target.value)}
        />
      </div>

      <div className="outcomes-input">
        <h4>Learning Outcomes</h4>
        <Textarea
          pageName="Learning Outcomes"
          value={outcomesDraft}
          onChange={setOutcomesDraft}
        />
        <button onClick={handleParseOutcomes}>Parse Outcomes</button>
      </div>

      <div className="outcomes-display">
        <OutcomeCard sections={outcomes} />
      </div>
      <button onClick={handleSubmit}>Create Template</button>
    </div>
  );
}

export default Create_Template;
