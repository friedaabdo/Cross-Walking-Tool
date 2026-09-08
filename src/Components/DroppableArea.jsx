import { useDroppable } from "@dnd-kit/react";
import "./DroppableArea.css";

function DroppableArea({ id, children }) {
    const {ref} = useDroppable({ id });

    return (
        <div ref={ref} className="droppable-area">
            {children}
        </div>
    );
}

export default DroppableArea;