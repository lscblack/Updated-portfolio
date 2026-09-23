import { useSite } from '../contexts/SiteContext'
import { Icon } from '../lib/icons'
import SectionHeader from './ui/SectionHeader'
import Reveal from './ui/Reveal'
import { ParallaxColumns } from './ui/ScrollFx'

export default function Activities() {
  const { data, sectionTitle } = useSite()
  const items = (data?.activities ?? []).filter(a => a.visible !== false)
  const t = sectionTitle('activities', { label: 'life beyond code', title: 'Outside work', subtitle: '' })
  if (!items.length) return null

  return (
    <section id="activities" className="section bg-surface/40 overflow-hidden">
      <div className="container-x">
        <div className="grid lg:grid-cols-[minmax(0,320px)_1fr] gap-10 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-28">
            <SectionHeader label={t.label} title={t.title} subtitle={t.subtitle} />
            <Reveal delay={0.2}>
              <div className="mt-8 flex items-baseline gap-2">
                <span className="font-display text-4xl sm:text-5xl font-extrabold text-line leading-none select-none">{items.length}</span>
                <span className="font-mono text-xs text-muted tracking-widest uppercase">interests</span>
              </div>
            </Reveal>
          </div>
          <ParallaxColumns items={items} render={(a, i) => (
              <Reveal key={a.id ?? i} as="article" className="group card card-hover p-5 flex gap-4" delay={(i % 2) * 0.08}>
                <span className="shrink-0 w-11 h-11 rounded-card-sm bg-surface-2 grid place-items-center text-muted group-hover:bg-accent group-hover:text-accent-fg transition-colors"><Icon name={a.icon} size={18} /></span>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display font-bold text-fg">{a.label}</h3>
                    <span className="font-mono text-[0.65rem] text-muted/60">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted leading-relaxed italic">{a.quote}</p>
                </div>
              </Reveal>
            )} />
        </div>
      </div>
    </section>
  )
}
