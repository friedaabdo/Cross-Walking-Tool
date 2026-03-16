import { useDraggable } from "@dnd-kit/react";
import "./Draggable-card.css";

function DraggableCard({ id, className, line }) {
    const { ref, attributes, listeners } = useDraggable({ id });

    return (
        <p ref={ref} className={`draggable-card-item ${className ?? ""}`} {...attributes} {...listeners}>
            {line}
        </p>
    );
}

export default DraggableCard;