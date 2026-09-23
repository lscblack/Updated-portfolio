import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Bell, Briefcase, Inbox, Info, CheckCheck } from 'lucide-react'
import api from '../../../api/client'
import { timeAgo } from '../../../lib/dates'
import type { Notification } from '../../../lib/types'

const ICON: Record<string, React.ElementType> = { offer: Briefcase, message: Inbox }

/** Dashboard bell: polls for new offers/messages, shows a dropdown and fires a browser notification when allowed. */
export default function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const lastSeen = useRef<number>(0)

  const load = useCallback(async () => {
    try {
      const r = await api.get('/api/admin/notifications', { params: { limit: 20 } })
      const list: Notification[] = r.data.items
      setItems(list); setUnread(r.data.unread)
      const newest = list[0]?.id ?? 0
      if (lastSeen.current && newest > lastSeen.current && typeof Notification !== 'undefined' && window.Notification?.permission === 'granted') {
        const n = list[0]; new window.Notification(n.title, { body: n.body, tag: `lsc-${n.id}` })
      }
      lastSeen.current = newest
    } catch { /* offline */ }
  }, [])
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t) }, [load])
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc); return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const markAll = async () => { await api.post('/api/admin/notifications/read', {}); setItems(x => x.map(i => ({ ...i, read: true }))); setUnread(0) }
  const markOne = async (n: Notification) => { if (!n.read) { await api.post('/api/admin/notifications/read', { ids: [n.id] }); setItems(x => x.map(i => i.id === n.id ? { ...i, read: true } : i)); setUnread(u => Math.max(0, u - 1)) } setOpen(false) }
  const askPermission = () => { if (window.Notification && window.Notification.permission === 'default') window.Notification.requestPermission() }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => { setOpen(o => !o); askPermission() }} className="relative w-9 h-9 rounded-full grid place-items-center text-muted hover:bg-surface-2" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
        <Bell size={17} />
        {unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-fg text-[0.62rem] font-bold grid place-items-center">{unread > 99 ? '99+' : unread}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.98 }} transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-[min(92vw,380px)] card glass shadow-2xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-line flex items-center justify-between">
              <p className="text-sm font-bold text-fg">Notifications</p>
              {unread > 0 && <button onClick={markAll} className="text-xs text-accent-ink hover:underline inline-flex items-center gap-1"><CheckCheck size={12} /> Mark all read</button>}
            </div>
            <ul className="max-h-96 overflow-y-auto divide-y divide-line">
              {!items.length && <li className="p-6 text-sm text-muted text-center">Nothing yet — new offers and messages show up here.</li>}
              {items.map(n => { const I = ICON[n.kind] ?? Info; return (
                <li key={n.id}>
                  <Link to={n.link || '/admin'} onClick={() => markOne(n)} className={`flex gap-3 px-4 py-3 hover:bg-surface-2 ${n.read ? '' : 'bg-accent/5'}`}>
                    <span className={`mt-0.5 w-8 h-8 rounded-full grid place-items-center shrink-0 ${n.read ? 'bg-surface-2 text-muted' : 'bg-accent text-accent-fg'}`}><I size={14} /></span>
                    <span className="min-w-0 flex-1"><span className={`block text-sm truncate ${n.read ? 'text-fg' : 'font-bold text-fg'}`}>{n.title}</span>{n.body && <span className="block text-xs text-muted truncate">{n.body}</span>}<span className="block text-[0.65rem] text-muted mt-0.5">{timeAgo(n.created_at)}</span></span>
                  </Link>
                </li>
              ) })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
