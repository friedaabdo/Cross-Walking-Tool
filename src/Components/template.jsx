//create the component for the templates
// import React, { useState } from "react";
import "./Template.css";
import { useNavigate } from "react-router-dom";
import Button from "./Button.jsx";

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

  return (
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
          onClick={() => {
            const url = `/equivalency/${experienceId}`;
            window.location.href = url;
          }}
          text={"View Equivalencies"}
        />
      </div>
    </article>
  );
}

export default Template;
