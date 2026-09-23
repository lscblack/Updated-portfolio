import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

/** A soft accent glow that follows the pointer (desktop only). */
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce || window.matchMedia('(pointer: coarse)').matches) return
    const el = ref.current
    if (!el) return
    let raf = 0, tx = -999, ty = -999, cx = -999, cy = -999
    const move = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(tick) }
    const tick = () => {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18
      el.style.transform = `translate3d(${cx - 200}px, ${cy - 200}px, 0)`
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3 ? requestAnimationFrame(tick) : 0
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(raf) }
  }, [reduce])
  if (reduce) return null
  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-[5] w-[400px] h-[400px] rounded-full will-change-transform hidden md:block"
      style={{ background: 'radial-gradient(circle, color-mix(in oklab, var(--accent) 16%, transparent) 0%, transparent 62%)', transform: 'translate3d(-999px,-999px,0)' }} />
  )
}
