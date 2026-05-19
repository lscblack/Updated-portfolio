import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Download } from 'lucide-react'

const PHRASES = [
  'Building secure, scalable systems.',
  'Full-Stack · AI/ML · Security-focused.',
  'Senior Engineer · Kigali, Rwanda.',
  'Turning complex problems into clean code.',
]

export function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

export function LinkedinIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function Typewriter() {
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    const id = setInterval(() => setShowCursor(s => !s), 530)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const target = PHRASES[phraseIdx]
    let t: ReturnType<typeof setTimeout>
    if (!deleting && displayed.length < target.length) {
      t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 48)
    } else if (!deleting && displayed.length === target.length) {
      t = setTimeout(() => setDeleting(true), 2800)
    } else if (deleting && displayed.length > 0) {
      t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 24)
    } else {
      setDeleting(false)
      setPhraseIdx(i => (i + 1) % PHRASES.length)
    }
    return () => clearTimeout(t)
  }, [displayed, deleting, phraseIdx])

  return (
    <span>
      <span className="text-gray-800 dark:text-gray-200">{displayed}</span>
      <span className="inline-block w-0.5 h-[1.1em] bg-[#1A56A4] align-middle ml-0.5"
        style={{ opacity: showCursor ? 1 : 0, transition: 'opacity 0.08s' }} />
    </span>
  )
}

const METRICS = [
  { value: '3+', label: 'Years', sub: 'experience' },
  { value: '15+', label: 'Systems', sub: 'shipped' },
  { value: '4', label: 'Gov', sub: 'platforms' },
  { value: '107+', label: 'Repos', sub: 'GitHub' },
]

// Code lines with token arrays
const CODE_LINES = [
  [{ t: 'comment', v: '// portfolio/engineer.ts — Loue Sauveur Christian' }],
  [],
  [{ t: 'kw', v: 'interface' }, { t: 'sp', v: ' ' }, { t: 'type', v: 'SecureEngineer' }, { t: 'g', v: ' {' }],
  [{ t: 'sp', v: '  ' }, { t: 'key', v: 'name' }, { t: 'g', v: ':      ' }, { t: 'str', v: '"Loue Sauveur Christian"' }],
  [{ t: 'sp', v: '  ' }, { t: 'key', v: 'role' }, { t: 'g', v: ':      ' }, { t: 'str', v: '"Senior Software Engineer"' }],
  [{ t: 'sp', v: '  ' }, { t: 'key', v: 'location' }, { t: 'g', v: ':  ' }, { t: 'str', v: '"Kigali, Rwanda 🇷🇼"' }],
  [{ t: 'sp', v: '  ' }, { t: 'key', v: 'stack' }, { t: 'g', v: ':     ' }, { t: 'type', v: 'TechStack' }],
  [{ t: 'sp', v: '  ' }, { t: 'key', v: 'security' }, { t: 'g', v: ':  ' }, { t: 'type', v: 'OWASPCompliant' }],
  [{ t: 'sp', v: '  ' }, { t: 'key', v: 'openTo' }, { t: 'g', v: ':    ' }, { t: 'type', v: 'Opportunity[]' }],
  [{ t: 'g', v: '}' }],
  [],
  [{ t: 'kw', v: 'const' }, { t: 'sp', v: ' ' }, { t: 'var', v: 'christian' }, { t: 'g', v: ': ' }, { t: 'type', v: 'SecureEngineer' }, { t: 'g', v: ' = {' }],
  [{ t: 'sp', v: '  ' }, { t: 'key', v: 'stack' }, { t: 'g', v: ': [' }, { t: 'str', v: '"FastAPI"' }, { t: 'g', v: ', ' }, { t: 'str', v: '"React"' }, { t: 'g', v: ', ' }, { t: 'str', v: '"Flutter"' }, { t: 'g', v: ', ' }, { t: 'str', v: '"PostgreSQL"' }, { t: 'g', v: '],' }],
  [{ t: 'sp', v: '  ' }, { t: 'key', v: 'security' }, { t: 'g', v: ': ' }, { t: 'str', v: '"JWT · MFA · TLS · OWASP · RBAC"' }, { t: 'g', v: ',' }],
  [{ t: 'sp', v: '  ' }, { t: 'key', v: 'openTo' }, { t: 'g', v: ': [' }, { t: 'str', v: '"MSc Cybersecurity"' }, { t: 'g', v: ', ' }, { t: 'str', v: '"Research"' }, { t: 'g', v: ', ' }, { t: 'str', v: '"Collaboration"' }, { t: 'g', v: '],' }],
  [{ t: 'g', v: '}' }, { t: 'g', v: ';' }],
  [],
  [{ t: 'comment', v: '// Currently protecting: 14M+ citizen land records @ NLA' }],
  [{ t: 'comment', v: '// Live: amakuru.lands.rw · safeland.rw · pro-rw.netlify.app' }],
  [],
  [{ t: 'kw', v: 'export' }, { t: 'sp', v: ' ' }, { t: 'kw', v: 'default' }, { t: 'sp', v: ' ' }, { t: 'var', v: 'christian' }, { t: 'g', v: ';  ' }, { t: 'comment', v: '// always building.' }],
]

