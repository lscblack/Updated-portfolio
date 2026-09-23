import { useRef } from 'react'
import { motion, useReducedMotion, type MotionValue } from 'framer-motion'
import { ArrowUpRight, Sparkles, Globe } from 'lucide-react'
import { useSite } from '../contexts/SiteContext'
import type { Project } from '../lib/types'
import SectionHeader from './ui/SectionHeader'
import Reveal from './ui/Reveal'
import { GithubIcon } from './ui/Brand'
import PersonalProjects from './PersonalProjects'
import { ScrollCard, StackItem, useGroupProgress, useMinWidth } from './ui/ScrollFx'

function Cover({ p, i }: { p: Project; i: number }) {
  return (
    <div className="relative h-full min-h-[240px] md:min-h-[320px] overflow-hidden rounded-[calc(var(--radius)-4px)] bg-surface-2/70">
      {p.image_url ? (
        <img src={p.image_url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
      ) : (
        <div className="absolute inset-0">
          <div className="absolute inset-0 dots-bg opacity-50" />
          <div className="absolute inset-0" style={{ background: 'color-mix(in oklab, var(--accent) 9%, transparent)' }} />
          <span className="absolute left-6 bottom-4 font-display font-extrabold text-[5.5rem] leading-none text-fg/10 select-none">{String(i + 1).padStart(2, '0')}</span>
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 space-y-2 opacity-70">
            {p.technologies.slice(0, 4).map((t, k) => <div key={t} className="h-1.5 rounded-full bg-fg/10" style={{ width: `${75 - k * 14}%` }} />)}
          </div>
        </div>
      )}
      {p.image_url && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />}
      <div className="absolute top-4 left-4 flex gap-1.5">
        {p.year && <span className="tag !bg-black/40 !text-white !border-white/15 backdrop-blur">{p.year}</span>}
        {p.live_url && <span className="tag !bg-black/40 !text-white !border-white/15 backdrop-blur"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live</span>}
      </div>
    </div>
  )
}

function FeaturedCard({ p, i, stack }: { p: Project; i: number; stack?: { total: number; progress: MotionValue<number> } }) {
  const reduce = useReducedMotion()
  const href = p.live_url || p.github_url
  return (
    <Wrap i={i} stack={stack}>
      <article className={`group card ${stack ? 'card-solid' : 'card-hover'} p-2.5 md:p-3 grid md:grid-cols-[5fr_7fr] gap-3 md:gap-8 h-full`}>
        <a href={href || undefined} target={href ? '_blank' : undefined} rel="noreferrer" className="block h-full"><Cover p={p} i={i} /></a>
        <div className="p-4 md:py-7 md:pr-7 md:pl-0 flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[0.68rem] tracking-[0.18em] uppercase text-accent-ink">{String(i + 1).padStart(2, '0')} {p.role ? `· ${p.role}` : ''}</p>
              <h3 className="mt-2 font-display font-extrabold text-2xl md:text-3xl text-fg leading-tight text-balance">{p.title}</h3>
            </div>
            {href && (
              <motion.a href={href} target="_blank" rel="noreferrer" aria-label={`Open ${p.title}`} whileHover={reduce ? {} : { rotate: 45 }} className="shrink-0 w-11 h-11 rounded-full bg-surface-2/80 grid place-items-center text-muted group-hover:bg-accent group-hover:text-accent-fg transition-colors"><ArrowUpRight size={18} /></motion.a>
            )}
          </div>
          <p className="mt-4 text-sm md:text-[0.95rem] text-muted leading-relaxed text-pretty">{p.description}</p>
          {!!p.highlights?.length && (
            <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {p.highlights.slice(0, 4).map(h => <li key={h} className="flex items-start gap-2 text-sm text-fg/90"><Sparkles size={13} className="text-accent-ink shrink-0 mt-0.5" />{h}</li>)}
            </ul>
          )}
          <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">{p.technologies.slice(0, 7).map(t => <span key={t} className="tag tag-neutral">{t}</span>)}</div>
            <div className="flex items-center gap-2 shrink-0">
              {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><GithubIcon size={14} /> Code</a>}
              {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><Globe size={13} /> {p.live_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>}
            </div>
          </div>
        </div>
      </article>
    </Wrap>
  )
}

function Wrap({ children, i, stack }: { children: React.ReactNode; i: number; stack?: { total: number; progress: MotionValue<number> } }) {
  if (stack) return <StackItem index={i} total={stack.total} groupProgress={stack.progress}>{children}</StackItem>
  return <ScrollCard index={i} className="h-full">{children}</ScrollCard>
}

export default function Projects() {
  const { data, sectionTitle } = useSite()
  const all = (data?.projects ?? []).filter(p => p.public !== false)
  const featured = all.filter(p => p.featured)
  const others = all.filter(p => !p.featured)
  const t = sectionTitle('projects', { label: 'projects', title: 'Things I have built', subtitle: '' })
  const stackRef = useRef<HTMLDivElement>(null)
  const progress = useGroupProgress(stackRef)
  const stacked = useMinWidth(768) && featured.length > 1
  if (!all.length) return null

  return (
    <section id="projects" className="section bg-surface/40">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader label={t.label} title={t.title} subtitle={t.subtitle} />
          <Reveal delay={0.2}><p className="font-mono text-xs text-muted"><span className="text-accent-ink text-2xl font-display font-extrabold">{all.length}</span> projects · <span className="text-fg">{featured.length}</span> featured</p></Reveal>
        </div>

        {!!featured.length && (
          stacked ? (
            <div ref={stackRef} className="mt-12 pb-[6vh]">
              {featured.map((p, i) => <FeaturedCard key={p.id ?? i} p={p} i={i} stack={{ total: featured.length, progress }} />)}
            </div>
          ) : (
            <div className="mt-12 grid gap-5">
              {featured.map((p, i) => <FeaturedCard key={p.id ?? i} p={p} i={i} />)}
            </div>
          )
        )}
        <PersonalProjects projects={others} />
      </div>
    </section>
  )
}
