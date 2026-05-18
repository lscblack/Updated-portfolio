import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowDown, Shield, Cpu, Globe, Phone, GitBranchPlus, Link2Icon } from 'lucide-react'

const ROLES = [
  'Senior Software Engineer',
  'Full-Stack Developer',
  'AI & ML Practitioner',
  'Cybersecurity Enthusiast',
  'IoT & Embedded Systems Dev',
  'Open Source Builder',
]

const STATS = [
  { label: 'GitHub Repos', value: 107, suffix: '+' },
  { label: 'Technologies', value: 40, suffix: '+' },
  { label: 'Years Coding', value: 9, suffix: '+' },
  { label: 'GitHub Followers', value: 56, suffix: '' },
]

function useCounter(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let raf: number
    const begin = performance.now()
    const tick = (now: number) => {
      const pct = Math.min((now - begin) / duration, 1)
      const ease = 1 - Math.pow(1 - pct, 3)
      setCount(Math.floor(ease * target))
      if (pct < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, start])
  return count
}

function AnimatedStat({ label, value, suffix, started }: { label: string; value: number; suffix: string; started: boolean }) {
  const count = useCounter(value, 2000, started)
  return (
    <div className="glass-sm p-4 text-center hover:border-indigo-500/30 transition-all group">
      <div className="text-2xl font-bold gradient-text tabular-nums">
        {count}{suffix}
      </div>
      <div className="text-xs text-slate-500 mt-1 group-hover:text-slate-400 transition-colors">{label}</div>
    </div>
  )
}

function TypewriterRole() {
  const [roleIdx, setRoleIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const target = ROLES[roleIdx]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && displayed.length < target.length) {
      timeout = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 55)
    } else if (!deleting && displayed.length === target.length) {
      timeout = setTimeout(() => setDeleting(true), 2400)
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30)
    } else if (deleting && displayed.length === 0) {
      setDeleting(false)
      setRoleIdx(i => (i + 1) % ROLES.length)
    }

    return () => clearTimeout(timeout)
  }, [displayed, deleting, roleIdx])

  return (
    <span>
      <span className="gradient-text">{displayed}</span>
      <span className="cursor-blink" />
    </span>
  )
}

export default function Hero() {
  const [statsStarted, setStatsStarted] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsStarted(true) }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      <div className="orb w-96 h-96 bg-indigo-600 top-[-10%] left-[-10%]" />
      <div className="orb w-80 h-80 bg-violet-600 bottom-[-5%] right-[-5%]" />
      <div className="orb w-60 h-60 bg-cyan-500 top-[40%] right-[20%] opacity-20" />
      <div className="grid-lines" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-[1fr_380px] gap-16 items-center">

          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap items-center gap-2 mb-6"
            >
              <span className="badge badge-cyan">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Open to Opportunities
              </span>
              <span className="badge badge-violet">ALU Software Engineering '26</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
            >
              Loue Sauveur
              <br />
              <span className="gradient-text">Christian</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 text-xl text-slate-400 h-8"
            >
              <TypewriterRole />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 text-slate-400 text-base leading-relaxed max-w-xl"
            >
              Senior Software Engineer at <span className="text-indigo-400 font-medium">Nexventures Ltd</span> · Software Intern at{' '}
              <span className="text-cyan-400 font-medium">National Land Authority</span> · BSc Software Engineering at{' '}
              <span className="text-violet-400 font-medium">ALU</span>.
              Building intelligent, full-stack systems across web, mobile, IoT, and AI — for Africa's digital future.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <a href="#projects" className="btn-primary">
                View Projects
                <ArrowDown size={14} />
              </a>
              <a href="https://github.com/lscblack" target="_blank" rel="noreferrer" className="btn-ghost">
                <GitBranchPlus size={15} />
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/lscblack" target="_blank" rel="noreferrer" className="btn-ghost">
                <Link2Icon size={15} />
                LinkedIn
              </a>
              <a href="mailto:l.christian@alustudent.com" className="btn-ghost">
                <Mail size={15} />
                Email
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-10 flex flex-wrap gap-2"
            >
              {[
                { icon: Shield, label: 'Secure Systems' },
                { icon: Cpu, label: 'AI / ML' },
                { icon: Globe, label: 'Full-Stack' },
                { icon: Phone, label: 'Mobile & IoT' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="skill-pill">
                  <Icon size={12} />
                  {label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              <div className="w-56 h-56 rounded-3xl overflow-hidden glow-indigo border-2 border-indigo-500/30 float">
                <img
                  src="https://avatars.githubusercontent.com/u/141139366?v=4"
                  alt="Loue Sauveur Christian"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 glass px-4 py-1.5 rounded-full border-indigo-500/30 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Kigali, Rwanda
                </div>
              </div>
            </div>

            <div ref={statsRef} className="w-full grid grid-cols-2 gap-3 mt-4">
              {STATS.map(s => (
                <AnimatedStat key={s.label} {...s} started={statsStarted} />
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
        >
          <span className="text-xs tracking-widest uppercase">scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ArrowDown size={14} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
