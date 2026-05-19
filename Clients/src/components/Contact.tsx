import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, CheckCircle2, Send } from 'lucide-react'
import { useScrollInView } from '../hooks/useScrollInView'
import api from '../api/client'

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function Contact() {
  const [ref, inView] = useScrollInView()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      await api.post('/api/contact', form)
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setStatus('idle'), 5000)
    } catch {
      // Fallback: open mail client
      const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)
      window.open(`mailto:louesauveur18@gmail.com?subject=${encodeURIComponent(form.subject)}&body=${body}`)
      setStatus('idle')
    }
  }

  const inputCls = 'w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#1A56A4] transition-colors'

  return (
    <section id="contact" className="py-12 sm:py-20">
      <div className="w-11/12 mx-auto">
        <div ref={ref} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="section-label">{'{ let\'s_connect }'}</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Get in Touch
          </h2>
        </motion.div>

        <div className="mt-10 grid lg:grid-cols-2 gap-12">
          {/* Left — contact info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="space-y-4">
              {[
                { icon: <Mail size={18} />, label: 'Email', value: 'louesauveur18@gmail.com', href: 'mailto:louesauveur18@gmail.com' },
                { icon: <MapPin size={18} />, label: 'Location', value: 'Kigali, Rwanda', href: '#' },
              ].map(item => (
                <a key={item.label} href={item.href}
                  className="flex items-center gap-4 card p-4 rounded-lg hover:border-[#1A56A4] transition-colors group">
                  <div className="text-[#1A56A4]">{item.icon}</div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#1A56A4] transition-colors">
                      {item.value}
                    </p>
                  </div>
                </a>
              ))}

              <div className="card p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Open to</p>
                <div className="flex flex-wrap gap-1.5">
                  {['MSc Cybersecurity programmes', 'Research Collaborations', 'Engineering Roles'].map(t => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                {[
                  { icon: <GithubIcon />, href: 'https://github.com/lscblack', label: 'GitHub' },
                  { icon: <LinkedinIcon />, href: 'https://www.linkedin.com/in/christian-loue-sauveur/', label: 'LinkedIn' },
                  { icon: <Mail size={18} />, href: 'mailto:louesauveur18@gmail.com', label: 'Email' },
                ].map(({ icon, href, label }) => (
                  <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer" aria-label={label}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#1A56A4] dark:hover:text-[#4A90D9] transition-colors">
                    {icon}
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.16 }}
          >
            <form onSubmit={handleSubmit} className="card p-6 rounded-lg flex flex-col gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Name</label>
                  <input name="name" value={form.name} onChange={handleChange} required
                    placeholder="Your name" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    placeholder="your@email.com" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Subject</label>
                <input name="subject" value={form.subject} onChange={handleChange} required
                  placeholder="What's this about?" className={inputCls} />
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Message</label>
                <textarea name="message" value={form.message} onChange={handleChange} required
                  rows={5} placeholder="Your message..." className={`${inputCls} resize-none`} />
              </div>

              <button type="submit" disabled={status === 'sending'}
                className="btn-blue justify-center disabled:opacity-60">
                {status === 'sending' && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {status === 'success' && <CheckCircle2 size={16} />}
                {status === 'idle' && <Send size={15} />}
                {status === 'sending' ? 'Sending…' : status === 'success' ? 'Message sent!' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
