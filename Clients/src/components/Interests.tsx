import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { useSite } from '../contexts/SiteContext'
import { Icon } from '../lib/icons'
import type { Interest } from '../lib/types'
import SectionHeader from './ui/SectionHeader'
import { Stagger, Item } from './ui/Reveal'
import { useMinWidth } from './ui/ScrollFx'

function Card({ c, i, onEnter }: { c: Interest; i: number; onEnter?: (i: number) => void }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' })
  useEffect(() => { if (inView && onEnter) onEnter(i) }, [inView, onEnter, i])
  return (
    <motion.article ref={ref} animate={{ opacity: onEnter ? (inView ? 1 : 0.45) : 1, x: onEnter && inView ? 0 : onEnter ? 12 : 0 }} transition={{ duration: 0.4 }}
      className="group card card-hover p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <span className="w-10 h-10 rounded-full bg-surface-2/70 grid place-items-center text-accent-ink group-hover:bg-accent group-hover:text-accent-fg transition-colors"><Icon name={c.icon} size={17} /></span>
        <span className="font-mono text-[0.68rem] tracking-widest text-muted">{String(i + 1).padStart(2, '0')}</span>
      </div>
      <h3 className="mt-5 font-display font-extrabold text-lg text-fg leading-tight">{c.title}</h3>
      <ul className="mt-4 space-y-1.5">
        {c.items.map(it => <li key={it} className="text-sm text-muted leading-relaxed flex gap-2"><span className="mt-[0.45rem] w-1 h-1 rounded-full bg-accent-ink shrink-0" />{it}</li>)}
      </ul>
    </motion.article>
  )
}

export default function Interests() {
  const { data, sectionTitle } = useSite()
  const cats = (data?.interests ?? []).filter(c => c.visible !== false)
  const t = sectionTitle('interests', { label: 'interests', title: 'What I think about', subtitle: '' })
  const [active, setActive] = useState(0)
  const desktop = useMinWidth(1024)
  if (!cats.length) return null
  const cur = cats[Math.min(active, cats.length - 1)]

  if (!desktop) {
    return (
      <section id="interests" className="section">
        <div className="container-x">
          <SectionHeader label={t.label} title={t.title} subtitle={t.subtitle} />
          <Stagger className="mt-10 grid sm:grid-cols-2 gap-4">
            {cats.map((c, i) => <Item key={c.id ?? i}><Card c={c} i={i} /></Item>)}
          </Stagger>
        </div>
      </section>
    )
  }

  return (
    <section id="interests" className="section">
      <div className="container-x grid lg:grid-cols-[1fr_1.1fr] gap-16 items-start">
        <div className="lg:sticky lg:top-28 min-h-[60vh] flex flex-col">
          <SectionHeader label={t.label} title={t.title} subtitle={t.subtitle} />
          <div className="mt-10 relative flex-1">
            <AnimatePresence mode="wait">
              <motion.div key={cur.id ?? active} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.35 }} className="card p-8">
                <span className="w-14 h-14 rounded-full bg-accent text-accent-fg grid place-items-center"><Icon name={cur.icon} size={24} /></span>
                <p className="mt-6 font-mono text-xs text-accent-ink">{String(active + 1).padStart(2, '0')} / {String(cats.length).padStart(2, '0')}</p>
                <h3 className="mt-2 font-display font-extrabold text-2xl xl:text-3xl text-fg leading-tight text-balance">{cur.title}</h3>
                <p className="mt-3 text-sm text-muted">{cur.items.length} focus areas</p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-6 flex gap-1.5">
              {cats.map((c, i) => <span key={c.id ?? i} className={`h-1 rounded-full transition-all duration-500 ${i === active ? 'w-8 bg-accent-ink' : 'w-3 bg-line'}`} />)}
            </div>
          </div>
        </div>
        <div className="space-y-5 py-[10vh]">
          {cats.map((c, i) => <Card key={c.id ?? i} c={c} i={i} onEnter={setActive} />)}
        </div>
      </div>
    </section>
  )
}
