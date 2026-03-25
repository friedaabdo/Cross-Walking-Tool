import { useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'
import CertOutcomes from './Pages/OutcomesInput'
import SyllOutcomes from './Pages/OutcomesInput'
import CrossWalk from './Pages/CrossWalk'
import Home from './Pages/Home'

function App() {
  const [certLines, setCertLines] = useState([])
  const [syllLines, setSyllLines] = useState([])
  const [leTitle, setLeTitle] = useState('')
  const [ccTitle, setccTitle] = useState('')
  

  return (
    <div className="App">
  <h1>Cross Walking Tool</h1>
    <BrowserRouter>
    <Routes>
      <Route path="/"
        element={<Home
          learningExperienceTitle={leTitle}
          setLearningExperienceTitle={setLeTitle}
          cunyCourseTitle={ccTitle}
          setCunyCourseTitle={setccTitle}
        />}>
        
      </Route>
      <Route
        path="/learning-experience"
        element={
          <CertOutcomes
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
          />
        }
      />
      <Route path="/*" element={<h1>404 Not Found</h1>} />
    </Routes>
    </BrowserRouter>
    
     </div> 
  )
}

export default App
