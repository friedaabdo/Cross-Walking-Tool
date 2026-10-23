import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import axios from 'axios'

import Nav from './Components/Nav.jsx'
import CreateOutcomes from './Pages/CreateOutcomes.jsx'
import { loadMatchState } from './utils/matchDetails'
import { buildOutcomeRecords } from './utils/outcomeText'
const CrossWalk = lazy(() => import('./Pages/CrossWalk.jsx'))
const Home = lazy(() => import('./Pages/Home.jsx'))
const Board = lazy(() => import('./Pages/Board.jsx'))
const ViewEquiv = lazy(() => import('./Pages/ViewEquiv.jsx'))



const createLearningExperience = async (formData = {}) => {
  const title = String(formData.title ?? '').trim()

  if (!title) {
    throw new Error('Title is required before creating a learning experience.')
  }

  const payload = {
    title,
    description: String(formData.description ?? ''),
    link: String(formData.LElink ?? ''),
    outcomes: [],
    userId: null,
    is_template: formData.is_template ? 1 : 0,
  }

  const experienceId = formData.experienceId ?? formData.experience_id
  const response = experienceId
    ? await axios.put(`/api/learning-experiences/${experienceId}`, payload)
    : await axios.post('/api/learning-experiences', payload)
  console.log('Created learning experience:', response.data)
  return response.data
}

const createCunyCourse = async (formData = {}) => {
  const title = String(formData.title ?? '').trim()
  const courseCode = String(formData.courseCode ?? '').trim()

  if (!title) {
    throw new Error('Title is required before creating a CUNY course.')
  }

  if (!courseCode) {
    throw new Error('Course code is required before creating a CUNY course.')
  }

  const payload = {
    title,
    description: String(formData.description ?? ''),
    departmentId: formData.department?.id ?? null,
    userId: null,
    courseCode,
    syllabusFileName: String(formData.syllabusFileName ?? ''),
    syllabusFileUrl: String(formData.syllabusFile ?? ''),
    experienceId: formData.experienceId ?? null,
  }

  const courseId = formData.courseId ?? formData.course_id
  const response = courseId
    ? await axios.put(`/api/cuny-courses/${courseId}`, payload)
    : await axios.post('/api/cuny-courses', payload)
  console.log('Created CUNY course:', response.data)
  return response.data
}

const submitOutcomes = async (formData = {}) => {
  const outcomes = Array.isArray(formData.outcomes) ? formData.outcomes : []

  if (!outcomes.length) {
    throw new Error('No outcomes to submit.')
  }

  const normalizedOutcomes = buildOutcomeRecords(outcomes)

  const recordType = formData.recordType || (formData.courseId ? 'cunyCourse' : 'learningExperience')
  const courseId = formData.courseId ?? null
  const experienceId = formData.experienceId ?? null

  const payload = {
    outcomes: normalizedOutcomes,
    ...(recordType === 'cunyCourse'
      ? { courseId: courseId ?? null, experienceId: null }
      : { courseId: null, experienceId: experienceId ?? null }),
  }

  const response = await axios.post('/api/outcomes/bulk-replace', payload)
  console.log('Submitted outcomes:', response.data)
  return response.data
}

const createLearningExperienceProps = {
  outcomeType: 'learningExperience',
  onChange: () => {},
  submitMainData: createLearningExperience,
  submitOutcomes,
  submitTagMapping: () => {},
  goToEnd: () => {}, //if template, goes to temlate, if reg crosswalk goes to cuny course
  is_template: false,
}

const createCunyCourseProps = {
  outcomeType: 'cunyCourse',
  formData: {},
  onChange: () => {},
  submitMainData: createCunyCourse,
  submitOutcomes,
  submitTagMapping: () => {},
  goToEnd: () => {}, // if add-equiv goes to crosswalk with template, if reg crosswalk goes to crosswalk with le it got made with
  experienceId: null,
}

const createCrosswalkProps = {
  outcomeType: 'crosswalk',
  formData: {},
  onChange: () => {},
  submitMainData: () => {},
  submitOutcomes: () => {},
  submitTagMapping: () => {},
  goToCrosswalk: () => {},
}


//--------------------------------------------

function CrossWalkRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const [courseOutcomeRows, setCourseOutcomeRows] = useState([])
  const [experienceOutcomeRows, setExperienceOutcomeRows] = useState([])
  const [matchesByRow, setMatchesByRow] = useState({})
  const [notesByRow, setNotesByRow] = useState({})
  const [draggedOnceById, setDraggedOnceById] = useState({})
  const [loadedDetails, setLoadedDetails] = useState(null)
  const queryParams = new URLSearchParams(window.location.search)
  const crosswalkCourseId = queryParams.get('courseId')
  const crosswalkExperienceId = queryParams.get('experienceId')
  const crosswalkMatchId = queryParams.get('matchId')

  useEffect(() => {
    if (!crosswalkCourseId || !crosswalkExperienceId) {
      return
    }

    let cancelled = false

    const loadCrosswalkDetails = async () => {
      try {
        const [courseResponse, experienceResponse] = await Promise.all([
          fetch(`/api/cuny-courses/${crosswalkCourseId}`),
          fetch(`/api/learning-experiences/${crosswalkExperienceId}`),
        ])

        if (!courseResponse.ok || !experienceResponse.ok) {
          throw new Error("Failed to load course or learning experience")
        }

        const [course, experience] = await Promise.all([courseResponse.json(), experienceResponse.json()])

        if (!cancelled) {
          setLoadedDetails({ courseId: crosswalkCourseId, experienceId: crosswalkExperienceId, course, experience })
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load crosswalk details:", error)
        }
      }
    }

    loadCrosswalkDetails()

    return () => {
      cancelled = true
    }
  }, [crosswalkCourseId, crosswalkExperienceId])

  useEffect(() => {
    if (!crosswalkCourseId || !crosswalkExperienceId) {
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

        setCourseOutcomeRows(Array.isArray(courseOutcomes) ? courseOutcomes : [])
        setExperienceOutcomeRows(Array.isArray(experienceOutcomes) ? experienceOutcomes : [])
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
  }, [crosswalkCourseId, crosswalkExperienceId])

  useEffect(() => {
    if (!crosswalkMatchId || courseOutcomeRows.length === 0 || experienceOutcomeRows.length === 0) {
      return
    }

    let cancelled = false

    const loadMatchDetails = async () => {
      try {
        const matchState = await loadMatchState(crosswalkMatchId, courseOutcomeRows, experienceOutcomeRows)

        if (cancelled) {
          return
        }

        setMatchesByRow(matchState.matchesByRow)
        setNotesByRow(matchState.notesByRow)
        setDraggedOnceById(matchState.draggedOnceById)
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
  }, [crosswalkMatchId, courseOutcomeRows, experienceOutcomeRows])

  const certLines = useMemo(() => experienceOutcomeRows.map((row) => row.outcomeText ?? ''), [experienceOutcomeRows])
  const syllLines = useMemo(() => courseOutcomeRows.map((row) => row.outcomeText ?? ''), [courseOutcomeRows])

  if (!crosswalkCourseId || !crosswalkExperienceId) {
    return <Navigate to="/board" replace />
  }

  // Opened from the create wizard: Back reopens that wizard step. Opened any other way (e.g. the equivalency list): browser back.
  const backTo = location.state?.backTo
  const handleBack = () => (backTo ? navigate(backTo.path, { state: backTo.state }) : navigate(-1))

  const isLoaded =
    loadedDetails?.courseId === crosswalkCourseId && loadedDetails?.experienceId === crosswalkExperienceId
  const course = isLoaded ? loadedDetails.course : null
  const experience = isLoaded ? loadedDetails.experience : null

  return (
    <CrossWalk
      leTitle={experience?.title ?? ''}
      learningExperienceLink={experience?.link ?? ''}
      ccTitle={course?.title ?? ''}
      syllabusFileUrl={course?.syllabus_file_url ?? ''}
      syllabusFileName={course?.syllabus_file_name ?? ''}
      certLines={certLines}
      syllLines={syllLines}
      certOutcomeRows={experienceOutcomeRows}
      syllOutcomeRows={courseOutcomeRows}
      matchId={crosswalkMatchId}
      onBack={handleBack}
      matchesByRow={matchesByRow}
      setMatchesByRow={setMatchesByRow}
      notesByRow={notesByRow}
      setNotesByRow={setNotesByRow}
      draggedOnceById={draggedOnceById}
      setDraggedOnceById={setDraggedOnceById}
    />
  )
}

function AppRoutes() {
  const location = useLocation()
  const navigate = useNavigate()
  const [templateId, setTemplateId] = useState(null)
  const selectedTemplateId = location.state?.templateId ?? templateId

  // "back" says where the crosswalk page's Back button should return to: { path, state } of the wizard step that led here.
  const goToCrosswalk = (formData, fallbackExperienceId = null, back = null) => {
    const courseId = formData?.courseId ?? formData?.course_id ?? null
    const experienceId = formData?.experienceId ?? formData?.experience_id ?? fallbackExperienceId ?? null

    if (!courseId || !experienceId) {
      navigate('/board')
      return
    }

    const matchId = formData?.matchId ?? formData?.match_id ?? null

    const params = new URLSearchParams({
      courseId: String(courseId),
      experienceId: String(experienceId),
    })

    if (matchId) {
      params.set('matchId', String(matchId))
    }

    navigate(`/crosswalk?${params.toString()}`, {
      state: back && {
        backTo: { path: back.path, state: { ...back.state, restoreCourseId: courseId, restoreMatchId: matchId } },
      },
    })
  }

  return (
    <div className="App">
  {/* <h1>CUNY CPL Evaluation Cross Walking Tool</h1> */}
      <Nav />
      <Suspense fallback={<p>Loading page...</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
      <Route
        path="/board"
        element={<Board templateId={templateId} setTemplateId={setTemplateId} />}
      />
      <Route
        path="/equivalency/:experienceId"
        element={<ViewEquiv />}
      />
      <Route path="/crosswalk" element={<CrossWalkRoute />} />

      {/* make 2 functions one to create a new cuny course and one to create a new learning experience. Each function will take in the form data and submit it to the appropriate endpoint. */}



      <Route
        path="/create-crosswalk"
        element={
          <CreateOutcomes
          formProps={createCrosswalkProps}
          />
        }
      />
      <Route
        path="/create-learning-experience"
        element={
          <CreateOutcomes
            key="create-learning-experience"
            formProps={{
              ...createLearningExperienceProps,
              is_template: false,
              restoreExperienceId: location.state?.restoreExperienceId ?? null,
              goToEnd: (formData) => {
                const experienceId = formData?.experienceId ?? formData?.experience_id ?? null

                if (!experienceId) {
                  navigate('/board')
                  return
                }

                navigate('/create-cuny-course', {
                  state: { experienceId },
                })
              },
            }}
          />
        }
      />
      <Route
        path="/create-cuny-course"
        element={
          <CreateOutcomes
            key="create-cuny-course"
            formProps={{
              ...createCunyCourseProps,
              experienceId: location.state?.experienceId ?? null,
              restoreCourseId: location.state?.restoreCourseId ?? null,
              restoreMatchId: location.state?.restoreMatchId ?? null,
              goBack: location.state?.experienceId
                ? () => navigate('/create-learning-experience', { state: { restoreExperienceId: location.state.experienceId } })
                : undefined,
              goToEnd: (formData) =>
                goToCrosswalk(formData, location.state?.experienceId, {
                  path: '/create-cuny-course',
                  state: { experienceId: location.state?.experienceId },
                }),
            }}
          />
        }
      />
      <Route
        path="/create-template"
        element={
          <CreateOutcomes
          formProps={{ ...createLearningExperienceProps, is_template: true, goToEnd: () => window.location.href = '/board' }}
          />
        }
      />
      <Route
        path="/create-equivalency"
        element={
          <CreateOutcomes
            formProps={{
              ...createCunyCourseProps,
              experienceId: selectedTemplateId,
              restoreCourseId: location.state?.restoreCourseId ?? null,
              restoreMatchId: location.state?.restoreMatchId ?? null,
              goToEnd: (formData) =>
                goToCrosswalk(formData, selectedTemplateId, {
                  path: '/create-equivalency',
                  state: { templateId: selectedTemplateId },
                }),
            }}
          />
        }
      />
      <Route path="/*" element={<h1>404 Not Found</h1>} />
    </Routes>
    </Suspense>
    
     </div> 
   ) }

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
