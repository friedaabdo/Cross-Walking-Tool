import { useState} from "react";

import InputLine from "../Components/InputLine";
import { handleFileUpload, MAX_SYLLABUS_FILE_SIZE_BYTES } from "../utils/fileHandler";



function Create_Outcomes({ outcomeType = "cunyCourse", formData, onChange }) {
  const config = {
    learningExperience: {
      title: "Learning Experience",
      fields: [
        {
          name: "title",
          label: "Title",
          type: "text",
          placeholder: "ex. CompTIA Security+",
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          placeholder: "Add a description of the learning experience",
        },
        {
          name: "LElink",
          label: "URL",
          type: "url",
          placeholder: "https://www.comptia.org/en-us/certifications/security/",
        },
        { name: "tags", label: "Add Tags", type: "Select", placeholder: "" },
      ]
    },
    cunyCourse: {
      title: "CUNY Course",
      fields: [
        {
          name: "title",
          label: "Title",
          type: "text",
          placeholder: "ex. Intro to CompSci",
        },
        {
          name: "courseCode",
          label: "Course Code",
          type: "text",
          placeholder: "ex. CS101",
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          placeholder: "Add a description of the CUNY course",
        },
        {
          name: "syllabus",
          label: "Syllabus",
          type: "file",
          placeholder: "Attach Course Syllabus",
        },
        { name: "tags", label: "Add Tags", type: "select", placeholder: "" },
        {
          name: "campus",
          label: "Choose Campus",
          type: "select",
          options: "",
        },
        {
          name: "department",
          label: "Choose Department",
          type: "select",
          options: "",
        }
      ]
    }
  };

  const [importError, setImportError] = useState(null);
  
  const currentConfig = config[outcomeType];

const handleFileChange = async (event) => {
  try {
    const dataUrl = await handleFileUpload(event.target.files?.[0]);
    setImportError(null);
    onChange("syllabusFile", dataUrl);  // ← sends back to parent
  } catch (error) {
    setImportError(error.message);
    event.target.value = "";
  }
};

  const renderField = (field) => {
    switch (field.type) {
      case "text":
        return (
          <InputLine
            type="text"
            placeholder={field.placeholder}
            value={formData[field.name] || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
          />
        );
      case "url":
        return (
          <InputLine
            type="url"
            placeholder={field.placeholder}
            value={formData[field.name] || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
          />
        );
      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder}
            value={formData[field.name] || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            rows={4}
          />
        );
      case "file":
        return (
          <>
            <InputLine
              type="file"
              placeholder={field.placeholder}
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            {formData.syllabusFileName ? (
              <p>Uploaded: {formData.syllabusFileName}</p>
            ) : null}
            {importError ? <p>{importError}</p> : null}
          </>
        );
        case "select":
        return (
          <select
            value={field.name}
            onChange={(e) => onChange(field.options, e.target.value)}
          >
            <option value="">Select {field.label}</option>
            {(field.options || []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      default:
        return null;
    }
  };

  return (
    <div id="create-outcomes">
      <h3>Let's create a {currentConfig.title}</h3>
      <div className="main-data">
        {/* {currentConfig.map(field => {
            <label htmlFor={field.name}>
          {field.title}
        </label>
        })} */}
      </div>
    </div>
  );
}

export default Create_Outcomes;
