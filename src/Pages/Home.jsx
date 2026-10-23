import "./Home.css";
import Button from "../Components/Button.jsx";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div id="home-div">
      <h1>Welcome to the CUNY CPL Evaluation Cross Walking Tool</h1>
      <p>
        This tool is designed to help CUNY faculty recognize alignment between
        non-collegiate learning experiences (such as industry credentials and
        workplace training programs) and credit-bearing courses offered by CUNY
        colleges, in order to make decisions about appropriate Credit for Prior
        Learning equivalencies and credit awards.{" "}
      </p>
      <p>In the next steps you will be able to:</p>
      <ol>
        <li>
          Input key information about credentials/trainings (such as learning
          outcomes, competencies, or topic areas)
        </li>
        <li>
          Input the student learning objectives from the syllabus of a
          particular CUNY course.
        </li>
        <li>
          Drag-and-drop credential/training information to place it alongside
          course learning objectives, in order to identify and visualize
          alignment.
        </li>
      </ol>

      <div className="home-actions">
        <Button text="Start New Crosswalk" onClick={() => navigate("/create-learning-experience")} />
      </div>
    </div>
  );
}

export default Home;
