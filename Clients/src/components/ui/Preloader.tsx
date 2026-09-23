import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function Preloader({ text, ready }: { text: string; ready: boolean }) {
  const [show, setShow] = useState(true)
  const [minDone, setMinDone] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMinDone(true), 1100); return () => clearTimeout(t) }, [])
  useEffect(() => { if (ready && minDone) setShow(false) }, [ready, minDone])
  useEffect(() => { document.documentElement.style.overflow = show ? 'hidden' : ''; return () => { document.documentElement.style.overflow = '' } }, [show])
  const letters = text.split('')
  return (
    <AnimatePresence>
      {show && (
        <motion.div key="pre" className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg" exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }} aria-hidden="true">
          <div className="text-center">
            <div className="font-display font-extrabold tracking-tight text-4xl sm:text-6xl text-fg flex overflow-hidden">
              {letters.map((l, i) => (
                <motion.span key={i} initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ delay: 0.05 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="inline-block">
                  {l === ' ' ? ' ' : l}
                </motion.span>
              ))}
            </div>
            <motion.div className="mt-6 h-px bg-line mx-auto w-40 overflow-hidden">
              <motion.div className="h-full bg-accent" initial={{ x: '-100%' }} animate={{ x: ready ? '0%' : '-30%' }} transition={{ duration: ready ? 0.5 : 1.2, ease: 'easeInOut' }} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
