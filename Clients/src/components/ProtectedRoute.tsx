import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, ready } = useAuth()
  const loc = useLocation()
  if (!ready) return <div className="min-h-screen grid place-items-center bg-bg text-muted"><Loader2 className="animate-spin" /></div>
  if (!isAuthenticated) return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />
  return <>{children}</>
}
