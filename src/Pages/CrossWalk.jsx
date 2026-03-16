import OutcomeCard from "../Components/Outcome-card";
import DraggableCard from "../Components/Draggable-card";
import "./CrossWalk.css";
import { DragDropProvider } from "@dnd-kit/react";
import DroppableArea from "../Components/Droppable-area";


function CrossWalk({ certLines, syllLines }) {
  //a function that creates a unique id
  // const createUniqueId = () => Math.random().toString(36).substr(2, 9);

  return (
    <DragDropProvider>
      <div id="crosswalk-div">
        <div id="horizontal-div">
        <h2>Learning Experience Outcomes</h2>
        <div id="crosswalk-cert-div">
          {certLines.map((line, index) => (
            <DraggableCard key={index} id={`cert-${index}`} className="crosswalk-cert-card" line={line} />
          ))}
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
              <DroppableArea key={index} id={`match-${index}`} >
                
              </DroppableArea>
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
    </DragDropProvider>
  );
}
export default CrossWalk;
