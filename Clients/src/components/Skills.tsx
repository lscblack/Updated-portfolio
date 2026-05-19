import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { useScrollInView } from '../hooks/useScrollInView'

type Level = 'Expert' | 'Proficient' | 'Familiar'
type Skill = { name: string; level: Level }
type SampleProject = { name: string; url?: string }

const PCT: Record<Level, number> = { Expert: 90, Proficient: 70, Familiar: 45 }
const LEVEL_COLOR: Record<Level, string> = {
  Expert: 'text-[#1A56A4] font-semibold',
  Proficient: 'text-gray-500 dark:text-gray-400',
  Familiar: 'text-gray-400 dark:text-gray-500',
}

const TABS: { label: string; skills: Skill[]; projects: SampleProject[] }[] = [
  {
    label: 'Security & DevOps',
    skills: [
      { name: 'OWASP Top 10', level: 'Expert' },
      { name: 'JWT / OAuth 2.0', level: 'Expert' },
      { name: 'TLS / HTTPS', level: 'Expert' },
      { name: 'MFA / TOTP (Google Auth)', level: 'Expert' },
      { name: 'Role-Based Access Control', level: 'Expert' },
      { name: 'Linux Server Hardening', level: 'Proficient' },
      { name: 'Docker', level: 'Proficient' },
      { name: 'CI/CD Pipelines', level: 'Proficient' },
      { name: 'AWS EC2', level: 'Proficient' },
      { name: 'DigitalOcean', level: 'Proficient' },
      { name: 'Secrets Management', level: 'Proficient' },
      { name: 'Arduino IoT', level: 'Familiar' },
    ],
    projects: [
      { name: 'NLA Land Information Portal', url: 'https://amakuru.lands.rw' },
      { name: 'Afiacare Health System' },
      { name: 'Afriton Cross-Border Payment' },
      { name: 'SafeLand Rwanda', url: 'https://safeland.rw' },
      { name: 'Nexventures production APIs' },
    ],
  },
  {
    label: 'Backend',
    skills: [
      { name: 'FastAPI', level: 'Expert' },
      { name: 'REST API Design', level: 'Expert' },
      { name: 'Django', level: 'Proficient' },
      { name: 'Express.js', level: 'Proficient' },
      { name: 'Node.js', level: 'Proficient' },
      { name: 'PHP', level: 'Proficient' },
      { name: 'GraphQL', level: 'Familiar' },
    ],
    projects: [
      { name: 'Afiacare Health System (FastAPI)' },
      { name: 'Afriton Payment API (FastAPI)' },
      { name: 'BookHub Backend', url: 'https://github.com/lscblack/BookHub_Backend_fastapi' },
      { name: 'Course Management System', url: 'https://github.com/lscblack/course_management_system_Nodejs_mysql_redis' },
      { name: 'EcoTrack Rwanda (Django)' },
      { name: 'Youth Home Platform (PHP)' },
    ],
  },
  {
    label: 'Frontend',
    skills: [
      { name: 'React.js', level: 'Expert' },
      { name: 'TypeScript', level: 'Expert' },
      { name: 'Tailwind CSS', level: 'Expert' },
      { name: 'Redux Toolkit', level: 'Expert' },
      { name: 'Vite.js', level: 'Expert' },
      { name: 'Vue.js', level: 'Proficient' },
      { name: 'Framer Motion', level: 'Proficient' },
      { name: 'Bootstrap', level: 'Proficient' },
    ],
    projects: [
      { name: 'NLA Land Portal (React + Redux)', url: 'https://amakuru.lands.rw' },
      { name: 'SafeLand Rwanda', url: 'https://safeland.rw' },
      { name: 'EcoTrack Rwanda' },
      { name: 'Prov-Rwanda (React + Firebase)' },
      { name: 'This portfolio (React + Framer Motion)' },
    ],
  },
  {
    label: 'Mobile',
    skills: [
      { name: 'Flutter', level: 'Proficient' },
      { name: 'React Native', level: 'Proficient' },
      { name: 'Firebase', level: 'Proficient' },
      { name: 'Expo', level: 'Proficient' },
      { name: 'Android / Java WebView', level: 'Familiar' },
    ],
    projects: [
      { name: 'Fam Care App (Flutter)', url: 'https://github.com/lscblack/Famcare' },
      { name: 'Medical Insurance Estimator (Flutter)' },
      { name: 'Cholare La Lumière (React Native)' },
      { name: 'Youth Home Android (Java WebView)' },
    ],
  },
  {
    label: 'AI / ML',
    skills: [
      { name: 'Pandas', level: 'Expert' },
      { name: 'Jupyter Notebook', level: 'Expert' },
      { name: 'TensorFlow', level: 'Proficient' },
      { name: 'scikit-learn', level: 'Proficient' },
      { name: 'Deep Learning / CNN', level: 'Proficient' },
      { name: 'NLP', level: 'Familiar' },
      { name: 'Adversarial ML Awareness', level: 'Familiar' },
    ],
    projects: [
      { name: 'RwandaCropGuard (TensorFlow CNN)' },
      { name: 'Urban Sound Classifier', url: 'https://github.com/lscblack/Urban_Voice_classifier' },
      { name: 'AfriTon Chatbot (NLP)', url: 'https://github.com/lscblack/AfriTon-chatbot' },
      { name: 'Time-Series Forecasting', url: 'https://github.com/lscblack/Time-Series-Forecasting' },
      { name: 'Medical Insurance Estimator (ML)' },
    ],
  },
  {
    label: 'Languages',
    skills: [
      { name: 'Python', level: 'Expert' },
      { name: 'JavaScript', level: 'Expert' },
      { name: 'TypeScript', level: 'Expert' },
      { name: 'SQL', level: 'Expert' },
      { name: 'Shell Scripting', level: 'Proficient' },
      { name: 'PHP', level: 'Proficient' },
      { name: 'Dart', level: 'Proficient' },
      { name: 'C / C++', level: 'Familiar' },
      { name: 'Java', level: 'Familiar' },
    ],
    projects: [
      { name: 'Python: Afiacare, ML pipeline, EcoTrack' },
      { name: 'TypeScript: NLA Portal, SafeLand', url: 'https://github.com/lscblack/Safe_Land_Rwanda' },
      { name: 'Dart: Fam Care App', url: 'https://github.com/lscblack/Famcare' },
      { name: 'PHP: Youth Home, CODEJIKA projects' },
      { name: 'Java: Android WebView app (Play Store)' },
    ],
  },
  {
    label: 'Databases',
    skills: [
      { name: 'PostgreSQL', level: 'Expert' },
      { name: 'MySQL', level: 'Expert' },
      { name: 'MongoDB', level: 'Proficient' },
      { name: 'Firebase Firestore', level: 'Proficient' },
      { name: 'Redis', level: 'Familiar' },
    ],
    projects: [
      { name: 'PostgreSQL: Afiacare, Afriton, NLA Portal' },
      { name: 'MySQL: Course Mgmt', url: 'https://github.com/lscblack/course_management_system_Nodejs_mysql_redis' },
      { name: 'MongoDB: Inventory System' },
      { name: 'Firebase: Prov-Rwanda, Fam Care, Cholare' },
    ],
  },
  {
    label: 'Tools',
    skills: [
      { name: 'Git / GitHub', level: 'Expert' },
      { name: 'Postman', level: 'Expert' },
      { name: 'Linux CLI', level: 'Expert' },
      { name: 'VSCode', level: 'Expert' },
      { name: 'GitLab', level: 'Proficient' },
      { name: 'Figma', level: 'Proficient' },
      { name: 'Google Colab', level: 'Proficient' },
    ],
    projects: [
      { name: 'GitHub: 107+ repositories', url: 'https://github.com/lscblack' },
      { name: 'Figma: NLA Portal UI/UX design' },
      { name: 'Postman: API testing — Afiacare, Afriton' },
      { name: 'Linux: NLA server deployment & hardening' },
    ],
  },
]

