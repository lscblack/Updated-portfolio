import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Save, Eye, EyeOff, LogOut, ShieldCheck, KeyRound, History } from 'lucide-react'
import api, { errorMessage } from '../../api/client'
import { useAuth, type AdminInfo } from '../../contexts/AuthContext'
import type { AuditEntry } from '../../lib/types'
import { Card, Field, PageHeader, TextInput } from './ui/Fields'
import { useToast } from './ui/Toast'

function fmt(iso: string) { return new Date(iso + (iso.endsWith('Z') ? '' : 'Z')).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) }

export default function AdminSettings() {
  const { admin, logout, setSession } = useAuth()
  const { toast } = useToast()
  const nav = useNavigate()
  const [form, setForm] = useState({ current_password: '', new_name: '', new_email: '', new_password: '', confirm: '' })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [audit, setAudit] = useState<AuditEntry[]>([])

  useEffect(() => { api.get('/api/admin/audit', { params: { limit: 60 } }).then(r => setAudit(r.data)).catch(() => {}) }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.new_password && form.new_password !== form.confirm) { toast('New passwords do not match', 'error'); return }
    if (!form.new_name && !form.new_email && !form.new_password) { toast('Nothing to change', 'error'); return }
    setBusy(true)
    try {
      const r = await api.patch('/api/admin/auth/credentials', { current_password: form.current_password, new_name: form.new_name || undefined, new_email: form.new_email || undefined, new_password: form.new_password || undefined })
      setSession(r.data.access_token, r.data.admin as AdminInfo)
      setForm({ current_password: '', new_name: '', new_email: '', new_password: '', confirm: '' })
      toast(form.new_password ? 'Password changed — other sessions were signed out' : 'Account updated')
    } catch (err) { toast(errorMessage(err), 'error') } finally { setBusy(false) }
  }

  return (
    <div>
      <PageHeader title="Security" description="Your administrator account and the audit trail." />
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6 items-start">
        <div className="space-y-6">
          <Card title="Account" description={`Signed in as ${admin?.email}${admin?.last_login_at ? ` · last sign-in ${fmt(admin.last_login_at)}` : ''}`}>
            <form onSubmit={submit} className="space-y-4">
              <Field label="Current password" hint="Required for any change">
                <div className="relative"><TextInput type={show ? 'text' : 'password'} autoComplete="current-password" required value={form.current_password} onChange={v => setForm(f => ({ ...f, current_password: v }))} /><button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">{show ? <EyeOff size={14} /> : <Eye size={14} />}</button></div>
              </Field>
              <div className="divider" />
              <Field label="Display name"><TextInput value={form.new_name} onChange={v => setForm(f => ({ ...f, new_name: v }))} placeholder={admin?.name} /></Field>
              <Field label="Email" hint="One-time codes are sent here"><TextInput type="email" value={form.new_email} onChange={v => setForm(f => ({ ...f, new_email: v }))} placeholder={admin?.email} /></Field>
              <Field label="New password" hint="10+ characters with three of: lowercase, uppercase, digits, symbols"><TextInput type="password" autoComplete="new-password" value={form.new_password} onChange={v => setForm(f => ({ ...f, new_password: v }))} /></Field>
              {form.new_password && <Field label="Confirm new password"><TextInput type="password" autoComplete="new-password" value={form.confirm} onChange={v => setForm(f => ({ ...f, confirm: v }))} /></Field>}
              <button type="submit" disabled={busy} className="btn btn-primary btn-sm">{busy ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Update account</button>
            </form>
          </Card>
          <Card title="Sessions">
            <div className="flex flex-wrap gap-2">
              <button onClick={async () => { await logout(); nav('/admin/login', { replace: true }) }} className="btn btn-outline btn-sm"><LogOut size={13} /> Sign out here</button>
              <button onClick={async () => { await logout(true); nav('/admin/login', { replace: true }) }} className="btn btn-danger btn-sm"><KeyRound size={13} /> Sign out everywhere</button>
            </div>
            <p className="field-hint mt-3 inline-flex items-center gap-1.5"><ShieldCheck size={12} /> Sign-in requires your password plus an emailed one-time code. Accounts lock after repeated failures.</p>
          </Card>
        </div>
        <Card title="Audit log" description="Every dashboard action, newest first.">
          <ul className="divide-y divide-line max-h-[36rem] overflow-y-auto -mx-2">
            {audit.map(a => (
              <li key={a.id} className="px-2 py-2.5 flex items-start gap-3 text-sm">
                <History size={13} className="mt-1 text-muted shrink-0" />
                <div className="min-w-0 flex-1"><p className="font-mono text-xs text-fg">{a.action}{a.target ? <span className="text-muted"> #{a.target}</span> : null}</p>{a.detail && <p className="text-[0.68rem] text-muted truncate">{JSON.stringify(a.detail)}</p>}</div>
                <span className="text-[0.68rem] text-muted shrink-0">{fmt(a.created_at)}</span>
              </li>
            ))}
            {!audit.length && <li className="py-6 text-sm text-muted text-center">No entries yet.</li>}
          </ul>
        </Card>
      </div>
    </div>
  )
}
