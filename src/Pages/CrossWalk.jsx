import OutcomeCard from "../Components/Outcome-card";
import "./CrossWalk.css";

function CrossWalk({ certLines, syllLines }) {
  return (
    <div id="crosswalk-div">
      <div id="horizontal-div">
        <h2>Learning Experience Outcomes</h2>
        <div id="crosswalk-cert-div">
          <OutcomeCard className="crosswalk-cert-card" lines={certLines} />
        </div>
      </div>

      <div id="columns-div">
        <div id="crosswalk-syll">
          <h2>Syllabus Outcomes</h2>
          <OutcomeCard className="crosswalk-syll-card" lines={syllLines} />
        </div>
        <div id="crosswalk-match-div">
          <h2>Matches</h2>
          <div className="matches">
            {/* i want as many div elements as there are syllabus lines */}
            {syllLines.map((line, index) => (
              <div key={index} className="match-row"></div>
            ))}
          </div>
        </div>
        <div id="crosswalk-notes-div">
          <h2>Notes</h2>
          <div className="notes">
            {syllLines.map((line, index) => (
              <textarea key={index} placeholder="Add notes here..." />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default CrossWalk;
