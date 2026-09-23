import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useSite } from '../contexts/SiteContext'
import { Icon } from '../lib/icons'
import SectionHeader from './ui/SectionHeader'
import Reveal from './ui/Reveal'
import { useMinWidth } from './ui/ScrollFx'
import type { SkillCategory } from '../lib/types'

function levelLabel(l: number) { return l >= 85 ? 'Expert' : l >= 65 ? 'Proficient' : 'Familiar' }

function Bar({ name, level, index }: { name: string; level: number; index: number }) {
  const reduce = useReducedMotion()
  return (
    <div className="py-2.5">
      <div className="flex justify-between items-baseline mb-1.5 gap-3">
        <span className="text-sm font-medium text-fg truncate">{name}</span>
        <span className="font-mono text-[0.68rem] text-muted shrink-0">{levelLabel(level)} <span className="text-accent-ink">{level}%</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
        <motion.div className="h-full rounded-full bg-accent"
          initial={{ width: 0 }} animate={{ width: `${Math.max(2, Math.min(100, level))}%` }} transition={{ duration: reduce ? 0 : 0.9, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }} />
      </div>
    </div>
  )
}


/* ── desktop: pinned stage, categories slide horizontally with scroll ─────── */
function Panel({ cat, active }: { cat: SkillCategory; active: boolean }) {
  return (
    <motion.article animate={{ scale: active ? 1 : 0.94, opacity: active ? 1 : 0.55 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="card p-7 xl:p-8 w-[min(62vw,880px)] shrink-0 grid grid-cols-[3fr_2fr] gap-8 max-h-[70vh] overflow-hidden">
      <div>
        <div className="flex items-center gap-3 mb-5">
          <span className="w-11 h-11 rounded-full bg-accent text-accent-fg grid place-items-center"><Icon name={cat.icon} size={18} /></span>
          <div><h3 className="font-display font-extrabold text-xl text-fg leading-tight">{cat.name}</h3><p className="font-mono text-[0.68rem] text-muted">{cat.skills.length} skills</p></div>
        </div>
        <div className="grid grid-cols-2 gap-x-8">
          {cat.skills.map((sk, i) => active ? <Bar key={`${cat.id}-${sk.name}`} name={sk.name} level={Number(sk.level) || 0} index={i} /> : <div key={sk.name} className="py-2.5"><div className="flex justify-between mb-1.5"><span className="text-sm text-fg">{sk.name}</span></div><div className="h-1.5 rounded-full bg-surface-2" /></div>)}
        </div>
      </div>
      <div className="border-l border-line pl-7">
        <p className="font-mono text-[0.7rem] tracking-[0.18em] uppercase mb-4" style={{ color: 'var(--accent-2)' }}>Applied in</p>
        <ul className="space-y-3">
          {cat.applied.map((p, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--accent-2)' }} />
              {p.url ? <a href={p.url} target="_blank" rel="noreferrer" className="text-fg hover:text-accent-ink inline-flex items-center gap-1 group">{p.name}<ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></a> : <span className="text-muted">{p.name}</span>}
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  )
}

function HorizontalStage({ cats, label, title, subtitle }: { cats: SkillCategory[]; label: string; title: string; subtitle: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const n = cats.length
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26 })
  const x = useTransform(p, v => `calc(${-v * (n - 1)} * (min(62vw, 880px) + 1.5rem))`)
  const [active, setActive] = useState(0)
  useMotionValueEvent(p, 'change', v => setActive(Math.round(v * (n - 1))))
  const jump = (i: number) => { const el = ref.current; if (!el) return; window.scrollTo({ top: el.offsetTop + (i / (n - 1)) * (el.offsetHeight - window.innerHeight), behavior: 'smooth' }) }
  return (
    <div ref={ref} style={{ height: `${100 + n * 55}vh` }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        <div className="container-x flex items-end justify-between gap-6 mb-6">
          <SectionHeader label={label} title={title} subtitle={subtitle} />
          <div className="hidden xl:flex items-center gap-2 shrink-0">
            {cats.map((c, i) => (
              <button key={c.id ?? i} onClick={() => jump(i)} className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold border transition-colors ${active === i ? 'bg-accent text-accent-fg border-accent' : 'text-muted border-line hover:text-fg'}`}><Icon name={c.icon} size={13} />{c.name}</button>
            ))}
          </div>
        </div>
        <div className="w-11/12 mx-auto">
          <motion.div style={{ x }} className="flex gap-6 will-change-transform">
            {cats.map((c, i) => <Panel key={c.id ?? i} cat={c} active={i === active} />)}
          </motion.div>
        </div>
        <div className="container-x mt-6 flex items-center gap-3">
          <span className="font-mono text-xs text-muted tabular-nums">{String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
          <div className="relative h-px flex-1 bg-line"><motion.div className="absolute inset-y-0 left-0 bg-accent origin-left w-full" style={{ scaleX: p }} /></div>
          <span className="font-mono text-[0.65rem] text-muted uppercase tracking-widest">scroll</span>
        </div>
      </div>
    </div>
  )
}

export default function Skills() {
  const { data, sectionTitle } = useSite()
  const cats = (data?.skills ?? []).filter(c => c.visible !== false)
  const t = sectionTitle('skills', { label: 'skills', title: 'What I work with', subtitle: '' })
  const [tab, setTab] = useState(0)
  const desktop = useMinWidth(1024)
  const reduce = useReducedMotion()
  if (!cats.length) return null
  const cat = cats[Math.min(tab, cats.length - 1)]

  if (desktop && !reduce && cats.length > 1) {
    return <section id="skills" className="relative"><HorizontalStage cats={cats} label={t.label} title={t.title} subtitle={t.subtitle} /></section>
  }

  return (
    <section id="skills" className="section">
      <div className="container-x">
        <SectionHeader label={t.label} title={t.title} subtitle={t.subtitle} />

        <Reveal delay={0.15}>
          <div className="mt-10 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap [scrollbar-width:none]" role="tablist">
            {cats.map((c, i) => (
              <button key={c.id ?? i} role="tab" aria-selected={tab === i} onClick={() => setTab(i)}
                className={`relative shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-colors ${tab === i ? 'text-accent-fg border-transparent' : 'text-muted border-line hover:text-fg hover:border-muted'}`}>
                {tab === i && <motion.span layoutId="skill-tab" className="absolute inset-0 rounded-full bg-accent" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <span className="relative inline-flex items-center gap-2"><Icon name={c.icon} size={14} />{c.name}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          <motion.div key={cat.id ?? tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
            className="mt-6 grid lg:grid-cols-[3fr_2fr] gap-5 items-start">
            <div className="card p-6 sm:p-7">
              <div className="flex items-center justify-between mb-4">
                <p className="inline-flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.18em] uppercase text-accent-ink"><Icon name={cat.icon} size={14} />{cat.name}</p>
                <span className="font-mono text-xs text-muted">{cat.skills.length} skills</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-10">
                {cat.skills.map((s, i) => <Bar key={`${cat.id}-${s.name}`} name={s.name} level={Number(s.level) || 0} index={i} />)}
              </div>
            </div>
            <div className="card p-6 sm:p-7 bg-surface-2/50">
              <p className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-accent-2 mb-4" style={{ color: 'var(--accent-2)' }}>Applied in</p>
              <ul className="space-y-3">
                {cat.applied.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--accent-2)' }} />
                    {p.url ? <a href={p.url} target="_blank" rel="noreferrer" className="text-fg hover:text-accent-ink inline-flex items-center gap-1 group">{p.name}<ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></a> : <span className="text-muted">{p.name}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
