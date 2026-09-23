import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'

/** Counts a value like "14M+", "107+", "3+" or "4" up from zero when it enters the viewport. */
export default function Counter({ value, className, duration = 1.6 }: { value: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()
  const m = value.match(/^([^\d]*)(\d+(?:[.,]\d+)?)(.*)$/)
  const [display, setDisplay] = useState(m ? `${m[1]}0${m[3]}` : value)

  useEffect(() => {
    if (!m) return
    const target = parseFloat(m[2].replace(',', '.'))
    const decimals = (m[2].split(/[.,]/)[1] || '').length
    if (!inView) return
    if (reduce) { setDisplay(value); return }
    const controls = animate(0, target, {
      duration, ease: [0.16, 1, 0.3, 1],
      onUpdate: v => setDisplay(`${m[1]}${v.toFixed(decimals)}${m[3]}`),
      onComplete: () => setDisplay(value),
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value])

  return <span ref={ref} className={`${className ?? ''} tabular-nums`}>{display}</span>
}
