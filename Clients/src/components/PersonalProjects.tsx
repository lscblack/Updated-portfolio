/** "Other work" — the compact, filterable list under the featured projects. */
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../lib/types'
import { GithubIcon } from './ui/Brand'
import { Rise } from './ui/ScrollFx'
import Reveal from './ui/Reveal'

export default function PersonalProjects({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState('All')
  const filters = useMemo(() => ['All', ...Array.from(new Set(projects.flatMap(p => p.categories)))], [projects])
  const shown = projects.filter(p => filter === 'All' || p.categories.includes(filter))
  if (!projects.length) return null

  return (
    <div className="mt-20">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <p className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-muted">Other work <span className="text-accent-ink">{shown.length}</span></p>
          <div className="flex flex-wrap gap-1.5">
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === f ? 'bg-fg text-bg' : 'bg-surface-2/60 text-muted hover:text-fg'}`}>{f}</button>
            ))}
          </div>
        </div>
      </Reveal>
      <ul className="grid md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((p, i) => {
            const href = p.live_url || p.github_url
            return (
              <motion.li key={p.id ?? p.title} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }}>
                <Rise index={i} className="h-full">
                  <a href={href || undefined} target={href ? '_blank' : undefined} rel="noreferrer" className="group card card-hover p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display font-bold text-fg group-hover:text-accent-ink transition-colors">{p.title}</h4>
                          {p.year && <span className="font-mono text-[0.65rem] text-muted">{p.year}</span>}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1">{p.categories.map(c => <span key={c} className="tag !text-[0.62rem]">{c}</span>)}</div>
                      </div>
                      <span className="shrink-0 w-9 h-9 rounded-full bg-surface-2/70 grid place-items-center text-muted group-hover:bg-accent group-hover:text-accent-fg transition-colors"><ArrowUpRight size={15} /></span>
                    </div>
                    <p className="mt-3 text-sm text-muted leading-relaxed line-clamp-2">{p.description}</p>
                    <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                      <p className="font-mono text-[0.68rem] text-muted/80 truncate">{p.technologies.join(' · ')}</p>
                      {p.github_url && <GithubIcon size={14} className="text-muted group-hover:text-fg transition-colors shrink-0" />}
                    </div>
                  </a>
                </Rise>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </div>
  )
}
