import "./Outcome-card.css";

function OutcomeCard({ lines, className }) {
  return (
    <>
      {lines.map((line, index) => (
        <p key={`${line}-${index}`} className={className}>
          {line}
        </p>
      ))}
    </>
  );
}

export default OutcomeCard;
