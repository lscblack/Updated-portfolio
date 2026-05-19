import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useScrollInView } from '../hooks/useScrollInView'
import api from '../api/client'

type Job = {
  id?: number
  num: string; title: string; company: string; location: string
  period: string; job_type: string; bullets: string[]; tags: string[]
  order: number; visible: boolean
}

const DEFAULT_JOBS: Job[] = [
  { num: '01', title: 'Senior Software Engineer', period: 'May 2025 – Present', company: 'Nexventures Ltd', location: 'Kigali, Rwanda', job_type: 'Full-time', bullets: ['Led web and mobile app development using FastAPI, PostgreSQL, React, and Flutter', 'Designed secure RESTful APIs with JWT auth, input validation, and rate limiting', 'Integrated AI/ML models into production pipelines; evaluated adversarial robustness', 'Implemented CI/CD pipelines with security gates and automated testing', 'Contributed to IoT embedded systems (Arduino) with device auth considerations', 'Mentored junior engineers on secure coding practices and OWASP Top 10'], tags: ['FastAPI', 'React', 'Flutter', 'PostgreSQL', 'Docker', 'AI/ML', 'IoT'], order: 0, visible: true },
  { num: '02', title: 'Software Engineer Intern', period: 'Mar 2024 – Apr 2026', company: 'National Land Authority (NLA)', location: 'Kigali, Rwanda', job_type: 'Internship · amakuru.lands.rw', bullets: ['Architected end-to-end TLS encryption protecting sensitive citizen land data nationwide', 'Integrated Google Authenticator (TOTP-based MFA) for all administrative users', 'Built responsive React.js + Redux Toolkit frontend for cross-device compatibility', 'Hardened Linux server environment applying principle of least privilege', 'Configured horizontal scaling to handle high-concurrency public traffic', 'Deployed system live at amakuru.lands.rw — accessible nationwide'], tags: ['React', 'Redux', 'Linux', 'MFA', 'TLS', 'Security', 'Government'], order: 1, visible: true },
  { num: '03', title: 'Head Residential Advisor', period: 'Jan 2024 – May 2026', company: 'African Leadership University', location: 'Kigali, Rwanda', job_type: 'Leadership', bullets: ['Managed sensitive student data with strict institutional data protection compliance', 'Led crisis management and conflict resolution across a large residential community', 'Developed and ran leadership programs and student welfare initiatives'], tags: ['Leadership', 'Data Privacy', 'Crisis Management'], order: 2, visible: true },
  { num: '04', title: 'MERN & MySQL Trainer', period: 'Apr – May 2025', company: 'Church of God TTS – School of Development', location: 'Kigali, Rwanda', job_type: 'Contract', bullets: ['Delivered MERN stack training with secure coding best practices to S6 students', 'Covered environment variables, input sanitisation, and SQL injection prevention'], tags: ['Teaching', 'MERN', 'Secure Coding'], order: 3, visible: true },
  { num: '05', title: 'Website Development Coach', period: 'Jan – May 2023', company: 'CODEJIKA', location: 'Kigali, Rwanda', job_type: 'Part-time', bullets: ['Delivered hands-on web development instruction in HTML, CSS, PHP, and MySQL', "Developed training sessions improving learners' understanding of web fundamentals"], tags: ['Coaching', 'HTML', 'CSS', 'PHP'], order: 4, visible: true },
  { num: '06', title: 'Full-Stack Developer', period: 'Nov 2022 – Nov 2023', company: 'Grobal Growth Company', location: 'Kigali, Rwanda', job_type: 'Full-time', bullets: ['Built Youth Home — publishing and monetisation platform for African creators', 'Integrated KPay with secure PCI-compliant transaction flows', 'Developed Android WebView app in Java, published to Google Play Store'], tags: ['PHP', 'MySQL', 'Android', 'Java', 'Payments'], order: 5, visible: true },
]

export default function Experience() {
  const [expanded, setExpanded] = useState<number | null>(0)
  const [ref, inView] = useScrollInView()
  const [jobs, setJobs] = useState<Job[]>(DEFAULT_JOBS)

  useEffect(() => {
    api.get('/api/experience')
      .then(r => {
        const data: Job[] = r.data
        if (data && data.length > 0) {
          setJobs(data.filter(j => j.visible !== false).sort((a, b) => a.order - b.order))
        }
      })
      .catch(() => {/* use defaults */})
  }, [])

  return (
    <section id="experience" className="py-12 sm:py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="w-11/12 mx-auto">
        <div ref={ref} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <p className="section-label">{'{ experience }'}</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Work Experience
          </h2>
        </motion.div>

        <div className="mt-12 space-y-0 divide-y divide-gray-200 dark:divide-gray-800">
          {jobs.map((job, i) => {
            const isOpen = expanded === i
            return (
              <motion.div key={job.id ?? job.num + job.company}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: i * 0.07 }}>

                <button onClick={() => setExpanded(isOpen ? null : i)}
                  className="w-full text-left py-6 grid grid-cols-[48px_1fr_auto] sm:grid-cols-[48px_1fr_200px_80px] gap-4 items-start group">
                  <span className="font-mono-stack text-xs text-gray-300 dark:text-gray-600 font-bold pt-1 group-hover:text-[#1A56A4] transition-colors">
                    {job.num}
                  </span>
                  <div>
                    <p className="font-black text-gray-900 dark:text-white text-base sm:text-lg leading-tight group-hover:text-[#1A56A4] transition-colors">
                      {job.company}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{job.title}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-mono-stack mt-1">{job.job_type}</p>
                  </div>
                  <span className="hidden sm:block text-sm text-gray-400 dark:text-gray-500 text-right pt-1 leading-tight">{job.location}</span>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-mono-stack leading-tight block">{job.period}</span>
                    <span className="mt-2 inline-block text-[#1A56A4] text-lg leading-none">{isOpen ? '−' : '+'}</span>
                  </div>
                </button>

                {isOpen && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                    <div className="pb-8 pl-14 sm:pl-16 grid lg:grid-cols-[1fr_auto] gap-6">
                      <ul className="space-y-2">
                        {(job.bullets ?? []).map(b => (
                          <li key={b} className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span className="text-[#1A56A4] shrink-0 mt-0.5 font-bold">›</span>{b}
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap lg:flex-col gap-1.5 lg:items-end lg:self-start">
                        {(job.tags ?? []).map(t => <span key={t} className="tag">{t}</span>)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
