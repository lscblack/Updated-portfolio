import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ExternalLink, GitBranch } from 'lucide-react'

type Project = {
  name: string
  desc: string
  stack: string[]
  color: string
  github?: string
  category: string
}

const PROJECTS: Project[] = [
  {
    name: 'Afriton Cross-Border Payment',
    desc: 'Revolutionizing cross-border payments in Africa — a secure, efficient, unified payment system reducing dependency on physical cash across borders.',
    stack: ['React', 'FastAPI', 'PostgreSQL', 'Blockchain'],
    color: '#22d3ee',
    category: 'FinTech',
    github: 'https://github.com/lscblack',
  },
  {
    name: 'Afiacare Health System',
    desc: 'Full health management system enabling patients to access medical information and track health metrics from any device.',
    stack: ['FastAPI', 'React', 'Vite.js', 'PostgreSQL'],
    color: '#6366f1',
    category: 'HealthTech',
    github: 'https://github.com/lscblack',
  },
  {
    name: 'EcoTrack Rwanda',
    desc: 'Smart Waste Management System supporting household users, waste collectors, and admins — optimizing waste collection with route mapping.',
    stack: ['React.js', 'Django', 'Tailwind CSS', 'Google Maps API'],
    color: '#4ade80',
    category: 'GreenTech',
    github: 'https://github.com/lscblack',
  },
  {
    name: 'Fam Care App',
    desc: 'Family Healthcare Management mobile app for tracking family health records, appointments, and medical history.',
    stack: ['Flutter', 'Firebase', 'Dart'],
    color: '#f59e0b',
    category: 'Mobile',
    github: 'https://github.com/lscblack/Famcare',
  },
  {
    name: 'OrganiChain',
    desc: 'Enterprise-grade prototype for a transparent organ donation system using Hyperledger Fabric and a Gin-based Go backend.',
    stack: ['Hyperledger Fabric', 'Go (Gin)', 'TypeScript', 'React'],
    color: '#8b5cf6',
    category: 'Blockchain',
    github: 'https://github.com/lscblack/OrganiChain',
  },
  {
    name: 'Safe Land Rwanda',
    desc: 'Secure land registry platform for transparent property ownership records, reducing land disputes across Rwanda.',
    stack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    color: '#22d3ee',
    category: 'GovTech',
    github: 'https://github.com/lscblack/Safe_Land_Rwanda',
  },
  {
    name: 'RwandaCropGuard',
    desc: 'Deep learning-powered crop disease classification from leaf images — helping Rwandan farmers protect their harvest.',
    stack: ['Python', 'TensorFlow', 'scikit-learn', 'Jupyter'],
    color: '#a78bfa',
    category: 'AgriTech / AI',
    github: 'https://github.com/lscblack',
  },
  {
    name: 'AfriTon Chatbot',
    desc: 'Conversational AI chatbot tailored for African languages and contexts, using NLP techniques.',
    stack: ['Python', 'NLP', 'Jupyter Notebook', 'TensorFlow'],
    color: '#6366f1',
    category: 'AI / NLP',
    github: 'https://github.com/lscblack/AfriTon-chatbot',
  },
  {
    name: 'Medical Insurance Cost Estimator',
    desc: 'Mobile application that uses ML to estimate annual medical expenditure for new insurance customers based on demographics and health factors.',
    stack: ['Flutter', 'Python', 'scikit-learn', 'FastAPI'],
    color: '#22d3ee',
    category: 'Mobile / ML',
    github: 'https://github.com/lscblack',
  },
  {
    name: 'Prov-Rwanda',
    desc: "Multiple-choice quiz app helping Rwandans practice for the driving theory test — includes resources, timers, and progress tracking.",
    stack: ['React.js', 'Tailwind CSS', 'Firebase'],
    color: '#f59e0b',
    category: 'EdTech',
    github: 'https://github.com/lscblack',
  },
  {
    name: 'Inventory Management System',
    desc: 'Efficient stock tracking and inventory management for small businesses with real-time alerts and reporting.',
    stack: ['React', 'Vite.js', 'Node.js', 'Express', 'MongoDB'],
    color: '#4ade80',
    category: 'Business',
    github: 'https://github.com/lscblack',
  },
  {
    name: 'Urban Sound Classifier',
    desc: 'Machine learning pipeline for classifying urban sounds (sirens, drilling, street music) with high accuracy using spectral features.',
    stack: ['Python', 'scikit-learn', 'Librosa', 'Jupyter'],
    color: '#8b5cf6',
    category: 'AI / Audio',
    github: 'https://github.com/lscblack/Urban_Voice_classifier',
  },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}
const card = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

export default function PersonalProjects() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const categories = ['All', ...Array.from(new Set(PROJECTS.map(p => p.category.split(' /')[0].trim())))]

  return (
    <section id="personal-projects" className="py-24 relative" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div className="section-divider" />
          <h2 className="text-3xl sm:text-4xl font-bold mt-2">
            Personal <span className="gradient-text">Projects</span>
          </h2>
          <p className="mt-3 text-slate-500 max-w-xl">
            Systems built outside of work — across health, finance, agriculture, education, and AI.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {PROJECTS.map(p => (
            <motion.div
              key={p.name}
              variants={card}
              className="glass project-card p-5 rounded-2xl flex flex-col gap-3"
              style={{ borderColor: `${p.color}15` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className="badge text-[10px] mb-2 block w-fit"
                    style={{ background: `${p.color}12`, border: `1px solid ${p.color}28`, color: p.color }}
                  >
                    {p.category}
                  </span>
                  <h3 className="font-semibold text-sm text-slate-200 leading-tight">{p.name}</h3>
                </div>
                {p.github && (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-slate-600 hover:text-indigo-400 transition-colors shrink-0"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>

              <p className="text-xs text-slate-500 leading-relaxed flex-1">{p.desc}</p>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                {p.stack.map(s => (
                  <span key={s} className="badge badge-indigo text-[10px]">{s}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center"
        >
          <a
            href="https://github.com/lscblack"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost inline-flex"
          >
            <GitBranch size={14} />
            See all 107+ repos on GitHub
          </a>
        </motion.div>
      </div>
    </section>
  )
}
