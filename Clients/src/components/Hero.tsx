import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, useScroll } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Download, MapPin, ChevronDown } from 'lucide-react'
import { useSite } from '../contexts/SiteContext'
import { SocialIcon } from './ui/Brand'
import Counter from './ui/Counter'
import Magnetic from './ui/Magnetic'
import Marquee from './ui/Marquee'
import Particles from './ui/Particles'
import Portrait from './ui/Portrait'
import { Link } from 'react-router-dom'

const EASE = [0.22, 1, 0.36, 1] as const

function Typewriter({ phrases }: { phrases: string[] }) {
  const [i, setI] = useState(0)
  const [text, setText] = useState('')
  const [del, setDel] = useState(false)
  useEffect(() => {
    if (!phrases.length) return
    const target = phrases[i % phrases.length]
    let t: ReturnType<typeof setTimeout>
    if (!del && text.length < target.length) t = setTimeout(() => setText(target.slice(0, text.length + 1)), 42)
    else if (!del && text.length === target.length) t = setTimeout(() => setDel(true), 2400)
    else if (del && text.length > 0) t = setTimeout(() => setText(text.slice(0, -1)), 20)
    else { setDel(false); setI(x => (x + 1) % phrases.length) }
    return () => clearTimeout(t)
  }, [text, del, i, phrases])
  return (
    <span className="font-mono text-sm sm:text-base text-muted">
      <span className="text-accent-ink">&gt;</span> {text}<span className="cursor-blink inline-block w-[2px] h-[1.1em] bg-accent align-middle ml-0.5" />
    </span>
  )
}

