import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { SiteProvider } from './contexts/SiteContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Resume from './pages/Resume'
import './App.css'

// the dashboard is code-split so visitors never download it
const Login = lazy(() => import('./pages/Admin/Login'))
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'))
const AdminOverview = lazy(() => import('./pages/Admin/AdminOverview'))
const AdminAppearance = lazy(() => import('./pages/Admin/AdminAppearance'))
const AdminSite = lazy(() => import('./pages/Admin/AdminSite'))
const AdminAbout = lazy(() => import('./pages/Admin/AdminAbout'))
const AdminCollection = lazy(() => import('./pages/Admin/AdminCollection'))
const AdminMessages = lazy(() => import('./pages/Admin/AdminMessages'))
const AdminMedia = lazy(() => import('./pages/Admin/AdminMedia'))
const AdminSettings = lazy(() => import('./pages/Admin/AdminSettings'))
const ProjectsAdmin = lazy(() => import('./pages/Admin/ProjectsAdmin'))
const AdminOffers = lazy(() => import('./pages/Admin/AdminOffers'))

const Fallback = () => <div className="min-h-screen grid place-items-center bg-bg text-muted"><Loader2 className="animate-spin" /></div>

function Protected({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute><AdminLayout>{children}</AdminLayout></ProtectedRoute>
}

const COLLECTIONS = ['journey', 'experience', 'skills', 'projects', 'education', 'certifications', 'activities', 'interests']

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SiteProvider>
          <BrowserRouter>
            <Suspense fallback={<Fallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/resume" element={<Resume />} />
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin" element={<Protected><AdminOverview /></Protected>} />
                <Route path="/admin/appearance" element={<Protected><AdminAppearance /></Protected>} />
                <Route path="/admin/site" element={<Protected><AdminSite /></Protected>} />
                <Route path="/admin/about" element={<Protected><AdminAbout /></Protected>} />
                {COLLECTIONS.map(c => <Route key={c} path={`/admin/${c}`} element={<Protected><AdminCollection name={c} /></Protected>} />)}
                <Route path="/admin/github" element={<Protected><ProjectsAdmin /></Protected>} />
                <Route path="/admin/messages" element={<Protected><AdminMessages /></Protected>} />
                <Route path="/admin/offers" element={<Protected><AdminOffers /></Protected>} />
                <Route path="/admin/media" element={<Protected><AdminMedia /></Protected>} />
                <Route path="/admin/settings" element={<Protected><AdminSettings /></Protected>} />
                <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </SiteProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
