import { useEffect, useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2, CheckCircle2, ExternalLink } from 'lucide-react'
import api from '../../api/client'

type Project = {
  id?: number
  title: string
  description: string
  public: boolean
  github_url: string
  live_url: string
  technologies: string[]
  categories: string[]
  status: string
  order: number
  contributed: boolean
}

const BLANK: Project = {
  title: '', description: '', public: true,
  github_url: '', live_url: '',
  technologies: [], categories: [],
  status: 'production', order: 0, contributed: true,
}

const CATEGORY_OPTIONS = ['Web', 'Mobile', 'AI / ML', 'Security', 'Open Source', 'IoT', 'Blockchain']

const inputCls = 'w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-md text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-[#1A56A4] transition-colors'

function ProjectCard({ project, onChange, onSave, onDelete, saving }: {
  project: Project; onChange: (p: Project) => void
  onSave: () => void; onDelete: () => void; saving: boolean
}) {
  const [open, setOpen] = useState(!project.id)

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/2 transition-colors group">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-bold text-sm text-gray-100 truncate">{project.title || 'New Project'}</span>
          {project.live_url && (
            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
              contributed
            </span>
          )}
          {!project.public && (
            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 border border-gray-700">
              hidden
            </span>
          )}
        </div>
        {open ? <ChevronUp size={14} className="text-gray-500 shrink-0" /> : <ChevronDown size={14} className="text-gray-500 shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 pt-4 border-t border-gray-800 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-gray-500 mb-1">Title</label>
              <input className={inputCls} value={project.title}
                onChange={e => onChange({ ...project, title: e.target.value })} placeholder="Project title" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] text-gray-500 mb-1">Description</label>
              <textarea className={`${inputCls} resize-none`} rows={3} value={project.description}
                onChange={e => onChange({ ...project, description: e.target.value })}
                placeholder="Project description…" />
            </div>

            <div>
              <label className="block text-[11px] text-gray-500 mb-1">GitHub URL</label>
              <input className={inputCls} value={project.github_url}
                onChange={e => onChange({ ...project, github_url: e.target.value })}
                placeholder="https://github.com/lscblack/…" />
            </div>

            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Live URL (leave blank if none)</label>
              <input className={inputCls} value={project.live_url}
                onChange={e => onChange({ ...project, live_url: e.target.value })}
                placeholder="https://example.com" />
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#1A56A4] hover:underline">
                  <ExternalLink size={10} /> Visit site
                </a>
              )}
            </div>

            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Tech Stack (comma-separated)</label>
              <input className={inputCls} value={project.technologies.join(', ')}
                onChange={e => onChange({ ...project, technologies: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="React, FastAPI, PostgreSQL" />
            </div>

            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Display Order</label>
              <input type="number" className={inputCls} value={project.order}
                onChange={e => onChange({ ...project, order: Number(e.target.value) })} />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(c => (
                <button key={c} type="button"
                  onClick={() => {
                    const cats = project.categories.includes(c)
                      ? project.categories.filter(x => x !== c)
                      : [...project.categories, c]
                    onChange({ ...project, categories: cats })
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                    project.categories.includes(c)
                      ? 'bg-[#1A56A4] text-white border-[#1A56A4]'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-[#1A56A4]'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={project.public}
                onChange={e => onChange({ ...project, public: e.target.checked })}
                className="accent-[#1A56A4]" />
              Visible on portfolio
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={project.contributed}
                onChange={e => onChange({ ...project, contributed: e.target.checked })}
                className="accent-[#1A56A4]" />
              Mark as "Contributed on"
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={onSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A56A4] text-white rounded-md text-sm font-medium disabled:opacity-60 hover:bg-blue-700 transition-colors">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-2 border border-red-800 text-red-400 rounded-md text-sm hover:bg-red-950/30 transition-colors">
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminPortfolioProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | string | null>(null)

  const load = () => {
    setLoading(true)
    api.get('/api/projects/all')
      .then(r => setProjects(r.data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const update = (i: number, p: Project) => setProjects(list => list.map((x, idx) => idx === i ? p : x))

  const save = async (i: number) => {
    const p = projects[i]
    const key = p.id ?? 'new'
    setSavingId(key)
    try {
      if (p.id) {
        const payload = { ...p, technologies: p.technologies, categories: p.categories }
        await api.put(`/projects/${p.id}`, payload)
      } else {
        const r = await api.post('/projects/', p)
        setProjects(list => list.map((x, idx) => idx === i ? r.data : x))
      }
    } catch {}
    setSavingId(null)
  }

  const remove = async (i: number) => {
    const p = projects[i]
    if (p.id) await api.delete(`/projects/${p.id}`).catch(() => {})
    setProjects(list => list.filter((_, idx) => idx !== i))
  }

  const addNew = () => setProjects(list => [{ ...BLANK, order: list.length }, ...list])

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-gray-100">Portfolio Projects</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Projects shown on your public portfolio page. Edit titles, descriptions, URLs, and visibility.
          </p>
        </div>
        <button onClick={addNew}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#1A56A4] text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors">
          <Plus size={13} /> Add Project
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 py-8 justify-center">
          <Loader2 size={16} className="animate-spin" /> Loading projects…
        </div>
      ) : (
        <div className="space-y-3">
          {projects.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              <p className="text-sm mb-2">No portfolio projects yet.</p>
              <p className="text-xs">Click "Add Project" to create one, or start the FastAPI backend to load saved projects.</p>
            </div>
          )}
          {projects.map((p, i) => (
            <ProjectCard key={p.id ?? `new-${i}`} project={p}
              onChange={proj => update(i, proj)}
              onSave={() => save(i)}
              onDelete={() => remove(i)}
              saving={savingId === (p.id ?? 'new')} />
          ))}
        </div>
      )}
    </div>
  )
}