function IdentityCard() {
  const { data } = useSite()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0), ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 120, damping: 16 })
  const sry = useSpring(ry, { stiffness: 120, damping: 16 })
  const glowX = useTransform(sry, [-12, 12], ['20%', '80%'])
  const glowY = useTransform(srx, [12, -12], ['20%', '80%'])
  const about = data?.about
  const settings = data?.settings

  const onMove = (e: React.PointerEvent) => {
    if (reduce || !ref.current || e.pointerType !== 'mouse') return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * 16); rx.set(-py * 16)
  }
  const reset = () => { rx.set(0); ry.set(0) }
  const currently = about?.currently?.slice(0, 3) ?? []

  return (
    <div className="relative [perspective:1400px]">
      {/* orbit rings */}
      <div className="absolute -inset-10 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 rounded-full border border-accent/15 animate-spin-slow" />
        <div className="absolute inset-8 rounded-full border border-dashed border-accent/20 animate-spin-slow [animation-direction:reverse] [animation-duration:34s]" />
        <span className="absolute top-[8%] left-1/2 w-2 h-2 rounded-full bg-accent shadow-[0_0_20px_var(--accent)]" />
      </div>
      <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={reset} style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }}
        className="relative card p-5 sm:p-6 w-[min(100%,380px)] mx-auto shadow-[0_40px_80px_-30px_rgb(0_0_0/.55)] overflow-hidden">
        <motion.div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: useTransform([glowX, glowY], ([x, y]) => `radial-gradient(360px circle at ${x} ${y}, color-mix(in oklab, var(--accent) 10%, transparent), transparent 60%)`) }} />
        <div className="flex items-center justify-between relative">
          <span className="font-mono text-[0.68rem] tracking-[0.2em] uppercase text-muted">Profile</span>
          <span className="inline-flex items-center gap-2 text-[0.7rem] font-semibold text-muted">
            <span className={`w-2 h-2 rounded-full ${settings?.available ? 'bg-emerald-500 pulse-dot' : 'bg-muted'}`} />
            {settings?.availability_text || 'Available'}
          </span>
        </div>
        <div className="mt-5 flex items-center gap-4 relative" style={{ transform: 'translateZ(30px)' }}>
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-[calc(var(--radius)*1.2)] bg-accent opacity-90" />
            <Portrait images={about?.gallery?.length ? about.gallery : [about?.avatar_url ?? '']} alt={about?.name || 'Portrait'} className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[var(--radius)] border-2 border-bg" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-extrabold text-lg leading-tight text-fg">{about?.name}</p>
            <p className="text-sm text-accent-ink font-semibold mt-0.5">{about?.role}</p>
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted"><MapPin size={12} /> {about?.location}</p>
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-line relative" style={{ transform: 'translateZ(20px)' }}>
          <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-muted mb-2.5">Currently</p>
          <ul className="space-y-2">
            {currently.map((c, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span className="leading-snug"><span className="text-fg font-semibold">{c.role}</span><span className="text-muted"> at {c.org}</span></span>
              </li>
            ))}
          </ul>
        </div>
        {!!settings?.live_sites?.length && (
          <div className="mt-4 flex flex-wrap gap-1.5 relative">
            {settings.live_sites.slice(0, 3).map(s => (
              <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="tag tag-neutral hover:border-accent hover:text-accent-ink transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{s.label}
              </a>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function Hero() {
  const { data } = useSite()
  const s = data?.settings
  const about = data?.about
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const yBg = useTransform(scrollY, [0, 600], [0, reduce ? 0 : 120])
  const opacity = useTransform(scrollY, [0, 500], [1, 0.2])

  const name = about?.name || 'Loue Sauveur Christian'
  const parts = name.trim().split(' ')
  const last = parts.length > 1 ? parts.pop()! : ''
  const first = parts.join(' ')
  const showParticles = s?.effects?.particles !== false
  const showMarquee = s?.effects?.marquee !== false && !!s?.marquee?.length
  const fade = (d: number) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: d, ease: EASE } })

  return (
    <section id="hero" className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden pt-24 pb-10">
      <motion.div className="absolute inset-0 -z-10" style={{ y: yBg, opacity }} aria-hidden="true">
        <div className="absolute inset-0 grid-bg" />
        {showParticles && <Particles />}
      </motion.div>

      <div className="container-x grid lg:grid-cols-[1.25fr_1fr] gap-12 lg:gap-8 items-center">
        <div>
          <motion.div {...fade(0.1)}>
            <span className="inline-flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border border-line bg-surface/70 backdrop-blur text-xs font-semibold text-muted">
              <span className="w-6 h-6 rounded-full bg-accent/15 text-accent-ink grid place-items-center"><span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" /></span>
              {s?.hero_kicker || about?.role}
            </span>
          </motion.div>

          <h1 className="h-display mt-6 text-[clamp(2rem,4.6vw,3.6rem)] text-fg">
            <span className="block overflow-hidden"><motion.span className="block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: EASE }}>{first}</motion.span></span>
            {last && <span className="block overflow-hidden"><motion.span className="block text-gradient pb-2" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.32, ease: EASE }}>{last}</motion.span></span>}
          </h1>

          <motion.div {...fade(0.5)} className="mt-5 h-8"><Typewriter phrases={s?.hero_phrases?.length ? s.hero_phrases : ['Building secure, scalable systems.']} /></motion.div>

          <motion.p {...fade(0.6)} className="mt-5 max-w-xl text-muted text-[0.95rem] sm:text-base leading-relaxed text-pretty">{s?.hero_intro}</motion.p>

          <motion.div {...fade(0.7)} className="mt-8 flex flex-wrap items-center gap-3">
            <Magnetic><a href={s?.hero_primary_href || '#projects'} className="btn btn-primary">{s?.hero_primary_label || 'View my work'} <ArrowRight size={16} /></a></Magnetic>
            <Magnetic>{s?.resume_url ? <Link to="/resume" className="btn btn-outline"><Download size={15} /> {s?.hero_secondary_label || 'View resume'}</Link> : <a href={s?.hero_secondary_href || '#contact'} className="btn btn-outline"><Download size={15} /> {s?.hero_secondary_label || 'Download CV'}</a>}</Magnetic>
            <div className="flex items-center gap-1 ml-1">
              {(s?.social_links ?? []).map(l => (
                <a key={l.url} href={l.url} target={l.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer" aria-label={l.label}
                  className="w-10 h-10 rounded-full grid place-items-center text-muted hover:text-accent-ink hover:bg-surface-2 transition-colors"><SocialIcon name={l.icon} size={17} /></a>
              ))}
            </div>
          </motion.div>

          {!!s?.metrics?.length && (
            <motion.div {...fade(0.85)} className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-6 border-t border-line pt-8 max-w-2xl">
              {s.metrics.map(m => (
                <div key={m.label}>
                  <div className="font-display text-2xl sm:text-3xl font-extrabold text-fg tracking-tight"><Counter value={m.value} /></div>
                  <div className="text-sm font-semibold text-accent-ink mt-1">{m.label}</div>
                  {m.sub && <div className="text-xs text-muted mt-0.5">{m.sub}</div>}
                </div>
              ))}
            </motion.div>
          )}
        </div>

        <motion.div initial={{ opacity: 0, x: 40, rotate: 2 }} animate={{ opacity: 1, x: 0, rotate: 0 }} transition={{ duration: 1, delay: 0.5, ease: EASE }} className="relative lg:justify-self-end w-full max-w-md">
          <IdentityCard />
          <a href="#journey" className="hidden lg:flex absolute -bottom-8 -left-10 items-center gap-2 text-xs font-mono text-muted hover:text-accent-ink transition-colors group">
            <span className="w-9 h-9 rounded-full border border-line grid place-items-center group-hover:border-accent"><ArrowUpRight size={14} className="rotate-90 group-hover:rotate-[135deg] transition-transform" /></span>
            Walk through my journey
          </a>
        </motion.div>
      </div>

      {showMarquee && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1 }} className="container-x mt-16">
          <div className="divider mb-4" />
          <Marquee items={s!.marquee} />
        </motion.div>
      )}

      <motion.a href="#about" aria-label="Scroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="absolute bottom-5 left-1/2 -translate-x-1/2 text-muted hover:text-accent-ink">
        <motion.span animate={reduce ? {} : { y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} className="block"><ChevronDown size={20} /></motion.span>
      </motion.a>
    </section>
  )
}
