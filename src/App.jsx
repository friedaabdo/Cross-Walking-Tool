import { lazy, Suspense, useEffect, useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'

const CertOutcomes = lazy(() => import('./Pages/OutcomesInput'))
const SyllOutcomes = lazy(() => import('./Pages/OutcomesInput'))
const CrossWalk = lazy(() => import('./Pages/CrossWalk'))
const Home = lazy(() => import('./Pages/Home'))
const Board = lazy(() => import('./Pages/Board'))

const STORAGE_KEYS = {
  certLines: 'crosswalk.certLines',
  syllLines: 'crosswalk.syllLines',
  certDraft: 'crosswalk.certDraft',
  syllDraft: 'crosswalk.syllDraft',
  leTitle: 'crosswalk.leTitle',
  leLink: 'crosswalk.leLink',
  ccTitle: 'crosswalk.ccTitle',
  matchesByRow: 'crosswalk.matchesByRow',
  notesByRow: 'crosswalk.notesByRow',
  draggedOnceById: 'crosswalk.draggedOnceById',
}

function getStoredValue(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) {
      return fallbackValue
    }

    return JSON.parse(raw)
  } catch {
    return fallbackValue
  }
}

function App() {
  const [certLines, setCertLines] = useState(() => getStoredValue(STORAGE_KEYS.certLines, []))
  const [syllLines, setSyllLines] = useState(() => getStoredValue(STORAGE_KEYS.syllLines, []))
  const [certDraft, setCertDraft] = useState(() => getStoredValue(STORAGE_KEYS.certDraft, ''))
  const [syllDraft, setSyllDraft] = useState(() => getStoredValue(STORAGE_KEYS.syllDraft, ''))
  const [leTitle, setLeTitle] = useState(() => getStoredValue(STORAGE_KEYS.leTitle, ''))
  const [learningExperienceLink, setLearningExperienceLink] = useState(() => getStoredValue(STORAGE_KEYS.leLink, ''))
  const [ccTitle, setccTitle] = useState(() => getStoredValue(STORAGE_KEYS.ccTitle, ''))
  const [matchesByRow, setMatchesByRow] = useState(() => getStoredValue(STORAGE_KEYS.matchesByRow, {}))
  const [notesByRow, setNotesByRow] = useState(() => getStoredValue(STORAGE_KEYS.notesByRow, {}))
  const [draggedOnceById, setDraggedOnceById] = useState(() => getStoredValue(STORAGE_KEYS.draggedOnceById, {}))

  const hasSavedProgress =
    certLines.length > 0 ||
    syllLines.length > 0 ||
    Boolean(leTitle.trim()) ||
    Boolean(learningExperienceLink.trim()) ||
    Boolean(ccTitle.trim()) ||
    Object.keys(matchesByRow).length > 0 ||
    Object.keys(notesByRow).length > 0 ||
    Object.keys(draggedOnceById).length > 0

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.certLines, JSON.stringify(certLines))
    localStorage.setItem(STORAGE_KEYS.syllLines, JSON.stringify(syllLines))
    localStorage.setItem(STORAGE_KEYS.certDraft, JSON.stringify(certDraft))
    localStorage.setItem(STORAGE_KEYS.syllDraft, JSON.stringify(syllDraft))
    localStorage.setItem(STORAGE_KEYS.leTitle, JSON.stringify(leTitle))
    localStorage.setItem(STORAGE_KEYS.leLink, JSON.stringify(learningExperienceLink))
    localStorage.setItem(STORAGE_KEYS.ccTitle, JSON.stringify(ccTitle))
    localStorage.setItem(STORAGE_KEYS.matchesByRow, JSON.stringify(matchesByRow))
    localStorage.setItem(STORAGE_KEYS.notesByRow, JSON.stringify(notesByRow))
    localStorage.setItem(STORAGE_KEYS.draggedOnceById, JSON.stringify(draggedOnceById))
  }, [
    certLines,
    syllLines,
    certDraft,
    syllDraft,
    leTitle,
    learningExperienceLink,
    ccTitle,
    matchesByRow,
    notesByRow,
    draggedOnceById,
  ])

  const clearSavedProgress = () => {
    setCertLines([])
    setSyllLines([])
    setCertDraft('')
    setSyllDraft('')
    setLeTitle('')
    setLearningExperienceLink('')
    setccTitle('')
    setMatchesByRow({})
    setNotesByRow({})
    setDraggedOnceById({})

    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  }

  return (
    <div className="App">
  <h1>Cross Walking Tool</h1>
    <BrowserRouter>
    <Suspense fallback={<p>Loading page...</p>}>
    <Routes>
      <Route path="/"
        element={<Home
          learningExperienceTitle={leTitle}
          setLearningExperienceTitle={setLeTitle}
          learningExperienceLink={learningExperienceLink}
          setLearningExperienceLink={setLearningExperienceLink}
          cunyCourseTitle={ccTitle}
          setCunyCourseTitle={setccTitle}
          setCertLines={setCertLines}
          setSyllLines={setSyllLines}
          setLeTitle={setLeTitle}
          setccTitle={setccTitle}
          setMatchesByRow={setMatchesByRow}
          setNotesByRow={setNotesByRow}
          setDraggedOnceById={setDraggedOnceById}
          hasSavedProgress={hasSavedProgress}
          clearSavedProgress={clearSavedProgress}
        />}>
        
      </Route>
      <Route
        path="/board"
        element={<Board/>}
      />
      <Route
        path="/learning-experience"
        element={
          <CertOutcomes
            key="learning-experience"
            pageName="Learning Experience"
            certLines={certLines}
            setCertLines={setCertLines}
            draftValue={certDraft}
            setDraftValue={setCertDraft}
            leTitle={leTitle}
            learningExperienceLink={learningExperienceLink}
            setLeTitle={setLeTitle}
          />
        }
      />
      <Route
        path="/syllabus"
        element={
          <SyllOutcomes
            key="syllabus"
            pageName="Syllabus"
            syllLines={syllLines}
            setSyllLines={setSyllLines}
            draftValue={syllDraft}
            setDraftValue={setSyllDraft}
            ccTitle={ccTitle}
            setCcTitle={setccTitle}
          />
        }
      />
      <Route
        path="/crosswalk"
        element={
          <CrossWalk
            certLines={certLines}
            syllLines={syllLines}
            leTitle={leTitle}
            ccTitle={ccTitle}
            matchesByRow={matchesByRow}
            setMatchesByRow={setMatchesByRow}
            notesByRow={notesByRow}
            setNotesByRow={setNotesByRow}
            draggedOnceById={draggedOnceById}
            setDraggedOnceById={setDraggedOnceById}
          />
        }
      />
      <Route path="/*" element={<h1>404 Not Found</h1>} />
    </Routes>
    </Suspense>
    </BrowserRouter>
    
     </div> 
  )
}

export default App
