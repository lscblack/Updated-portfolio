import { useEffect, useRef, useState } from 'react'

export function useScrollInView(margin = '-80px') {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { rootMargin: margin }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [margin])

  return [ref, inView] as const
}