function CodeToken({ t, v }: { t: string; v: string }) {
  const cls = t === 'comment' ? 'text-gray-500 italic'
    : t === 'kw' ? 'text-blue-400 font-semibold'
    : t === 'type' ? 'text-yellow-300'
    : t === 'key' ? 'text-sky-300'
    : t === 'str' ? 'text-amber-300'
    : t === 'var' ? 'text-green-300'
    : 'text-gray-400'
  return <span className={cls}>{v}</span>
}

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-14 pb-10 overflow-hidden">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.75 bg-[#1A56A4]" />

      <div className="w-11/12 mx-auto">
        {/* True 50/50 on desktop so code block gets full space */}
        <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-start lg:items-center">

          {/* ── Left column ── */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mb-8">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-gray-600 dark:text-gray-400 font-medium text-xs">
                  Senior SWE · Nexventures &amp; NLA · Kigali
                </span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.02]">
                Loue Sauveur<br />
                <span className="text-[#1A56A4]">Christian</span>
              </h1>
              <div className="mt-4 w-14 h-0.75 bg-[#1A56A4] rounded-full" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.22 }}>
              <div className="mt-6 text-lg sm:text-xl font-medium text-gray-500 dark:text-gray-400 font-mono-stack h-8">
                <Typewriter />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.32 }}>
              <p className="mt-5 text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                Software engineer specialising in secure full-stack systems, AI/ML integration, and
                government-grade infrastructure. Currently building at{' '}
                <a href="https://nexventures.rw" target="_blank" rel="noreferrer" className="text-[#1A56A4] font-medium hover:underline">Nexventures</a>
                {' '}and protecting citizen data at the{' '}
                <a href="https://amakuru.lands.rw" target="_blank" rel="noreferrer" className="text-[#1A56A4] font-medium hover:underline">National Land Authority</a>.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.42 }}>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#projects" className="btn-blue">View My Work <ArrowRight size={15} /></a>
                <a href="/resume.pdf" className="btn-outline"><Download size={15} /> Download CV</a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.52 }}>
              <div className="mt-10 grid grid-cols-4 gap-3 border-t border-gray-200 dark:border-gray-800 pt-8">
                {METRICS.map(m => (
                  <div key={m.label}>
                    <div className="text-xl font-black text-gray-900 dark:text-white">{m.value}</div>
                    <div className="text-xs text-[#1A56A4] font-semibold mt-0.5">{m.label}</div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500">{m.sub}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
              <div className="mt-6 flex items-center gap-5">
                {[
                  { icon: <GithubIcon size={19} />, href: 'https://github.com/lscblack', label: 'GitHub' },
                  { icon: <LinkedinIcon size={19} />, href: 'https://www.linkedin.com/in/christian-loue-sauveur/', label: 'LinkedIn' },
                  { icon: <Mail size={19} />, href: 'mailto:louesauveur18@gmail.com', label: 'Email' },
                ].map(({ icon, href, label }) => (
                  <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer" aria-label={label}
                    className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-[#1A56A4] dark:hover:text-[#4A90D9] transition-colors text-sm">
                    {icon}
                    <span className="hidden sm:inline">{label}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Right column — full-width code terminal ── */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}>
            <div className="bg-gray-950 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">

              {/* Chrome bar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs font-mono-stack">engineer.ts</span>
                  <span className="px-2 py-0.5 text-[10px] rounded bg-blue-900/50 text-blue-300 font-mono-stack">TypeScript</span>
                </div>
                <span className="text-gray-600 text-xs font-mono-stack">UTF-8</span>
              </div>

              {/* Code area */}
              <div className="p-5 font-mono-stack text-[12.5px] leading-6 select-none overflow-x-auto">
                {CODE_LINES.map((line, i) => (
                  <div key={i} className="flex items-start gap-4 min-h-6 hover:bg-white/2 transition-colors rounded-sm px-1">
                    <span className="text-gray-700 text-right shrink-0 w-5 text-xs mt-0.5 select-none tabular-nums">{i + 1}</span>
                    <span className="flex-1 min-w-0 break-all">
                      {line.length === 0
                        ? <span className="invisible">·</span>
                        : line.map((tok, j) => <CodeToken key={j} t={tok.t} v={tok.v} />)
                      }
                    </span>
                  </div>
                ))}
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between px-5 py-2.5 bg-[#1A56A4]">
                <span className="text-white/70 text-[11px] font-mono-stack">
                  Ln {CODE_LINES.length}, Col 1 · TypeScript
                </span>
                <span className="flex items-center gap-2 text-white text-[11px] font-mono-stack">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Available for opportunities
                </span>
                <span className="text-white/50 text-[11px] font-mono-stack">engineer.ts</span>
              </div>
            </div>

            {/* Live site badges below terminal */}
            <div className="mt-4 flex flex-wrap gap-2 justify-start">
              {[
                { label: 'amakuru.lands.rw', url: 'https://amakuru.lands.rw' },
                { label: 'safeland.rw', url: 'https://safeland.rw' },
                { label: 'pro-rw.netlify.app', url: 'https://pro-rw.netlify.app/' },
              ].map(s => (
                <a key={s.label} href={s.url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-[11px] font-mono-stack text-gray-500 dark:text-gray-400 hover:border-[#1A56A4] hover:text-[#1A56A4] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {s.label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
