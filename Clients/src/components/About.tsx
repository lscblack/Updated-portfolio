import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { Mail, Phone, MapPin, Languages, ArrowUpRight } from 'lucide-react'
import { useSite } from '../contexts/SiteContext'
import Reveal, { Stagger, Item, Words } from './ui/Reveal'
import { SocialIcon } from './ui/Brand'
import { ScrollText } from './ui/ScrollFx'
import Portrait from './ui/Portrait'

export default function About() {
  const { data, sectionTitle } = useSite()
  const a = data?.about
  const s = data?.settings
  const t = sectionTitle('about', { label: 'about', title: 'Who I am' })
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const yImg = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 50, reduce ? 0 : -50])
  if (!a) return null

  const contact = [
    a.email && { icon: <Mail size={14} />, value: a.email, href: `mailto:${a.email}` },
    a.phone && { icon: <Phone size={14} />, value: a.phone, href: `tel:${a.phone.replace(/\s/g, '')}` },
    a.location && { icon: <MapPin size={14} />, value: a.location },
    a.languages?.length && { icon: <Languages size={14} />, value: a.languages.join(' · ') },
  ].filter(Boolean) as { icon: React.ReactNode; value: string; href?: string }[]

  return (
    <section id="about" className="section" ref={ref}>
      <div className="container-x">
        <Reveal><p className="section-label">{t.label}</p></Reveal>
        <h2 className="h-display mt-5 text-[clamp(1.45rem,2.7vw,2.35rem)] max-w-4xl text-fg">
          <Words text={a.headline} highlight={a.headline_highlight} />
        </h2>

        <div className="mt-14 grid lg:grid-cols-[minmax(0,380px)_1fr] gap-12 lg:gap-20 items-start">
          {/* portrait column */}
          <div className="relative">
            <Reveal>
              <div className="relative rounded-card-lg overflow-hidden card aspect-[4/5] max-w-sm">
                <motion.div style={{ y: yImg, scale: 1.12 }} className="absolute inset-0"><Portrait images={a.gallery?.length ? a.gallery : [a.avatar_url]} alt={a.name} className="w-full h-full" interval={5200} /></motion.div>
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/75 via-black/30 to-transparent text-white">
                  <p className="font-display font-extrabold text-xl leading-tight">{a.name}</p>
                  <p className="text-sm text-white/80">{a.role}</p>
                </div>
                <span className="absolute top-4 left-4 tag bg-black/40 text-white border-white/20 backdrop-blur"><MapPin size={11} /> {a.location.split(',')[0]}</span>
              </div>
            </Reveal>
            {!!a.facts?.length && (
              <Stagger className="mt-6 max-w-sm divide-y divide-line border-y border-line">
                {a.facts.map(f => (
                  <Item key={f.label} className="flex items-center justify-between py-3 text-sm gap-4">
                    <span className="text-muted">{f.label}</span><span className="font-semibold text-fg text-right">{f.value}</span>
                  </Item>
                ))}
              </Stagger>
            )}
          </div>

          {/* text column */}
          <div>
            {a.quote && (
              <Reveal delay={0.1}>
                <ScrollText as="blockquote" text={a.quote} className="relative pl-6 border-l-2 border-accent font-display text-lg sm:text-xl font-semibold leading-snug text-fg text-pretty" />
              </Reveal>
            )}
            <div className="mt-8 space-y-5 text-fg text-[0.95rem] sm:text-base leading-relaxed text-pretty">
              {a.bio.map((p, i) => <ScrollText key={i} text={p} />)}
            </div>

            <div className="mt-10 grid sm:grid-cols-2 gap-8">
              {!!a.currently?.length && (
                <Reveal delay={0.2}>
                  <p className="label">Currently</p>
                  <ul className="space-y-3">
                    {a.currently.map((c, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                        <div className="text-sm leading-snug">
                          <p className="font-semibold text-fg">{c.role}</p>
                          {c.url ? <a href={c.url} target="_blank" rel="noreferrer" className="text-muted hover:text-accent-ink inline-flex items-center gap-1">{c.org} <ArrowUpRight size={11} /></a> : <p className="text-muted">{c.org}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
              <Reveal delay={0.26}>
                <p className="label">Contact</p>
                <ul className="space-y-2.5">
                  {contact.map((c, i) => (
                    <li key={i} className="text-sm">
                      {c.href ? <a href={c.href} className="inline-flex items-center gap-2.5 text-muted hover:text-accent-ink transition-colors"><span className="text-accent-ink">{c.icon}</span>{c.value}</a>
                        : <span className="inline-flex items-center gap-2.5 text-muted"><span className="text-accent-ink">{c.icon}</span>{c.value}</span>}
                    </li>
                  ))}
                  {!!s?.social_links?.length && (
                    <li className="flex items-center gap-1 pt-1">
                      {s.social_links.map(l => <a key={l.url} href={l.url} target={l.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer" aria-label={l.label} className="w-9 h-9 rounded-full grid place-items-center text-muted hover:text-accent-ink hover:bg-surface-2 transition-colors"><SocialIcon name={l.icon} size={16} /></a>)}
                    </li>
                  )}
                </ul>
              </Reveal>
            </div>

            {!!a.open_to?.length && (
              <Reveal delay={0.3}>
                <div className="mt-10 card p-5 flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-fg">Open to</span>
                  {a.open_to.map(o => <span key={o} className="tag">{o}</span>)}
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
