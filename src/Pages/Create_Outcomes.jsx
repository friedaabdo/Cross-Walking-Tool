import { useState, useEffect } from "react";

import InputLine from "../Components/InputLine";
import {
  handleFileUpload,
  MAX_SYLLABUS_FILE_SIZE_BYTES,
} from "../utils/fileHandler";

function Create_Outcomes({ outcomeType }) {
  const [formData, setFormData] = useState({});
  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [campusList, setCampusList] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [campusesResponse, tagsResponse] = await Promise.all([
          fetch("/api/campuses"),
          fetch("/api/tags"),
        ]);

        if (!campusesResponse.ok) throw new Error("Failed to fetch campuses");
        if (!tagsResponse.ok) throw new Error("Failed to fetch tags");

        const [campuses, tags] = await Promise.all([
          campusesResponse.json(),
          tagsResponse.json(),
        ]);

        if (cancelled) return;

        setCampusList(campuses);
        setTagsList(tags);
      } catch (error) {
        console.error("Failed to load dropdown data:", error);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  console.log("tasgsList", tagsList);

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
      ],
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
        { name: "tags", label: "Add Tags", type: "dblSelect", options: tagsList },
        {
          name: "campus",
          label: "Choose Campus",
          type: "select",
          options: campusList,
        },
        {
          name: "department",
          label: "Choose Department",
          type: "select",
          options: "",
        },
      ],
    },
  };

  const [importError, setImportError] = useState(null);

  const currentConfig = config[outcomeType];

  const handleFileChange = async (event) => {
    try {
      const dataUrl = await handleFileUpload(event.target.files?.[0]);
      setImportError(null);
      handleFieldChange("syllabusFile", dataUrl);
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
            value={formData?.[field.name] ?? ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );
      case "url":
        return (
          <InputLine
            type="url"
            placeholder={field.placeholder}
            value={formData?.[field.name] ?? ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );

      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder}
            value={formData?.[field.name] ?? ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
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
            value={formData?.[field.name] ?? ""}
            onChange={(e) => {
              handleFieldChange(field.name, e.target.value);
            }}
          >
            <option value="">{field.label}</option>
            {(field.options || []).map((option) => (
              <option key={option.school_id} value={option.school_name}>
                {option.school_name}
              </option>
            ))}
          </select>
        );
      case "dblSelect":
        return (
          <select
            value={formData?.[field.name] ?? ""}
            onChange={(e) => {
              handleFieldChange(field.name, e.target.value);
            }}
          >
            <option value="">{field.label}</option>
            {(field.options || []).map((option) => (
              <option key={option.school_id} value={option.school_name}>
                {option.school_name}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  return (
    <div id="create-outcomes">
      <h3>Let's create a {currentConfig.title}</h3>
      <div className="main-data">
        {currentConfig.fields.map((field) => (
          <div key={field.name} className="field-group">
            <label htmlFor={field.name}>{field.label}</label>
            {renderField(field)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Create_Outcomes;
