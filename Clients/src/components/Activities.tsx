import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useSite } from '../contexts/SiteContext'
import { Icon } from '../lib/icons'
import type { Activity } from '../lib/types'
import SectionHeader from './ui/SectionHeader'
import Reveal from './ui/Reveal'
import ActivityScene from './ui/ActivityScene'
import LifeTree from './ui/LifeTree'
import { useMinWidth } from './ui/ScrollFx'

/** The media (or animated scene) for one activity, with a slow drift so it feels alive. */
function Media({ a, active, compact = false }: { a: Activity; active: boolean; compact?: boolean }) {
  const reduce = useReducedMotion()
  if (a.media_url && a.media_kind === 'video') {
    return <video src={a.media_url} muted loop playsInline autoPlay={!reduce} className="absolute inset-0 w-full h-full object-cover" aria-label={a.caption || a.label} />
  }
  if (a.media_url) {
    return (
      <motion.img src={a.media_url} alt={a.caption || `${a.label}`} loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
        animate={reduce ? {} : { scale: active ? 1.08 : 1 }} transition={{ duration: 7, ease: 'linear' }} />
    )
  }
  // only reached when this activity has no media of its own
  return <div className="absolute inset-0 grid place-items-center">{compact ? <ActivityScene kind={`${a.icon} ${a.label}`} playing={active} /> : null}</div>
}

function Panel({ a, active, tree, compact = false }: { a: Activity; active: boolean; tree?: React.ReactNode; compact?: boolean }) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-card-lg bg-surface-2/60">
      {!a.media_url && tree ? <div className="absolute inset-0 p-4">{tree}</div> : <Media a={a} active={active} compact={compact} />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <span className="inline-flex items-center gap-2 tag !bg-black/45 !text-white !border-white/20 backdrop-blur"><Icon name={a.icon} size={12} /> {a.label}</span>
        {a.caption && <p className="mt-3 text-white/90 text-sm max-w-md">{a.caption}</p>}
      </div>
    </div>
  )
}

function Row({ a, i, onEnter }: { a: Activity; i: number; onEnter: (i: number) => void }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' })
  useEffect(() => { if (inView) onEnter(i) }, [inView, onEnter, i])
  return (
    <motion.article ref={ref} animate={{ opacity: inView ? 1 : 0.4 }} transition={{ duration: 0.45 }} className="py-10 lg:py-16">
      <div className="flex items-center gap-3">
        <span className={`w-11 h-11 rounded-full grid place-items-center transition-colors ${inView ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-muted'}`}><Icon name={a.icon} size={18} /></span>
        <span className="font-mono text-[0.68rem] text-muted">{String(i + 1).padStart(2, '0')}</span>
      </div>
      <h3 className="mt-5 font-display font-extrabold text-2xl lg:text-3xl text-fg leading-tight">{a.label}</h3>
      <p className="mt-3 text-muted leading-relaxed text-pretty max-w-lg">{a.quote}</p>
      {/* the media also appears inline on small screens, where there is no sticky panel */}
      <div className="lg:hidden mt-5 aspect-[4/3]"><Panel a={a} active={inView} compact /></div>
    </motion.article>
  )
}

export default function Activities() {
  const { data, sectionTitle } = useSite()
  const items = (data?.activities ?? []).filter(a => a.visible !== false)
  const t = sectionTitle('activities', { label: 'life beyond code', title: 'Outside work', subtitle: '' })
  const [active, setActive] = useState(0)
  const desktop = useMinWidth(1024)
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const reduce = useReducedMotion()
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : -24, reduce ? 0 : 24])
  if (!items.length) return null
  const cur = items[Math.min(active, items.length - 1)]

  // note: no overflow-hidden on this section — it would become a scroll container and break the sticky panel
  return (
    <section id="activities" className="section bg-surface/40" ref={ref}>
      <div className="container-x">
        <SectionHeader label={t.label} title={t.title} subtitle={t.subtitle} />
        {/* no items-start: the right column must stretch so the sticky panel has room to travel */}
        <div className="mt-12 grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-16">
          <div>
            {items.map((a, i) => <Row key={a.id ?? i} a={a} i={i} onEnter={setActive} />)}
          </div>
          {desktop && (
            <div className="relative">
            <div className="sticky top-24 h-[74vh] flex flex-col">
              <motion.div style={{ y }} className="flex-1 min-h-0">
                {cur.media_url ? (
                  <AnimatePresence mode="wait">
                    <motion.div key={cur.id ?? active} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.99 }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="w-full h-full">
                      <Panel a={cur} active />
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <Panel a={cur} active tree={<LifeTree items={items.map(x => ({ icon: x.icon, label: x.label }))} active={active} />} />
                )}
              </motion.div>
              <div className="mt-4 flex gap-1.5 shrink-0">
                {items.map((a, i) => <span key={a.id ?? i} className={`h-1 rounded-full transition-all duration-500 ${i === active ? 'w-8 bg-accent-ink' : 'w-3 bg-line'}`} />)}
              </div>
            </div>
            </div>
          )}
        </div>
        <Reveal><p className="mt-10 text-xs text-muted font-mono">{items.length} things that keep me human</p></Reveal>
      </div>
    </section>
  )
}
