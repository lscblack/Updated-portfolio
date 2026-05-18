import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { GraduationCap, Briefcase, Users, BookOpen } from 'lucide-react'

const HIGHLIGHTS = [
  {
    icon: GraduationCap,
    color: '#22d3ee',
    title: 'BSc Software Engineering',
    sub: 'African Leadership University · 2023–2026',
    body: 'Coursework in Linux, Web Development, Databases, Algorithms, Mobile Development, and Machine Learning. On track for May 2026 graduation.',
  },
  {
    icon: Briefcase,
    color: '#6366f1',
    title: 'Senior Software Engineer',
    sub: 'Nexventures Ltd · May 2025 – Present',
    body: 'Leading development of web and mobile apps with FastAPI, PostgreSQL, React, and Flutter. Integrating AI/ML into production systems and contributing to IoT embedded systems.',
  },
  {
    icon: Briefcase,
    color: '#8b5cf6',
    title: 'Software Engineer Intern',
    sub: 'National Land Authority · Mar 2024 – Apr 2026',
    body: "Designed Figma UI/UX for Rwanda's land information portal. Built and deployed a React + Redux frontend on Linux servers with Google Authenticator integration and end-to-end encryption.",
  },
  {
    icon: Users,
    color: '#a78bfa',
    title: 'Head Residential Advisor',
    sub: 'African Leadership University · Jan 2024 – May 2026',
    body: 'Mentoring 100+ students, organizing leadership programs, and serving as liaison between students and administration. Crisis management and community building.',
  },
]

export default function Story() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="about" className="py-24 relative" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <div className="section-divider" />
              <h2 className="text-3xl sm:text-4xl font-bold mt-2">
                About <span className="gradient-text">Me</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 space-y-5 text-slate-400 leading-relaxed"
            >
              <p>
                I'm a software engineer based in Kigali, Rwanda, currently completing my Bachelor's in Software
                Engineering at the African Leadership University (graduating May 2026). I work as a Senior Software
                Engineer at Nexventures Ltd while simultaneously completing an internship at the National Land Authority.
              </p>
              <p>
                My journey started in high school writing C++, PHP, and Python — learning algorithms and
                database design from first principles. Since then I've shipped production systems across web,
                mobile, AI/ML, IoT, and blockchain, trained developers across Rwanda, and mentored
                university students as a Head Residential Advisor.
              </p>
              <p>
                I hold a Stanford-affiliated Data Science certificate and a CS certificate from high school.
                My mission is to deliver high-quality, secure, intelligent systems that solve real African problems.
              </p>
              <p className="text-slate-300 font-medium border-l-2 border-indigo-500 pl-4">
                "Build with precision, secure by design, and deliver for Africa."
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <a href="mailto:l.christian@alustudent.com" className="btn-ghost text-xs">
                <BookOpen size={13} />
                l.christian@alustudent.com
              </a>
              <span className="skill-pill">+250 790 110 231</span>
            </motion.div>
          </div>

          {/* Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            {HIGHLIGHTS.map((h, i) => {
              const Icon = h.icon
              return (
                <motion.div
                  key={h.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.1 }}
                  className="glass p-5 rounded-2xl hover:scale-[1.02] transition-transform"
                  style={{ borderColor: `${h.color}18` }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${h.color}18`, border: `1px solid ${h.color}30` }}
                    >
                      <Icon size={16} style={{ color: h.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-200 text-sm">{h.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 mb-2">{h.sub}</p>
                      <p className="text-slate-500 text-xs leading-relaxed">{h.body}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
