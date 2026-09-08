import "./OutcomeCard.css";
import "./OutcomeRich.css";
// import { splitOutcomeText } from "../utils/outcomeText";

// const normalizeSections = (lines, sections) => {
//   const sourceSections = sections ?? (Array.isArray(lines) ? lines.map((line) => ({ header: "", lines: [line] })) : []);

//   return sourceSections.map((section) => {
//     if (typeof section === "string") {
//       return { header: "", lines: [section] };
//     }

//     return {
//       header: section?.header ?? "",
//       lines: Array.isArray(section?.lines)
//         ? section.lines
//         : section?.line
//           ? [section.line]
//           : [],
//     };
//   });
// };

function OutcomeCard({ outcomes }) {
  // const normalizedSections = normalizeSections(lines, sections);
console.log("outcomes in OutcomeCard.jsx:", outcomes);


return (
  <div className="card-container">
    {outcomes.map((outcome, outcomeIndex) => (
      <div key={`outcome-${outcomeIndex}`} className="outcome-card">
        {/* Render header if present */}
        {outcome.header && (
          <strong className="outcome-header">{outcome.header}</strong>
        )}

        {/* Render lines */}
        {outcome.lines.map((line, lineIndex) => {
          const isBullet = line.trim().startsWith('-');
          const text = isBullet ? line.trim().replace(/^-\s*/, '') : line;
          const key = `line-${outcomeIndex}-${lineIndex}`;

          return isBullet ? (
            <ul key={key} className="outcome-bullet-list">
              <li>{text}</li>
            </ul>
          ) : (
            <p key={key} className="outcome-text">
              {text}
            </p>
          );
        })}
      </div>
    ))}
  </div>
);
}

export default OutcomeCard;

//         return (
//           <div
//             // key={sectionKey}
//             className={`outcome-card-item outcome-rich-content ${className}`.trim()}
//           >
//             {section.header ? (
//               <span className="outcome-rich-header">{section.header}</span>
//             ) : null}

//             {section.lines.map((line, lineIndex) => {
//               const { bullets, statement } = splitOutcomeText(line);

//               return (
//                 <div key={`section-${index}-line-${lineIndex}`} className="outcome-rich-line-group">
//                   {statement ? <span className="outcome-rich-statement">{statement}</span> : null}
//                   {bullets.length > 0 ? (
//                     <ul className="outcome-rich-bullets">
//                       {bullets.map((bullet, bulletIndex) => (
//                         <li key={`outcome-${index}-bullet-${lineIndex}-${bulletIndex}`}>{bullet}</li>
//                       ))}
//                     </ul>
//                   ) : null}
//                 </div>
//               );
//             })}
//           </div>
//         );
//       })}
     
//   );
// }

// export default OutcomeCard;
