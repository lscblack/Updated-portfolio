import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Terminal, Home, FolderOpen, User, Briefcase, BookOpen, Zap, Globe, ChevronRight, Settings, LogOut, FolderKanban } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const NAV = [
  { label: 'Overview', href: '/admin', icon: Home },
  { label: 'About', href: '/admin/about', icon: User },
  { label: 'Experience', href: '/admin/experience', icon: Briefcase },
  { label: 'Portfolio Projects', href: '/admin/portfolio', icon: FolderKanban },
  { label: 'GitHub Repos', href: '/admin/projects', icon: FolderOpen },
  { label: 'Education', href: '/admin/education', icon: BookOpen },
  { label: 'Activities', href: '/admin/activities', icon: Zap },
  { label: 'Interests', href: '/admin/interests', icon: Globe },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const { username, logout } = useAuth()
  const nav = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    nav('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">

      {/* Sidebar */}
      <aside className={`shrink-0 border-r border-gray-800 flex flex-col transition-all duration-200 ${collapsed ? 'w-14' : 'w-56'}`}>
        {/* Logo */}
        <div className="h-14 flex items-center gap-3 px-4 border-b border-gray-800 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#1A56A4] flex items-center justify-center shrink-0">
            <Terminal size={13} className="text-white" />
          </div>
          {!collapsed && (
            <span className="font-mono text-sm font-bold text-[#4A90D9] truncate">&lt;lsc /&gt;</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
          {NAV.map(item => {
            const Icon = item.icon
            const active = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
            return (
              <Link key={item.href} to={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? 'bg-[#1A56A4]/20 text-[#4A90D9]'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                }`}>
                <Icon size={15} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User + logout */}
        {!collapsed && (
          <div className="border-t border-gray-800 px-3 py-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono truncate">{username}</span>
              <button onClick={handleLogout} title="Logout"
                className="text-gray-600 hover:text-red-400 transition-colors p-1">
                <LogOut size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(c => !c)}
          className="h-10 flex items-center justify-center text-gray-600 hover:text-gray-300 transition-colors border-t border-gray-800 shrink-0">
          <ChevronRight size={14} className={`transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b border-gray-800 flex items-center justify-between px-6 shrink-0 bg-gray-950">
          <p className="text-sm text-gray-400 font-medium">
            {NAV.find(n => n.href === pathname || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label ?? 'Dashboard'}
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {username}
            </span>
            <Link to="/" className="text-xs text-gray-500 hover:text-gray-200 transition-colors border border-gray-700 rounded px-2.5 py-1 hover:border-gray-500">
              ← Portfolio
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
