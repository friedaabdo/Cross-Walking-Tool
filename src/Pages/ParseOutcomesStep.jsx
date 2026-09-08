import Textarea from "../Components/Textarea";
import "./CreateWizard.css";

function ParseOutcomesStep({
  outcomesDraft,
  setOutcomesDraft,
  onParse,
  formData,
  onBack,
}) {
  return (
    <div id="parsing-div" className="wizard-shell parse-panel">
      <div className="wizard-header">
        <h3>{formData.title || "Outcome"} outcomes, competencies, and key topics</h3>
        <p className="wizard-subtitle">Paste or type each outcome on a new line. We’ll parse them into structured cards next.</p>
      </div>

      <div className="parse-textarea-wrap">
        <Textarea
          pageName="outcomes"
          value={outcomesDraft}
          onChange={setOutcomesDraft}
        />
      </div>

      <div className="wizard-actions">
        <button className="wizard-button secondary" onClick={onBack}>Back</button>
        <button className="wizard-button" onClick={onParse}>Parse Outcomes</button>
      </div>
    </div>
  );
}

export default ParseOutcomesStep;
