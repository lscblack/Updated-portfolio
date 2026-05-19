import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { useScrollInView } from '../hooks/useScrollInView'

const TIMELINE = [
  {
    period: '2020 – 2022',
    kind: 'diploma',
    title: 'A2 National Diploma',
    subtitle: 'Computer Science & Mathematics',
    org: 'Rwanda Education Board',
    location: 'Kigali, Rwanda',
    note: 'Advanced Level — top secondary qualification in Rwanda.',
    tags: ['C++', 'Python', 'Algorithms', 'Mathematics', 'Databases'],
    url: null,
    grade: null,
  },
  {
    period: '2023 – 2026',
    kind: 'degree',
    title: 'B.Sc. Software Engineering',
    subtitle: 'Machine Learning Specialisation',
    org: 'African Leadership University',
    location: 'Kigali, Rwanda',
    note: 'Expected May 2026. Coursework: Linux, Web Dev & Security, Databases, Algorithms, Mobile Dev, Machine Learning.',
    tags: ['Linux', 'Security', 'Databases', 'Algorithms', 'Mobile Dev', 'ML'],
    url: null,
    grade: null,
  },
]

const CERTS = [
  { title: 'Data Science Short Course', issuer: 'Stanford University (Prof. Jennifer Widom)', grade: null, url: 'https://drive.google.com/file/d/1KwNCV12SIs_1YLbxTr1XPv8uEDlAP_TZ/view?usp=sharing' },
  { title: 'Applied Unsupervised Learning in Python', issuer: 'University of Michigan', grade: '100%', url: 'https://drive.google.com/file/d/1FoE-09df7BoG2_qUINQgo8fcjKSwHLBk/view?usp=drive_link' },
  { title: 'Flutter & Dart: iOS, Android & Mobile Apps', issuer: 'IBM', grade: '100%', url: 'https://drive.google.com/file/d/16WenQo_bBnnxZHUc2zN4tYELxgib-iog/view?usp=drive_link' },
  { title: 'Getting Started with R', issuer: 'Coursera', grade: '100%', url: 'https://drive.google.com/file/d/19CS0P2JG-KsCkCZnvkDPjA_h3XZO2L2b/view?usp=sharing' },
  { title: 'Introduction to Academic Writing', issuer: 'O.P. Jindal Global University', grade: '100%', url: 'https://drive.google.com/file/d/1oBwwj2uTWI7YblQlvSiddDC4HxsY-P5O/view?usp=sharing' },
  { title: 'Computer Science (High School)', issuer: 'National Curriculum', grade: null, url: null },
]

export default function Education() {
  const [ref, inView] = useScrollInView()

  return (
    <section id="education" className="py-12 sm:py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="w-11/12 mx-auto">
        <div ref={ref} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <p className="section-label">{'{ education }'}</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Education &amp; Certifications
          </h2>
        </motion.div>

        <div className="mt-12 grid lg:grid-cols-[1fr_1px_1fr] gap-0">

          {/* ── Left: Academic qualifications ── */}
          <div className="pr-0 lg:pr-10">
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.1 }}
              className="text-[11px] font-bold uppercase tracking-widest text-[#1A56A4] mb-6"
            >
              Qualifications
            </motion.p>

            <div className="space-y-8">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                >
                  <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700 hover:border-[#1A56A4] transition-colors group">
                    {/* Dot */}
                    <div className="absolute -left-1.25 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#1A56A4] bg-white dark:bg-gray-950 group-hover:bg-[#1A56A4] transition-colors" />

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <span className="text-[11px] font-mono-stack text-gray-400 dark:text-gray-500">{item.period}</span>
                        <h3 className="mt-0.5 font-black text-gray-900 dark:text-white text-lg leading-tight">{item.title}</h3>
                        <p className="text-[#1A56A4] font-semibold text-sm mt-0.5">{item.subtitle}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.org} · {item.location}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{item.note}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {item.tags.map(t => <span key={t} className="tag">{t}</span>)}
                        </div>
                      </div>
                      {item.kind === 'degree' && (
                        <div className="shrink-0 text-right">
                          <span className="inline-block px-2 py-1 text-[10px] font-bold bg-[#1A56A4] text-white rounded">
                            In Progress
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block bg-gray-200 dark:bg-gray-700 w-px mx-0" />

          {/* ── Right: Certifications ── */}
          <div className="pl-0 lg:pl-10 mt-10 lg:mt-0">
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.15 }}
              className="text-[11px] font-bold uppercase tracking-widest text-[#1A56A4] mb-6"
            >
              Certifications &amp; Courses
            </motion.p>

            <div className="space-y-0 divide-y divide-gray-200 dark:divide-gray-700">
              {CERTS.map((cert, i) => (
                <motion.div
                  key={cert.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.2 + i * 0.07 }}
                >
                  <div className="py-4 flex items-start justify-between gap-3 group hover:bg-white dark:hover:bg-gray-800/40 transition-colors -mx-3 px-3 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight">{cert.title}</p>
                        {cert.grade && (
                          <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-black rounded bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                            {cert.grade}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cert.issuer}</p>
                    </div>
                    {cert.url ? (
                      <a href={cert.url} target="_blank" rel="noreferrer"
                        className="shrink-0 mt-0.5 text-gray-300 dark:text-gray-600 group-hover:text-[#1A56A4] dark:group-hover:text-[#4A90D9] transition-colors"
                        aria-label="View certificate">
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="shrink-0 mt-0.5 w-3.5" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
