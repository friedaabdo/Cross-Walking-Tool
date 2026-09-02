import { useRef, useState } from "react";

import MainDatastep from "./MainDataStep";
import ParseOutcomesStep from "./ParseOutcomesStep";
import ReviewOutcomesStep from "./ReviewOutcomesStep";
import { parseInputToOutcomeSections } from "../utils/outcomeText";

function Create_Outcomes({ formProps }) {
  const { outcomeType, submitMainData, submitOutcomes, is_template, goToEnd, learningExperienceId } = formProps;
  const [formData, setFormData] = useState({
    learningExperienceId: learningExperienceId ?? null,
  });
  const createdRecordRef = useRef(null);
  console.log("LE id:", formData.learningExperienceId);
  const [outcomesDraft, setOutcomesDraft] = useState("");
  const [currentStep, setCurrentStep] = useState("main");

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
      learningExperienceId: formData.learningExperienceId ?? learningExperienceId ?? null,
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



  return (
    <div id="create-outcomes">
      {currentStep === "main" && (
        <MainDatastep
          formData={formData}
          setFormData={setFormData}
          onNext={handleSubmitMain}
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
          // learningExperienceId={templateId}
        />
      )}
    </div>
  );
}

export default Create_Outcomes;
