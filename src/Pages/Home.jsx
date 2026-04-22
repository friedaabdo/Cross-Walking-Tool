import './Home.css';
import InputLine from '../Components/inputLine';
import Button from '../Components/button';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { importCrosswalkCsv } from '../utils/csvImport';

function Home({
    learningExperienceTitle,
    setLearningExperienceTitle,
    learningExperienceLink,
    setLearningExperienceLink,
    cunyCourseTitle,
    setCunyCourseTitle,
    setCertLines,
    setSyllLines,
    setLeTitle,
    setccTitle,
    setMatchesByRow,
    setNotesByRow,
    setDraggedOnceById,
    hasSavedProgress,
    clearSavedProgress,
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

            // Open the learning experience editor so imported outcomes can be reviewed and edited
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

    const handleClearSavedProgress = () => {
        clearSavedProgress();
        setImportError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div id="home-div">
            <h1>Welcome to the Cross Walking Tool</h1>
            <p>This tool is designed to help you cross walk learning outcomes from a learning experience to a syllabus.</p>
            <p>To get started, please input the titles for the learning experience and CUNY course.</p>

            <p>You can start from scratch by inputting the learning experience and syllabus outcomes in their respective pages.</p>
            
            <div className='main-data'> 
                <h4>Learning Experience</h4>
                <InputLine
                placeholder="Learning Experience Title"
                value={learningExperienceTitle}
                onChange={(event) => setLearningExperienceTitle(event.target.value)}
            />
            <p>Add the link to the main page of the learning experience:</p><InputLine
                placeholder="Learning Experience Link"
                value={learningExperienceLink}
                onChange={(event) => setLearningExperienceLink(event.target.value)}
            /></div>
           
            <div className='main-data'>
                <h4>CUNY Course</h4>
            <InputLine
                placeholder="CUNY Course Title"
                value={cunyCourseTitle}
                onChange={(event) => setCunyCourseTitle(event.target.value)}
            />
            <p>Attach the syllabus for the CUNY course:</p>
            <InputLine placeholder="Syllabus File" type="file" accept=".pdf,.doc,.docx" />

            </div>
            <div id="home-actions">
                <Button text="Add Learning Experience Outcomes" onClick={() => navigate('/learning-experience')} />
            </div>

            <div className="home-persistence-actions">
                <Button
                    text="Resume Saved Progress"
                    onClick={() => navigate('/crosswalk')}
                    disabled={!hasSavedProgress}
                />
                <Button
                    text="Clear Saved Progress"
                    onClick={handleClearSavedProgress}
                    disabled={!hasSavedProgress}
                />
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
            <p className="home-save-hint">
                {hasSavedProgress
                    ? 'Progress is auto-saved on this browser.'
                    : 'No saved progress found on this browser yet.'}
            </p>
        </div>
    );
}
 
export default Home