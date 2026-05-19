import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { useScrollInView } from '../hooks/useScrollInView'
import api from '../api/client'

// API project shape
type ApiProject = {
  id: number; title: string; description: string | null
  public: boolean; github_url: string | null; live_url: string | null
  technologies: string[] | null; categories: string[] | null
  status: string | null; order: number; contributed: boolean
}

// Normalised shape used by both hardcoded and API data
type Project = {
  title: string; desc: string; stack: string[]
  categories: string[]; github?: string; live?: string; contributed?: boolean
}

// Projects I contributed on (fixed — shown prominently)
const CONTRIBUTED: Project[] = [
  {
    title: 'NLA Land Information Portal',
    desc: "Rwanda's national land information system protecting 14M+ citizen records with end-to-end TLS, Google Authenticator MFA, and horizontal scaling.",
    stack: ['React', 'Redux Toolkit', 'Linux', 'MFA', 'TLS'],
    categories: ['Web', 'Security'], live: 'https://amakuru.lands.rw', contributed: true,
  },
  {
    title: 'SafeLand Rwanda',
    desc: "National digital real-estate marketplace — blockchain-backed parcel records integrated with LAIS, RDB, RRA, and Irembo; ML-powered land valuation and fraud detection; multilingual (RW/EN/FR) for citizens, agents, and government.",
    stack: ['Hyperledger Fabric', 'FastAPI', 'Go', 'React', 'Flutter', 'PostgreSQL', 'Redis', 'ML'],
    categories: ['Web', 'Security'], live: 'https://safeland.rw', github: 'https://github.com/lscblack/Safe_Land_Rwanda', contributed: true,
  },
  {
    title: 'Prov-Rwanda',
    desc: "Live civic platform helping Rwandans pass the driving theory permit exam — quizzes, traffic rule guides, and study resources.",
    stack: ['React.js', 'Firebase'], categories: ['Web', 'Open Source'],
    live: 'https://pro-rw.netlify.app/', github: 'https://github.com/lscblack', contributed: true,
  },
]

// Fallback for "Other Work" when API is offline
const DEFAULT_OTHER: Project[] = [
  { title: 'Afriton Cross-Border Payment', desc: 'Pan-African unified payment system with encrypted transaction flows and fraud prevention.', stack: ['React', 'FastAPI', 'PostgreSQL'], categories: ['Web', 'Security'], github: 'https://github.com/lscblack' },
  { title: 'Afiacare Health System', desc: 'Patient health record platform with encrypted storage and OWASP-compliant API endpoints.', stack: ['FastAPI', 'React', 'Vite.js', 'PostgreSQL'], categories: ['Web', 'Security'], github: 'https://github.com/lscblack' },
  { title: 'EcoTrack Rwanda', desc: 'Smart waste management system for households, collectors, and admins with real-time route optimisation.', stack: ['React', 'Django', 'Google Maps API'], categories: ['Web'], github: 'https://github.com/lscblack' },
  { title: 'RwandaCropGuard', desc: 'Deep learning pipeline classifying crop diseases from leaf images.', stack: ['TensorFlow', 'Python'], categories: ['AI / ML'], github: 'https://github.com/lscblack' },
  { title: 'Urban Sound Classifier', desc: 'ML pipeline for urban sound classification — audio feature extraction and multi-class modelling.', stack: ['scikit-learn', 'Python'], categories: ['AI / ML'], github: 'https://github.com/lscblack/Urban_Voice_classifier' },
  { title: 'Medical Insurance Estimator', desc: 'Privacy-preserving mobile ML app estimating medical costs using on-device inference.', stack: ['Flutter', 'Firebase'], categories: ['Mobile', 'AI / ML'], github: 'https://github.com/lscblack' },
  { title: 'Fam Care App', desc: 'Family healthcare management — health records, appointments, and family member profiles.', stack: ['Flutter', 'Firebase'], categories: ['Mobile'], github: 'https://github.com/lscblack/Famcare' },
  { title: 'Cholare La Lumière', desc: 'Mobile app for managing and enjoying Cholare La Lumière songs with audio playback.', stack: ['React Native', 'Expo', 'Firebase'], categories: ['Mobile', 'Open Source'], github: 'https://github.com/lscblack' },
  { title: 'Inventory Management System', desc: 'Full-stack inventory tracking with real-time stock updates, reporting, and user roles.', stack: ['React', 'Node.js', 'Express', 'MongoDB'], categories: ['Web'], github: 'https://github.com/lscblack' },
  { title: 'Youth Home Platform', desc: 'Publishing and monetisation platform for African writers and artists with integrated KPay.', stack: ['PHP', 'MySQL', 'Bootstrap'], categories: ['Web'], github: 'https://github.com/lscblack' },
  { title: 'OrganiChain', desc: 'Transparent organ donation system using Hyperledger Fabric and Go backend.', stack: ['Hyperledger Fabric', 'Go', 'TypeScript'], categories: ['Web', 'Security'], github: 'https://github.com/lscblack/OrganiChain' },
  { title: 'AfriTon Chatbot', desc: 'Conversational AI chatbot tailored for African languages and contexts using NLP.', stack: ['Python', 'NLP', 'Jupyter'], categories: ['AI / ML'], github: 'https://github.com/lscblack/AfriTon-chatbot' },
]

