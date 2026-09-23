import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, MapPin, Plus } from 'lucide-react'
import { useSite } from '../contexts/SiteContext'
import SectionHeader from './ui/SectionHeader'
import Reveal from './ui/Reveal'
import { ScrollRail } from './ui/ScrollFx'

export default function Experience() {
  const { data, sectionTitle } = useSite()
  const jobs = (data?.experience ?? []).filter(j => j.visible !== false)
  const t = sectionTitle('experience', { label: 'experience', title: 'Where I have worked', subtitle: '' })
  const [open, setOpen] = useState<number>(0)
  const [passed, setPassed] = useState(0)
  const listRef = useRef<HTMLOListElement>(null)
  if (!jobs.length) return null

  return (
    <section id="experience" className="section bg-surface/40">
      <div className="container-x">
        <div className="grid lg:grid-cols-[minmax(0,320px)_1fr] gap-10 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-28">
            <SectionHeader label={t.label} title={t.title} subtitle={t.subtitle} />
            <Reveal delay={0.2}>
              <div className="mt-8 flex items-baseline gap-2">
                <span className="font-display text-4xl sm:text-5xl font-extrabold text-line leading-none select-none">{String(jobs.length).padStart(2, '0')}</span>
                <span className="font-mono text-xs text-muted tracking-widest uppercase">roles</span>
              </div>
            </Reveal>
          </div>

          <ol ref={listRef} className="relative divide-y divide-line border-y border-line pl-4 sm:pl-6">
            <ScrollRail target={listRef} className="left-0" count={jobs.length} onIndex={setPassed} />
            {jobs.map((job, i) => {
              const isOpen = open === i
              return (
                <Reveal key={job.id ?? i} as="li" delay={i * 0.05} y={18}>
                  <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}
                    className="w-full text-left py-6 sm:py-7 grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[3rem_1fr_11rem_2.5rem] gap-4 items-start group">
                    <span className={`font-mono text-xs pt-1.5 transition-colors duration-500 ${i <= passed ? 'text-accent-ink' : 'text-muted'} group-hover:text-accent-ink`}>{String(i + 1).padStart(2, '0')}</span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3 className="font-display font-extrabold text-lg sm:text-xl text-fg leading-tight group-hover:text-accent-ink transition-colors">{job.company}</h3>
                        {job.current && <span className="tag"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Current</span>}
                      </div>
                      <p className="text-sm text-muted mt-1">{job.title}<span className="mx-2 opacity-40">/</span><span className="font-mono text-xs">{job.job_type}</span></p>
                      <p className="sm:hidden text-xs text-muted font-mono mt-1">{job.period}</p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="font-mono text-xs text-muted">{job.period}</p>
                      {job.location && <p className="text-xs text-muted mt-1 inline-flex items-center gap-1"><MapPin size={11} />{job.location}</p>}
                    </div>
                    <span className={`w-9 h-9 rounded-full border border-line grid place-items-center text-muted transition-all ${isOpen ? 'rotate-45 border-accent text-accent-ink' : 'group-hover:border-accent group-hover:text-accent-ink'}`}><Plus size={15} /></span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                        <div className="pb-8 pl-[3.5rem] sm:pl-[4rem] grid lg:grid-cols-[1fr_auto] gap-6">
                          <div>
                            {job.summary && <p className="text-sm text-muted leading-relaxed mb-4 max-w-2xl">{job.summary}</p>}
                            <ul className="space-y-2.5">
                              {job.bullets.map((b, k) => (
                                <motion.li key={k} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + k * 0.05 }} className="flex gap-3 text-sm text-muted leading-relaxed">
                                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />{b}
                                </motion.li>
                              ))}
                            </ul>
                            {job.company_url && <a href={job.company_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-5 text-xs font-semibold text-accent-ink hover:underline">{job.company_url.replace(/^https?:\/\//, '')} <ArrowUpRight size={12} /></a>}
                          </div>
                          <div className="flex flex-wrap lg:flex-col gap-1.5 lg:items-end lg:max-w-[180px]">{job.tags.map(tg => <span key={tg} className="tag tag-neutral">{tg}</span>)}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Reveal>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
