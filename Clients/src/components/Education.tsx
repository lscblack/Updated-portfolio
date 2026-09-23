import { useRef } from 'react'
import { ArrowUpRight, Award, MapPin } from 'lucide-react'
import { useSite } from '../contexts/SiteContext'
import SectionHeader from './ui/SectionHeader'
import Reveal, { Stagger, Item } from './ui/Reveal'
import { ScrollRail, SlideIn } from './ui/ScrollFx'

export default function Education() {
  const { data, sectionTitle } = useSite()
  const edu = (data?.education ?? []).filter(e => e.visible !== false)
  const certs = (data?.certifications ?? []).filter(c => c.visible !== false)
  const t = sectionTitle('education', { label: 'education', title: 'Education & certifications', subtitle: '' })
  const railRef = useRef<HTMLDivElement>(null)
  if (!edu.length && !certs.length) return null

  return (
    <section id="education" className="section">
      <div className="container-x">
        <SectionHeader label={t.label} title={t.title} subtitle={t.subtitle} />
        <div className="mt-12 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16">
          <div>
            <Reveal><p className="label mb-6">Qualifications</p></Reveal>
            <div ref={railRef} className="relative pl-6 sm:pl-8"><ScrollRail target={railRef} className="left-0" />
            <Stagger className="relative space-y-6">
              {edu.map((e, i) => (
                <Item key={e.id ?? i} as="article" className="card card-hover p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-xs text-accent-ink">{e.period}</span>
                      <h3 className="font-display font-extrabold text-xl text-fg mt-1 leading-tight">{e.title}</h3>
                      {e.subtitle && <p className="text-sm font-semibold text-fg/80 mt-0.5">{e.subtitle}</p>}
                      <p className="text-sm text-muted mt-1">{e.org}{e.location && <span className="inline-flex items-center gap-1 ml-2"><MapPin size={11} />{e.location}</span>}</p>
                    </div>
                    {e.status && <span className={`tag shrink-0 ${/progress/i.test(e.status) ? '' : 'tag-neutral'}`}>{e.status}</span>}
                  </div>
                  {e.note && <p className="mt-3 text-sm text-muted leading-relaxed">{e.note}</p>}
                  <div className="mt-4 flex flex-wrap gap-1.5">{e.tags.map(tg => <span key={tg} className="tag tag-neutral">{tg}</span>)}</div>
                  {e.url && <a href={e.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-accent-ink hover:underline">View <ArrowUpRight size={12} /></a>}
                </Item>
              ))}
            </Stagger>
            </div>
          </div>
          <div>
            <Reveal><p className="label mb-6">Certifications & courses</p></Reveal>
            <div className="divide-y divide-line border-y border-line overflow-x-clip">
              {certs.map((c, i) => (
                <SlideIn key={c.id ?? i} index={i}>
                  <a href={c.url || undefined} target={c.url ? '_blank' : undefined} rel="noreferrer" className="group flex items-start gap-4 py-4 -mx-3 px-3 rounded-card hover:bg-surface transition-colors">
                    <span className="mt-0.5 w-9 h-9 rounded-full bg-surface-2 grid place-items-center text-accent-ink shrink-0 group-hover:bg-accent group-hover:text-accent-fg transition-colors"><Award size={15} /></span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-sm text-fg leading-tight group-hover:text-accent-ink transition-colors">{c.title}</p>
                        {c.grade && <span className="tag">{c.grade}</span>}
                      </div>
                      <p className="text-xs text-muted mt-0.5">{c.issuer}{c.year && <span className="font-mono ml-2">{c.year}</span>}</p>
                    </div>
                    {c.url && <ArrowUpRight size={14} className="text-muted group-hover:text-accent-ink transition-colors mt-1 shrink-0" />}
                  </a>
                </SlideIn>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
