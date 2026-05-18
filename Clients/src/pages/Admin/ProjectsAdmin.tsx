import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  GitBranch, RefreshCw, Search, ExternalLink,
  Star, GitFork, Eye, EyeOff, Terminal, Home, ArrowLeft,
  Loader2, Globe,
} from 'lucide-react'
import { Link } from 'react-router-dom'

type Repo = {
  id: number
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  topics: string[]
  updated_at: string
  fork: boolean
  visibility: string
}

const LANG_COLORS: Record<string, string> = {
  Python: '#3776ab',
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Dart: '#00b4ab',
  Go: '#00add8',
  'Jupyter Notebook': '#da5b0b',
  HTML: '#e34c26',
  CSS: '#563d7c',
}

function humanName(name: string) {
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function timeAgo(date: string) {
  const d = (Date.now() - new Date(date).getTime()) / 1000
  if (d < 60) return 'just now'
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  return `${Math.floor(d / 86400)}d ago`
}

export default function ProjectsAdmin() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [langFilter, setLangFilter] = useState('All')
  const [hidden, setHidden] = useState<Set<number>>(new Set())
  const [refreshing, setRefreshing] = useState(false)

  const fetchRepos = async () => {
    try {
      const r = await fetch('https://api.github.com/users/lscblack/repos?per_page=100&sort=updated')
      const data = await r.json()
      setRepos(data.filter((r: Repo) => !r.fork))
    } catch {
      setRepos([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchRepos() }, [])

  const refresh = () => {
    setRefreshing(true)
    fetchRepos()
  }

  const toggleHidden = (id: number) =>
    setHidden(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const langs = ['All', ...Array.from(new Set(repos.map(r => r.language).filter(Boolean) as string[]))]

  const displayed = repos
    .filter(r => langFilter === 'All' || r.language === langFilter)
    .filter(r =>
      search.trim() === '' ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? '').toLowerCase().includes(search.toLowerCase())
    )

  const stats = {
    total: repos.length,
    visible: repos.length - hidden.size,
    stars: repos.reduce((a, r) => a + r.stargazers_count, 0),
    langs: new Set(repos.map(r => r.language).filter(Boolean)).size,
  }

  return (
    <div className="min-h-screen relative">
      <div className="bg-mesh" />
      <div className="relative z-10">
        {/* Topbar */}
        <header className="glass border-b border-white/5 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Terminal size={12} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-200">Admin Dashboard</span>
              <span className="badge badge-violet">Projects</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/" className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5">
                <Home size={12} />
                Portfolio
              </Link>
              <a
                href="https://github.com/lscblack"
                target="_blank"
                rel="noreferrer"
                className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <GitBranch size={12} />
                GitHub
              </a>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: 'Total Repos', value: stats.total, color: '#6366f1' },
              { label: 'Visible', value: stats.visible, color: '#22d3ee' },
              { label: 'Total Stars', value: stats.stars, color: '#f59e0b' },
              { label: 'Languages', value: stats.langs, color: '#a78bfa' },
            ].map(s => (
              <div key={s.label} className="glass p-4 rounded-xl">
                <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center flex-1">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search repos…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors w-56"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {langs.slice(0, 7).map(l => (
                  <button
                    key={l}
                    onClick={() => setLangFilter(l)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${langFilter === l
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:border-indigo-500/30'
                      }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={refresh}
              disabled={refreshing}
              className="btn-ghost text-xs py-2 px-4 flex items-center gap-2"
            >
              {refreshing
                ? <Loader2 size={13} className="animate-spin" />
                : <RefreshCw size={13} />
              }
              Sync GitHub
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-24 text-slate-500 gap-3">
              <Loader2 size={18} className="animate-spin text-indigo-400" />
              Fetching repositories from GitHub…
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
                      <th className="text-left px-5 py-3 font-medium">Repository</th>
                      <th className="text-left px-4 py-3 font-medium">Language</th>
                      <th className="text-center px-4 py-3 font-medium">Stars</th>
                      <th className="text-center px-4 py-3 font-medium">Forks</th>
                      <th className="text-left px-4 py-3 font-medium">Updated</th>
                      <th className="text-center px-4 py-3 font-medium">Visibility</th>
                      <th className="text-right px-5 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map((repo, i) => (
                      <motion.tr
                        key={repo.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className={`border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors ${hidden.has(repo.id) ? 'opacity-40' : ''
                          }`}
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-200 text-sm">{humanName(repo.name)}</div>
                          <div className="text-xs text-slate-600 mt-0.5 max-w-xs truncate">
                            {repo.description || '—'}
                          </div>
                          {repo.topics?.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {repo.topics.slice(0, 2).map(t => (
                                <span key={t} className="badge badge-indigo text-[10px]">{t}</span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {repo.language ? (
                            <span className="flex items-center gap-1.5 text-xs text-slate-400">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: LANG_COLORS[repo.language] ?? '#6366f1' }}
                              />
                              {repo.language}
                            </span>
                          ) : (
                            <span className="text-slate-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="flex items-center justify-center gap-1 text-xs text-slate-500">
                            <Star size={11} />
                            {repo.stargazers_count}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="flex items-center justify-center gap-1 text-xs text-slate-500">
                            <GitFork size={11} />
                            {repo.forks_count}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs text-slate-500">{timeAgo(repo.updated_at)}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`badge ${hidden.has(repo.id) ? 'badge-indigo' : 'badge-green'}`}>
                            {hidden.has(repo.id) ? 'Hidden' : 'Visible'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleHidden(repo.id)}
                              title={hidden.has(repo.id) ? 'Show' : 'Hide'}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/8 transition-all"
                            >
                              {hidden.has(repo.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noreferrer"
                              title="Open on GitHub"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-white/8 transition-all"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {displayed.length === 0 && !loading && (
                  <div className="py-16 text-center text-slate-600">
                    <Globe size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No repositories match your filters.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
            <span>Showing {displayed.length} of {repos.length} repositories</span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Synced from GitHub API
            </span>
          </div>
        </main>
      </div>
    </div>
  )
}
