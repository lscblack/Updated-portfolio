import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sun, Moon, Menu, X, ArrowUpRight } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useSite } from '../contexts/SiteContext'
import BrandMark from './ui/BrandMark'

export default function Navbar() {
  const { mode, toggle } = useTheme()
  const { data } = useSite()
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('hero')
  const [open, setOpen] = useState(false)

  const links = useMemo(() => (data?.settings?.sections ?? []).filter(s => s.visible !== false && s.key !== 'hero').map(s => ({ label: s.label, href: `#${s.key}`, key: s.key })), [data])
  const logo = data?.settings?.logo_text || 'lsc'
  const cta = data?.settings?.resume_url ? '/resume' : ''

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ids = ['hero', ...links.map(l => l.key)]
    const els = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    if (!els.length) return
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) })
    }, { rootMargin: '-45% 0px -50% 0px' })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [links])

  useEffect(() => { document.documentElement.style.overflow = open ? 'hidden' : '' }, [open])

  return (
    <>
      <motion.header initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 inset-x-0 z-[70] pointer-events-none">
        <div className={`container-x transition-all duration-300 ${scrolled ? 'pt-3' : 'pt-5'}`}>
          <nav className={`pointer-events-auto flex items-center justify-between gap-4 transition-all duration-300 rounded-full px-3 sm:px-4 ${scrolled ? 'glass border border-line shadow-[0_10px_40px_-20px_rgb(0_0_0/.5)] h-14' : 'h-14 bg-transparent border border-transparent'}`} aria-label="Primary">
            <a href="#hero" className="flex items-center gap-2 pl-1 group" aria-label="Back to top">
              <BrandMark size={34} className="transition-transform group-hover:scale-105" />
              <span className="font-mono text-sm font-bold tracking-tight text-fg">&lt;{logo} /&gt;</span>
            </a>

            <ul className="hidden lg:flex items-center gap-1">
              {links.map(l => (
                <li key={l.key}>
                  <a href={l.href} className={`relative px-3.5 py-2 text-[0.82rem] font-semibold rounded-full transition-colors ${active === l.key ? 'text-fg' : 'text-muted hover:text-fg'}`}>
                    {active === l.key && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-surface-2 border border-line" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                    <span className="relative">{l.label}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1.5">
              <button onClick={toggle} aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-10 h-10 rounded-full grid place-items-center text-muted hover:text-fg hover:bg-surface-2 transition-colors">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={mode} initial={{ rotate: -90, opacity: 0, scale: 0.6 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 90, opacity: 0, scale: 0.6 }} transition={{ duration: 0.25 }} className="grid place-items-center">
                    {mode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                  </motion.span>
                </AnimatePresence>
              </button>
              {cta && <Link to={cta} className="btn btn-primary btn-sm hidden sm:inline-flex">Resume <ArrowUpRight size={14} /></Link>}
              <button className="lg:hidden w-10 h-10 rounded-full grid place-items-center text-muted hover:text-fg hover:bg-surface-2 transition-colors" onClick={() => setOpen(o => !o)} aria-label="Menu" aria-expanded={open}>
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[65] bg-bg/95 backdrop-blur-xl lg:hidden flex flex-col pt-28 pb-10 px-8">
            <ul className="flex flex-col gap-1">
              {links.map((l, i) => (
                <motion.li key={l.key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.05 }}>
                  <a href={l.href} onClick={() => setOpen(false)} className={`flex items-center justify-between py-3.5 border-b border-line font-display text-2xl font-bold ${active === l.key ? 'text-accent-ink' : 'text-fg'}`}>
                    {l.label}
                    <span className="font-mono text-xs text-muted">0{i + 1}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            {cta && <Link to={cta} className="btn btn-primary mt-8 self-start" onClick={() => setOpen(false)}>Resume <ArrowUpRight size={15} /></Link>}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
