import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Phone, Send, CheckCircle2, RefreshCw, AlertCircle, Loader2, ArrowUpRight } from 'lucide-react'
import api, { errorMessage } from '../api/client'
import { useSite } from '../contexts/SiteContext'
import SectionHeader from './ui/SectionHeader'
import Reveal from './ui/Reveal'
import { SocialIcon } from './ui/Brand'
import Magnetic from './ui/Magnetic'
import { VelocityMarquee } from './ui/ScrollFx'

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function Contact() {
  const { data, sectionTitle } = useSite()
  const a = data?.about
  const s = data?.settings
  const t = sectionTitle('contact', { label: 'contact', title: 'Let us build something', subtitle: '' })
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' })
  const [captcha, setCaptcha] = useState<{ id: string; question: string } | null>(null)
  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const loadCaptcha = useCallback(async () => {
    try { const r = await api.get('/api/public/captcha'); setCaptcha(r.data); setAnswer('') } catch { setCaptcha(null) }
  }, [])
  useEffect(() => { loadCaptcha() }, [loadCaptcha])

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending'); setError('')
    try {
      await api.post('/api/public/contact', { ...form, captcha_id: captcha?.id ?? '', captcha_answer: answer })
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '', website: '' })
      loadCaptcha()
      setTimeout(() => setStatus('idle'), 6000)
    } catch (err) {
      setError(errorMessage(err, 'Could not send your message.'))
      setStatus('error')
      loadCaptcha()
    }
  }

  return (
    <section id="contact" className="section relative overflow-hidden">
      <VelocityMarquee text={`${t.title}  ·  ${(a?.open_to ?? []).join("  ·  ") || "Open to opportunities"}`} className="-mt-6 mb-10 sm:mb-14" />
      <div className="container-x">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-20 items-start">
          <div>
            <SectionHeader label={t.label} title={t.title} subtitle={t.subtitle} />
            {s?.contact_intro && <Reveal delay={0.2}><p className="mt-6 text-muted leading-relaxed text-pretty">{s.contact_intro}</p></Reveal>}
            <Reveal delay={0.25}>
              <ul className="mt-8 space-y-3">
                {a?.email && <li><a href={`mailto:${a.email}`} className="group card card-hover p-4 flex items-center gap-4"><span className="w-10 h-10 rounded-full bg-surface-2 grid place-items-center text-accent-ink"><Mail size={16} /></span><span><span className="block text-xs text-muted">Email</span><span className="font-semibold text-fg group-hover:text-accent-ink transition-colors">{a.email}</span></span><ArrowUpRight size={14} className="ml-auto text-muted" /></a></li>}
                {a?.phone && <li><a href={`tel:${a.phone.replace(/\s/g, '')}`} className="group card card-hover p-4 flex items-center gap-4"><span className="w-10 h-10 rounded-full bg-surface-2 grid place-items-center text-accent-ink"><Phone size={16} /></span><span><span className="block text-xs text-muted">Phone</span><span className="font-semibold text-fg group-hover:text-accent-ink transition-colors">{a.phone}</span></span><ArrowUpRight size={14} className="ml-auto text-muted" /></a></li>}
                {a?.location && <li className="card p-4 flex items-center gap-4"><span className="w-10 h-10 rounded-full bg-surface-2 grid place-items-center text-accent-ink"><MapPin size={16} /></span><span><span className="block text-xs text-muted">Based in</span><span className="font-semibold text-fg">{a.location}</span></span></li>}
              </ul>
            </Reveal>
            {!!s?.social_links?.length && (
              <Reveal delay={0.3}>
                <div className="mt-6 flex flex-wrap gap-2">
                  {s.social_links.map(l => <a key={l.url} href={l.url} target={l.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="btn btn-outline btn-sm"><SocialIcon name={l.icon} size={14} /> {l.label}</a>)}
                </div>
              </Reveal>
            )}
          </div>

          <Reveal delay={0.15}>
            <form onSubmit={submit} className="card p-6 sm:p-8 space-y-5 relative overflow-hidden" noValidate>
              <div className="grid sm:grid-cols-2 gap-5">
                <div><label className="label" htmlFor="c-name">Name</label><input id="c-name" name="name" value={form.name} onChange={change} required minLength={2} maxLength={120} placeholder="Your name" className="input" autoComplete="name" /></div>
                <div><label className="label" htmlFor="c-email">Email</label><input id="c-email" name="email" type="email" value={form.email} onChange={change} required placeholder="you@example.com" className="input" autoComplete="email" /></div>
              </div>
              <div><label className="label" htmlFor="c-subject">Subject</label><input id="c-subject" name="subject" value={form.subject} onChange={change} required minLength={2} maxLength={200} placeholder="What is this about?" className="input" /></div>
              <div><label className="label" htmlFor="c-message">Message</label><textarea id="c-message" name="message" rows={5} value={form.message} onChange={change} required minLength={10} maxLength={5000} placeholder="Tell me about the project, role or idea" className="input" /></div>
              {/* honeypot */}
              <div className="absolute -left-[9999px] top-0 opacity-0" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={change} /></label></div>
              <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-end">
                <div>
                  <label className="label" htmlFor="c-captcha">Quick check: what is <span className="text-accent-ink font-mono">{captcha?.question ?? '…'}</span>?</label>
                  <div className="flex gap-2">
                    <input id="c-captcha" value={answer} onChange={e => setAnswer(e.target.value)} required inputMode="numeric" placeholder="Answer" className="input max-w-[140px]" />
                    <button type="button" onClick={loadCaptcha} aria-label="New question" className="btn btn-ghost btn-sm"><RefreshCw size={14} /></button>
                  </div>
                </div>
                <Magnetic strength={0.2}>
                  <button type="submit" disabled={status === 'sending'} className="btn btn-primary w-full sm:w-auto">
                    {status === 'sending' ? <Loader2 size={16} className="animate-spin" /> : status === 'success' ? <CheckCircle2 size={16} /> : <Send size={15} />}
                    {status === 'sending' ? 'Sending' : status === 'success' ? 'Sent' : 'Send message'}
                  </button>
                </Magnetic>
              </div>
              {status === 'success' && <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-emerald-500 flex items-center gap-2"><CheckCircle2 size={15} /> Thanks — your message is in my inbox. A receipt is on its way to your email.</motion.p>}
              {status === 'error' && <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-500 flex items-center gap-2"><AlertCircle size={15} /> {error}</motion.p>}
              <p className="text-[0.7rem] text-muted">Messages are encrypted at rest and never shared.</p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
