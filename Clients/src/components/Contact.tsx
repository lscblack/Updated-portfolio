import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Mail, GitBranch, Send, MapPin, CheckCircle2, Phone } from 'lucide-react'

const LINKS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'l.christian@alustudent.com',
    href: 'mailto:l.christian@alustudent.com',
    color: '#22d3ee',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+250 790 110 231',
    href: 'tel:+250790110231',
    color: '#4ade80',
  },
  {
    icon: GitBranch,
    label: 'GitHub',
    value: 'github.com/lscblack',
    href: 'https://github.com/lscblack',
    color: '#6366f1',
  },
  {
    icon: GitBranch,
    label: 'LinkedIn',
    value: 'linkedin.com/in/lscblack',
    href: 'https://www.linkedin.com/in/lscblack',
    color: '#0ea5e9',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Kigali, Rwanda',
    href: '#',
    color: '#a78bfa',
  },
]

export default function Contact() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const subject = encodeURIComponent(`Portfolio contact from ${form.name}`)
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)
    window.open(`mailto:l.christian@alustudent.com?subject=${subject}&body=${body}`)
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <section id="contact" className="py-24 relative" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div className="section-divider" />
          <h2 className="text-3xl sm:text-4xl font-bold mt-2">
            Get in <span className="gradient-text">Touch</span>
          </h2>
          <p className="mt-3 text-slate-500 max-w-lg">
            Open to engineering roles, research collaborations, consulting, and building ambitious systems together.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Links */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            {LINKS.map((l, i) => {
              const Icon = l.icon
              return (
                <motion.a
                  key={l.label}
                  href={l.href}
                  target={l.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="glass p-4 rounded-xl flex items-center gap-4 hover:scale-[1.02] transition-transform group"
                  style={{ borderColor: `${l.color}18` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${l.color}15`, border: `1px solid ${l.color}25` }}
                  >
                    <Icon size={16} style={{ color: l.color }} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">{l.label}</div>
                    <div className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors font-medium">
                      {l.value}
                    </div>
                  </div>
                </motion.a>
              )
            })}

            {/* References note */}
            <div className="glass p-4 rounded-xl mt-2">
              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="text-slate-400 font-medium">References available:</span>{' '}
                Ag. Chief Digital Officer (Ministry of Environment) · CTO at RISA · Head of Land Administration (NLA) · CEO at Nexventures Ltd
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <form onSubmit={handleSubmit} className="glass p-6 rounded-2xl flex flex-col gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="What would you like to discuss?"
                  className="w-full px-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                />
              </div>

              <button type="submit" className="btn-primary justify-center">
                {sent ? (
                  <>
                    <CheckCircle2 size={15} className="text-green-400" />
                    Opening mail client…
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
