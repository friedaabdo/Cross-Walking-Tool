import { useDraggable } from "@dnd-kit/react";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { splitOutcomeDisplayParts } from "../utils/outcomeText";
import "./DraggableCard.css";
import "./OutcomeRich.css";

const COLLAPSED_CARD_HEIGHT = 150;

function DraggableCard({ id, className, line, linkUrl }) {
    const { ref, attributes, listeners } = useDraggable({ id });
    const wrapperRef = useRef(null);
    const cardRef = useRef(null);
    const [hasOverflow, setHasOverflow] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedRect, setExpandedRect] = useState({ left: 0, top: 0, width: 0 });

    const { bullets, heading, statementBody } = splitOutcomeDisplayParts(line);

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
                {linkUrl ? (
                    <a
                        className="draggable-card-link-icon"
                        href={linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Open linked outcome"
                        title="Open linked outcome"
                        onMouseDown={(event) => event.stopPropagation()}
                        onPointerDown={(event) => event.stopPropagation()}
                    >
                        <FontAwesomeIcon icon={faLink} style={{ color: "rgb(70, 147, 207)" }} />
                    </a>
                ) : null}
                <div className="draggable-card-content outcome-rich-content">
                    {heading ? (
                        <div className="outcome-rich-heading">
                            <strong>{heading}</strong>
                        </div>
                    ) : null}
                    {statementBody ? <span className="outcome-rich-statement">{statementBody}</span> : null}
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