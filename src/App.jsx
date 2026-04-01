import { lazy, Suspense, useEffect, useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'

const CertOutcomes = lazy(() => import('./Pages/OutcomesInput'))
const SyllOutcomes = lazy(() => import('./Pages/OutcomesInput'))
const CrossWalk = lazy(() => import('./Pages/CrossWalk'))
const Home = lazy(() => import('./Pages/Home'))

const STORAGE_KEYS = {
  certLines: 'crosswalk.certLines',
  syllLines: 'crosswalk.syllLines',
  leTitle: 'crosswalk.leTitle',
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
  const [leTitle, setLeTitle] = useState(() => getStoredValue(STORAGE_KEYS.leTitle, ''))
  const [ccTitle, setccTitle] = useState(() => getStoredValue(STORAGE_KEYS.ccTitle, ''))
  const [matchesByRow, setMatchesByRow] = useState(() => getStoredValue(STORAGE_KEYS.matchesByRow, {}))
  const [notesByRow, setNotesByRow] = useState(() => getStoredValue(STORAGE_KEYS.notesByRow, {}))
  const [draggedOnceById, setDraggedOnceById] = useState(() => getStoredValue(STORAGE_KEYS.draggedOnceById, {}))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.certLines, JSON.stringify(certLines))
    localStorage.setItem(STORAGE_KEYS.syllLines, JSON.stringify(syllLines))
    localStorage.setItem(STORAGE_KEYS.leTitle, JSON.stringify(leTitle))
    localStorage.setItem(STORAGE_KEYS.ccTitle, JSON.stringify(ccTitle))
    localStorage.setItem(STORAGE_KEYS.matchesByRow, JSON.stringify(matchesByRow))
    localStorage.setItem(STORAGE_KEYS.notesByRow, JSON.stringify(notesByRow))
    localStorage.setItem(STORAGE_KEYS.draggedOnceById, JSON.stringify(draggedOnceById))
  }, [
    certLines,
    syllLines,
    leTitle,
    ccTitle,
    matchesByRow,
    notesByRow,
    draggedOnceById,
  ])

  const resetCrosswalkState = () => {
    setMatchesByRow({})
    setNotesByRow({})
    setDraggedOnceById({})
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
          cunyCourseTitle={ccTitle}
          setCunyCourseTitle={setccTitle}
          setCertLines={setCertLines}
          setSyllLines={setSyllLines}
          setLeTitle={setLeTitle}
          setccTitle={setccTitle}
          setMatchesByRow={setMatchesByRow}
          setNotesByRow={setNotesByRow}
          setDraggedOnceById={setDraggedOnceById}
        />}>
        
      </Route>
      <Route
        path="/learning-experience"
        element={
          <CertOutcomes
            key="learning-experience"
            pageName="Learning Experience"
            certLines={certLines}
            setCertLines={setCertLines}
            leTitle={leTitle}
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
            resetCrosswalkState={resetCrosswalkState}
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
