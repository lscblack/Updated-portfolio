/** Static vertical timeline — used when the animated walker is disabled or motion is reduced. */
import { Icon } from '../lib/icons'
import type { Milestone } from '../lib/types'
import Reveal from './ui/Reveal'
import { ArrowUpRight, MapPin } from 'lucide-react'

export default function Timeline({ items }: { items: Milestone[] }) {
  return (
    <ol className="relative mt-14 border-l border-line ml-3 sm:ml-6 space-y-10">
      {items.map((m, i) => (
        <Reveal key={m.id ?? i} as="li" className="relative pl-8 sm:pl-12" delay={i * 0.04}>
          <span className="absolute -left-[13px] top-1 w-6 h-6 rounded-full bg-surface border border-accent grid place-items-center text-accent-ink"><Icon name={m.icon} size={12} /></span>
          <span className="font-mono text-xs text-accent-ink">{m.year}</span>
          <h3 className="font-display font-bold text-lg text-fg mt-1">{m.title}</h3>
          {m.subtitle && <p className="text-sm text-muted">{m.subtitle}{m.location && <span className="inline-flex items-center gap-1 ml-2"><MapPin size={11} />{m.location}</span>}</p>}
          {m.description && <p className="mt-2 text-sm text-muted leading-relaxed max-w-2xl">{m.description}</p>}
          <div className="mt-3 flex flex-wrap gap-1.5">{m.tags?.map(t => <span key={t} className="tag tag-neutral">{t}</span>)}</div>
          {m.link && <a href={m.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-accent-ink hover:underline">Visit <ArrowUpRight size={12} /></a>}
        </Reveal>
      ))}
    </ol>
  )
}
