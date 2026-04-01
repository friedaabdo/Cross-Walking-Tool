import './Home.css';
import InputLine from '../Components/inputLine';
import Button from '../Components/button';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { importCrosswalkCsv } from '../utils/csvImport';

function Home({
    learningExperienceTitle,
    setLearningExperienceTitle,
    cunyCourseTitle,
    setCunyCourseTitle,
    setCertLines,
    setSyllLines,
    setLeTitle,
    setccTitle,
    setMatchesByRow,
    setNotesByRow,
    setDraggedOnceById,
}) {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [importError, setImportError] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setImportError(null);

        try {
            const data = await importCrosswalkCsv(file);
            
            // Populate all state
            setLeTitle(data.leTitle);
            setccTitle(data.ccTitle);
            setCertLines(data.certLines);
            setSyllLines(data.syllLines);
            setMatchesByRow(data.matchesByRow);
            setNotesByRow(data.notesByRow);
            setDraggedOnceById(data.draggedOnceById);

            // Navigate to crosswalk
            navigate('/crosswalk');
        } catch (error) {
            setImportError(error.message || 'Failed to import CSV file');
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } finally {
            setIsImporting(false);
        }
    };

    const handleImportButtonClick = () => {
        fileInputRef.current?.click();
    };

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
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />
            <Button 
                text={isImporting ? "Importing..." : "Import CSV"} 
                onClick={handleImportButtonClick}
                disabled={isImporting}
            />
            {importError && <p style={{ color: 'red' }}>{importError}</p>}
        </div>
    );
}
 
export default Home