import { useDraggable } from "@dnd-kit/react";
import { useEffect, useRef, useState } from "react";
import { splitOutcomeText } from "../utils/outcomeText";
import "./Draggable-card.css";
import "./outcome-rich.css";

const COLLAPSED_CARD_HEIGHT = 150;

function DraggableCard({ id, className, line }) {
    const { ref, attributes, listeners } = useDraggable({ id });
    const wrapperRef = useRef(null);
    const cardRef = useRef(null);
    const [hasOverflow, setHasOverflow] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedRect, setExpandedRect] = useState({ left: 0, top: 0, width: 0 });

    const { bullets, statement } = splitOutcomeText(line);

    useEffect(() => {
        if (!cardRef.current) {
            return;
        }

        const element = cardRef.current;

        const checkOverflow = () => {
            setHasOverflow(element.scrollHeight > COLLAPSED_CARD_HEIGHT + 1);
        };

        checkOverflow();

        const resizeObserver = new ResizeObserver(checkOverflow);
        resizeObserver.observe(element);
        window.addEventListener("resize", checkOverflow);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", checkOverflow);
        };
    }, [line]);

    const setCardRefs = (node) => {
        cardRef.current = node;
        ref(node);
    };

    const handleMouseEnter = () => {
        if (!hasOverflow || !wrapperRef.current) {
            return;
        }

        const rect = wrapperRef.current.getBoundingClientRect();
        setExpandedRect({
            left: rect.left,
            top: rect.top,
            width: rect.width,
        });
        setIsExpanded(true);
    };

    const handleMouseLeave = () => {
        if (!isExpanded) {
            return;
        }

        setIsExpanded(false);
    };

    return (
        <div
            ref={wrapperRef}
            className={`draggable-card-wrapper ${className ?? ""} ${hasOverflow ? "draggable-card-wrapper-overflow" : ""}`}
            style={{
                "--expanded-left": `${expandedRect.left}px`,
                "--expanded-top": `${expandedRect.top}px`,
                "--expanded-width": `${expandedRect.width}px`,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                ref={setCardRefs}
                className={`draggable-card-item ${className ?? ""} ${hasOverflow ? "draggable-card-has-overflow" : ""} ${isExpanded ? "draggable-card-expanded" : ""}`}
                {...attributes}
                {...listeners}
            >
                <div className="draggable-card-content outcome-rich-content">
                    {statement ? <span className="outcome-rich-statement">{statement}</span> : null}
                    {bullets.length > 0 ? (
                        <ul className="outcome-rich-bullets">
                            {bullets.map((bullet, index) => (
                                <li key={`${id}-bullet-${index}`}>{bullet}</li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default DraggableCard;