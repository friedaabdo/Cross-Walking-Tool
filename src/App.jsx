import { useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'
import CertOutcomes from './Pages/OutcomesInput'
import SyllOutcomes from './Pages/OutcomesInput'
import CrossWalk from './Pages/CrossWalk'

function App() {
  const [certLines, setCertLines] = useState([])
  const [syllLines, setSyllLines] = useState([])

  return (
    <div className="App">
  <h1>Cross Walking Tool</h1>
    <BrowserRouter>
    <Routes>
      <Route
        path="/"
        element={
          <CertOutcomes
            pageName="Learning Experience"
            certLines={certLines}
            setCertLines={setCertLines}
            // syllLines={syllLines}
            // setSyllLines={setSyllLines}
          />
        }
      />
      <Route
        path="/syllabus"
        element={
          <SyllOutcomes
            pageName="Syllabus"
            // certLines={certLines}
            // setCertLines={setCertLines}
            syllLines={syllLines}
            setSyllLines={setSyllLines}
          />
        }
      />
      <Route path="/crosswalk" element={<CrossWalk certLines={certLines} syllLines={syllLines} />} />
      <Route path="/*" element={<h1>404 Not Found</h1>} />
    </Routes>
    </BrowserRouter>
    
     </div> 
  )
}

export default App
