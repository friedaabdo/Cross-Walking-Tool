import { useEffect, useRef, useState } from "react";

import MainDatastep from "./MainDataStep.jsx";
import ParseOutcomesStep from "./ParseOutcomesStep.jsx";
import ReviewOutcomesStep from "./ReviewOutcomesStep.jsx";
import { outcomeGroupsToHtml, outcomeRecordsToGroups, parseInputToOutcomeSections } from "../utils/outcomeText";

// The saved learning experience or CUNY course, shaped like the form data the wizard builds while you fill it in.
const savedRecordToFormData = (isCourse, record, matchId) =>
  isCourse
    ? {
        courseId: record.courseId,
        matchId,
        experienceId: null,
        title: record.title,
        courseCode: record.courseCode ?? "",
        description: record.description ?? "",
        syllabusFile: record.syllabus_file_url ?? "",
        syllabusFileName: record.syllabus_file_name ?? "",
        ...(record.school_id ? { campus: { id: record.school_id, name: record.school_name } } : {}),
        ...(record.department_id ? { department: { id: record.department_id, name: record.department_name } } : {}),
      }
    : {
        experienceId: record.experienceId,
        title: record.title,
        description: record.description ?? "",
        LElink: record.link ?? "",
      };

function Create_Outcomes({ formProps }) {
  const {
    outcomeType,
    submitMainData,
    submitOutcomes,
    is_template,
    goToEnd,
    goBack,
    experienceId,
    restoreExperienceId,
    restoreCourseId,
    restoreMatchId,
  } = formProps;
  const restoreId = restoreCourseId ?? restoreExperienceId;
  const [formData, setFormData] = useState({
    experienceId: experienceId ?? null,
  });
  const createdRecordRef = useRef(null);
  console.log("Experience id:", formData.experienceId);
  const [outcomesDraft, setOutcomesDraft] = useState("");
  const [currentStep, setCurrentStep] = useState("main");
  const [isRestoring, setIsRestoring] = useState(Boolean(restoreId));

  // Coming back to a saved learning experience or CUNY course: reload it and reopen the review step.
  useEffect(() => {
    if (!restoreId) {
      return;
    }

    const isCourse = Boolean(restoreCourseId);

    let cancelled = false;

    const restoreExperience = async () => {
      try {
        const [recordResponse, outcomesResponse] = await Promise.all([
          fetch(isCourse ? `/api/cuny-courses/${restoreId}` : `/api/learning-experiences/${restoreId}`),
          fetch(`/api/outcomes?${isCourse ? "courseId" : "experienceId"}=${restoreId}`),
        ]);

        if (!recordResponse.ok || !outcomesResponse.ok) {
          throw new Error("Failed to load the saved record");
        }

        const [record, outcomeRows] = await Promise.all([recordResponse.json(), outcomesResponse.json()]);

        if (cancelled) {
          return;
        }

        const draft = outcomeGroupsToHtml(outcomeRecordsToGroups(outcomeRows));

        setFormData({
          ...savedRecordToFormData(isCourse, record, restoreMatchId),
          outcomes: parseInputToOutcomeSections(draft),
        });
        setOutcomesDraft(draft);
        setCurrentStep("review-outcomes");
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to restore the saved record:", error);
          alert("Couldn't reload your saved work. You can enter it again.");
        }
      } finally {
        if (!cancelled) {
          setIsRestoring(false);
        }
      }
    };

    restoreExperience();

    return () => {
      cancelled = true;
    };
  }, [restoreId, restoreCourseId, restoreMatchId]);

  const handleParseOutcomes = () => {
    const parsedOutcomes = parseInputToOutcomeSections(outcomesDraft);

    setFormData((prev) => ({
      ...prev,
      outcomes: parsedOutcomes,
    }));
    setCurrentStep("review-outcomes");
    return parsedOutcomes;
  };

  const handleReviewNext = async () => {
    try {
      if (!submitOutcomes) {
        setCurrentStep("main");
        return;
      }

      const finalFormData = {
        ...formData,
        ...(createdRecordRef.current ?? {}),
        recordType: outcomeType,
      };

      await submitOutcomes(finalFormData);
      goToEnd?.(finalFormData);
    } catch (error) {
      alert(error?.message || "Failed to save outcomes.");
    }
  };

  const handleSubmitMain = async () => {
    const title = String(formData.title ?? "").trim();

    if (!title) {
      alert("Please enter a title before continuing.");
      return;
    }

    const nextFormData = {
      ...formData,
      experienceId: formData.experienceId ?? experienceId ?? null,
      is_template,
      recordType: outcomeType,
    };

    setFormData(nextFormData);

    try {
      const createdRecord = await submitMainData?.(nextFormData);

      if (createdRecord) {
        const isCunyCourse = outcomeType === "cunyCourse";
        const createdId = isCunyCourse ? createdRecord.courseId : createdRecord.experienceId;

        createdRecordRef.current = createdRecord;

        setFormData((prev) => ({
          ...prev,
          ...createdRecord,
          recordType: outcomeType,
          ...(createdId !== undefined
            ? isCunyCourse
              ? {
                  courseId: createdId,
                  experienceId: null,
                }
              : {
                  experienceId: createdId,
                  courseId: null,
                }
            : {}),
        }));
      }

      setCurrentStep("parse-outcomes");
    } catch (error) {
      alert(error?.message || "Failed to create the record.");
    }
  };



  if (isRestoring) {
    return <p>Loading your saved work...</p>;
  }

  return (
    <div id="create-outcomes">
      {currentStep === "main" && (
        <MainDatastep
          formData={formData}
          setFormData={setFormData}
          setOutcomesDraft={setOutcomesDraft}
          onNext={handleSubmitMain}
          onBack={goBack}
          outcomeType={outcomeType}
        />
      )}

      {currentStep === "parse-outcomes" && (
        <ParseOutcomesStep
          formData={formData}
          outcomesDraft={outcomesDraft}
          setOutcomesDraft={setOutcomesDraft}
          onParse={handleParseOutcomes}
          onBack={() => setCurrentStep("main")}
        />
      )}

      {currentStep === "review-outcomes" && (
        <ReviewOutcomesStep
          formData={formData}
          setFormData={setFormData}
          onBack={() => setCurrentStep("parse-outcomes")}
          onNext={handleReviewNext}
          outcomeLinks={formData.outcomes || []}
        />
      )}
    </div>
  );
}

export default Create_Outcomes;
