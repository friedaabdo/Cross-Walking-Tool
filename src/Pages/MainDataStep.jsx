import { useState, useEffect } from "react";

import InputLine from "../Components/InputLine.jsx";
import {
  agentResultToForm,
  extractPdfText,
  handleFileUpload,
  matchByName,
  MAX_SYLLABUS_FILE_SIZE_BYTES,
  parseSyllabusWithAgent,
} from "../utils/fileHandler";
import "./CreateWizard.css";

const departmentRequests = new Map();

// One request per campus; the department dropdown and the syllabus reader both use it.
const fetchDepartments = (campusId) => {
  if (!departmentRequests.has(campusId)) {
    departmentRequests.set(
      campusId,
      fetch(`/api/departments/${campusId}`)
        .then((res) => res.json())
        .then((data) => (Array.isArray(data) ? data : [])),
    );
  }

  return departmentRequests.get(campusId);
};

function MainDataStep({
  formData,
  setFormData,
  setOutcomesDraft,
  onNext,
  onBack,
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
  const [departments, setDepartments] = useState({ campusId: null, list: [] });
  const campusId = formData.campus?.id ?? null;
  const departmentsList = String(departments.campusId) === String(campusId) ? departments.list : [];


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

  //keeps the department dropdown in step with the chosen campus (also when this step is reopened with a campus already set)
  useEffect(() => {
    if (!campusId) {
      return;
    }

    let cancelled = false;

    fetchDepartments(campusId).then((list) => {
      if (!cancelled) {
        setDepartments({ campusId, list });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [campusId]);

  const applyCampus = (selectedCampus) => {
    const campusName = campusList.find(
      (campus) => String(campus.school_id) === String(selectedCampus),
    )?.school_name;

    handleFieldChange("campus", {
      id: selectedCampus,
      name: campusName,
    });
  };

  const handleCampusChange = (event) => applyCampus(event.target.value);

  console.log("campusList", campusList);
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
          name: "syllabus",
          label: "Syllabus",
          type: "file",
          placeholder: "Attach Course Syllabus",
        },
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
  const [isParsing, setIsParsing] = useState(false);

  const currentConfig = config[outcomeType];

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    console.log("Selected syllabus file:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    try {
      const dataUrl = await handleFileUpload(file);
      setImportError(null);
      handleFieldChange("syllabusFile", dataUrl);
      handleFieldChange("syllabusFileName", file.name);

      const isPdf =
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        setIsParsing(true);

        try {
          console.log("Extracting text from PDF...");
          const extractedText = await extractPdfText(file);

          const agentResult = await parseSyllabusWithAgent(extractedText);
          console.log("Syllabus agent result:", agentResult);

          const { fields, campusName, departmentName, outcomesDraft } = agentResultToForm(agentResult);
          Object.entries(fields).forEach(([name, value]) => {
            if (value) {
              handleFieldChange(name, value);
            }
          });
          setOutcomesDraft?.(outcomesDraft);

          const campus = matchByName(campusList, (item) => item.school_name, campusName);
          if (campus) {
            applyCampus(campus.school_id);
            const department = matchByName(
              await fetchDepartments(campus.school_id),
              (item) => item.department_name,
              departmentName,
            );
            if (department) {
              handleFieldChange("department", {
                id: department.department_id,
                name: department.department_name,
              });
            }
          }
        } catch (error) {
          console.error("Failed to read syllabus with the agent:", error);
          setImportError(
            `Couldn't read the syllabus automatically (${error.message}). You can enter the details by hand.`,
          );
        } finally {
          setIsParsing(false);
        }
      }
    } catch (error) {
      console.error("Failed to process uploaded syllabus:", error);
      setImportError(error.message || "Failed to process uploaded syllabus.");
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
          <h4>Upload the CUNY course syllabus first to extract data</h4>
          <h5 style={{ color: "red" }}>Double check the extracted data, and make any necessary corrections.</h5>
            <InputLine
              type="file"
              placeholder={field.placeholder}
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            {formData.syllabusFileName ? (
              <p>Uploaded: {formData.syllabusFileName}</p>
            ) : null}
            {isParsing ? <p>Reading the syllabus…</p> : null}
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
        {onBack ? (
          <button type="button" className="wizard-button secondary" onClick={onBack}>Back</button>
        ) : null}
        <button className="wizard-button" onClick={onNext}>Next</button>
      </div>
    </div>
  );
}

export default MainDataStep;
