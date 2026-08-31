import OutcomeCard from "../Components/Outcome-card.jsx";




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
    <div id ="review-outcomes">
      <h3>How does everything look?</h3>
        <div>  <OutcomeCard
        outcomes={outcomes}
        outcomeLinks={outcomeLinks}
      /></div>
    

      <div className="button-row">
        <button type="button" onClick={onBack}>
          Back
        </button>
        <button type="button" onClick={onNext} >
          Continue
        </button>
      </div>
    </div>
  );
}

export default ReviewOutcomesStep;