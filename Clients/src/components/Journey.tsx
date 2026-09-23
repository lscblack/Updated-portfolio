import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionTemplate, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, useVelocity, type MotionValue } from 'framer-motion'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { useSite } from '../contexts/SiteContext'
import { Icon } from '../lib/icons'
import type { Milestone } from '../lib/types'
import Walker, { type WalkerState } from './Story'
import Timeline from './Timeline'
import SectionHeader from './ui/SectionHeader'

/* ── scene palette (time of day follows scroll progress) ─────────────────── */
const STOPS = [0, 0.3, 0.62, 1]
// dark scene throughout: warm ember dawn → muted day → ember dusk → deep night
const SKY_TOP = ['#0E0B10', '#141317', '#120C10', '#07070B']
const SKY_BOT = ['#3A1F14', '#2A2624', '#3D1A12', '#0F1018']
const HILL_FAR = ['#241A1C', '#26232A', '#22171C', '#10101A']
const HILL_MID = ['#1A1215', '#1B191F', '#181013', '#0B0B11']
const GROUND = ['#120D0F', '#121114', '#100B0D', '#07070A']

const KIND_LABEL: Record<string, string> = { education: 'Education', work: 'Work', project: 'Project', award: 'Milestone', life: 'Life' }

function useViewport() {
  const [vp, setVp] = useState({ w: 1280, h: 800 })
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    on(); window.addEventListener('resize', on, { passive: true })
    return () => window.removeEventListener('resize', on)
  }, [])
  return vp
}

function Stars({ opacity }: { opacity: MotionValue<number> }) {
  const stars = useMemo(() => { const r = (k: number) => { const x = Math.sin(k * 9301 + 49297) * 233280; return x - Math.floor(x) }; return Array.from({ length: 80 }, (_, i) => ({ x: r(i) * 100, y: r(i + 100) * 58 + 1, s: 1 + r(i + 200) * 1.6, d: 2 + r(i + 300) * 3.5 })) }, [])
  return (
    <motion.div className="absolute inset-0" style={{ opacity }} aria-hidden="true">
      {stars.map((s, i) => <span key={i} className="star absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, ['--tw' as string]: `${s.d}s` }} />)}
    </motion.div>
  )
}

function hills(seed: number, amp: number, base: number, w = 2400): string {
  // a smooth rolling ridge across `w` px, repeated by the caller
  let d = `M0 ${base}`
  const n = 12
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * w
    const y = base - amp * (0.55 + 0.45 * Math.sin(seed + i * 1.7)) * (i % 2 ? 1 : 0.6)
    const cx = x - w / n / 2
    d += ` Q ${cx} ${y - amp * 0.35} ${x} ${y}`
  }
  return d + ` L ${w} 400 L 0 400 Z`
}

function Ridge({ x, color, seed, amp, base, opacity = 1, height, count }: { x: MotionValue<number>; color: MotionValue<string>; seed: number; amp: number; base: number; opacity?: number; height: number; count: number }) {
  const path = useMemo(() => hills(seed, amp, base), [seed, amp, base])
  return (
    <motion.div className="absolute bottom-0 left-0 flex will-change-transform" style={{ x, height }} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 2400 400" preserveAspectRatio="none" width={2400} height={height} className="shrink-0" style={{ opacity }}>
          <motion.path d={path} style={{ fill: color }} />
        </svg>
      ))}
    </motion.div>
  )
}

function Skyline({ x, color, offset, bottom }: { x: MotionValue<number>; color: MotionValue<string>; offset: number; bottom: number }) {
  const buildings = useMemo(() => Array.from({ length: 22 }, (_, i) => ({ w: 26 + ((i * 13) % 40), h: 40 + ((i * 29) % 140), gap: 6 + (i % 3) * 4 })), [])
  let cursor = 0
  return (
    <motion.div className="absolute left-0 will-change-transform" style={{ x, left: offset, bottom }} aria-hidden="true">
      <svg width={1000} height={220} viewBox="0 0 1000 220">
        {buildings.map((b, i) => {
          const bx = cursor; cursor += b.w + b.gap
          return (
            <g key={i}>
              <motion.rect x={bx} y={220 - b.h} width={b.w} height={b.h} style={{ fill: color }} />
              {Array.from({ length: Math.floor(b.h / 22) }).map((_, r) => (
                <rect key={r} x={bx + 6} y={220 - b.h + 8 + r * 22} width={b.w - 12} height={4} fill="var(--accent-2)" opacity={((i + r) % 3) ? 0.35 : 0.08} />
              ))}
            </g>
          )
        })}
      </svg>
    </motion.div>
  )
}

