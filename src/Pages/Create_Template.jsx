import "./Create_Template.css";
import axios from "axios";
import InputLine from "../Components/InputLine";
import Textarea from "../Components/textarea";
import OutcomeCard from "../Components/Outcome-card";
import { parseInputToOutcomeSections } from "../utils/outcomeText";

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

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      title: learningExperienceTitle,
      description: learningExperienceDescription,
      link: learningExperienceLink,
      outcomes: outcomes,
    };

    axios
      .post("/api/learning-experiences/create-template", payload)
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div id="create-template">
      <h1>Create Template Page</h1>
      <p>This is where users can create a new template.</p>
      <div className="main-data">
        <h4>Learning Experience</h4>
        <label htmlFor="learningExperienceTitle">
          Learning Experience Title:
        </label>
        <InputLine
          placeholder="ex. CompTIA Security+"
          value={learningExperienceTitle}
          onChange={(event) =>
            setLearningExperienceTitle(event.target.value)
          }
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
          import { parseInputToOutcomeSections } from "../utils/outcomeText";
          Learning Experience Link:
        </label>
        <InputLine
          placeholder="https://example.com/learning-experience"
          value={learningExperienceLink}
          onChange={(event) =>
            setLearningExperienceLink(event.target.value)
          }
        />
      </div>
      <button onClick={handleSubmit}>Next</button>

      <div className="outcomes-input">
        <h4>Learning Outcomes</h4>
              const parsedOutcomes = parseInputToOutcomeSections(outcomesDraft);
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
    </div>
  );
}

export default Create_Template;
