/** "Other work" — a drive-through: on desktop the cards travel past horizontally as you scroll. */
import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight, MoveRight } from 'lucide-react'
import type { Project } from '../lib/types'
import { GithubIcon } from './ui/Brand'
import { Rise, useMinWidth } from './ui/ScrollFx'
import Reveal from './ui/Reveal'

function Card({ p, i, wide = false }: { p: Project; i: number; wide?: boolean }) {
  const href = p.live_url || p.github_url
  return (
    <a href={href || undefined} target={href ? '_blank' : undefined} rel="noreferrer"
      className={`group card card-hover p-5 flex flex-col h-full ${wide ? 'w-[min(78vw,380px)] shrink-0' : ''}`}>
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
      <p className={`mt-3 text-sm text-muted leading-relaxed ${wide ? 'line-clamp-4' : 'line-clamp-2'}`}>{p.description}</p>
      <div className="mt-auto pt-4 flex items-center justify-between gap-3">
        <p className="font-mono text-[0.68rem] text-muted/80 truncate">{p.technologies.join(' · ')}</p>
        {p.github_url && <GithubIcon size={14} className="text-muted group-hover:text-fg transition-colors shrink-0" />}
      </div>
      <span className="mt-3 font-display text-4xl font-extrabold text-fg/[0.06] leading-none select-none">{String(i + 1).padStart(2, '0')}</span>
    </a>
  )
}

/** Pinned track: the row of cards slides sideways while the page scrolls through this section. */
function DriveThrough({ projects, filters, filter, setFilter }: { projects: Project[]; filters: string[]; filter: string; setFilter: (f: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const n = projects.length
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.0005 })
  // travel the full row minus one screen, so the last card lands at the right edge
  const x = useTransform(p, v => `calc(${-v} * (${n} * (min(78vw,380px) + 1.25rem) - 86vw))`)
  const [seen, setSeen] = useState(1)
  useMotionValueEvent(p, 'change', v => setSeen(Math.min(n, Math.max(1, Math.round(v * (n - 1)) + 1))))

  return (
    <div ref={ref} style={{ height: `${90 + n * 26}vh` }} className="relative mt-6">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div className="container-x flex flex-wrap items-center justify-between gap-4 mb-6">
          <p className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-muted inline-flex items-center gap-2">
            <MoveRight size={14} className="text-accent-ink" /> keep scrolling
          </p>
          <div className="flex flex-wrap gap-1.5">
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === f ? 'bg-fg text-bg' : 'bg-surface-2/60 text-muted hover:text-fg'}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="w-11/12 mx-auto overflow-hidden">
          <motion.div style={{ x }} className="flex gap-5 will-change-transform items-stretch">
            {projects.map((pr, i) => <Card key={pr.id ?? pr.title} p={pr} i={i} wide />)}
          </motion.div>
        </div>
        <div className="container-x mt-6 flex items-center gap-3">
          <span className="font-mono text-xs text-muted tabular-nums">{String(seen).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
          <div className="relative h-px flex-1 bg-line"><motion.div className="absolute inset-y-0 left-0 w-full bg-accent origin-left" style={{ scaleX: p }} /></div>
        </div>
      </div>
    </div>
  )
}

export default function PersonalProjects({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState('All')
  const filters = useMemo(() => ['All', ...Array.from(new Set(projects.flatMap(p => p.categories)))], [projects])
  const shown = projects.filter(p => filter === 'All' || p.categories.includes(filter))
  const wide = useMinWidth(1024)
  const reduce = useReducedMotion()
  const drive = wide && !reduce && shown.length > 2
  if (!projects.length) return null

  return (
    <div className="mt-20">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-muted">Other work <span className="text-accent-ink">{shown.length}</span></p>
          {!drive && (
            <div className="flex flex-wrap gap-1.5">
              {filters.map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === f ? 'bg-fg text-bg' : 'bg-surface-2/60 text-muted hover:text-fg'}`}>{f}</button>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      {drive ? (
        <DriveThrough projects={shown} filters={filters} filter={filter} setFilter={setFilter} />
      ) : (
        <ul className="mt-6 grid md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((p, i) => (
              <motion.li key={p.id ?? p.title} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }}>
                <Rise index={i} className="h-full"><Card p={p} i={i} /></Rise>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}
