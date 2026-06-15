import "./Create_Template.css";
import { useState } from "react";
import axios from "axios";
import InputLine from "../Components/InputLine";
import Textarea from "../Components/textarea";

function Create_Template() {
  const [values, setValues] = useState({
    learningExperienceTitle: "",
    learningExperienceDescription: "",
    learningExperienceLink: "",
  });
  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      title: values.learningExperienceTitle,
      description: values.learningExperienceDescription,
      link: values.learningExperienceLink,
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
  const {
    learningExperienceTitle,
    learningExperienceDescription,
    learningExperienceLink,
  } = values;
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
            setValues({
              ...values,
              learningExperienceTitle: event.target.value,
            })
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
            setValues({
              ...values,
              learningExperienceDescription: event.target.value,
            })
          }
          rows={4}
        />
        <label htmlFor="learningExperienceLink">
          Learning Experience Link:
        </label>
        <InputLine
          placeholder="https://example.com/learning-experience"
          value={learningExperienceLink}
          onChange={(event) =>
            setValues({ ...values, learningExperienceLink: event.target.value })
          }
        />
      </div>
      <button onClick={handleSubmit}>Next</button>

      <Textarea value={inputValue}
            onChange={handleInputChange}/>
    </div>
  );
}

export default Create_Template;
