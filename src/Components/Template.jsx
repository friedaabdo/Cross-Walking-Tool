//create the component for the templates
import "./Template.css";
import { useNavigate } from "react-router-dom";
import Button from "./Button.jsx";
import { useEffect, useState } from "react";

  //  const createCourseAndMatch = async (experienceId) => {
  //           try {
  //             const courseResponse = await fetch("/api/cuny-courses", {
  //               method: "POST",
  //               headers: { "Content-Type": "application/json" },
  //               body: JSON.stringify({ title: "New Course", description: "" }),
  //             });

  //             if (!courseResponse.ok) {
  //               throw new Error("Failed to create CUNY course");
  //             }

  //             const courseData = await courseResponse.json();
  //             const courseId = courseData?.courseId;

  //             if (!courseId) {
  //               throw new Error("Missing course id from response");
  //             }

  //             const matchResponse = await fetch("/api/matches", {
  //               method: "POST",
  //               headers: { "Content-Type": "application/json" },
  //               body: JSON.stringify({
  //                 courseId,
  //                 experienceId,
  //               }),
  //             });

  //             if (!matchResponse.ok) {
  //               throw new Error("Failed to create match");
  //             }

  //             const matchData = await matchResponse.json();

  //             window.location.href = `/add-equivalency?courseId=${courseId}&experienceId=${experienceId}&matchId=${matchData?.matchId ?? ""}`;
  //           } catch (err) {
  //             console.error("Error creating course and match:", err);
  //             alert("Failed to create course or match. Please try again.");
  //           }
  //         };

function Template({ title, description, link, experienceId, clearAddEquivDraft, setTemplateId }) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [outcomes, setOutcomes] = useState([]);
  const [outcomesLoading, setOutcomesLoading] = useState(false);
  const [outcomesError, setOutcomesError] = useState("");

  const handleViewDetails = async () => {
    setShowDetails(true);
    setOutcomesLoading(true);
    setOutcomesError("");

    try {
      const response = await fetch(`/api/outcomes?experienceId=${experienceId}`);

      if (!response.ok) {
        throw new Error("Failed to load template outcomes");
      }

      const data = await response.json();
      setOutcomes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading template outcomes:", error);
      setOutcomesError("Unable to load outcomes. Please try again.");
    } finally {
      setOutcomesLoading(false);
    }
  };

  useEffect(() => {
    if (!showDetails) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowDetails(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showDetails]);

  return (
    <>
      <article className="template-card">
      <div className="template-card-header">
        <span className="template-badge">Template</span>
      </div>

      <h2>{title}</h2>

      <p className="template-description">
        {description || "No description provided for this template yet."}
      </p>

      {link && (
        <a className="template-link" href={link} target="_blank" rel="noopener noreferrer">
          View source
        </a>
      )}

      <div className="template-actions">
        <Button
          className="template-button primary"
          onClick={() => {
            clearAddEquivDraft?.();
            setTemplateId?.(experienceId);
            navigate("/create-equivalency", { state: { templateId: experienceId } });
          }}
          text={"Add Possible Equivalencies"}
        />
        <Button
          className="template-button secondary"
          onClick={handleViewDetails}
          text={"View Template Details"}
        />
        <Button
          className="template-button secondary"
          onClick={() => {
            const url = `/equivalency/${experienceId}`;
            window.location.href = url;
          }}
          text={"View Equivalencies"}
        />
      </div>
      </article>

      {showDetails ? (
        <div
          className="template-modal-backdrop"
          role="presentation"
          onClick={() => setShowDetails(false)}
        >
          <section
            className="template-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`template-details-title-${experienceId}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="template-modal-header">
              <h2 id={`template-details-title-${experienceId}`}>{title}</h2>
              <button
                type="button"
                className="template-modal-close"
                onClick={() => setShowDetails(false)}
                aria-label="Close template details"
              >
                ×
              </button>
            </div>

            <div className="template-modal-content">
              {outcomesLoading ? <p>Loading outcomes...</p> : null}
              {outcomesError ? <p className="template-modal-error">{outcomesError}</p> : null}
              {!outcomesLoading && !outcomesError && outcomes.length === 0 ? (
                <p>No outcomes found for this learning experience.</p>
              ) : null}
              {!outcomesLoading && !outcomesError && outcomes.length > 0 ? (
                <ol className="template-outcomes-list">
                  {outcomes.map((outcome) => (
                    <li key={outcome.outcomeId ?? outcome.id}>
                      {outcome.category ? <strong>{outcome.category}: </strong> : null}
                      {outcome.outcomeText ?? outcome.text}
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default Template;
