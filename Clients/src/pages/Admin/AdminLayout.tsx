import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Palette, Globe, User, Route, Briefcase, Cpu, FolderKanban, GraduationCap, Award, Heart, Compass, Inbox, Images, ShieldCheck, LogOut, ExternalLink, Menu, X, Sun, Moon, BarChart3, type LucideIcon } from 'lucide-react'
import { GithubIcon } from '../../components/ui/Brand'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useSite } from '../../contexts/SiteContext'
import { ToastProvider } from './ui/Toast'
import api from '../../api/client'
import NotificationBell from './ui/Notifications'
import BrandMark from '../../components/ui/BrandMark'

type NavItem = { to: string; label: string; icon: LucideIcon | React.ComponentType<{ size?: number; className?: string }>; end?: boolean }
const GROUPS: { title: string; items: NavItem[] }[] = [
  { title: 'General', items: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/appearance', label: 'Appearance', icon: Palette },
    { to: '/admin/site', label: 'Site & hero', icon: Globe },
    { to: '/admin/about', label: 'About', icon: User },
  ] },
  { title: 'Content', items: [
    { to: '/admin/journey', label: 'Journey', icon: Route },
    { to: '/admin/experience', label: 'Experience', icon: Briefcase },
    { to: '/admin/skills', label: 'Skills', icon: Cpu },
    { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
    { to: '/admin/github', label: 'GitHub import', icon: GithubIcon },
    { to: '/admin/education', label: 'Education', icon: GraduationCap },
    { to: '/admin/certifications', label: 'Certifications', icon: Award },
    { to: '/admin/activities', label: 'Life', icon: Heart },
    { to: '/admin/interests', label: 'Interests', icon: Compass },
  ] },
  { title: 'Operations', items: [
    { to: '/admin/analytics', label: 'Audience', icon: BarChart3 },
    { to: '/admin/offers', label: 'Offers', icon: Briefcase },
    { to: '/admin/messages', label: 'Inbox', icon: Inbox },
    { to: '/admin/media', label: 'Media', icon: Images },
    { to: '/admin/settings', label: 'Security', icon: ShieldCheck },
  ] },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, logout } = useAuth()
  const { mode, toggle } = useTheme()
  const { data } = useSite()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState<number>(0)
  const [offers, setOffers] = useState<number>(0)

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    let alive = true
    const load = () => { api.get('/api/admin/messages', { params: { unread: true, limit: 1 } }).then(r => { if (alive) setUnread(r.data.total) }).catch(() => {}); api.get('/api/admin/offers', { params: { status: 'new', limit: 1 } }).then(r => { if (alive) setOffers(r.data.total) }).catch(() => {}) }
    load(); const t = setInterval(load, 60000)
    return () => { alive = false; clearInterval(t) }
  }, [pathname])

  const current = GROUPS.flatMap(g => g.items).find(i => i.end ? pathname === i.to : pathname.startsWith(i.to))
  const logo = data?.settings?.logo_text || 'lsc'

  const Sidebar = (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center gap-3 px-5 border-b border-line shrink-0">
        <BrandMark size={34} />
        <div className="min-w-0"><p className="font-mono text-sm font-bold text-fg leading-none">&lt;{logo} /&gt;</p><p className="text-[0.65rem] text-muted mt-1 uppercase tracking-wider">Dashboard</p></div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {GROUPS.map(g => (
          <div key={g.title}>
            <p className="px-2 mb-1.5 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted">{g.title}</p>
            <ul className="space-y-0.5">
              {g.items.map(it => (
                <li key={it.to}>
                  <NavLink to={it.to} end={it.end} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                    <it.icon size={15} className="shrink-0" /><span className="flex-1 truncate">{it.label}</span>
                    {it.to === '/admin/messages' && unread > 0 && <span className="text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full bg-accent text-accent-fg">{unread}</span>}
                    {it.to === '/admin/offers' && offers > 0 && <span className="text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full bg-accent text-accent-fg">{offers}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-line p-3 shrink-0">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <BrandMark size={32} />
          <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-fg truncate">{admin?.name}</p><p className="text-[0.68rem] text-muted truncate">{admin?.email}</p></div>
          <button onClick={async () => { await logout(); nav('/admin/login', { replace: true }) }} className="p-2 text-muted hover:text-red-500" title="Sign out" aria-label="Sign out"><LogOut size={15} /></button>
        </div>
      </div>
    </div>
  )

  return (
    <ToastProvider>
      <div className="min-h-screen bg-bg text-fg lg:grid lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block sticky top-0 h-screen border-r border-line bg-surface/60">{Sidebar}</aside>
        {open && (
          <div className="fixed inset-0 z-[80] lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-[280px] bg-bg border-r border-line shadow-2xl">{Sidebar}</aside>
          </div>
        )}
        <div className="min-w-0 flex flex-col min-h-screen">
          <header className="h-16 sticky top-0 z-40 glass border-b border-line flex items-center justify-between px-4 sm:px-6 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button className="lg:hidden w-9 h-9 grid place-items-center rounded-full hover:bg-surface-2" onClick={() => setOpen(o => !o)} aria-label="Menu">{open ? <X size={18} /> : <Menu size={18} />}</button>
              <p className="font-display font-bold text-fg truncate">{current?.label ?? 'Dashboard'}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <NotificationBell />
              <button onClick={toggle} className="w-9 h-9 rounded-full grid place-items-center text-muted hover:bg-surface-2" aria-label="Toggle theme">{mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
              <Link to="/" target="_blank" className="btn btn-outline btn-sm">View site <ExternalLink size={13} /></Link>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">{children}</main>
        </div>
      </div>
    </ToastProvider>
  )
}
