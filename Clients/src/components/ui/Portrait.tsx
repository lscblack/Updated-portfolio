import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

/** Crossfades through the portrait gallery; falls back to the single avatar. */
export default function Portrait({ images, alt, className = '', interval = 4500, style }: { images: string[]; alt: string; className?: string; interval?: number; style?: React.CSSProperties }) {
  const list = images.filter(Boolean)
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  useEffect(() => {
    if (list.length < 2 || reduce) return
    const t = setInterval(() => setI(x => (x + 1) % list.length), interval)
    return () => clearInterval(t)
  }, [list.length, interval, reduce])
  if (!list.length) return <div className={`bg-surface-2 ${className}`} style={style} />
  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      <AnimatePresence initial={false}>
        <motion.img key={list[i % list.length]} src={list[i % list.length]} alt={alt} loading="eager"
          initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full object-cover" />
      </AnimatePresence>
      {list.length > 1 && (
        <div className="absolute bottom-2 right-2 flex gap-1">
          {list.map((_, k) => <span key={k} className={`h-1 rounded-full transition-all ${k === i ? 'w-4 bg-white' : 'w-1 bg-white/50'}`} />)}
        </div>
      )}
    </div>
  )
}
