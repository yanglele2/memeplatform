import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MemeGenerator from './pages/MemeGenerator'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MemeGenerator />} />
      </Routes>
    </Router>
  )
}

export default App
