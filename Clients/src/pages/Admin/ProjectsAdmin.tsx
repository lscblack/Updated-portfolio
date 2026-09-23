/** Browse public GitHub repositories and import them as projects. */
import { useEffect, useState } from 'react'
import { RefreshCw, Search, Star, GitFork, ExternalLink, Download, Loader2, Check } from 'lucide-react'
import api, { errorMessage } from '../../api/client'
import { useSite } from '../../contexts/SiteContext'
import { PageHeader } from './ui/Fields'
import { useToast } from './ui/Toast'

type Repo = { id: number; name: string; description: string; html_url: string; homepage: string; language: string; topics: string[]; stars: number; forks: number; updated_at: string; fork: boolean; archived: boolean }

const LANG: Record<string, string> = { Python: '#3776ab', TypeScript: '#3178c6', JavaScript: '#f7df1e', Dart: '#00b4ab', Go: '#00add8', 'Jupyter Notebook': '#da5b0b', HTML: '#e34c26', CSS: '#563d7c', PHP: '#777bb4', Java: '#b07219', 'C++': '#f34b7d' }
function ago(iso: string) { const d = (Date.now() - new Date(iso).getTime()) / 86400000; return d < 1 ? 'today' : d < 30 ? `${Math.floor(d)}d ago` : d < 365 ? `${Math.floor(d / 30)}mo ago` : `${Math.floor(d / 365)}y ago` }

export default function ProjectsAdmin() {
  const { data, reload } = useSite()
  const { toast } = useToast()
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [lang, setLang] = useState('All')
  const [importing, setImporting] = useState<number | null>(null)
  const existing = new Set((data?.projects ?? []).map(p => p.github_url))

  const load = async (refresh = false) => {
    setLoading(true)
    try { const r = await api.get('/api/admin/github/repos', { params: { refresh } }); setRepos(r.data.filter((x: Repo) => !x.fork)) } catch (e) { toast(errorMessage(e), 'error') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const importRepo = async (r: Repo) => {
    setImporting(r.id)
    try { await api.post('/api/admin/github/import', r); await reload(); toast(`Imported ${r.name} — edit it under Projects`) } catch (e) { toast(errorMessage(e), 'error') } finally { setImporting(null) }
  }

  const langs = ['All', ...Array.from(new Set(repos.map(r => r.language).filter(Boolean)))]
  const shown = repos.filter(r => (lang === 'All' || r.language === lang) && (!q || r.name.toLowerCase().includes(q.toLowerCase()) || r.description.toLowerCase().includes(q.toLowerCase())))

  return (
    <div>
      <PageHeader title="GitHub import" description="Public repositories fetched from GitHub. Import one to turn it into an editable project." actions={<button onClick={() => load(true)} className="btn btn-outline btn-sm"><RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh</button>} />
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input className="input input-sm !pl-8" placeholder="Search repositories" value={q} onChange={e => setQ(e.target.value)} /></div>
        <select className="input input-sm max-w-[200px]" value={lang} onChange={e => setLang(e.target.value)}>{langs.map(l => <option key={l}>{l}</option>)}</select>
      </div>
      {loading ? <p className="text-sm text-muted flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Fetching from GitHub</p> : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map(r => {
            const done = existing.has(r.html_url)
            return (
              <article key={r.id} className="card p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-fg truncate">{r.name}</h3>
                  <a href={r.html_url} target="_blank" rel="noreferrer" className="text-muted hover:text-accent-ink shrink-0"><ExternalLink size={13} /></a>
                </div>
                <p className="mt-1 text-xs text-muted line-clamp-2 flex-1">{r.description || 'No description'}</p>
                <div className="mt-3 flex flex-wrap gap-1">{r.topics.slice(0, 4).map(t => <span key={t} className="tag tag-neutral !text-[0.6rem]">{t}</span>)}</div>
                <div className="mt-3 flex items-center justify-between text-[0.68rem] text-muted">
                  <span className="flex items-center gap-3">{r.language && <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: LANG[r.language] ?? 'var(--muted)' }} />{r.language}</span>}<span className="inline-flex items-center gap-1"><Star size={11} />{r.stars}</span><span className="inline-flex items-center gap-1"><GitFork size={11} />{r.forks}</span></span>
                  <span>{ago(r.updated_at)}</span>
                </div>
                <button disabled={done || importing === r.id} onClick={() => importRepo(r)} className={`btn btn-sm mt-3 ${done ? 'btn-ghost' : 'btn-outline'}`}>
                  {done ? <><Check size={13} /> Imported</> : importing === r.id ? <Loader2 size={13} className="animate-spin" /> : <><Download size={13} /> Import as project</>}
                </button>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
