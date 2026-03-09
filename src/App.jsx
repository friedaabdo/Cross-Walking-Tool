// import { useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'
import CertOutcomes from './Pages/OutcomesInput'
import SyllOutcomes from './Pages/OutcomesInput'

function App() {

  return (
    <div className="App">
  
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<h1>Cross Walking Tool</h1>} />
      <Route path="/certificate" element={<CertOutcomes pageName="Certificate"/>} />
      <Route path="/syllabus" element={<SyllOutcomes pageName="Syllabus"/>} />
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
    </BrowserRouter>
    
     </div> 
  )
}

export default App
