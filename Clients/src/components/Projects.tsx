import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import {  Star, GitFork, ExternalLink, Loader2, Search, GitBranch } from 'lucide-react'

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
}

const FEATURED = [
  'OrganiChain',
  'Safe_Land_Rwanda',
  'Famcare',
  'AfriTon-chatbot',
  'BookHub_Backend_fastapi',
  'course_management_system_Nodejs_mysql_redis',
  'Deep-Q-Learning_Reforcement_Learning',
  'Sentiment-Analysis',
  'Time-Series-Forecasting',
  'hidden-markov',
  'Urban_Voice_classifier',
  'linux-dashboard-control',
]

const LANG_COLORS: Record<string, string> = {
  Python: '#3776ab',
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Dart: '#00b4ab',
  Go: '#00add8',
  'Jupyter Notebook': '#da5b0b',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Solidity: '#aa6746',
}

function LanguageDot({ lang }: { lang: string }) {
  const color = LANG_COLORS[lang] ?? '#6366f1'
  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-500">
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
      {lang}
    </span>
  )
}

function shimmerCards() {
  return Array.from({ length: 6 }).map((_, i) => (
    <div key={i} className="glass p-5 rounded-2xl h-40 shimmer" />
  ))
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}
const card = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

function humanName(name: string) {
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function Projects() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('All')
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  useEffect(() => {
    fetch('https://api.github.com/users/lscblack/repos?per_page=100&sort=updated')
      .then(r => r.json())
      .then((data: Repo[]) => {
        const filtered = data.filter(r => !r.fork)
        // Put FEATURED first, then rest sorted by updated_at
        const featured = FEATURED
          .map(n => filtered.find(r => r.name === n))
          .filter(Boolean) as Repo[]
        const rest = filtered
          .filter(r => !FEATURED.includes(r.name))
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        setRepos([...featured, ...rest])
      })
      .catch(() => setRepos([]))
      .finally(() => setLoading(false))
  }, [])

  const languages = ['All', ...Array.from(new Set(repos.map(r => r.language).filter(Boolean) as string[]))]

  const displayed = repos
    .filter(r => filter === 'All' || r.language === filter)
    .filter(r =>
      search.trim() === '' ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? '').toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, showAll ? 1000 : 12)

  return (
    <section id="projects" className="py-24 relative" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="section-divider" />
          <div className="flex flex-wrap items-end justify-between gap-4 mt-2">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                GitHub <span className="gradient-text">Projects</span>
              </h2>
              <p className="mt-2 text-slate-500 flex items-center gap-2">
                <span>Live from</span>
                <a
                  href="https://github.com/lscblack"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  <GitBranch size={13} />
                  github.com/lscblack
                </a>
                {!loading && <span className="badge badge-indigo">{repos.length} repos</span>}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="mb-6 flex flex-wrap gap-3 items-center"
        >
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {languages.slice(0, 8).map(l => (
              <button
                key={l}
                onClick={() => setFilter(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === l
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:border-indigo-500/30 hover:text-slate-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{shimmerCards()}</div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {displayed.map(repo => (
              <motion.a
                key={repo.id}
                variants={card}
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="glass project-card p-5 rounded-2xl flex flex-col gap-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-200 group-hover:text-indigo-300 transition-colors leading-tight">
                      {humanName(repo.name)}
                    </h3>
                    {FEATURED.includes(repo.name) && (
                      <span className="badge badge-violet mt-1">Featured</span>
                    )}
                  </div>
                  <ExternalLink size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-0.5" />
                </div>

                <p className="text-xs text-slate-500 leading-relaxed flex-1 line-clamp-3">
                  {repo.description || 'No description provided.'}
                </p>

                {repo.topics?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {repo.topics.slice(0, 3).map(t => (
                      <span key={t} className="badge badge-indigo text-[10px]">{t}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  {repo.language ? (
                    <LanguageDot lang={repo.language} />
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Star size={11} />
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork size={11} />
                      {repo.forks_count}
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}

        {!loading && repos.length > 12 && !showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="mt-10 text-center"
          >
            <button onClick={() => setShowAll(true)} className="btn-ghost">
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              Show all {repos.length} repositories
              <ExternalLink size={13} />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
