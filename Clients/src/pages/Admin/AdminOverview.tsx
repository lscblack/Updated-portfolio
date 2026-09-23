import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Inbox, Briefcase, Users, Route, FolderKanban, Cpu, GraduationCap, Heart, Compass, Award, Images, Activity, RefreshCw, Palette, Globe } from 'lucide-react'
import api, { errorMessage } from '../../api/client'
import { timeAgo } from '../../lib/dates'
import { useSite } from '../../contexts/SiteContext'
import { PageHeader, Card } from './ui/Fields'
import { useToast } from './ui/Toast'
import type { AuditEntry } from '../../lib/types'

type Overview = { counts: Record<string, number>; messages: { unread: number; total: number }; offers?: { new: number; total: number }; audience?: { devices_30d: number; visits_30d: number }; uploads: number; settings_updated_at: string | null; recent_activity: AuditEntry[] }

const TILES = [
  { key: 'journey', label: 'Journey', icon: Route }, { key: 'experience', label: 'Experience', icon: Briefcase },
  { key: 'skills', label: 'Skill groups', icon: Cpu }, { key: 'projects', label: 'Projects', icon: FolderKanban },
  { key: 'education', label: 'Education', icon: GraduationCap }, { key: 'certifications', label: 'Certifications', icon: Award },
  { key: 'activities', label: 'Life', icon: Heart }, { key: 'interests', label: 'Interests', icon: Compass },
]


export default function AdminOverview() {
  const [ov, setOv] = useState<Overview | null>(null)
  const [health, setHealth] = useState<boolean | null>(null)
  const { reload } = useSite()
  const { toast } = useToast()
  const load = () => { api.get('/api/admin/overview').then(r => setOv(r.data)).catch(() => {}); api.get('/api/public/health').then(() => setHealth(true)).catch(() => setHealth(false)) }
  useEffect(load, [])

  const clearCache = async () => { try { await api.post('/api/admin/cache/clear'); await reload(); toast('Public cache cleared') } catch (e) { toast(errorMessage(e), 'error') } }

  return (
    <div>
      <PageHeader title="Overview" description="Everything on the public site is editable from here. Changes go live the moment you save." actions={<button onClick={clearCache} className="btn btn-outline btn-sm"><RefreshCw size={13} /> Refresh public cache</button>} />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Link to="/admin/offers" className="card card-hover p-5 flex items-center gap-4">
          <span className="w-11 h-11 rounded-full bg-accent/15 text-accent-ink grid place-items-center"><Briefcase size={18} /></span>
          <div><p className="font-display text-2xl font-extrabold text-fg">{ov?.offers?.new ?? '–'}</p><p className="text-xs text-muted">new of {ov?.offers?.total ?? '–'} offers</p></div>
        </Link>
        <Link to="/admin/messages" className="card card-hover p-5 flex items-center gap-4">
          <span className="w-11 h-11 rounded-full bg-accent/15 text-accent-ink grid place-items-center"><Inbox size={18} /></span>
          <div><p className="font-display text-2xl font-extrabold text-fg">{ov?.messages.unread ?? '–'}</p><p className="text-xs text-muted">unread of {ov?.messages.total ?? '–'} messages</p></div>
        </Link>
        <Link to="/admin/media" className="card card-hover p-5 flex items-center gap-4">
          <span className="w-11 h-11 rounded-full bg-surface-2 text-fg grid place-items-center"><Images size={18} /></span>
          <div><p className="font-display text-2xl font-extrabold text-fg">{ov?.uploads ?? '–'}</p><p className="text-xs text-muted">uploaded images</p></div>
        </Link>
        <Link to="/admin/analytics" className="card card-hover p-5 flex items-center gap-4">
          <span className="w-11 h-11 rounded-full bg-accent/15 text-accent-ink grid place-items-center"><Users size={18} /></span>
          <div><p className="font-display text-2xl font-extrabold text-fg">{ov?.audience?.devices_30d ?? '–'}</p><p className="text-xs text-muted">unique devices · 30 days</p></div>
        </Link>
        <div className="card p-5 flex items-center gap-4">
          <span className={`w-11 h-11 rounded-full grid place-items-center ${health ? 'bg-emerald-500/15 text-emerald-500' : health === false ? 'bg-red-500/15 text-red-500' : 'bg-surface-2 text-muted'}`}><Activity size={18} /></span>
          <div><p className="font-display text-lg font-extrabold text-fg">{health ? 'API online' : health === false ? 'API offline' : 'Checking'}</p><p className="text-xs text-muted">{ov?.settings_updated_at ? `settings saved ${timeAgo(ov.settings_updated_at)}` : 'PostgreSQL-backed'}</p></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-6">
          <Card title="Quick actions">
            <div className="grid sm:grid-cols-2 gap-3">
              <Link to="/admin/appearance" className="card card-hover p-4 flex items-center gap-3"><Palette size={16} className="text-accent-ink" /><span className="text-sm font-semibold">Theme, colours & fonts</span><ArrowRight size={14} className="ml-auto text-muted" /></Link>
              <Link to="/admin/site" className="card card-hover p-4 flex items-center gap-3"><Globe size={16} className="text-accent-ink" /><span className="text-sm font-semibold">Hero, SEO & sections</span><ArrowRight size={14} className="ml-auto text-muted" /></Link>
            </div>
          </Card>
          <Card title="Content" description="Row counts per section.">
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {TILES.map(t => (
                <Link key={t.key} to={`/admin/${t.key}`} className="card card-hover p-4 group">
                  <t.icon size={16} className="text-muted group-hover:text-accent-ink transition-colors" />
                  <p className="mt-3 font-display text-2xl font-extrabold text-fg">{ov?.counts[t.key] ?? '–'}</p>
                  <p className="text-xs text-muted">{t.label}</p>
                </Link>
              ))}
            </div>
          </Card>
        </div>
        <Card title="Recent activity" description="Audit trail of dashboard actions.">
          <ul className="space-y-3">
            {(ov?.recent_activity ?? []).map(a => (
              <li key={a.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <div className="min-w-0 flex-1"><p className="font-mono text-xs text-fg truncate">{a.action}{a.target ? ` #${a.target}` : ''}</p><p className="text-[0.68rem] text-muted">{timeAgo(a.created_at)}</p></div>
              </li>
            ))}
            {ov && !ov.recent_activity.length && <li className="text-sm text-muted">No activity yet.</li>}
          </ul>
          <Link to="/admin/settings" className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-accent-ink hover:underline">Full audit log <ArrowRight size={12} /></Link>
        </Card>
      </div>
    </div>
  )
}
