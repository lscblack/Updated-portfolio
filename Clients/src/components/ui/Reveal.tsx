import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

const EASE = [0.22, 1, 0.36, 1] as const

type Props = {
  children: ReactNode
  delay?: number
  y?: number
  x?: number
  once?: boolean
  className?: string
  as?: 'div' | 'section' | 'li' | 'span' | 'p' | 'article'
  amount?: number
  duration?: number
  blur?: boolean
}

/** Fade/slide-in when scrolled into view. */
export default function Reveal({ children, delay = 0, y = 26, x = 0, once = true, className, as = 'div', amount = 0.2, duration = 0.7, blur = false }: Props) {
  const reduce = useReducedMotion()
  const Comp = motion[as] as typeof motion.div
  const variants: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : { hidden: { opacity: 0, y, x, filter: blur ? 'blur(8px)' : 'blur(0px)' }, show: { opacity: 1, y: 0, x: 0, filter: 'blur(0px)', transition: { duration, delay, ease: EASE } } }
  return (
    <Comp className={className} variants={variants} initial="hidden" whileInView="show" viewport={{ once, amount }}>
      {children}
    </Comp>
  )
}

export function Stagger({ children, className, stagger = 0.07, delay = 0, amount = 0.15 }: { children: ReactNode; className?: string; stagger?: number; delay?: number; amount?: number }) {
  return (
    <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}>
      {children}
    </motion.div>
  )
}

export function Item({ children, className, y = 22, as = 'div' }: { children: ReactNode; className?: string; y?: number; as?: 'div' | 'li' | 'article' }) {
  const reduce = useReducedMotion()
  const Comp = motion[as] as typeof motion.div
  return (
    <Comp className={className} variants={reduce ? { hidden: { opacity: 1 }, show: { opacity: 1 } } : { hidden: { opacity: 0, y }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}>
      {children}
    </Comp>
  )
}

/** Splits text into words that rise in one after another. */
export function Words({ text, className, delay = 0, highlight }: { text: string; className?: string; delay?: number; highlight?: string }) {
  const reduce = useReducedMotion()
  const words = text.split(' ')
  const hl = highlight?.trim().toLowerCase().split(/\s+/).filter(Boolean) ?? []
  // find the highlighted run so it can be coloured as a phrase
  const lower = words.map(w => w.toLowerCase().replace(/[^\w']/g, ''))
  let hlStart = -1
  if (hl.length) for (let i = 0; i + hl.length <= lower.length; i++) if (hl.every((h, j) => lower[i + j] === h)) { hlStart = i; break }
  return (
    <motion.span className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: delay } } }} aria-label={text}>
      {words.map((w, i) => {
        const isHl = hlStart >= 0 && i >= hlStart && i < hlStart + hl.length
        return (
          <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
            <motion.span className={`inline-block ${isHl ? 'text-accent-ink' : ''}`}
              variants={reduce ? { hidden: { y: 0 }, show: { y: 0 } } : { hidden: { y: '110%', rotate: 3 }, show: { y: 0, rotate: 0, transition: { duration: 0.75, ease: EASE } } }}>
              {w}{i < words.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        )
      })}
    </motion.span>
  )
}
