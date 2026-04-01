import "./Outcome-card.css";
import "./outcome-rich.css";
import { splitOutcomeText } from "../utils/outcomeText";

function OutcomeCard({ lines, className, containerClassName }) {
  return (
    <div className={containerClassName}>
      {lines.map((line, index) => {
        const { bullets, statement } = splitOutcomeText(line);

        return (
          <div key={`${line}-${index}`} className={`outcome-card-item outcome-rich-content ${className ?? ""}`}>
            {statement ? <span className="outcome-rich-statement">{statement}</span> : null}
            {bullets.length > 0 ? (
              <ul className="outcome-rich-bullets">
                {bullets.map((bullet, bulletIndex) => (
                  <li key={`outcome-${index}-bullet-${bulletIndex}`}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default OutcomeCard;
