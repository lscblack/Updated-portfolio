import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, FileSignature, Handshake, FlaskConical, Send, CheckCircle2, AlertCircle, Loader2, RefreshCw, Sparkles, MoreHorizontal } from 'lucide-react'
import api, { errorMessage } from '../api/client'
import { useSite } from '../contexts/SiteContext'
import SectionHeader from './ui/SectionHeader'
import Reveal from './ui/Reveal'
import { ScrollCard } from './ui/ScrollFx'

const KINDS = [
  { key: 'job', label: 'Full-time role', icon: Briefcase },
  { key: 'contract', label: 'Contract', icon: FileSignature },
  { key: 'freelance', label: 'Freelance project', icon: Sparkles },
  { key: 'research', label: 'Research', icon: FlaskConical },
  { key: 'collaboration', label: 'Collaboration', icon: Handshake },
  { key: 'other', label: 'Something else', icon: MoreHorizontal },
]
const BUDGETS = ['Not sure yet', 'Under $1k', '$1k – $5k', '$5k – $20k', '$20k+', 'Salary (full-time)']
const TIMELINES = ['Flexible', 'ASAP', 'Within a month', '1 – 3 months', '3+ months']

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function Hire() {
  const { sectionTitle } = useSite()
  const t = sectionTitle('hire', { label: 'work with me', title: 'Have a role or a project in mind?', subtitle: 'Send an offer — a job, contract, research collaboration or freelance project.' })
  const [form, setForm] = useState({ kind: 'job', name: '', email: '', company: '', website: '', title: '', budget: BUDGETS[0], timeline: TIMELINES[0], message: '', honeypot: '' })
  const [captcha, setCaptcha] = useState<{ id: string; question: string } | null>(null)
  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const loadCaptcha = useCallback(async () => { try { const r = await api.get('/api/public/captcha'); setCaptcha(r.data); setAnswer('') } catch { setCaptcha(null) } }, [])
  useEffect(() => { loadCaptcha() }, [loadCaptcha])
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setStatus('sending'); setError('')
    try {
      await api.post('/api/public/offers', { ...form, captcha_id: captcha?.id ?? '', captcha_answer: answer })
      setStatus('success')
      setForm(f => ({ ...f, name: '', email: '', company: '', website: '', title: '', message: '' }))
      loadCaptcha()
    } catch (err) { setError(errorMessage(err, 'Could not send your offer.')); setStatus('error'); loadCaptcha() }
  }

  return (
    <section id="hire" className="section relative overflow-hidden">
      <div className="container-x">
        <SectionHeader label={t.label} title={t.title} subtitle={t.subtitle} align="center" className="mx-auto text-center" />
        <ScrollCard className="mt-12 max-w-4xl mx-auto">
          <form onSubmit={submit} className="card p-6 sm:p-8 space-y-7" noValidate>
            <div>
              <p className="label">What kind of offer is it?</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {KINDS.map(k => (
                  <button type="button" key={k.key} onClick={() => set('kind', k.key)} aria-pressed={form.kind === k.key}
                    className={`relative flex items-center gap-2.5 px-4 py-3 rounded-card-sm text-sm font-semibold text-left transition-colors border ${form.kind === k.key ? 'border-accent-ink/60 text-fg bg-accent/10' : 'border-transparent bg-surface-2/50 text-muted hover:text-fg'}`}>
                    {form.kind === k.key && <motion.span layoutId="kind-pill" className="absolute inset-0 rounded-card-sm border border-accent-ink/50" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                    <k.icon size={16} className={form.kind === k.key ? 'text-accent-ink' : ''} /><span className="relative">{k.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div><label className="label" htmlFor="h-name">Your name</label><input id="h-name" className="input" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" autoComplete="name" /></div>
              <div><label className="label" htmlFor="h-email">Email</label><input id="h-email" type="email" className="input" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@company.com" autoComplete="email" /></div>
              <div><label className="label" htmlFor="h-company">Company / organisation</label><input id="h-company" className="input" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Optional" autoComplete="organization" /></div>
              <div><label className="label" htmlFor="h-web">Website</label><input id="h-web" className="input" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://" /></div>
              <div className="sm:col-span-2"><label className="label" htmlFor="h-title">Title</label><input id="h-title" className="input" required minLength={3} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Senior backend engineer · Security audit · ML research" /></div>
              <div><label className="label" htmlFor="h-budget">Budget</label><select id="h-budget" className="input" value={form.budget} onChange={e => set('budget', e.target.value)}>{BUDGETS.map(b => <option key={b}>{b}</option>)}</select></div>
              <div><label className="label" htmlFor="h-time">Timeline</label><select id="h-time" className="input" value={form.timeline} onChange={e => set('timeline', e.target.value)}>{TIMELINES.map(b => <option key={b}>{b}</option>)}</select></div>
              <div className="sm:col-span-2"><label className="label" htmlFor="h-msg">Details</label><textarea id="h-msg" className="input" rows={5} required minLength={10} maxLength={6000} value={form.message} onChange={e => set('message', e.target.value)} placeholder="Scope, responsibilities, stack, location or anything that helps me understand the opportunity" /></div>
            </div>
            <div className="absolute -left-[9999px] top-0 opacity-0" aria-hidden="true"><label>Leave empty<input tabIndex={-1} autoComplete="off" value={form.honeypot} onChange={e => set('honeypot', e.target.value)} /></label></div>
            <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-end">
              <div>
                <label className="label" htmlFor="h-captcha">Quick check: what is <span className="text-accent-ink font-mono">{captcha?.question ?? '…'}</span>?</label>
                <div className="flex gap-2"><input id="h-captcha" className="input max-w-[140px]" required inputMode="numeric" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Answer" /><button type="button" onClick={loadCaptcha} className="btn btn-ghost btn-sm" aria-label="New question"><RefreshCw size={14} /></button></div>
              </div>
              <button type="submit" disabled={status === 'sending'} className="btn btn-primary w-full sm:w-auto">
                {status === 'sending' ? <Loader2 size={16} className="animate-spin" /> : status === 'success' ? <CheckCircle2 size={16} /> : <Send size={15} />}
                {status === 'sending' ? 'Sending' : status === 'success' ? 'Offer sent' : 'Send offer'}
              </button>
            </div>
            {status === 'success' && <Reveal><p className="text-sm text-emerald-500 flex items-center gap-2"><CheckCircle2 size={15} /> Received. A confirmation is on its way to your email and I will reply within a few days.</p></Reveal>}
            {status === 'error' && <p className="text-sm text-red-500 flex items-center gap-2"><AlertCircle size={15} /> {error}</p>}
            <p className="text-[0.7rem] text-muted">Offers are stored encrypted and only visible to me.</p>
          </form>
        </ScrollCard>
      </div>
    </section>
  )
}
