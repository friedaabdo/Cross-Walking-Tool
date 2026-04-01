import "./Outcome-card.css";

const splitOutcomeText = (text) => {
  const segments = String(text ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item !== "");

  const bullets = segments
    .filter((item) => /^-\s+/.test(item))
    .map((item) => item.replace(/^-\s+/, ""));

  const statement = segments.filter((item) => !/^-\s+/.test(item)).join("\n");

  return { bullets, statement };
};

function OutcomeCard({ lines, className, containerClassName }) {
  return (
    <div className={containerClassName}>
      {lines.map((line, index) => {
        const { bullets, statement } = splitOutcomeText(line);

        return (
          <div key={`${line}-${index}`} className={`outcome-card-item ${className ?? ""}`}>
            {statement ? <span className="outcome-card-statement">{statement}</span> : null}
            {bullets.length > 0 ? (
              <ul className="outcome-card-bullets">
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
