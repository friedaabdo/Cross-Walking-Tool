import { useDraggable } from "@dnd-kit/react";
import "./Draggable-card.css";

function DraggableCard({ id, className, line }) {
    const { ref } = useDraggable({ id });

    return (
        <p ref={ref} className={className}>
            {line}
        </p>
    );
}

export default DraggableCard;