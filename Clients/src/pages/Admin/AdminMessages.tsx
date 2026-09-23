import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Inbox, Mail, MailOpen, Star, Trash2, Search, Loader2, Reply, X } from 'lucide-react'
import api, { errorMessage } from '../../api/client'
import type { ContactMessage } from '../../lib/types'
import { Confirm, PageHeader } from './ui/Fields'
import { useToast } from './ui/Toast'

function fmt(iso: string) { return new Date(iso + (iso.endsWith('Z') ? '' : 'Z')).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) }

export default function AdminMessages() {
  const { toast } = useToast()
  const [items, setItems] = useState<ContactMessage[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<ContactMessage | null>(null)
  const [confirm, setConfirm] = useState<ContactMessage | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/api/admin/messages', { params: { q, unread: filter === 'unread' ? true : undefined, limit: 200 } })
      const list: ContactMessage[] = filter === 'starred' ? r.data.items.filter((m: ContactMessage) => m.starred) : r.data.items
      setItems(list); setTotal(r.data.total)
    } catch (e) { toast(errorMessage(e), 'error') } finally { setLoading(false) }
  }, [q, filter, toast])
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t) }, [load])

  const patch = async (m: ContactMessage, body: Partial<ContactMessage>) => {
    try { const r = await api.patch(`/api/admin/messages/${m.id}`, body); setItems(x => x.map(i => i.id === m.id ? r.data : i)); if (sel?.id === m.id) setSel(r.data) } catch (e) { toast(errorMessage(e), 'error') }
  }
  const open = (m: ContactMessage) => { setSel(m); if (!m.read) patch(m, { read: true }) }
  const remove = async (m: ContactMessage) => {
    setConfirm(null)
    try { await api.delete(`/api/admin/messages/${m.id}`); setItems(x => x.filter(i => i.id !== m.id)); if (sel?.id === m.id) setSel(null); toast('Message deleted') } catch (e) { toast(errorMessage(e), 'error') }
  }

  return (
    <div>
      <PageHeader title="Inbox" description={`${total} message${total === 1 ? '' : 's'} from the contact form. Stored encrypted; decrypted only here.`} />
      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        <div className="card overflow-hidden">
          <div className="p-3 border-b border-line space-y-2">
            <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input className="input input-sm !pl-8" placeholder="Search name, email, subject" value={q} onChange={e => setQ(e.target.value)} /></div>
            <div className="flex gap-1">{(['all', 'unread', 'starred'] as const).map(f => <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${filter === f ? 'bg-fg text-bg' : 'text-muted hover:text-fg'}`}>{f}</button>)}</div>
          </div>
          <div className="max-h-[calc(100vh-16rem)] overflow-y-auto divide-y divide-line">
            {loading ? <div className="p-6 text-sm text-muted flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading</div> : !items.length ? <div className="p-10 text-center text-muted text-sm"><Inbox className="mx-auto mb-2" size={22} />No messages</div> :
              items.map(m => (
                <button key={m.id} onClick={() => open(m)} className={`w-full text-left px-4 py-3 flex gap-3 ${sel?.id === m.id ? 'bg-accent/10' : 'hover:bg-surface-2'}`}>
                  <span className={`mt-1 shrink-0 ${m.read ? 'text-muted' : 'text-accent-ink'}`}>{m.read ? <MailOpen size={15} /> : <Mail size={15} />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2"><span className={`text-sm truncate ${m.read ? 'text-fg' : 'font-bold text-fg'}`}>{m.name}</span>{m.starred && <Star size={12} className="text-accent-2 fill-current shrink-0" style={{ color: 'var(--accent-2)' }} />}</span>
                    <span className="block text-xs text-fg/80 truncate">{m.subject}</span>
                    <span className="block text-[0.68rem] text-muted mt-0.5">{fmt(m.created_at)}</span>
                  </span>
                </button>
              ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {sel ? (
            <motion.article key={sel.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-xl text-fg">{sel.subject}</h2>
                  <p className="text-sm text-muted mt-1">From <span className="text-fg font-semibold">{sel.name}</span> · <a href={`mailto:${sel.email}`} className="text-accent-ink hover:underline">{sel.email}</a></p>
                  <p className="text-xs text-muted mt-1">{fmt(sel.created_at)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => patch(sel, { starred: !sel.starred })} className={`btn btn-ghost btn-sm ${sel.starred ? 'text-accent-ink' : ''}`} title="Star"><Star size={14} className={sel.starred ? 'fill-current' : ''} /></button>
                  <button onClick={() => patch(sel, { read: !sel.read })} className="btn btn-ghost btn-sm" title={sel.read ? 'Mark unread' : 'Mark read'}>{sel.read ? <Mail size={14} /> : <MailOpen size={14} />}</button>
                  <button onClick={() => setConfirm(sel)} className="btn btn-ghost btn-sm text-red-500" title="Delete"><Trash2 size={14} /></button>
                  <button onClick={() => setSel(null)} className="btn btn-ghost btn-sm" title="Close"><X size={14} /></button>
                </div>
              </div>
              <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-fg bg-surface-2/60 rounded-card p-5 border border-line">{sel.message}</div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <a href={`mailto:${sel.email}?subject=${encodeURIComponent('Re: ' + sel.subject)}`} className="btn btn-primary btn-sm"><Reply size={14} /> Reply by email</a>
                {sel.user_agent && <p className="text-[0.65rem] text-muted font-mono truncate max-w-md" title={sel.user_agent}>{sel.user_agent}</p>}
              </div>
            </motion.article>
          ) : (
            <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card border-dashed p-12 text-center text-muted text-sm">Select a message to read it.</motion.div>
          )}
        </AnimatePresence>
      </div>
      <Confirm open={!!confirm} title="Delete this message?" text="It will be removed permanently." onCancel={() => setConfirm(null)} onConfirm={() => confirm && remove(confirm)} />
    </div>
  )
}
