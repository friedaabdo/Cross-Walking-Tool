import './Home.css';
import InputLine from '../Components/inputLine';
import Button from '../Components/button';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

    return (
        <div id="home-div">
            <h1>Welcome to the Cross Walking Tool</h1>
            <p>This tool is designed to help you cross walk learning outcomes from a learning experience to a syllabus.</p>
            <p>To get started, please input the titles for the learning experience and CUNY course.</p>

            <InputLine placeholder="Learning Experience Title" value=""/>
            <InputLine placeholder="CUNY Course Title" value="" />

            <p>If you have a .csv file, import it here:</p>
            <InputLine placeholder="Import .csv file" type="file" value="" />
            <Button text="Import" onClick={() => {}} />

            <p>Or, you can start from scratch by inputting the learning experience and syllabus outcomes in their respective pages.</p>
             <div id="home-actions">
                <Button text="Go to Learning Experience Outcomes" onClick={() => navigate('/learning-experience')} />
              
             </div>
        </div>
    )
}
 
export default Home