import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      className="fixed top-0.75 left-0 right-0 h-0.75 bg-[#1A56A4] origin-left z-[60] pointer-events-none"
      style={{ scaleX }}
    />
  )
}
