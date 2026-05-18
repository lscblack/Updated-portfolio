import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const CATEGORIES = [
  {
    title: 'Languages',
    color: 'cyan',
    skills: ['Python', 'TypeScript', 'JavaScript', 'PHP', 'C / C++', 'SQL', 'Shell Scripting', 'HTML / CSS', 'Go'],
  },
  {
    title: 'Frameworks & Libraries',
    color: 'indigo',
    skills: ['React.js', 'Next.js', 'Vue.js', 'FastAPI', 'Django', 'Express.js', 'Node.js', 'Flutter', 'React Native', 'Bootstrap', 'Tailwind CSS'],
  },
  {
    title: 'AI / ML & Data',
    color: 'violet',
    skills: ['TensorFlow', 'scikit-learn', 'PyTorch', 'Deep Q-Learning', 'NLP', 'Time-Series Forecasting', 'Pandas', 'Jupyter Notebook', 'Google Colab'],
  },
  {
    title: 'Databases',
    color: 'cyan',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'Firebase', 'Redis', 'SQLModel / SQLAlchemy'],
  },
  {
    title: 'DevOps & Infrastructure',
    color: 'indigo',
    skills: ['Docker', 'Linux', 'AWS EC2', 'DigitalOcean', 'Nginx', 'GitHub Actions', 'GitLab CI', 'cPanel', 'CI/CD'],
  },
  {
    title: 'Platforms & Tools',
    color: 'violet',
    skills: ['GitHub', 'GitLab', 'Figma', 'Arduino (IoT)', 'Hyperledger Fabric', 'Google Maps API', 'Google Authenticator', 'Vite.js'],
  },
]

const colorMap = {
  cyan: 'badge-cyan',
  indigo: 'badge-indigo',
  violet: 'badge-violet',
}
const borderMap = {
  cyan: 'rgba(34,211,238,0.15)',
  indigo: 'rgba(99,102,241,0.15)',
  violet: 'rgba(139,92,246,0.15)',
}
const headerMap = {
  cyan: 'linear-gradient(90deg,#22d3ee,#06b6d4)',
  indigo: 'linear-gradient(90deg,#6366f1,#818cf8)',
  violet: 'linear-gradient(90deg,#8b5cf6,#a78bfa)',
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function Skills() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="skills" className="py-24 relative" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div className="section-divider" />
          <h2 className="text-3xl sm:text-4xl font-bold mt-2">
            Technical <span className="gradient-text">Skills</span>
          </h2>
          <p className="mt-3 text-slate-500 max-w-xl">
            A full-stack toolkit spanning languages, frameworks, AI, databases, DevOps, and embedded systems.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {CATEGORIES.map(cat => (
            <motion.div
              key={cat.title}
              variants={item}
              className="glass p-6 hover:scale-[1.02] transition-transform"
              style={{ borderColor: borderMap[cat.color as keyof typeof borderMap] }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-1 h-5 rounded-full"
                  style={{ background: headerMap[cat.color as keyof typeof headerMap] }}
                />
                <h3 className="font-semibold text-sm text-slate-200">{cat.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map(s => (
                  <span key={s} className={`badge ${colorMap[cat.color as keyof typeof colorMap]}`}>{s}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-10 glass p-6 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-linear-to-b from-amber-400 to-orange-500" />
            <h3 className="font-semibold text-sm text-slate-200">Certifications & Programs</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Computer Science (High School Certificate)',
                desc: 'HTML, CSS, PHP, C++, Python, Algorithms, System Analysis, Database Management',
                color: '#f59e0b',
              },
              {
                title: 'Data Science — Stanford / Jennifer Widom',
                desc: 'Python, Data Structures, Pandas, Introduction to Machine Learning',
                color: '#22d3ee',
              },
            ].map(c => (
              <div
                key={c.title}
                className="rounded-xl p-4"
                style={{ background: `${c.color}08`, border: `1px solid ${c.color}20` }}
              >
                <p className="text-sm font-medium text-slate-200">{c.title}</p>
                <p className="text-xs text-slate-500 mt-1">{c.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
