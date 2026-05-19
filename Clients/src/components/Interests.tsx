import { motion } from 'framer-motion'
import { useScrollInView } from '../hooks/useScrollInView'

const CATEGORIES = [
  {
    num: '01',
    title: 'Cybersecurity & Secure Systems',
    items: ['Application & API security', 'Cryptographic protocols and TLS internals', 'Zero Trust architecture', 'AI security & adversarial ML', 'Cybersecurity in African digital infrastructure'],
  },
  {
    num: '02',
    title: 'Artificial Intelligence',
    items: ['Deep learning for agricultural & health applications', 'Privacy-preserving ML — federated learning, differential privacy', 'NLP in African languages', 'AI safety & responsible deployment'],
  },
  {
    num: '03',
    title: 'Software Architecture',
    items: ['Distributed systems & microservices', 'Event-driven architecture', 'High-availability infrastructure design', 'Open-source software & developer tooling'],
  },
  {
    num: '04',
    title: 'African Tech Ecosystem',
    items: ['Trusted digital infrastructure across Africa', 'Fintech innovation & cross-border payments', 'AgriTech & climate tech for the continent', 'Digital policy & data sovereignty'],
  },
  {
    num: '05',
    title: 'Research Interests',
    items: ['Secure software development methodologies', 'Threat modelling & formal security analysis', 'Human factors in cybersecurity', 'IoT device security'],
  },
  {
    num: '06',
    title: 'Creative & Cultural',
    items: ['African music theory & composition', 'Technology × African culture', 'Literature from the African continent', 'Community-led technology education'],
  },
]

export default function Interests() {
  const [ref, inView] = useScrollInView()

  return (
    <section id="interests" className="py-12 sm:py-20">
      <div className="w-11/12 mx-auto">
        <div ref={ref} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <p className="section-label">{'< interests />'}</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            What I Think About
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-lg">
            The domains I read, research, and build toward — beyond the day-to-day ticket queue.
          </p>
        </motion.div>

        {/* Numbered editorial grid */}
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y divide-gray-100 dark:divide-gray-800 sm:divide-y-0">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.num}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.07 }}
            >
              <div className="p-6 border border-gray-100 dark:border-gray-800 hover:border-[#1A56A4] dark:hover:border-[#1A56A4] transition-colors group h-full">
                {/* Number */}
                <span className="font-mono-stack text-[11px] font-bold text-[#B8860B] tracking-widest">
                  {cat.num}
                </span>

                {/* Title */}
                <h3 className="mt-2 font-black text-gray-900 dark:text-white text-base leading-tight group-hover:text-[#1A56A4] dark:group-hover:text-[#4A90D9] transition-colors">
                  {cat.title}
                </h3>

                {/* Divider */}
                <div className="mt-3 mb-4 w-8 h-px bg-[#1A56A4] opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Items */}
                <ul className="space-y-1.5">
                  {cat.items.map(item => (
                    <li key={item} className="text-xs text-gray-500 dark:text-gray-400 flex gap-2 leading-relaxed">
                      <span className="text-[#B8860B] shrink-0">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
