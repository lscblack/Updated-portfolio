import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Terminal } from 'lucide-react'

const LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Personal', href: '#personal-projects' },
  { label: 'Journey', href: '#journey' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = LINKS.map(l => document.querySelector(l.href))
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActive('#' + e.target.id) })
      },
      { rootMargin: '-40% 0px -50% 0px' }
    )
    sections.forEach(s => s && observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass border-b border-white/5' : ''
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center glow-indigo group-hover:scale-110 transition-transform">
              <Terminal size={14} className="text-white" />
            </div>
            <span className="font-semibold text-sm gradient-text-subtle">lscblack</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                className={`nav-link ${active === l.href ? 'active' : ''}`}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="/resume.pdf" className="btn-primary text-xs py-2 px-4">
              Resume
            </a>
          </div>

          <button className="md:hidden p-2 text-slate-400 hover:text-white transition-colors" onClick={() => setOpen(o => !o)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-40 glass border-b border-white/5 md:hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {LINKS.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-slate-300 hover:text-white transition-colors py-1"
                >
                  {l.label}
                </a>
              ))}
              <a href="/resume.pdf" className="btn-primary text-xs py-2 px-4 w-fit">Resume</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
