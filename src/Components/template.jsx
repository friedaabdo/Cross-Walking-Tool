//create the component for the templates
// import React, { useState } from "react";
import "./template.css";
import Button from "./button.jsx";

   const createCourseAndMatch = async (experience_id) => {
            try {
              const courseResponse = await fetch("/api/cuny-courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "New Course", description: "" }),
              });

              if (!courseResponse.ok) {
                throw new Error("Failed to create CUNY course");
              }

              const courseData = await courseResponse.json();
              const courseId = courseData?.courseId ?? courseData?.id;

              if (!courseId) {
                throw new Error("Missing course id from response");
              }

              const matchResponse = await fetch("/api/matches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  course_id: courseId,
                  experience_id,
                }),
              });

              if (!matchResponse.ok) {
                throw new Error("Failed to create match");
              }

              const matchData = await matchResponse.json();

              window.location.href = `/add-equivalency?courseId=${courseId}&experienceId=${experience_id}&matchId=${matchData?.match_id ?? ""}`;
            } catch (err) {
              console.error("Error creating course and match:", err);
              alert("Failed to create course or match. Please try again.");
            }
          };

function Template({ title, description, link, experience_id, clearAddEquivDraft }) {
  return (
    <div className="template">
      <h2>{title}</h2>
      
      
      <p>{description}</p>
      <a href={link} target="_blank" rel="noopener noreferrer">
        Learn More
      </a>
      <Button
        className="use-template-button"
        onClick={() => {
          clearAddEquivDraft?.();
          createCourseAndMatch(experience_id);
        }}
      text={"Add Possible Equivalencies"}>
        
        
      </Button>
      <Button
        className="use-template-button"
        onClick={() => {
          const url = `/equivalency/${experience_id}`;
          window.location.href = url;
        }}
      text={"View Equivalencies"}>
      </Button>
    </div>
  );
}

export default Template;
