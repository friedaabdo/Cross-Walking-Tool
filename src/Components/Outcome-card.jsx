import "./Outcome-card.css";

function OutcomeCard({ lines, className, containerClassName }) {
  return (
    <div className={containerClassName}>
      {lines.map((line, index) => (
        <p key={`${line}-${index}`} className={`outcome-card-item ${className ?? ""}`}>
          {line}
        </p>
      ))}
    </div>
  );
}

export default OutcomeCard;
