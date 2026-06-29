import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import Nav from './Components/Nav.jsx'
import Create_Template from './Pages/Create_Template.jsx'
import Add_Equiv from './Pages/Add_Equiv.jsx'
const CertOutcomes = lazy(() => import('./Pages/OutcomesInput'))
const SyllOutcomes = lazy(() => import('./Pages/OutcomesInput'))
const CrossWalk = lazy(() => import('./Pages/CrossWalk'))
const Home = lazy(() => import('./Pages/Home'))
const Board = lazy(() => import('./Pages/Board'))
const View_equiv = lazy(() => import('./Pages/View_equiv'))

const STORAGE_KEYS = {
  certLines: 'crosswalk.certLines',
  syllLines: 'crosswalk.syllLines',
  certOutcomeLinks: 'crosswalk.certOutcomeLinks',
  syllOutcomeLinks: 'crosswalk.syllOutcomeLinks',
  certDraft: 'crosswalk.certDraft',
  syllDraft: 'crosswalk.syllDraft',
  leTitle: 'crosswalk.leTitle',
  leDescription: 'crosswalk.leDescription',
  leLink: 'crosswalk.leLink',
  outcomes: 'crosswalk.outcomes',
  outcomesDraft: 'crosswalk.outcomesDraft',
  ccTitle: 'crosswalk.ccTitle',
  ccDescription: 'crosswalk.ccDescription',
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

function clearStoredKeys(keys) {
  keys.forEach((key) => {
    localStorage.removeItem(key)
  })
}

function CrossWalkRoute({
  certLines,
  syllLines,
  setCertLines,
  setSyllLines,
  certOutcomeLinks,
  syllOutcomeLinks,
  leTitle,
  learningExperienceDescription,
  learningExperienceLink,
  ccTitle,
  cunyCourseDescription,
  syllabusFileUrl,
  syllabusFileName,
  matchesByRow,
  setMatchesByRow,
  notesByRow,
  setNotesByRow,
  draggedOnceById,
  setDraggedOnceById,
}) {
  const [courseOutcomeRows, setCourseOutcomeRows] = useState([])
  const [experienceOutcomeRows, setExperienceOutcomeRows] = useState([])
  const queryParams = new URLSearchParams(window.location.search)
  const crosswalkCourseId = queryParams.get('courseId')
  const crosswalkExperienceId = queryParams.get('experienceId')
  const crosswalkMatchId = queryParams.get('matchId')

  useEffect(() => {
    if (!crosswalkCourseId || !crosswalkExperienceId) {
      setCertLines([])
      setSyllLines([])
      return
    }

    let cancelled = false

    const loadCrosswalkOutcomes = async () => {
      try {
        const [courseResponse, experienceResponse] = await Promise.all([
          fetch(`/api/outcomes?courseId=${crosswalkCourseId}`),
          fetch(`/api/outcomes?experienceId=${crosswalkExperienceId}`),
        ])

        if (!courseResponse.ok) {
          throw new Error("Failed to load course outcomes")
        }

        if (!experienceResponse.ok) {
          throw new Error("Failed to load learning experience outcomes")
        }

        const [courseOutcomes, experienceOutcomes] = await Promise.all([
          courseResponse.json(),
          experienceResponse.json(),
        ])

        if (cancelled) {
          return
        }

        const nextCourseOutcomeRows = Array.isArray(courseOutcomes) ? courseOutcomes : []
        const nextExperienceOutcomeRows = Array.isArray(experienceOutcomes) ? experienceOutcomes : []

        setCourseOutcomeRows(nextCourseOutcomeRows)
        setExperienceOutcomeRows(nextExperienceOutcomeRows)

        setSyllLines(
          nextCourseOutcomeRows
            .map((item) => item?.outcome_text ?? item?.outcomeText ?? "")
            .filter((line) => Boolean(String(line).trim()))
        )
        setCertLines(
          nextExperienceOutcomeRows
            .map((item) => item?.outcome_text ?? item?.outcomeText ?? "")
            .filter((line) => Boolean(String(line).trim()))
        )
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load crosswalk outcomes:", error)
        }
      }
    }

    loadCrosswalkOutcomes()

    return () => {
      cancelled = true
    }
  }, [crosswalkCourseId, crosswalkExperienceId, setCertLines, setSyllLines])

  useEffect(() => {
    if (!crosswalkMatchId || courseOutcomeRows.length === 0 || experienceOutcomeRows.length === 0) {
      return
    }

    let cancelled = false

    const loadMatchDetails = async () => {
      try {
        const response = await fetch(`/api/match-details/${crosswalkMatchId}`)

        if (!response.ok) {
          throw new Error("Failed to load match details")
        }

        const detailRows = await response.json()

        if (cancelled) {
          return
        }

        const nextMatchesByRow = {}
        const nextNotesByRow = {}
        const nextDraggedOnceById = {}

        detailRows.forEach((detail) => {
          const courseRowIndex = courseOutcomeRows.findIndex((row) => Number(row?.id) === Number(detail?.cuny_outcome_id))
          const experienceRowIndex = experienceOutcomeRows.findIndex((row) => Number(row?.id) === Number(detail?.experience_outcome_id))

          if (courseRowIndex < 0 || experienceRowIndex < 0) {
            return
          }

          const rowId = `drop-${courseRowIndex}`
          const matchedId = `cert-${experienceRowIndex}`

          nextMatchesByRow[rowId] = [...(nextMatchesByRow[rowId] ?? []), matchedId]
          nextDraggedOnceById[matchedId] = true

          if (detail?.notes && !nextNotesByRow[rowId]) {
            nextNotesByRow[rowId] = detail.notes
          }
        })

        setMatchesByRow(nextMatchesByRow)
        setNotesByRow(nextNotesByRow)
        setDraggedOnceById(nextDraggedOnceById)
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load match details:", error)
        }
      }
    }

    setMatchesByRow({})
    setNotesByRow({})
    setDraggedOnceById({})
    loadMatchDetails()

    return () => {
      cancelled = true
    }
  }, [
    crosswalkMatchId,
    courseOutcomeRows,
    experienceOutcomeRows,
    setDraggedOnceById,
    setMatchesByRow,
    setNotesByRow,
  ])

  return (
    <CrossWalk
      certLines={certLines}
      syllLines={syllLines}
      certOutcomeLinks={certOutcomeLinks}
      syllOutcomeLinks={syllOutcomeLinks}
      leTitle={leTitle}
      learningExperienceDescription={learningExperienceDescription}
      learningExperienceLink={learningExperienceLink}
      ccTitle={ccTitle}
      cunyCourseDescription={cunyCourseDescription}
      syllabusFileUrl={syllabusFileUrl}
      syllabusFileName={syllabusFileName}
      matchesByRow={matchesByRow}
      setMatchesByRow={setMatchesByRow}
      notesByRow={notesByRow}
      setNotesByRow={setNotesByRow}
      draggedOnceById={draggedOnceById}
      setDraggedOnceById={setDraggedOnceById}
      courseId={crosswalkCourseId}
      experienceId={crosswalkExperienceId}
      matchId={crosswalkMatchId}
    />
  )
}

