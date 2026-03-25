import './Home.css';
import InputLine from '../Components/inputLine';
import Button from '../Components/button';
import { useNavigate } from 'react-router-dom';

function Home({
    learningExperienceTitle,
    setLearningExperienceTitle,
    cunyCourseTitle,
    setCunyCourseTitle,
}) {
    const navigate = useNavigate();

    return (
        <div id="home-div">
            <h1>Welcome to the Cross Walking Tool</h1>
            <p>This tool is designed to help you cross walk learning outcomes from a learning experience to a syllabus.</p>
            <p>To get started, please input the titles for the learning experience and CUNY course.</p>

            <p>You can start from scratch by inputting the learning experience and syllabus outcomes in their respective pages.</p>
            <InputLine
                placeholder="Learning Experience Title"
                value={learningExperienceTitle}
                onChange={(event) => setLearningExperienceTitle(event.target.value)}
            />
            <InputLine
                placeholder="CUNY Course Title"
                value={cunyCourseTitle}
                onChange={(event) => setCunyCourseTitle(event.target.value)}
            />
            <div id="home-actions">
                <Button text="Go to Learning Experience Outcomes" onClick={() => navigate('/learning-experience')} />
            </div>

            <p>Or, if you have a .csv file, import it here:</p>
            <InputLine type="file" />
            <Button text="Import" onClick={() => {}} />

              
             </div>
      
    )
}
 
export default Home