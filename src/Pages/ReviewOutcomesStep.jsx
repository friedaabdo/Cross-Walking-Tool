import OutcomeCard from "../Components/Outcome-card.jsx";
import "./CreateWizard.css";

function ReviewOutcomesStep({
  formData,
  onBack,
  onNext,
  outcomeLinks,
}) {
  const outcomes = Array.isArray(formData?.outcomes) && formData.outcomes.length > 0
    ? formData.outcomes
    : [];

  return (
    <div id="review-outcomes" className="wizard-shell review-panel">
      <div className="wizard-header">
        <h3>How does everything look?</h3>
        <p className="wizard-subtitle">Review the parsed outcomes before continuing.</p>
      </div>

      <div className="review-summary">
        <p>{outcomes.length} outcome section{outcomes.length === 1 ? "" : "s"} ready to continue.</p>
      </div>

      <div className="review-card-wrap">
        <OutcomeCard
          outcomes={outcomes}
          outcomeLinks={outcomeLinks}
        />
      </div>

      <div className="wizard-actions">
        <button type="button" className="wizard-button secondary" onClick={onBack}>
          Back
        </button>
        <button type="button" className="wizard-button" onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default ReviewOutcomesStep;