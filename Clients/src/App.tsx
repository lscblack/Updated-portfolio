import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ProjectsAdmin from './pages/Admin/ProjectsAdmin'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/projects" element={<ProjectsAdmin />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
