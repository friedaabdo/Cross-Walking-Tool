//create the component for the templates
// import React, { useState } from "react";
import "./template.css";
import Button from "./button.jsx";

function Template({ title, description, link }) {
  return (
    <div className="template">
      <h2>{title}</h2>
      <p>{description}</p>
      <a href={link} target="_blank" rel="noopener noreferrer">
        Learn More
      </a>
      <Button
        className="use-template-button"
        //onclick i want to navigate to 
        onClick={() => alert(`You clicked to use the "${title}" template!`)}
      text={"Add Possible Equivalencies"}>
        
      </Button>
      <Button
        className="use-template-button"
        onClick={() => alert(`You clicked to use the "${title}" template!`)}
      text={"View Equivalencies"}>
        
      </Button>
    </div>
  );
}

export default Template;