function App() {
  const [certLines, setCertLines] = useState(() => getStoredValue(STORAGE_KEYS.certLines, []))
  const [syllLines, setSyllLines] = useState(() => getStoredValue(STORAGE_KEYS.syllLines, []))
  const [certOutcomeLinks, setCertOutcomeLinks] = useState(() => getStoredValue(STORAGE_KEYS.certOutcomeLinks, {}))
  const [syllOutcomeLinks, setSyllOutcomeLinks] = useState(() => getStoredValue(STORAGE_KEYS.syllOutcomeLinks, {}))
  const [certDraft, setCertDraft] = useState(() => getStoredValue(STORAGE_KEYS.certDraft, ''))
  const [syllDraft, setSyllDraft] = useState(() => getStoredValue(STORAGE_KEYS.syllDraft, ''))
  const [leTitle, setLeTitle] = useState(() => getStoredValue(STORAGE_KEYS.leTitle, ''))
  const [learningExperienceDescription, setLearningExperienceDescription] = useState(() => getStoredValue(STORAGE_KEYS.leDescription, ''))
  const [learningExperienceLink, setLearningExperienceLink] = useState(() => getStoredValue(STORAGE_KEYS.leLink, ''))
  const [outcomes, setOutcomes] = useState(() => getStoredValue(STORAGE_KEYS.outcomes, []))
  const [outcomesDraft, setOutcomesDraft] = useState(() => getStoredValue(STORAGE_KEYS.outcomesDraft, ''))
  const [syllabusFileUrl, setSyllabusFileUrl] = useState('')
  const [syllabusFileName, setSyllabusFileName] = useState('')
  const [ccTitle, setccTitle] = useState(() => getStoredValue(STORAGE_KEYS.ccTitle, ''))
  const [cunyCourseDescription, setCunyCourseDescription] = useState(() => getStoredValue(STORAGE_KEYS.ccDescription, ''))
  const [matchesByRow, setMatchesByRow] = useState(() => getStoredValue(STORAGE_KEYS.matchesByRow, {}))
  const [notesByRow, setNotesByRow] = useState(() => getStoredValue(STORAGE_KEYS.notesByRow, {}))
  const [draggedOnceById, setDraggedOnceById] = useState(() => getStoredValue(STORAGE_KEYS.draggedOnceById, {}))

  const hasSavedProgress =
    certLines.length > 0 ||
    syllLines.length > 0 ||
    Object.keys(certOutcomeLinks).length > 0 ||
    Object.keys(syllOutcomeLinks).length > 0 ||
    Boolean(leTitle.trim()) ||
    Boolean(learningExperienceDescription.trim()) ||
    Boolean(learningExperienceLink.trim()) ||
    outcomes.length > 0 ||
    Boolean(outcomesDraft.trim()) ||
    Boolean(syllabusFileUrl) ||
    Boolean(ccTitle.trim()) ||
    Boolean(cunyCourseDescription.trim()) ||
    Object.keys(matchesByRow).length > 0 ||
    Object.keys(notesByRow).length > 0 ||
    Object.keys(draggedOnceById).length > 0

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.certLines, JSON.stringify(certLines))
    localStorage.setItem(STORAGE_KEYS.syllLines, JSON.stringify(syllLines))
    localStorage.setItem(STORAGE_KEYS.certOutcomeLinks, JSON.stringify(certOutcomeLinks))
    localStorage.setItem(STORAGE_KEYS.syllOutcomeLinks, JSON.stringify(syllOutcomeLinks))
    localStorage.setItem(STORAGE_KEYS.certDraft, JSON.stringify(certDraft))
    localStorage.setItem(STORAGE_KEYS.syllDraft, JSON.stringify(syllDraft))
    localStorage.setItem(STORAGE_KEYS.leTitle, JSON.stringify(leTitle))
    localStorage.setItem(STORAGE_KEYS.leDescription, JSON.stringify(learningExperienceDescription))
    localStorage.setItem(STORAGE_KEYS.leLink, JSON.stringify(learningExperienceLink))
    localStorage.setItem(STORAGE_KEYS.outcomes, JSON.stringify(outcomes))
    localStorage.setItem(STORAGE_KEYS.outcomesDraft, JSON.stringify(outcomesDraft))
    localStorage.setItem(STORAGE_KEYS.ccTitle, JSON.stringify(ccTitle))
    localStorage.setItem(STORAGE_KEYS.ccDescription, JSON.stringify(cunyCourseDescription))
    localStorage.setItem(STORAGE_KEYS.matchesByRow, JSON.stringify(matchesByRow))
    localStorage.setItem(STORAGE_KEYS.notesByRow, JSON.stringify(notesByRow))
    localStorage.setItem(STORAGE_KEYS.draggedOnceById, JSON.stringify(draggedOnceById))
  }, [
    certLines,
    syllLines,
    certOutcomeLinks,
    syllOutcomeLinks,
    certDraft,
    syllDraft,
    leTitle,
    learningExperienceDescription,
    learningExperienceLink,
    outcomes,
    outcomesDraft,
    ccTitle,
    cunyCourseDescription,
    matchesByRow,
    notesByRow,
    draggedOnceById,
  ])

  const clearSavedProgress = () => {
    setCertLines([])
    setSyllLines([])
    setCertOutcomeLinks({})
    setSyllOutcomeLinks({})
    setCertDraft('')
    setSyllDraft('')
    setLeTitle('')
    setLearningExperienceDescription('')
    setLearningExperienceLink('')
    setOutcomes([])
    setOutcomesDraft('')
    setSyllabusFileUrl('')
    setSyllabusFileName('')
    setccTitle('')
    setCunyCourseDescription('')
    setMatchesByRow({})
    setNotesByRow({})
    setDraggedOnceById({})

    clearStoredKeys(Object.values(STORAGE_KEYS))
  }

  const clearAddEquivDraft = () => {
    setccTitle('')
    setCunyCourseDescription('')
    setSyllabusFileUrl('')
    setSyllabusFileName('')
    setOutcomes([])
    setOutcomesDraft('')

    clearStoredKeys([
      STORAGE_KEYS.ccTitle,
      STORAGE_KEYS.ccDescription,
      STORAGE_KEYS.outcomes,
      STORAGE_KEYS.outcomesDraft,
    ])
  }

  const clearCreateTemplateDraft = () => {
    setLeTitle('')
    setLearningExperienceDescription('')
    setLearningExperienceLink('')
    setOutcomes([])
    setOutcomesDraft('')

    clearStoredKeys([
      STORAGE_KEYS.leTitle,
      STORAGE_KEYS.leDescription,
      STORAGE_KEYS.leLink,
      STORAGE_KEYS.outcomes,
      STORAGE_KEYS.outcomesDraft,
    ])
  }

  const clearCrosswalkDraft = () => {
    setMatchesByRow({})
    setNotesByRow({})
    setDraggedOnceById({})
    setCertLines([])
    setSyllLines([])

    clearStoredKeys([
      STORAGE_KEYS.matchesByRow,
      STORAGE_KEYS.notesByRow,
      STORAGE_KEYS.draggedOnceById,
      STORAGE_KEYS.certLines,
      STORAGE_KEYS.syllLines,
    ])
  }

  return (
    <div className="App">
  {/* <h1>CUNY CPL Evaluation Cross Walking Tool</h1> */}
    <BrowserRouter>
      <Nav clearCreateTemplateDraft={clearCreateTemplateDraft} />
      <Suspense fallback={<p>Loading page...</p>}>
        <Routes>
          <Route path="/"
            element={<Home
              learningExperienceTitle={leTitle}
          setLearningExperienceTitle={setLeTitle}
          learningExperienceDescription={learningExperienceDescription}
          setLearningExperienceDescription={setLearningExperienceDescription}
          learningExperienceLink={learningExperienceLink}
          setLearningExperienceLink={setLearningExperienceLink}
          setSyllabusFileUrl={setSyllabusFileUrl}
          syllabusFileName={syllabusFileName}
          setSyllabusFileName={setSyllabusFileName}
          cunyCourseTitle={ccTitle}
          setCunyCourseTitle={setccTitle}
          cunyCourseDescription={cunyCourseDescription}
          setCunyCourseDescription={setCunyCourseDescription}
          setCertLines={setCertLines}
          setSyllLines={setSyllLines}
          setCertOutcomeLinks={setCertOutcomeLinks}
          setSyllOutcomeLinks={setSyllOutcomeLinks}
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
        element={<Board clearAddEquivDraft={clearAddEquivDraft} />}
      />
       <Route
        path="/create-template"
        element={<Create_Template
          learningExperienceTitle={leTitle}
          setLearningExperienceTitle={setLeTitle}
          learningExperienceDescription={learningExperienceDescription}
          setLearningExperienceDescription={setLearningExperienceDescription}
          learningExperienceLink={learningExperienceLink}
          setLearningExperienceLink={setLearningExperienceLink}
          outcomes={outcomes}
          setOutcomes={setOutcomes}
          outcomesDraft={outcomesDraft}
          setOutcomesDraft={setOutcomesDraft}
        />}
      />
      <Route
        path="/add-equivalency"
        element={<Add_Equiv
          cunyCourseTitle={ccTitle}
          setCunyCourseTitle={setccTitle}
          cunyCourseDescription={cunyCourseDescription}
          setCunyCourseDescription={setCunyCourseDescription}
          syllabusFileUrl={syllabusFileUrl}
          setSyllabusFileUrl={setSyllabusFileUrl}
          syllabusFileName={syllabusFileName}
          setSyllabusFileName={setSyllabusFileName}
          outcomes={outcomes}
          setOutcomes={setOutcomes}
          outcomesDraft={outcomesDraft}
          setOutcomesDraft={setOutcomesDraft}
          clearCrosswalkDraft={clearCrosswalkDraft}
        />}
      />
      <Route
        path="/equivalency/:experienceId"
        element={<View_equiv />}
      />
      <Route
        path="/learning-experience"
        element={
          <CertOutcomes
            key="learning-experience"
            pageName="Learning Experience"
            certLines={certLines}
            setCertLines={setCertLines}
            outcomeLinks={certOutcomeLinks}
            setOutcomeLinks={setCertOutcomeLinks}
            draftValue={certDraft}
            setDraftValue={setCertDraft}
            leTitle={leTitle}
            learningExperienceLink={learningExperienceLink}
            setLeTitle={setLeTitle}
            learningExperienceDescription={learningExperienceDescription}
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
            outcomeLinks={syllOutcomeLinks}
            setOutcomeLinks={setSyllOutcomeLinks}
            draftValue={syllDraft}
            setDraftValue={setSyllDraft}
            ccTitle={ccTitle}
            syllabusFileUrl={syllabusFileUrl}
            syllabusFileName={syllabusFileName}
            setCcTitle={setccTitle}
            cunyCourseDescription={cunyCourseDescription}

          />
        }
      />
      <Route
        path="/crosswalk"
        element={
          <CrossWalkRoute
            certLines={certLines}
            syllLines={syllLines}
            certOutcomeLinks={certOutcomeLinks}
            syllOutcomeLinks={syllOutcomeLinks}
            leTitle={leTitle}
            setCertLines={setCertLines}
            setSyllLines={setSyllLines}
            learningExperienceDescription={learningExperienceDescription}
            learningExperienceLink={learningExperienceLink}
            ccTitle={ccTitle}
            cunyCourseDescription={cunyCourseDescription}
            syllabusFileUrl={syllabusFileUrl}
            syllabusFileName={syllabusFileName}
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
