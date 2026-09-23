import { useCallback, useEffect, useState } from 'react'
import { Users, Eye, Timer, MousePointerClick, MoveVertical, RefreshCw, Loader2, Monitor, Smartphone, Tablet, Globe } from 'lucide-react'
import api, { errorMessage } from '../../api/client'
import { timeAgo } from '../../lib/dates'
import { Card, PageHeader } from './ui/Fields'
import { useToast } from './ui/Toast'
import TrendChart, { type Point } from './ui/TrendChart'

type Bucket = { name: string; count: number }
type Recent = { device: string; browser: string; os: string; country: string; duration: number; interactions: number; scroll: number; referrer: string; sections: number; started_at: string }
type Data = {
  days: number
  totals: { unique_devices: number; returning_devices: number; visits: number; engaged_visits: number; interactions: number; avg_seconds: number; median_seconds: number; total_seconds: number; avg_scroll: number; bounce_rate: number }
  series: Point[]
  devices: Bucket[]; browsers: Bucket[]; systems: Bucket[]; referrers: Bucket[]; countries: Bucket[]; sections: Bucket[]
  recent: Recent[]
}

const RANGES = [7, 30, 90]
const DEVICE_ICON: Record<string, React.ElementType> = { desktop: Monitor, mobile: Smartphone, tablet: Tablet }

function duration(sec: number) {
  if (!sec) return '0s'
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60), s = sec % 60
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

function Stat({ icon: I, value, label, sub }: { icon: React.ElementType; value: string | number; label: string; sub?: string }) {
  return (
    <div className="card p-5">
      <span className="w-10 h-10 rounded-full bg-accent/15 text-accent-ink grid place-items-center"><I size={17} /></span>
      <p className="mt-4 font-display text-3xl font-extrabold text-fg tabular-nums">{value}</p>
      <p className="text-sm font-semibold text-fg mt-1">{label}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </div>
  )
}

/** Horizontal breakdown — one measure, so a single recessive bar per row with the value labelled. */
function Breakdown({ title, rows, empty }: { title: string; rows: Bucket[]; empty: string }) {
  const max = Math.max(1, ...rows.map(r => r.count))
  return (
    <Card title={title}>
      {!rows.length ? <p className="text-sm text-muted">{empty}</p> : (
        <ul className="space-y-2.5">
          {rows.map(r => (
            <li key={r.name}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-fg truncate">{r.name || 'direct'}</span>
                <span className="text-muted tabular-nums shrink-0">{r.count}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                <div className="h-full rounded-full bg-accent" style={{ width: `${(r.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default function AdminAnalytics() {
  const { toast } = useToast()
  const [days, setDays] = useState(30)
  const [d, setD] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await api.get('/api/admin/analytics', { params: { days } }); setD(r.data) }
    catch (e) { toast(errorMessage(e), 'error') } finally { setLoading(false) }
  }, [days, toast])
  useEffect(() => { load() }, [load])

  const t = d?.totals

  return (
    <div>
      <PageHeader title="Audience" description="Every unique device that visited, what they did and how long they stayed. No cookies, no IP addresses — device ids are hashed, bots and Do-Not-Track visitors are excluded."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-full bg-surface-2/70 p-1">
              {RANGES.map(r => <button key={r} onClick={() => setDays(r)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${days === r ? 'bg-fg text-bg' : 'text-muted hover:text-fg'}`}>{r}d</button>)}
            </div>
            <button onClick={load} className="btn btn-outline btn-sm"><RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh</button>
          </div>
        } />

      {loading && !d ? <p className="text-sm text-muted flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> Loading</p> : t && d && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <Stat icon={Users} value={t.unique_devices} label="Unique devices" sub={`${t.returning_devices} came back`} />
            <Stat icon={Eye} value={t.visits} label="Visits" sub={`${t.engaged_visits} lasted over 5s`} />
            <Stat icon={Timer} value={duration(t.avg_seconds)} label="Average time" sub={`median ${duration(t.median_seconds)} · ${duration(t.total_seconds)} total`} />
            <Stat icon={MousePointerClick} value={t.interactions} label="Interactions" sub="clicks, taps and key presses" />
            <Stat icon={MoveVertical} value={`${t.avg_scroll}%`} label="Average scroll depth" sub={`${t.bounce_rate}% left within 5s`} />
          </div>

          <Card title="Daily trend" description={`Visits and unique devices over the last ${d.days} days.`}>
            <TrendChart data={d.series} />
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card title="Devices">
              {!d.devices.length ? <p className="text-sm text-muted">No visits yet.</p> : (
                <ul className="space-y-3">
                  {d.devices.map(r => {
                    const I = DEVICE_ICON[r.name] ?? Globe
                    const pct = Math.round((r.count / Math.max(1, t.visits)) * 100)
                    return (
                      <li key={r.name} className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-surface-2 grid place-items-center text-accent-ink"><I size={15} /></span>
                        <span className="flex-1 capitalize text-sm text-fg">{r.name}</span>
                        <span className="text-sm text-muted tabular-nums">{r.count} · {pct}%</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Card>
            <Breakdown title="Browsers" rows={d.browsers} empty="No visits yet." />
            <Breakdown title="Operating systems" rows={d.systems} empty="No visits yet." />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Breakdown title="Where they came from" rows={d.referrers} empty="No referrers recorded — visitors arrived directly." />
            <Breakdown title="Sections they actually reached" rows={d.sections} empty="No section data yet." />
          </div>

          <Card title="Recent visits" description="The newest sessions, most recent first.">
            {!d.recent.length ? <p className="text-sm text-muted">Nothing yet. Open the public site in another browser to see a visit appear.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[0.68rem] uppercase tracking-wider text-muted border-b border-line">
                      <th className="py-2 pr-4 font-semibold">When</th><th className="py-2 pr-4 font-semibold">Device</th>
                      <th className="py-2 pr-4 font-semibold">Time</th><th className="py-2 pr-4 font-semibold">Interactions</th>
                      <th className="py-2 pr-4 font-semibold">Scroll</th><th className="py-2 font-semibold">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {d.recent.map((r, i) => (
                      <tr key={i}>
                        <td className="py-2.5 pr-4 text-muted whitespace-nowrap">{timeAgo(r.started_at)}</td>
                        <td className="py-2.5 pr-4 text-fg capitalize whitespace-nowrap">{r.device} · {r.browser} · {r.os}{r.country ? ` · ${r.country}` : ''}</td>
                        <td className="py-2.5 pr-4 text-fg tabular-nums">{duration(r.duration)}</td>
                        <td className="py-2.5 pr-4 text-muted tabular-nums">{r.interactions}</td>
                        <td className="py-2.5 pr-4 text-muted tabular-nums">{r.scroll}%</td>
                        <td className="py-2.5 text-muted truncate max-w-[220px]">{r.referrer ? r.referrer.replace(/^https?:\/\//, '') : 'direct'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
