import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Login from './pages/Admin/Login'
import AdminLayout from './pages/Admin/AdminLayout'
import AdminOverview from './pages/Admin/AdminOverview'
import AdminAbout from './pages/Admin/AdminAbout'
import AdminExperience from './pages/Admin/AdminExperience'
import AdminPortfolioProjects from './pages/Admin/AdminPortfolioProjects'
import AdminSettings from './pages/Admin/AdminSettings'
import ProjectsAdmin from './pages/Admin/ProjectsAdmin'
import './App.css'

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />

            {/* Admin auth */}
            <Route path="/admin/login" element={<Login />} />

            {/* Protected admin pages */}
            <Route path="/admin" element={<Protected><AdminOverview /></Protected>} />
            <Route path="/admin/about" element={<Protected><AdminAbout /></Protected>} />
            <Route path="/admin/experience" element={<Protected><AdminExperience /></Protected>} />
            <Route path="/admin/portfolio" element={<Protected><AdminPortfolioProjects /></Protected>} />
            <Route path="/admin/projects" element={<Protected><ProjectsAdmin /></Protected>} />
            <Route path="/admin/settings" element={<Protected><AdminSettings /></Protected>} />

            {/* Legacy redirect */}
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