function fromApi(p: ApiProject): Project {
  return {
    title: p.title,
    desc: p.description ?? '',
    stack: p.technologies ?? [],
    categories: p.categories ?? [],
    github: p.github_url ?? undefined,
    live: p.live_url ?? undefined,
    contributed: p.contributed,
  }
}

const FILTERS = ['All', 'Web', 'Mobile', 'AI / ML', 'Security', 'Open Source']

export default function Projects() {
  const [filter, setFilter] = useState('All')
  const [ref, inView] = useScrollInView('-60px')
  const [otherProjects, setOtherProjects] = useState<Project[]>(DEFAULT_OTHER)
  const [apiLoaded, setApiLoaded] = useState(false)

  useEffect(() => {
    api.get('/projects/')
      .then(r => {
        const data: ApiProject[] = r.data
        if (data && data.length > 0) {
          const visible = data.filter(p => p.public).sort((a, b) => a.order - b.order)
          setOtherProjects(visible.map(fromApi))
          setApiLoaded(true)
        }
      })
      .catch(() => {/* use defaults */})
  }, [])

  const filtered = otherProjects.filter(p =>
    filter === 'All' || p.categories.includes(filter)
  )

  return (
    <section id="projects" className="py-12 sm:py-20">
      <div className="w-11/12 mx-auto">
        <div ref={ref} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <p className="section-label">{'< projects />'}</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Projects
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Production systems and open-source work.
            {apiLoaded && <span className="ml-2 text-[#1A56A4] text-[11px] font-mono-stack">↻ live from db</span>}
          </p>
        </motion.div>

        {/* ── Projects I Contributed On ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="mt-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#B8860B] mb-4">
              Projects I Contributed On
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CONTRIBUTED.map(p => (
                <div key={p.title} className="relative border-l-2 border-[#1A56A4] pl-5 py-1 group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-black text-gray-900 dark:text-white text-base leading-tight group-hover:text-[#1A56A4] transition-colors">
                        {p.title}
                      </h3>
                      {p.live && (
                        <a href={p.live} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-mono-stack text-[#1A56A4] hover:underline mt-0.5">
                          {p.live.replace('https://', '')} <ExternalLink size={10} />
                        </a>
                      )}
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{p.desc}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.stack.map(s => <span key={s} className="tag">{s}</span>)}
                      </div>
                    </div>
                  </div>
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noreferrer"
                      className="mt-3 inline-block text-xs text-gray-400 hover:text-[#1A56A4] transition-colors">
                      GitHub →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Other Work (from DB, fallback to defaults) ── */}
        <div className="mt-14">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Other Work
            </p>
            <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                      filter === f
                        ? 'bg-[#1A56A4] text-white border-[#1A56A4]'
                        : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-[#1A56A4] hover:text-[#1A56A4]'
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <AnimatePresence mode="popLayout">
              {filtered.map(p => (
                <motion.div key={p.title} layout
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }}>
                  <div className="py-4 grid sm:grid-cols-[1fr_auto] gap-3 items-start group hover:bg-gray-50 dark:hover:bg-gray-900/40 -mx-3 px-3 rounded-lg transition-colors">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-[#1A56A4] transition-colors">
                          {p.title}
                        </h3>
                        {p.categories.map(c => <span key={c} className="tag text-[10px]">{c}</span>)}
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{p.desc}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.stack.map(s => <span key={s} className="tag">{s}</span>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {p.live && (
                        <a href={p.live} target="_blank" rel="noreferrer"
                          className="text-[#1A56A4] hover:text-blue-700 transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {p.github && !p.live && (
                        <a href={p.github} target="_blank" rel="noreferrer"
                          className="text-gray-300 dark:text-gray-600 hover:text-[#1A56A4] transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  )
}
