import { useMemo, useRef, useState } from 'react'

/** Daily visits and unique devices — two count series on one shared axis.
 *  Plain SVG: thin marks, recessive grid, crosshair + tooltip, legend and a direct label on the last point. */
export type Point = { date: string; visits: number; devices: number }

const W = 760, H = 220, PAD = { t: 14, r: 16, b: 26, l: 34 }

export default function TrendChart({ data }: { data: Point[] }) {
  const ref = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const pts = data.length ? data : [{ date: '', visits: 0, devices: 0 }]

  const { max, xs, line, area, ticks } = useMemo(() => {
    const max = Math.max(4, ...pts.map(p => Math.max(p.visits, p.devices)))
    const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b
    const x = (i: number) => PAD.l + (pts.length === 1 ? iw / 2 : (i / (pts.length - 1)) * iw)
    const y = (v: number) => PAD.t + ih - (v / max) * ih
    const line = (key: 'visits' | 'devices') => pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(' ')
    const area = (key: 'visits' | 'devices') => `${line(key)} L${x(pts.length - 1).toFixed(1)} ${PAD.t + ih} L${x(0).toFixed(1)} ${PAD.t + ih} Z`
    const step = Math.max(1, Math.ceil(max / 3))
    const ticks = Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => ({ v: i * step, y: y(i * step) }))
    return { max, xs: pts.map((_, i) => x(i)), line, area, ticks }
  }, [pts])

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return
    const rel = ((e.clientX - r.left) / r.width) * W
    let best = 0
    xs.forEach((x, i) => { if (Math.abs(x - rel) < Math.abs(xs[best] - rel)) best = i })
    setHover(best)
  }
  const cur = hover != null ? pts[hover] : null
  const last = pts[pts.length - 1]
  const fmt = (d: string) => (d ? new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '')

  return (
    <div className="viz relative">
      <div className="flex items-center gap-4 mb-3">
        {[['Visits', 'var(--series-1)'], ['Unique devices', 'var(--series-2)']].map(([label, c]) => (
          <span key={label} className="inline-flex items-center gap-1.5 text-xs text-muted">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />{label}
          </span>
        ))}
      </div>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img"
        aria-label={`Daily visits and unique devices. Latest: ${last.visits} visits, ${last.devices} devices.`}>
        {ticks.map(t => (
          <g key={t.v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={t.y} y2={t.y} stroke="var(--viz-grid)" strokeWidth="1" />
            <text x={PAD.l - 8} y={t.y + 3.5} textAnchor="end" className="fill-muted" style={{ fontSize: 10 }}>{t.v}</text>
          </g>
        ))}
        <path d={area('visits')} fill="var(--series-1)" opacity="0.12" />
        <path d={line('visits')} fill="none" stroke="var(--series-1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <path d={line('devices')} fill="none" stroke="var(--series-2)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="5 4" />
        {pts.length > 1 && (
          <>
            <text x={W - PAD.r} y={PAD.t - 2} textAnchor="end" className="fill-muted" style={{ fontSize: 10 }}>{fmt(last.date)}</text>
            <text x={PAD.l} y={H - 6} className="fill-muted" style={{ fontSize: 10 }}>{fmt(pts[0].date)}</text>
          </>
        )}
        {cur && hover != null && (
          <g>
            <line x1={xs[hover]} x2={xs[hover]} y1={PAD.t} y2={H - PAD.b} stroke="var(--viz-grid)" strokeWidth="1" />
            {(['visits', 'devices'] as const).map((k, i) => (
              <circle key={k} cx={xs[hover]} cy={PAD.t + (H - PAD.t - PAD.b) - (cur[k] / max) * (H - PAD.t - PAD.b)} r="4"
                fill={`var(--series-${i + 1})`} stroke="var(--surface)" strokeWidth="2" />
            ))}
          </g>
        )}
      </svg>
      {cur && (
        <div className="absolute top-0 right-0 card px-3 py-2 text-xs pointer-events-none">
          <p className="font-semibold text-fg">{fmt(cur.date)}</p>
          <p className="text-muted mt-0.5"><span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: 'var(--series-1)' }} />{cur.visits} visits</p>
          <p className="text-muted"><span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: 'var(--series-2)' }} />{cur.devices} devices</p>
        </div>
      )}
    </div>
  )
}
