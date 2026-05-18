import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Briefcase, GraduationCap, Users, Code2, Cpu, BookOpen } from 'lucide-react'

const JOURNEY = [
  {
    period: '2022–2023',
    era: 'First Roles',
    icon: Code2,
    color: '#22d3ee',
    org: 'Grobal Growth Company & CODEJIKA',
    location: 'Kigali, Rwanda',
    title: 'Full Stack Developer & Web Coach',
    body: 'Built the Youth Home platform for African writers/artists — Figma UI, PHP/MySQL backend, Bootstrap frontend, Android WebView app on Play Store. Simultaneously taught HTML, CSS, PHP, and MySQL at CODEJIKA, delivering hands-on bootcamp sessions.',
    tags: ['PHP', 'MySQL', 'Bootstrap', 'HTML/CSS', 'Android', 'cPanel'],
  },
  {
    period: '2023 – 2026',
    era: 'University',
    icon: GraduationCap,
    color: '#6366f1',
    org: 'African Leadership University',
    location: 'Kigali, Rwanda',
    title: 'BSc Software Engineering',
    body: 'Full-time degree covering Linux, Web Development, Databases, Algorithms, Mobile Development, and Machine Learning. Graduating May 2026. Stanford-affiliated Data Science certificate completed alongside.',
    tags: ['Algorithms', 'Linux', 'Databases', 'Mobile Dev', 'Machine Learning'],
  },
  {
    period: 'Jan 2024 – Present',
    era: 'Leadership',
    icon: Users,
    color: '#8b5cf6',
    org: 'African Leadership University',
    location: 'Kigali, Rwanda',
    title: 'Head Residential Advisor',
    body: 'Mentoring and supporting 100+ university students — resolving academic, personal, and social challenges. Organizing community engagement and leadership programs. Acting as liaison between students and administration, handling crisis management professionally.',
    tags: ['Mentorship', 'Leadership', 'Community', 'Crisis Management'],
  },
  {
    period: 'Mar 2024 – Apr 2026',
    era: 'Gov Tech',
    icon: Briefcase,
    color: '#22d3ee',
    org: 'National Land Authority (NLA)',
    location: 'Kigali, Rwanda',
    title: 'Software Engineer Intern',
    body: "Designed Figma UI/UX for Rwanda's national land information portal. Built React + Redux Toolkit frontend deployed on Linux server. Configured horizontal scaling backend, integrated Google Authenticator, and encrypted all frontend–backend communication.",
    tags: ['React', 'Redux Toolkit', 'Figma', 'Linux', 'Google Authenticator', 'Tailwind CSS'],
  },
  {
    period: 'Apr – May 2025',
    era: 'Training',
    icon: BookOpen,
    color: '#a78bfa',
    org: 'Church of God TTS – School of Development',
    location: 'Kigali, Rwanda',
    title: 'MERN & MySQL Trainer',
    body: 'Delivered comprehensive MERN stack training (MongoDB, Express.js, React, Tailwind CSS, Node.js) plus MySQL to S6 Level V students. Prepared students for national exams with real-world development scenarios.',
    tags: ['MongoDB', 'Express.js', 'React', 'Node.js', 'MySQL', 'Tailwind CSS'],
  },
  {
    period: 'May 2025 – Present',
    era: 'Senior Eng.',
    icon: Cpu,
    color: '#f59e0b',
    org: 'Nexventures Ltd (NV)',
    location: 'Kigali, Rwanda',
    title: 'Senior Software Engineer',
    body: 'Leading web and mobile app development with FastAPI, PostgreSQL, React, and Flutter. Integrating AI/ML models into production. Mentoring juniors, conducting code reviews, implementing CI/CD pipelines, and contributing to IoT embedded systems.',
    tags: ['FastAPI', 'PostgreSQL', 'React', 'Flutter', 'AI/ML', 'CI/CD', 'IoT', 'Docker'],
  },
]

export default function Timeline() {
  const [active, setActive] = useState(JOURNEY.length - 1)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="journey" className="py-24 relative" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div className="section-divider" />
          <h2 className="text-3xl sm:text-4xl font-bold mt-2">
            Experience &amp; <span className="gradient-text">Journey</span>
          </h2>
          <p className="mt-3 text-slate-500">6 roles across engineering, government tech, training, and leadership.</p>
        </motion.div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8 items-start">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 lg:overflow-visible"
          >
            {JOURNEY.map((j, i) => {
              const Icon = j.icon
              const isActive = active === i
              return (
                <button
                  key={j.period + j.era}
                  onClick={() => setActive(i)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left whitespace-nowrap lg:whitespace-normal shrink-0 lg:shrink w-full ${
                    isActive
                      ? 'glass border-indigo-500/30 bg-indigo-600/10'
                      : 'hover:bg-white/4 border border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: isActive ? `${j.color}20` : 'rgba(255,255,255,0.05)',
                      border: isActive ? `1px solid ${j.color}40` : '1px solid transparent',
                    }}
                  >
                    <Icon size={14} style={{ color: isActive ? j.color : '#64748b' }} />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-medium truncate ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                      {j.era}
                    </div>
                    <div className={`text-[10px] truncate ${isActive ? 'text-slate-400' : 'text-slate-600'}`}>
                      {j.period}
                    </div>
                  </div>
                </button>
              )
            })}
          </motion.div>

          {/* Detail */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass p-8 rounded-2xl"
              style={{ borderColor: `${JOURNEY[active].color}20` }}
            >
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="badge" style={{
                  background: `${JOURNEY[active].color}15`,
                  border: `1px solid ${JOURNEY[active].color}30`,
                  color: JOURNEY[active].color,
                }}>
                  {JOURNEY[active].period}
                </span>
                <span className="text-xs text-slate-500">{JOURNEY[active].location}</span>
              </div>

              <h3 className="text-2xl font-bold mt-4 text-slate-100">{JOURNEY[active].title}</h3>
              <p className="text-sm text-slate-400 mt-1">{JOURNEY[active].org}</p>
              <p className="mt-4 text-slate-400 leading-relaxed">{JOURNEY[active].body}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {JOURNEY[active].tags.map(t => (
                  <span key={t} className="skill-pill text-xs">{t}</span>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-2">
                {JOURNEY.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className="transition-all rounded-full"
                    style={{
                      width: i === active ? 24 : 8,
                      height: 8,
                      background: i === active ? JOURNEY[active].color : 'rgba(255,255,255,0.1)',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
