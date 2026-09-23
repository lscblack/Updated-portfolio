/** Scroll-driven effects shared across sections (all respect prefers-reduced-motion). */
import { useEffect, useRef, useState, type RefObject } from 'react'
import { motion, useAnimationFrame, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, useVelocity, type MotionValue } from 'framer-motion'

/* words light up one by one as the paragraph scrolls through the viewport */
function Word({ progress, range, children }: { progress: MotionValue<number>; range: [number, number]; children: string }) {
  const opacity = useTransform(progress, range, [0.16, 1])
  const y = useTransform(progress, range, [4, 0])
  return <motion.span style={{ opacity, y }} className="inline-block mr-[0.28em]">{children}</motion.span>
}

export function ScrollText({ text, className = '', as = 'p' }: { text: string; className?: string; as?: 'p' | 'blockquote' | 'h3' }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.92', 'end 0.5'] })
  const words = text.split(/\s+/).filter(Boolean)
  const Comp = motion[as] as typeof motion.p
  if (reduce) return <Comp ref={ref} className={className}>{text}</Comp>
  return (
    <Comp ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => <Word key={i} progress={scrollYProgress} range={[i / words.length, Math.min(1, (i + 1.2) / words.length)]}>{w}</Word>)}
    </Comp>
  )
}

/* a vertical line that draws itself while the target scrolls, with a travelling dot */
export function ScrollRail({ target, className = '', onIndex, count }: { target: RefObject<HTMLElement | null>; className?: string; onIndex?: (i: number) => void; count?: number }) {
  const { scrollYProgress } = useScroll({ target, offset: ['start 0.65', 'end 0.65'] })
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 26 })
  const top = useTransform(p, v => `${v * 100}%`)
  useMotionValueEvent(p, 'change', v => { if (onIndex && count) onIndex(Math.min(count - 1, Math.floor(v * count))) })
  return (
    <div className={`absolute top-0 bottom-0 w-px bg-line ${className}`} aria-hidden="true">
      <motion.div className="absolute inset-x-0 top-0 bg-accent origin-top" style={{ scaleY: p, height: '100%' }} />
      <motion.span className="absolute -left-[5px] w-[11px] h-[11px] rounded-full bg-accent shadow-[0_0_16px_var(--accent)]" style={{ top }} />
    </div>
  )
}

/* two columns drifting at different speeds while the section scrolls */
export function ParallaxColumns<T>({ items, render, className = '', amount = 60 }: { items: T[]; render: (item: T, i: number) => React.ReactNode; className?: string; amount?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const yA = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : amount, reduce ? 0 : -amount])
  const yB = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : -amount * 0.6, reduce ? 0 : amount * 0.6])
  const a = items.filter((_, i) => i % 2 === 0), b = items.filter((_, i) => i % 2 === 1)
  return (
    <div ref={ref} className={`grid sm:grid-cols-2 gap-4 ${className}`}>
      <motion.div style={{ y: yA }} className="space-y-4">{a.map((it, i) => render(it, i * 2))}</motion.div>
      <motion.div style={{ y: yB }} className="space-y-4 sm:mt-10">{b.map((it, i) => render(it, i * 2 + 1))}</motion.div>
    </div>
  )
}

/* huge text strip that slides with scroll velocity (direction follows the scroll) */
const wrap = (min: number, max: number, v: number) => { const r = max - min; return ((((v - min) % r) + r) % r) + min }
export function VelocityMarquee({ text, baseSpeed = 2, className = '' }: { text: string; baseSpeed?: number; className?: string }) {
  const baseX = useMotionValue(0)
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 })
  const factor = useTransform(smooth, [0, 1000], [0, 5], { clamp: false })
  const x = useTransform(baseX, v => `${wrap(-25, 0, v)}%`)
  const dir = useRef(1)
  useAnimationFrame((_, delta) => {
    if (reduce) return
    let move = dir.current * baseSpeed * (delta / 1000)
    const f = factor.get()
    if (f < 0) dir.current = -1; else if (f > 0) dir.current = 1
    move += dir.current * move * Math.abs(f)
    baseX.set(baseX.get() + move)
  })
  const chunk = `${text}  ·  `
  return (
    <div className={`overflow-hidden whitespace-nowrap select-none ${className}`} aria-hidden="true">
      <motion.div className="flex font-display font-extrabold uppercase tracking-tight text-[clamp(2.4rem,7vw,6rem)] leading-none text-fg/[0.06]" style={{ x }}>
        {[0, 1, 2, 3].map(i => <span key={i} className="pr-6">{chunk}</span>)}
      </motion.div>
    </div>
  )
}

/* card that scales/rises into place as it enters */
export function ScrollCard({ children, className = '', index = 0 }: { children: React.ReactNode; className?: string; index?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 1', 'start 0.55'] })
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.9, 1])
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 50 + index * 14, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [reduce ? 1 : 0.2, 1])
  return <motion.div ref={ref} style={{ scale, y, opacity }} className={className}>{children}</motion.div>
}

/* small hook: is the viewport at least `px` wide */
export function useMinWidth(px: number) {
  const [ok, setOk] = useState(() => typeof window !== 'undefined' && window.innerWidth >= px)
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${px}px)`)
    const on = () => setOk(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [px])
  return ok
}

/* sticky card stack: each card pins under the previous one and shrinks slightly as the next slides over */
export function StackItem({ children, index, total, groupProgress, className = '' }: { children: React.ReactNode; index: number; total: number; groupProgress: MotionValue<number>; className?: string }) {
  const last = index === total - 1
  const reduce = useReducedMotion()
  const start = index / total, end = (index + 1) / total
  const scale = useTransform(groupProgress, [start, end], [1, reduce ? 1 : 0.96])
  return (
    <motion.div style={{ scale, top: `calc(6.5rem + ${index * 1.25}rem)`, marginBottom: last ? 0 : '22vh' }} className={`sticky ${className}`}>
      {children}
    </motion.div>
  )
}

export function useGroupProgress(ref: RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 104px', 'end end'] })
  return scrollYProgress
}

/* slides in from the side as it enters */
export function SlideIn({ children, className = '', from = 40, index = 0 }: { children: React.ReactNode; className?: string; from?: number; index?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 1', 'start 0.7'] })
  const x = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : from + index * 6, 0])
  const opacity = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.1, 1])
  return <motion.div ref={ref} style={{ x, opacity }} className={className}>{children}</motion.div>
}

/* rises into place (scroll-linked) — for list rows */
export function Rise({ children, className = '', index = 0 }: { children: React.ReactNode; className?: string; index?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 1', 'start 0.78'] })
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 28 + (index % 3) * 4, 0])
  const opacity = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.05, 1])
  return <motion.div ref={ref} style={{ y, opacity }} className={className}>{children}</motion.div>
}
