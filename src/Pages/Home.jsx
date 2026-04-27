import './Home.css';
import InputLine from '../Components/inputLine';
import Button from '../Components/button';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { importCrosswalkCsv } from '../utils/csvImport';

const MAX_SYLLABUS_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function Home({
    learningExperienceTitle,
    setLearningExperienceTitle,
    learningExperienceDescription,
    setLearningExperienceDescription,
    learningExperienceLink,
    setLearningExperienceLink,
    setSyllabusFileUrl,
    syllabusFileName,
    setSyllabusFileName,
    cunyCourseTitle,
    setCunyCourseTitle,
    cunyCourseDescription,
    setCunyCourseDescription,
    setCertLines,
    setSyllLines,
    setCertOutcomeLinks,
    setSyllOutcomeLinks,
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
            setLearningExperienceDescription(data.learningExperienceDescription ?? '');
            setLearningExperienceLink(data.learningExperienceLink ?? '');
            setccTitle(data.ccTitle);
            setCunyCourseDescription(data.cunyCourseDescription ?? '');
            setCertLines(data.certLines);
            setSyllLines(data.syllLines);
            setCertOutcomeLinks(data.certOutcomeLinks ?? {});
            setSyllOutcomeLinks(data.syllOutcomeLinks ?? {});
            setSyllabusFileName(data.syllabusFileName ?? '');
            setSyllabusFileUrl(data.syllabusFileDataUrl ?? '');
          
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

    const handleSyllabusFileChange = (event) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            return;
        }

        if (selectedFile.size > MAX_SYLLABUS_FILE_SIZE_BYTES) {
            const maxSizeMb = MAX_SYLLABUS_FILE_SIZE_BYTES / (1024 * 1024);
            setImportError(`Syllabus file is too large. Please upload a file smaller than ${maxSizeMb} MB.`);
            event.target.value = '';
            return;
        }

        setImportError(null);

        const fileReader = new FileReader();
        fileReader.onload = () => {
            const dataUrl = typeof fileReader.result === 'string' ? fileReader.result : '';
            setSyllabusFileUrl(dataUrl);
            setSyllabusFileName(selectedFile.name);
        };

        fileReader.onerror = () => {
            setImportError('Failed to read uploaded syllabus file');
        };

        fileReader.readAsDataURL(selectedFile);
    };

    return (
        <div id="home-div">
            <h1>Welcome to the Cross Walking Tool</h1>
            <p>This tool is designed to help you find similarities between learning experiences and CUNY courses. In the next steps you will be able to import your data and visualize the relationships between different learning outcomes.</p>
            <p>You can start from scratch by inputting the learning experience and syllabus outcomes in their respective pages. Or if you have a .csv file you have been working on, import it here:</p>
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
             <p>Note: Importing a CSV file will overwrite any current progress in this browser.</p>
             <p>If you have previously entered data but haven't exported it, you can resume your progress by clicking the "Resume Saved Progress" button below. Your progress is auto-saved on this browser.</p>
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
            
            <p className="home-save-hint">
                {hasSavedProgress
                    ? 'Progress is auto-saved on this browser.'
                    : 'No saved progress found on this browser yet.'}
            </p>
             <hr />
            <p>To get started, please input some metadata for the courses you want to crosswalk.</p>

            
            <div className='main-data'> 
                <h4>Learning Experience</h4>
                <label htmlFor="learningExperienceTitle">Learning Experience Title:</label>
                <InputLine
                placeholder="ex. CompTIA Security+"
                value={learningExperienceTitle}
                onChange={(event) => setLearningExperienceTitle(event.target.value)}
            />
            <label htmlFor="learningExperienceDescription">Learning Experience Description:</label>
            <textarea
                className="home-description-textarea"
                placeholder="Enter a description of the learning experience"
                value={learningExperienceDescription}
                onChange={(event) => setLearningExperienceDescription(event.target.value)}
                rows={4}
            />
            <label htmlFor="learningExperienceLink">Learning Experience Link:</label>
            <InputLine
                placeholder="https://example.com/learning-experience"
                value={learningExperienceLink}
                onChange={(event) => setLearningExperienceLink(event.target.value)}
            /></div>
           
            <div className='main-data'>
                <h4>CUNY Course</h4>
                <label htmlFor="cunyCourseTitle">CUNY Course Title:</label>
            <InputLine
                placeholder="ex. Introduction to Computer Science"
                value={cunyCourseTitle}
                onChange={(event) => setCunyCourseTitle(event.target.value)}
            />

            <label htmlFor="cunyCourseDescription">CUNY Course Description:</label>
            <textarea
                className="home-description-textarea"
                placeholder="Enter a description of the CUNY course"
                value={cunyCourseDescription}
                onChange={(event) => setCunyCourseDescription(event.target.value)}
                rows={4}
            />
            <p>Attach the syllabus for the CUNY course:</p>
            
            <InputLine
                placeholder="Syllabus File"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleSyllabusFileChange}
            />
            {syllabusFileName ? <p>Uploaded: {syllabusFileName}</p> : null}

            </div>
            <p>Next, you can input the individual learning outcomes for each course by clicking the button below.</p>
            <div id="home-actions">
                <Button text="Add Outcomes" onClick={() => navigate('/learning-experience')} />
            </div>

            
        </div>
    );
}
 
export default Home