function SkillBar({ name, level, index }: { name: string; level: Level; index: number }) {
  const [visible, setVisible] = useState(false)
  const setRef = (el: HTMLDivElement | null) => {
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { rootMargin: '-20px' })
    obs.observe(el)
  }
  const pct = PCT[level]

  return (
    <div ref={setRef} className="py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{name}</span>
        <span className={`text-[11px] tabular-nums font-mono-stack ${LEVEL_COLOR[level]}`}>{pct}%</span>
      </div>
      <div className="h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[#1A56A4]"
          initial={{ width: 0 }}
          animate={visible ? { width: `${pct}%` } : { width: 0 }}
          transition={{ duration: 0.7, delay: index * 0.035, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default function Skills() {
  const [tab, setTab] = useState(0)
  const [ref, inView] = useScrollInView()

  return (
    <section id="skills" className="py-12 sm:py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="w-11/12 mx-auto">
        <div ref={ref} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <p className="section-label">{'< skills />'}</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Technical Skills
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Select a category — proficiency bars + the real projects where each skill was applied.
          </p>
        </motion.div>

        {/* Tab strip */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="mt-8 flex flex-wrap gap-2">
            {TABS.map((t, i) => (
              <button key={t.label} onClick={() => setTab(i)}
                className={`px-4 py-2 rounded-md text-sm font-medium border transition-all ${
                  tab === i
                    ? 'bg-[#1A56A4] text-white border-[#1A56A4] shadow-sm shadow-blue-200 dark:shadow-none'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-[#1A56A4] hover:text-[#1A56A4] dark:hover:text-[#4A90D9]'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content: 2-col skill bars (left) + projects (right) */}
        <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          <div className="mt-6 grid lg:grid-cols-[3fr_2fr] gap-5 items-start">

            {/* Left: skill bars */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#1A56A4]">
                  {TABS[tab].label}
                </p>
                <div className="flex items-center gap-4 text-[10px] text-gray-400 dark:text-gray-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-0.5 rounded-full bg-[#1A56A4] inline-block" />Expert</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-0.5 rounded-full bg-[#1A56A4] opacity-55 inline-block" />Proficient</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-0.5 rounded-full bg-[#1A56A4] opacity-30 inline-block" />Familiar</span>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-10">
                {TABS[tab].skills.map((s, i) => (
                  <SkillBar key={`${tab}-${s.name}`} name={s.name} level={s.level} index={i} />
                ))}
              </div>
            </div>

            {/* Right: projects used in */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#B8860B] mb-5">
                Applied in
              </p>
              <ul className="space-y-3">
                {TABS[tab].projects.map(p => (
                  <li key={p.name}>
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noreferrer"
                        className="flex items-start gap-2.5 text-sm text-[#1A56A4] hover:underline group">
                        <span className="text-[#B8860B] shrink-0 font-bold mt-0.5">›</span>
                        <span>{p.name}</span>
                        <ExternalLink size={10} className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </a>
                    ) : (
                      <div className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-gray-300 dark:text-gray-600 shrink-0 mt-0.5">›</span>
                        <span>{p.name}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  )
}
