import { motion } from 'framer-motion'
import { Music, Music2, Zap, Activity, BookOpen, Users, Globe, Heart } from 'lucide-react'
import { useScrollInView } from '../hooks/useScrollInView'

const ITEMS = [
  { icon: Music,    label: 'Piano',            quote: 'Debugging in music — finding harmony in complexity, one key at a time.' },
  { icon: Music2,   label: 'Guitar',           quote: 'From classical fingerpicking to African rhythms. Improvisation outside of code.' },
  { icon: Zap,      label: 'Dancing',          quote: 'Movement is a universal language. Keeps me present, energised, connected to culture.' },
  { icon: Activity, label: 'Running',          quote: 'Early morning runs are where I process problems. Most engineering breakthroughs happen mid-run.' },
  { icon: BookOpen, label: 'Reading',          quote: 'Tech, philosophy, African literature. Reading is how I stay curious beyond my discipline.' },
  { icon: Users,    label: 'Mentoring Youth',  quote: 'Teaching web development to young Rwandans. Sharing knowledge multiplies impact.' },
  { icon: Globe,    label: 'Community',        quote: 'Building inclusive communities as Head RA — a skill I carry into every team.' },
  { icon: Heart,    label: 'Faith',            quote: 'Keeps me grounded, purposeful, and focused on work that genuinely serves others.' },
]

export default function Activities() {
  const [ref, inView] = useScrollInView()

  return (
    <section id="activities" className="py-12 sm:py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="w-11/12 mx-auto">
        <div ref={ref} />

        <div className="grid lg:grid-cols-[280px_1fr] gap-12 lg:gap-20 items-start">

          {/* Left — sticky label column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="lg:sticky lg:top-24">
              <p className="section-label">{'{ life_beyond_code }'}</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                Outside Work
              </h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Engineering is what I do — but not all I am. Here's what keeps me balanced, creative, and human.
              </p>

              {/* Count decorative */}
              <div className="mt-8 flex items-baseline gap-2">
                <span className="text-6xl font-black text-gray-100 dark:text-gray-800 leading-none select-none">
                  {ITEMS.length}
                </span>
                <span className="text-sm text-gray-400 dark:text-gray-500 font-mono-stack">interests</span>
              </div>
            </div>
          </motion.div>

          {/* Right — compact editorial list */}
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {ITEMS.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.08 + i * 0.06 }}
                >
                  <div className="py-5 flex items-start gap-5 group hover:bg-white dark:hover:bg-gray-800/30 transition-colors -mx-4 px-4 rounded-lg">
                    <div className="shrink-0 w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:border-[#1A56A4] group-hover:bg-[#1A56A4] transition-all">
                      <Icon size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{item.label}</p>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 italic leading-relaxed">
                        "{item.quote}"
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-mono-stack text-gray-200 dark:text-gray-700 pt-1 select-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
