import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Briefcase, Star, Trash2, Search, Loader2, Reply, X, Check, Clock, XCircle, Send, Building2, Globe, Wallet, CalendarClock, Mail } from 'lucide-react'
import api, { errorMessage } from '../../api/client'
import type { Offer } from '../../lib/types'
import { Confirm, PageHeader, TextArea, Toggle } from './ui/Fields'
import { useToast } from './ui/Toast'

const STATUS: Record<Offer['status'], { label: string; cls: string; icon: React.ElementType }> = {
  new: { label: 'New', cls: 'bg-accent/15 text-accent-ink', icon: Briefcase },
  reviewing: { label: 'Reviewing', cls: 'bg-amber-500/15 text-amber-500', icon: Clock },
  accepted: { label: 'Accepted', cls: 'bg-emerald-500/15 text-emerald-500', icon: Check },
  declined: { label: 'Declined', cls: 'bg-red-500/15 text-red-500', icon: XCircle },
}
const KIND: Record<string, string> = { job: 'Full-time role', contract: 'Contract', freelance: 'Freelance', research: 'Research', collaboration: 'Collaboration', other: 'Other' }
function fmt(iso: string) { return new Date(iso + (iso.endsWith('Z') ? '' : 'Z')).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) }

export default function AdminOffers() {
  const { toast } = useToast()
  const [items, setItems] = useState<Offer[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | Offer['status']>('all')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<Offer | null>(null)
  const [notes, setNotes] = useState('')
  const [reply, setReply] = useState('')
  const [notify, setNotify] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState<Offer | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await api.get('/api/admin/offers', { params: { q, status: filter === 'all' ? undefined : filter, limit: 200 } }); setItems(r.data.items); setTotal(r.data.total) } catch (e) { toast(errorMessage(e), 'error') } finally { setLoading(false) }
  }, [q, filter, toast])
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t) }, [load])

  const patch = async (o: Offer, body: Record<string, unknown>) => {
    setBusy(true)
    try { const r = await api.patch(`/api/admin/offers/${o.id}`, body); setItems(x => x.map(i => i.id === o.id ? r.data : i)); if (sel?.id === o.id) setSel(r.data); return r.data as Offer } catch (e) { toast(errorMessage(e), 'error') } finally { setBusy(false) }
  }
  const open = (o: Offer) => { setSel(o); setNotes(o.notes || ''); setReply(''); if (!o.read) patch(o, { read: true }) }
  const setStatus = async (s: Offer['status']) => { if (!sel) return; await patch(sel, { status: s, notify, reply }); toast(`Marked as ${STATUS[s].label}${notify ? ' — the sender was emailed' : ''}`); setReply('') }
  const saveNotes = async () => { if (!sel) return; await patch(sel, { notes }); toast('Notes saved') }
  const remove = async (o: Offer) => { setConfirm(null); try { await api.delete(`/api/admin/offers/${o.id}`); setItems(x => x.filter(i => i.id !== o.id)); if (sel?.id === o.id) setSel(null); toast('Offer deleted') } catch (e) { toast(errorMessage(e), 'error') } }

  return (
    <div>
      <PageHeader title="Offers" description={`${total} offer${total === 1 ? '' : 's'} from the Hire me form. You were emailed for each one; the sender gets an email when you change the status.`} />
      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        <div className="card overflow-hidden">
          <div className="p-3 border-b border-line space-y-2">
            <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input className="input input-sm !pl-8" placeholder="Search name, company, title" value={q} onChange={e => setQ(e.target.value)} /></div>
            <div className="flex flex-wrap gap-1">{(['all', 'new', 'reviewing', 'accepted', 'declined'] as const).map(f => <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${filter === f ? 'bg-fg text-bg' : 'text-muted hover:text-fg'}`}>{f}</button>)}</div>
          </div>
          <div className="max-h-[calc(100vh-16rem)] overflow-y-auto divide-y divide-line">
            {loading ? <div className="p-6 text-sm text-muted flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading</div> : !items.length ? <div className="p-10 text-center text-muted text-sm"><Briefcase className="mx-auto mb-2" size={22} />No offers yet</div> :
              items.map(o => { const S = STATUS[o.status]; return (
                <button key={o.id} onClick={() => open(o)} className={`w-full text-left px-4 py-3 flex gap-3 ${sel?.id === o.id ? 'bg-accent/10' : 'hover:bg-surface-2'}`}>
                  <span className={`mt-0.5 w-8 h-8 rounded-full grid place-items-center shrink-0 ${S.cls}`}><S.icon size={14} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2"><span className={`text-sm truncate ${o.read ? 'text-fg' : 'font-bold text-fg'}`}>{o.title}</span>{o.starred && <Star size={12} className="fill-current shrink-0" style={{ color: 'var(--accent-2)' }} />}</span>
                    <span className="block text-xs text-muted truncate">{o.name}{o.company ? ` · ${o.company}` : ''} · {KIND[o.kind] ?? o.kind}</span>
                    <span className="block text-[0.68rem] text-muted mt-0.5">{fmt(o.created_at)}</span>
                  </span>
                </button>
              ) })}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {sel ? (
            <motion.article key={sel.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS[sel.status].cls}`}>{STATUS[sel.status].label}</span>
                  <h2 className="font-display font-bold text-xl text-fg mt-3">{sel.title}</h2>
                  <p className="text-sm text-muted mt-1">{KIND[sel.kind] ?? sel.kind} · from <span className="text-fg font-semibold">{sel.name}</span> · <a href={`mailto:${sel.email}`} className="text-accent-ink hover:underline">{sel.email}</a></p>
                  <p className="text-xs text-muted mt-1">{fmt(sel.created_at)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => patch(sel, { starred: !sel.starred })} className={`btn btn-ghost btn-sm ${sel.starred ? 'text-accent-ink' : ''}`} title="Star"><Star size={14} className={sel.starred ? 'fill-current' : ''} /></button>
                  <button onClick={() => setConfirm(sel)} className="btn btn-ghost btn-sm text-red-500" title="Delete"><Trash2 size={14} /></button>
                  <button onClick={() => setSel(null)} className="btn btn-ghost btn-sm" title="Close"><X size={14} /></button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                {[[Building2, 'Company', sel.company || '—'], [Globe, 'Website', sel.website || '—'], [Wallet, 'Budget', sel.budget || '—'], [CalendarClock, 'Timeline', sel.timeline || '—']].map(([I, l, v]) => { const Ic = I as React.ElementType; return (
                  <div key={String(l)} className="card p-3"><p className="text-[0.65rem] uppercase tracking-wider text-muted flex items-center gap-1.5"><Ic size={11} />{String(l)}</p><p className="mt-1 font-semibold text-fg truncate">{String(v).startsWith('http') ? <a href={String(v)} target="_blank" rel="noreferrer" className="text-accent-ink hover:underline">{String(v).replace(/^https?:\/\//, '')}</a> : String(v)}</p></div>
                ) })}
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-fg bg-surface-2/60 rounded-card p-5">{sel.message}</div>
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <p className="label">Update status</p>
                  <TextArea rows={3} value={reply} onChange={setReply} placeholder="Optional message included in the status email to the sender" />
                  <div className="mt-3"><Toggle checked={notify} onChange={setNotify} label="Email the sender about this change" /></div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button disabled={busy || sel.status === 'reviewing'} onClick={() => setStatus('reviewing')} className="btn btn-outline btn-sm"><Clock size={13} /> Reviewing</button>
                    <button disabled={busy || sel.status === 'accepted'} onClick={() => setStatus('accepted')} className="btn btn-primary btn-sm"><Check size={13} /> Accept</button>
                    <button disabled={busy || sel.status === 'declined'} onClick={() => setStatus('declined')} className="btn btn-danger btn-sm"><XCircle size={13} /> Decline</button>
                    <a href={`mailto:${sel.email}?subject=${encodeURIComponent('Re: ' + sel.title)}`} className="btn btn-ghost btn-sm"><Reply size={13} /> Reply by email</a>
                  </div>
                </div>
                <div>
                  <p className="label">Private notes</p>
                  <TextArea rows={5} value={notes} onChange={setNotes} placeholder="Only you can see these (encrypted)" />
                  <button onClick={saveNotes} disabled={busy} className="btn btn-outline btn-sm mt-3"><Send size={13} /> Save notes</button>
                </div>
              </div>
              {sel.user_agent && <p className="text-[0.65rem] text-muted font-mono truncate flex items-center gap-1.5" title={sel.user_agent}><Mail size={10} />{sel.user_agent}</p>}
            </motion.article>
          ) : (
            <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card border-dashed p-12 text-center text-muted text-sm">Select an offer to review it.</motion.div>
          )}
        </AnimatePresence>
      </div>
      <Confirm open={!!confirm} title="Delete this offer?" text="It will be removed permanently." onCancel={() => setConfirm(null)} onConfirm={() => confirm && remove(confirm)} />
    </div>
  )
}
