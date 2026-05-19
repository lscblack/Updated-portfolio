import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Briefcase, FolderOpen, BookOpen, ArrowRight } from 'lucide-react'
import api from '../../api/client'

const SECTIONS = [
  { icon: User, label: 'About', desc: 'Edit your bio, tagline, contact info, and quote.', href: '/admin/about', color: '#1A56A4' },
  { icon: Briefcase, label: 'Experience', desc: 'Manage work history — add, edit, reorder, or remove roles.', href: '/admin/experience', color: '#059669' },
  { icon: FolderOpen, label: 'Projects', desc: 'Manage live and portfolio projects — sync from GitHub or add manually.', href: '/admin/projects', color: '#B8860B' },
  { icon: BookOpen, label: 'Education', desc: 'Degrees, diplomas, and certifications.', href: '/admin/education', color: '#7C3AED' },
]

export default function AdminOverview() {
  const [apiOk, setApiOk] = useState<boolean | null>(null)

  useEffect(() => {
    api.get('/api/about').then(() => setApiOk(true)).catch(() => setApiOk(false))
  }, [])

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-100 mb-1">Portfolio Dashboard</h1>
      <p className="text-sm text-gray-500 mb-8">
        Edit every section of your portfolio. Changes save to the database and are reflected immediately.
      </p>

      {/* API status */}
      <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-md border mb-8 w-fit ${
        apiOk === null ? 'border-gray-700 text-gray-500'
        : apiOk ? 'border-green-800 bg-green-950/40 text-green-400'
        : 'border-red-800 bg-red-950/40 text-red-400'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${apiOk === null ? 'bg-gray-500' : apiOk ? 'bg-green-500' : 'bg-red-500'}`} />
        {apiOk === null ? 'Checking API…' : apiOk ? 'Backend API connected' : 'Backend offline — start uvicorn from Server/'}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {SECTIONS.map(s => {
          const Icon = s.icon
          return (
            <Link key={s.href} to={s.href}
              className="border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-colors group bg-gray-900/50">
              <div className="flex items-start justify-between gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${s.color}20`, border: `1px solid ${s.color}40` }}>
                  <Icon size={16} style={{ color: s.color }} />
                </div>
                <ArrowRight size={14} className="text-gray-700 group-hover:text-gray-400 transition-colors mt-0.5" />
              </div>
              <h3 className="mt-3 font-bold text-gray-100 text-base">{s.label}</h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
