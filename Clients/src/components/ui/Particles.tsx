import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

/** Sparse accent-coloured particles drifting upward; pauses when off-screen. */
export default function Particles({ count = 36, className = '' }: { count?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) return
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let w = 0, h = 0, raf = 0, running = true
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    type P = { x: number; y: number; r: number; vy: number; vx: number; a: number; t: number }
    let ps: P[] = []
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ps = Array.from({ length: count }, () => ({ x: Math.random() * w, y: Math.random() * h, r: 0.8 + Math.random() * 1.8, vy: -(0.08 + Math.random() * 0.22), vx: (Math.random() - 0.5) * 0.12, a: 0.15 + Math.random() * 0.45, t: Math.random() * Math.PI * 2 }))
    }
    const accent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#F0631C'
    let color = accent()
    const draw = () => {
      if (!running) return
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = color
      for (const p of ps) {
        p.y += p.vy; p.x += p.vx + Math.sin(p.t += 0.01) * 0.08
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w }
        if (p.x < -5) p.x = w + 5; else if (p.x > w + 5) p.x = -5
        ctx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(p.t * 2))
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    const io = new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) { color = accent(); cancelAnimationFrame(raf); draw() } })
    io.observe(canvas)
    resize()
    const ro = new ResizeObserver(resize); ro.observe(canvas)
    const mo = new MutationObserver(() => { color = accent() }); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] })
    draw()
    return () => { running = false; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); mo.disconnect() }
  }, [count, reduce])
  if (reduce) return null
  return <canvas ref={ref} className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} aria-hidden="true" />
}
