import Textarea from "../Components/textarea";

function ParseOutcomesStep({
  outcomesDraft,
  setOutcomesDraft,
  onParse,
  formData,
  onBack,
}) {
  return (
    <div id="parsing-div">
      <h3>{formData.title || "Outcome"} Outcomes, Competencies, Key Topics</h3>
      <Textarea
        pageName="outcomes"
        value={outcomesDraft}
        onChange={setOutcomesDraft}
      />
      <button onClick={onBack}>Back</button>
      <button onClick={onParse}>Parse Outcomes</button>
    </div>
  );
}

export default ParseOutcomesStep;