function MilestoneCard({ m, index, total, compact = false }: { m: Milestone; index: number; total: number; compact?: boolean }) {
  return (
    <motion.article key={m.id ?? index} initial={{ opacity: 0, y: 26, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -18, scale: 0.98 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`card glass shadow-[0_30px_60px_-30px_rgb(0_0_0/.6)] ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="tag"><Icon name={m.icon} size={11} /> {KIND_LABEL[m.kind] ?? m.kind}</span>
        <span className="font-mono text-[0.68rem] text-muted tabular-nums">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
      </div>
      <p className={`${compact ? 'mt-2 text-xs' : 'mt-4 text-sm'} font-mono text-accent-ink`}>{m.year}</p>
      <h3 className={`mt-1 font-display font-extrabold leading-tight text-fg text-balance ${compact ? 'text-lg' : 'text-xl sm:text-2xl'}`}>{m.title}</h3>
      {(m.subtitle || m.location) && (
        <p className="mt-1 text-sm text-muted flex flex-wrap items-center gap-x-3">
          {m.subtitle && <span className="font-semibold text-fg/80">{m.subtitle}</span>}
          {m.location && <span className="inline-flex items-center gap-1"><MapPin size={11} />{m.location}</span>}
        </p>
      )}
      {m.description && <p className={`mt-3 text-sm text-muted leading-relaxed text-pretty ${compact ? 'line-clamp-3 text-[0.82rem]' : 'line-clamp-5'}`}>{m.description}</p>}
      {!compact && (m.tags?.length || m.link) ? (
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-wrap gap-1.5">{m.tags?.slice(0, 5).map(t => <span key={t} className="tag tag-neutral">{t}</span>)}</div>
          {m.link && <a href={m.link} target="_blank" rel="noreferrer" className="text-xs font-semibold text-accent-ink inline-flex items-center gap-1 hover:underline">Visit <ArrowUpRight size={12} /></a>}
        </div>
      ) : null}
    </motion.article>
  )
}

function Scene({ items, title, subtitle }: { items: Milestone[]; title: string; subtitle: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const vp = useViewport()
  const n = items.length
  const mobile = vp.w < 768
  const spacing = mobile ? Math.max(420, vp.w * 1.05) : Math.min(980, Math.max(640, vp.w * 0.62))
  const walkerX = mobile ? vp.w * 0.18 : vp.w * 0.3
  const worldWidth = (n - 1) * spacing
  const stageH = vp.h
  const groundH = Math.round(stageH * (mobile ? 0.44 : 0.22))
  const walkerSize = mobile ? 104 : 156

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.6, restDelta: 0.0005 })

  // scroll progress → position in "post units": the walker travels to each post, then dwells there
  const { inputs, outputs } = useMemo(() => {
    const TRAVEL = 1, DWELL = 0.55
    const total = (n - 1) * TRAVEL + n * DWELL
    const inputs: number[] = [], outputs: number[] = []
    let cum = 0
    for (let i = 0; i < n; i++) {
      inputs.push(cum / total); outputs.push(i); cum += DWELL
      inputs.push(Math.min(1, cum / total)); outputs.push(i); cum += TRAVEL
    }
    return { inputs, outputs }
  }, [n])
  const pos = useTransform(progress, inputs, outputs)
  const velocity = useVelocity(pos)

  const worldX = useTransform(pos, v => -v * spacing)
  const farX = useTransform(pos, v => -v * spacing * 0.12)
  const midX = useTransform(pos, v => -v * spacing * 0.32)
  const nearX = useTransform(pos, v => -v * spacing * 0.6)
  const cityX = midX
  const postOffset = mobile ? 54 : 84

  const skyTop = useTransform(progress, STOPS, SKY_TOP)
  const skyBot = useTransform(progress, STOPS, SKY_BOT)
  const sky = useMotionTemplate`linear-gradient(180deg, ${skyTop} 0%, ${skyBot} 100%)`
  const farC = useTransform(progress, STOPS, HILL_FAR)
  const midC = useTransform(progress, STOPS, HILL_MID)
  const groundC = useTransform(progress, STOPS, GROUND)
  const starsO = useTransform(progress, [0, 0.14, 0.62, 0.85], [0.7, 0, 0, 1])
  const sunX = useTransform(progress, [0, 0.62], [`8%`, `92%`])
  const sunY = useTransform(progress, [0, 0.3, 0.62], [`62%`, `14%`, `66%`])
  const sunO = useTransform(progress, [0, 0.05, 0.58, 0.66], [0.9, 1, 1, 0])
  const moonY = useTransform(progress, [0.66, 1], [`70%`, `16%`])
  const moonO = useTransform(progress, [0.64, 0.74], [0, 1])
  const hazeO = useTransform(progress, [0, 0.3, 0.62, 1], [0.35, 0.12, 0.4, 0.08])

  const [state, setState] = useState<WalkerState>('idle')
  const [facing, setFacing] = useState<1 | -1>(1)
  const [speed, setSpeed] = useState(1)
  const [active, setActive] = useState(0)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useMotionValueEvent(velocity, 'change', v => {
    const abs = Math.abs(v)
    if (abs > 0.04) {
      setState('walking'); setFacing(v > 0 ? 1 : -1); setSpeed(Math.min(2.4, 0.6 + abs * 0.6))
      if (idleTimer.current) clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => setState('idle'), 160)
    }
  })
  useMotionValueEvent(pos, 'change', p => {
    const i = Math.round(p)
    setActive(a => (a === i ? a : Math.max(0, Math.min(n - 1, i))))
  })

  const jumpTo = (i: number) => {
    const el = ref.current
    if (!el) return
    const frac = (inputs[i * 2] + inputs[i * 2 + 1]) / 2
    const top = el.offsetTop + frac * (el.offsetHeight - stageH)
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const trackHeight = stageH + n * (mobile ? 0.8 : 0.9) * stageH

  return (
    <div ref={ref} style={{ height: trackHeight }} className="relative">
      <div className="sticky top-0 h-[100svh] overflow-hidden isolate" style={{ height: stageH }}>
        {/* sky */}
        <motion.div className="absolute inset-0" style={{ background: sky }} aria-hidden="true" />
        <Stars opacity={starsO} />
        <motion.div className="absolute w-24 h-24 rounded-full" style={{ left: sunX, top: sunY, opacity: sunO, x: '-50%', y: '-50%', background: 'radial-gradient(circle, color-mix(in oklab, var(--accent) 85%, white) 0%, var(--accent) 40%, transparent 70%)', filter: 'blur(2px)' }} aria-hidden="true" />
        <motion.div className="absolute right-[14%] w-14 h-14 rounded-full bg-[#D9D2C5] shadow-[0_0_50px_14px_rgba(217,210,197,.12)]" style={{ top: moonY, opacity: moonO }} aria-hidden="true">
          <span className="absolute left-3 top-4 w-3 h-3 rounded-full bg-[#DED7C6] opacity-70" /><span className="absolute left-8 top-8 w-2 h-2 rounded-full bg-[#DED7C6] opacity-60" />
        </motion.div>
        <motion.div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none" style={{ opacity: hazeO, background: 'linear-gradient(180deg, transparent, color-mix(in oklab, var(--accent) 22%, transparent))' }} aria-hidden="true" />

        {/* parallax ridges */}
        <Ridge x={farX} color={farC} seed={1.2} amp={150} base={330} height={groundH + stageH * 0.34} count={3} opacity={0.9} />
        <Ridge x={midX} color={midC} seed={4.1} amp={120} base={350} height={groundH + stageH * 0.2} count={3} />
        <Skyline x={cityX} color={midC} offset={worldWidth * 0.32 + vp.w * 0.45} bottom={groundH + stageH * 0.08} />
        <Ridge x={nearX} color={groundC} seed={7.7} amp={40} base={385} height={groundH + 30} count={4} />

        {/* ground */}
        <motion.div className="absolute inset-x-0 bottom-0" style={{ height: groundH, background: groundC }} aria-hidden="true" />
        <motion.div className="absolute left-0 right-0" style={{ bottom: groundH - 1, height: 2, background: 'linear-gradient(90deg, transparent, var(--accent) 30%, var(--accent) 70%, transparent)', opacity: 0.5 }} aria-hidden="true" />
        <motion.div className="absolute left-0 h-px" style={{ bottom: groundH * 0.55, x: worldX, width: worldWidth + vp.w * 2, backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,.35) 0 22px, transparent 22px 60px)' }} aria-hidden="true" />

        {/* world: signposts */}
        <motion.div className="absolute inset-y-0 left-0 will-change-transform z-[1]" style={{ x: worldX, width: worldWidth + vp.w + postOffset }} aria-hidden="true">
          {items.map((m, i) => {
            const isActive = i === active
            const left = walkerX + postOffset + i * spacing
            return (
              <div key={m.id ?? i} className="absolute flex flex-col items-center" style={{ left, bottom: groundH - 4, transform: 'translateX(-50%)' }}>
                <motion.div animate={{ scale: isActive ? 1 : 0.86, opacity: isActive ? 1 : 0.7 }} transition={{ duration: 0.4 }} className="flex flex-col items-center">
                  <span className={`font-mono text-[0.7rem] tracking-widest mb-2 px-2 py-0.5 rounded-full ${isActive ? 'bg-accent text-accent-fg' : 'bg-black/30 text-white/85'}`}>{m.year}</span>
                  <span className={`w-11 h-11 rounded-full grid place-items-center border-2 backdrop-blur transition-colors ${isActive ? 'bg-accent border-accent text-accent-fg shadow-[0_0_30px_var(--accent)]' : 'bg-black/35 border-white/40 text-white'}`}>
                    <Icon name={m.icon} size={17} />
                  </span>
                  {!mobile && <span className={`mt-2 max-w-[180px] text-center text-xs font-semibold leading-snug [text-shadow:0_1px_8px_rgba(0,0,0,.6)] ${isActive ? 'text-white' : 'text-white/75'}`}>{m.title}</span>}
                </motion.div>
                <span className={`w-[3px] rounded-full ${isActive ? 'bg-accent' : 'bg-white/40'}`} style={{ height: mobile ? 40 : 70 }} />
              </div>
            )
          })}
        </motion.div>

        {/* walker */}
        <div className="absolute text-black z-[2]" style={{ left: walkerX, bottom: groundH - 6, transform: 'translateX(-50%)' }}>
          <Walker state={state} facing={facing} speed={speed} size={walkerSize} />
        </div>

        {/* HUD: header */}
        <div className="absolute top-0 inset-x-0 pt-24 sm:pt-28 pointer-events-none">
          <div className="container-x">
            <div className="max-w-md pointer-events-auto">
              <p className="section-label !text-white/90 [&::before]:!bg-white/80">journey</p>
              <h2 className="h-section mt-3 text-white drop-shadow-[0_2px_20px_rgba(0,0,0,.35)] !text-[clamp(1.25rem,2.1vw,1.75rem)]">{title}</h2>
              {!mobile && subtitle && <p className="mt-2 text-sm text-white/75 max-w-sm">{subtitle}</p>}
            </div>
          </div>
        </div>

        {/* HUD: active milestone card */}
        <div className={`absolute ${mobile ? 'inset-x-4 bottom-[4.25rem]' : 'right-[4.1667%] top-1/2 -translate-y-[58%] w-[380px]'}`}>
          <AnimatePresence mode="wait">{items[active] && <MilestoneCard key={active} m={items[active]} index={active} total={n} compact={mobile} />}</AnimatePresence>
        </div>

        {/* HUD: progress */}
        <div className="absolute inset-x-0 bottom-0 pb-4 sm:pb-6">
          <div className="container-x">
            <div className="relative h-8 flex items-center">
              <div className="absolute inset-x-0 h-px bg-white/25" />
              <motion.div className="absolute left-0 h-px bg-accent origin-left" style={{ scaleX: progress, width: '100%' }} />
              <div className="relative w-full flex justify-between">
                {items.map((m, i) => (
                  <button key={m.id ?? i} onClick={() => jumpTo(i)} aria-label={`Go to ${m.year}: ${m.title}`} className="group relative -my-2 py-2 px-1">
                    <span className={`block w-2.5 h-2.5 rounded-full border transition-all ${i <= active ? 'bg-accent border-accent' : 'bg-transparent border-white/60'} ${i === active ? 'scale-150 shadow-[0_0_14px_var(--accent)]' : ''}`} />
                    <span className={`absolute left-1/2 -translate-x-1/2 -top-5 font-mono text-[0.6rem] whitespace-nowrap transition-opacity ${i === active ? 'text-white opacity-100' : 'text-white/60 opacity-0 group-hover:opacity-100'} ${mobile && i !== active ? 'hidden' : ''}`}>{m.year}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Journey() {
  const { data, sectionTitle } = useSite()
  const reduce = useReducedMotion()
  const items = (data?.journey ?? []).filter(m => m.visible !== false)
  const t = sectionTitle('journey', { label: 'journey', title: 'Walk through my story', subtitle: 'Scroll to travel from the first line of code to today.' })
  const animated = !reduce && data?.settings?.effects?.walker !== false && items.length >= 2

  if (!items.length) return null
  return (
    <section id="journey" className={animated ? 'relative' : 'section'}>
      {animated ? <Scene items={items} title={t.title} subtitle={t.subtitle} /> : (
        <div className="container-x">
          <SectionHeader label={t.label} title={t.title} subtitle={t.subtitle} />
          <Timeline items={items} />
        </div>
      )}
    </section>
  )
}
