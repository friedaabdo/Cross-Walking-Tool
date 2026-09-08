import { useState, useEffect } from "react";

import InputLine from "../Components/InputLine.jsx";
import {
  handleFileUpload,
  MAX_SYLLABUS_FILE_SIZE_BYTES,
} from "../utils/fileHandler";
import "./CreateWizard.css";

function MainDataStep({
  formData,
  setFormData,
  onNext,
  outcomeType,
 
}) {
  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [campusList, setCampusList] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState(null);


//loads campus and tags for the dropdowns in the form
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

  //loads departments for the department dropdown based on the selected campus
  const handleCampusChange = async (event) => {
    const selectedCampus = event.target.value;

    const campusName = campusList.find(
      (campus) => String(campus.school_id) === String(selectedCampus),
    )?.school_name;
    setSelectedCampusId(selectedCampus);

    handleFieldChange("campus", {
      id: selectedCampus,
      name: campusName,
    });

    if (!selectedCampus) {
      setDepartmentsList([]);
      return;
    }

    fetch(`/api/departments/${selectedCampus}`)
      .then((res) => res.json())
      .then((data) => setDepartmentsList(data || []));
  };

  console.log("campusList", campusList);
  console.log("selectedCampusId", selectedCampusId);
  console.log("tagsList", tagsList);
  console.log("departmentsList", departmentsList);

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
        {
          name: "tags",
          label: "Add Tags",
          type: "multiSelect",
          options: tagsList,
        },
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
        {
          name: "tags",
          label: "Add Tags",
          type: "multiSelect",
          options: tagsList,
        },
        {
          name: "campus",
          label: "Choose Campus",
          type: "select",
          handle: handleCampusChange,
          body_name: "school_name",
          body_id: "school_id",
          options: campusList,
        },
        {
          name: "department",
          label: "Choose Department",
          type: "select",
          handle: handleFieldChange,
          body_name: "department_name",
          body_id: "department_id",
          options: departmentsList,
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

  // Renders the appropriate input field based on the field type
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
      case "select": {
        //THIS ALSO NEEDS TO BE REVISITED. THERE MUST BE A WAY TO BE ABLE TO USE THE FUNCTIONS FROM THE OBJECT ABOVE. OR SOMETHING IDK. I NEED SLEEP

        const bodyName = field.body_name;
        const bodyId = field.body_id;

        return (
          <select
            value={formData?.[field.name]?.id ?? ""}
            onChange={(event) => {
              const selectedValue = event.target.value;
              const selectedOption = (field.options || []).find(
                (option) => String(option[bodyId]) === String(selectedValue),
              );

              if (field.name === "campus") {
                handleCampusChange(event);
                return;
              }

              const nextValue = selectedOption
                ? {
                    id: selectedOption[bodyId],
                    name: selectedOption[bodyName],
                  }
                : null;

              if (typeof field.handle === "function") {
                field.handle(field.name, nextValue);
              }
            }}
          >
            <option value="">{field.label}</option>
            {(field.options || []).map((option) => (
              <option key={option[bodyId]} value={option[bodyId]}>
                {option[bodyName]}
              </option>
            ))}
          </select>
        );
      }
      case "multiSelect":
        return (
          //THIS NEEDS TO BE REVISTED. AT LEAST ITS RENDERING BUTTONS FOR NOW. ONCLICK NEEDS TO BE FIXED. TAGS NEED THEIR OWN ONCLICK HANDLER TO ADD THE KEY(CATEGORY) AS A NEW KEY TO THE FORM DATA OBJECT. AND THEN WHEN YOU CLICK ON THE BUTTON, IT SHOWS THE ARRAY OF TAGS THAT IS ASSOCIATED WITH THAT CATEGORY. THEN WHEN YOU CLICK ON THE TAG, IT ADDS THAT TAG TO THE FORM DATA OBJECT AS AN ARRAY OF TAGS.
          <>
            {Object.keys(field.options).map((key) => (
              <button
                onClick={(e) => handleFieldChange(field.name, e.target.value)}
                key={key}
                value={key}
              >
                {key}
              </button>
            ))}
          </>
        );
      default:
        return null;
    }
  };
  console.log("formData", formData);

  return (
    <div id="main-data" className="wizard-shell">
      <div className="wizard-header">
        <h3>Let's create a {currentConfig.title}</h3>
        <p className="wizard-subtitle">Add the core record details before we parse outcomes.</p>
      </div>

      <div className="wizard-grid">
        {currentConfig.fields.map((field) => (
          <div key={field.name} className="field-group">
            <label htmlFor={field.name}>{field.label}</label>
            {renderField(field)}
          </div>
        ))}
      </div>

      <div className="wizard-actions">
        <button className="wizard-button" onClick={onNext}>Next</button>
      </div>
    </div>
  );
}

export default MainDataStep;
