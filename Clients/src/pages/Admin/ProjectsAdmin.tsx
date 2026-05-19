import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, RefreshCw, Search, ExternalLink, Star, GitFork, Eye, EyeOff, Loader2, Globe } from 'lucide-react'

type Repo = {
  id: number; name: string; description: string | null; html_url: string
  stargazers_count: number; forks_count: number; language: string | null
  topics: string[]; updated_at: string; fork: boolean; visibility: string
}

const LANG_COLORS: Record<string, string> = {
  Python: '#3776ab', TypeScript: '#3178c6', JavaScript: '#f7df1e',
  Dart: '#00b4ab', Go: '#00add8', 'Jupyter Notebook': '#da5b0b',
  HTML: '#e34c26', CSS: '#563d7c',
}

function humanName(n: string) { return n.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }

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
    } catch { setRepos([]) }
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { fetchRepos() }, [])

  const refresh = () => { setRefreshing(true); fetchRepos() }
  const toggleHidden = (id: number) =>
    setHidden(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const langs = ['All', ...Array.from(new Set(repos.map(r => r.language).filter(Boolean) as string[]))]
  const displayed = repos
    .filter(r => langFilter === 'All' || r.language === langFilter)
    .filter(r => search.trim() === '' || r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? '').toLowerCase().includes(search.toLowerCase()))

  const stats = {
    total: repos.length,
    visible: repos.length - hidden.size,
    stars: repos.reduce((a, r) => a + r.stargazers_count, 0),
    langs: new Set(repos.map(r => r.language).filter(Boolean)).size,
  }

  const inputCls = 'px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-md text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-[#1A56A4] transition-colors'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-gray-100">GitHub Projects</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Live sync from <a href="https://github.com/lscblack" target="_blank" rel="noreferrer"
              className="text-[#1A56A4] hover:underline">github.com/lscblack</a> · {repos.length} repos
          </p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-700 text-gray-400 rounded-md text-xs hover:border-[#1A56A4] hover:text-[#1A56A4] transition-colors disabled:opacity-50">
          {refreshing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Sync
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: '#1A56A4' },
          { label: 'Visible', value: stats.visible, color: '#059669' },
          { label: 'Stars', value: stats.stars, color: '#B8860B' },
          { label: 'Languages', value: stats.langs, color: '#7C3AED' },
        ].map(s => (
          <div key={s.label} className="border border-gray-800 rounded-xl p-4 bg-gray-900/50">
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
          <input type="text" placeholder="Search repos…" value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${inputCls} pl-8 w-52`} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {langs.slice(0, 7).map(l => (
            <button key={l} onClick={() => setLangFilter(l)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                langFilter === l
                  ? 'bg-[#1A56A4] text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-700'
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center gap-3 py-16 text-gray-500 justify-center">
          <Loader2 size={16} className="animate-spin text-[#1A56A4]" />
          Fetching from GitHub API…
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-[11px] text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-semibold">Repository</th>
                  <th className="text-left px-4 py-3 font-semibold">Language</th>
                  <th className="text-center px-4 py-3 font-semibold">Stars</th>
                  <th className="text-center px-4 py-3 font-semibold">Forks</th>
                  <th className="text-left px-4 py-3 font-semibold">Updated</th>
                  <th className="text-center px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((repo, i) => (
                  <motion.tr key={repo.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.015 }}
                    className={`border-b border-gray-800 last:border-0 hover:bg-white/2 transition-colors ${hidden.has(repo.id) ? 'opacity-40' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-200 text-sm">{humanName(repo.name)}</div>
                      <div className="text-xs text-gray-600 mt-0.5 max-w-xs truncate">{repo.description || '—'}</div>
                    </td>
                    <td className="px-4 py-4">
                      {repo.language ? (
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                          <span className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: LANG_COLORS[repo.language] ?? '#6366f1' }} />
                          {repo.language}
                        </span>
                      ) : <span className="text-gray-700 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="flex items-center justify-center gap-1 text-xs text-gray-500">
                        <Star size={11} />{repo.stargazers_count}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="flex items-center justify-center gap-1 text-xs text-gray-500">
                        <GitFork size={11} />{repo.forks_count}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-gray-500 font-mono-stack">{timeAgo(repo.updated_at)}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        hidden.has(repo.id)
                          ? 'bg-gray-800 text-gray-500'
                          : 'bg-green-950 text-green-400 border border-green-800'
                      }`}>
                        {hidden.has(repo.id) ? 'Hidden' : 'Visible'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleHidden(repo.id)}
                          className="p-1.5 rounded text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all">
                          {hidden.has(repo.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <a href={repo.html_url} target="_blank" rel="noreferrer"
                          className="p-1.5 rounded text-gray-600 hover:text-[#1A56A4] hover:bg-white/5 transition-all">
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {displayed.length === 0 && !loading && (
              <div className="py-14 text-center text-gray-600">
                <Globe size={28} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No repositories match your filters.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
        <span>Showing {displayed.length} of {repos.length} repos</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Live GitHub API
        </span>
      </div>
    </div>
  )
}
