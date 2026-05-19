import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useScrollInView } from '../hooks/useScrollInView'
import { GithubIcon, LinkedinIcon } from './Hero'
import { Mail, Phone } from 'lucide-react'
import api from '../api/client'

type AboutData = {
  name: string; role: string; tagline: string
  bio_para1: string; bio_para2: string; quote: string
  email: string; phone: string; github: string; linkedin: string
  location: string; avatar_url: string; open_to: string
}

const DEFAULTS: AboutData = {
  name: 'Loue Sauveur Christian',
  role: 'Senior Software Engineer',
  tagline: "Building systems that protect people, not just data.",
  bio_para1: "I'm a software engineer with 3+ years building production systems across Rwanda's government, fintech, and health sectors. I've encrypted national land registry data protecting millions of citizens, integrated AI models into mobile health apps, and shipped payment infrastructure across borders — always with security designed in, not bolted on.",
  bio_para2: "Currently completing my B.Sc. Software Engineering (ML Specialisation) at the African Leadership University while holding three parallel roles. Applying for MSc Cybersecurity — driven by the conviction that defending digital infrastructure is the next frontier for Africa.",
  quote: "I believe Africa's digital future needs engineers who build things that are not only functional, but secure and trusted.",
  email: 'louesauveur18@gmail.com',
  phone: '+250 790 110 231',
  github: 'https://github.com/lscblack',
  linkedin: 'https://www.linkedin.com/in/christian-loue-sauveur/',
  location: 'Kigali, Rwanda',
  avatar_url: 'https://avatars.githubusercontent.com/u/141139366?v=4',
  open_to: 'MSc Cybersecurity programmes, Research Collaborations, Engineering Roles',
}

const CURRENTLY = [
  { role: 'Senior Software Engineer', org: 'Nexventures Ltd', dot: 'bg-green-500' },
  { role: 'Software Engineer Intern', org: 'National Land Authority', dot: 'bg-blue-500' },
  { role: 'Head Residential Advisor', org: 'African Leadership University', dot: 'bg-violet-500' },
]

export default function About() {
  const [ref, inView] = useScrollInView()
  const [data, setData] = useState<AboutData>(DEFAULTS)

  useEffect(() => {
    api.get('/api/about')
      .then(r => setData({ ...DEFAULTS, ...r.data }))
      .catch(() => {/* use defaults silently */})
  }, [])

  const openToList = data.open_to.split(',').map(s => s.trim()).filter(Boolean)

  return (
    <section id="about" className="py-12 sm:py-20">
      <div className="w-11/12 mx-auto">
        <div ref={ref} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <p className="section-label">{'{ about_me }'}</p>
          <h2 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.05] max-w-4xl">
            {data.tagline.includes('protect') ? (
              <>
                Building systems that
                <span className="text-[#1A56A4]"> protect people</span>,<br className="hidden sm:block" />
                {' '}not just data.
              </>
            ) : data.tagline}
          </h2>
        </motion.div>

        <div className="mt-12 grid lg:grid-cols-[1px_1fr_1fr] gap-0 lg:gap-10">
          <div className="hidden lg:block bg-gray-200 dark:bg-gray-800" />

          {/* Left: photo + currently + contact */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.12 }}>
            <div className="flex flex-col gap-6">
              <div className="relative w-fit">
                <img src={data.avatar_url} alt={data.name}
                  className="w-40 h-40 rounded-xl object-cover border-2 border-[#1A56A4]" loading="lazy" />
                <span className="absolute -bottom-2 -right-2 px-2 py-0.5 text-[10px] font-bold bg-[#1A56A4] text-white rounded font-mono-stack">
                  {data.location.split(',')[0]} 🇷🇼
                </span>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Currently</p>
                <div className="space-y-3">
                  {CURRENTLY.map(c => (
                    <div key={c.org} className="flex items-start gap-3">
                      <span className={`w-2 h-2 rounded-full ${c.dot} shrink-0 mt-1.5`} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">{c.role}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{c.org}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Contact</p>
                <div className="space-y-2">
                  {[
                    { icon: <Mail size={14} />, value: data.email, href: `mailto:${data.email}` },
                    { icon: <Phone size={14} />, value: data.phone, href: `tel:${data.phone.replace(/\s/g, '')}` },
                    { icon: <GithubIcon size={14} />, value: data.github.replace('https://', ''), href: data.github },
                    { icon: <LinkedinIcon size={14} />, value: data.linkedin.split('/in/')[1]?.replace('/', '') ?? 'LinkedIn', href: data.linkedin },
                  ].map(item => (
                    <a key={item.href} href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel="noreferrer"
                      className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400 hover:text-[#1A56A4] dark:hover:text-[#4A90D9] transition-colors">
                      <span className="text-[#1A56A4] shrink-0">{item.icon}</span>
                      {item.value}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: bio + stats + open-to */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.22 }}>
            <div className="mt-8 lg:mt-0 space-y-5 text-gray-600 dark:text-gray-400 leading-relaxed">
              <blockquote className="border-l-2 border-[#1A56A4] pl-4 text-base font-medium text-gray-800 dark:text-gray-200 italic leading-relaxed">
                "{data.quote}"
              </blockquote>
              <p>{data.bio_para1}</p>
              <p>{data.bio_para2}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                {[
                  { value: '3+', label: 'Years' }, { value: '15+', label: 'Systems' },
                  { value: '4', label: 'Gov platforms' }, { value: '107+', label: 'GitHub repos' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-2xl font-black text-[#1A56A4]">{s.value}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {openToList.length > 0 && (
                <div className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <span className="w-2 h-2 rounded-full bg-[#B8860B] shrink-0 mt-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Open to: </span>
                    {openToList.join(' · ')}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
