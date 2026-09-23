import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '../../lib/icons'

/** A tree that grows as visitors scroll through the Life section: one branch per activity, the branch for
 *  the activity being read lights up. Used when an activity has no photo or clip of its own. */
type Node = { x: number; y: number; bx: number; by: number; cx: number; cy: number; side: 1 | -1 }

const W = 480, H = 520

function build(n: number): Node[] {
  return Array.from({ length: n }, (_, i) => {
    const t = (i + 1) / (n + 1)             // 0 at the roots, 1 at the crown
    const side: 1 | -1 = i % 2 ? 1 : -1
    const by = H - 40 - t * (H - 150)       // where the branch leaves the trunk
    const reach = 52 + Math.sin(t * Math.PI) * 120   // widest in the middle, narrow at the crown
    const x = W / 2 + side * reach
    const y = by - 46 - Math.sin(t * Math.PI) * 26
    return { x, y, bx: W / 2, by, cx: W / 2 + side * reach * 0.45, cy: by - 8, side }
  })
}

export default function LifeTree({ items, active }: { items: { icon: string; label: string }[]; active: number }) {
  const reduce = useReducedMotion()
  const nodes = useMemo(() => build(items.length), [items.length])
  const leaves = useMemo(
    () => nodes.flatMap((nd, i) => [0.45, 0.72].map((k, j) => ({
      x: nd.bx + (nd.x - nd.bx) * k + nd.side * 6, y: nd.by + (nd.y - nd.by) * k - 6, r: 7 - j, i,
    }))),
    [nodes],
  )

  return (
    <div className="relative w-full h-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMax meet" aria-label="A tree growing through the things I do outside work">
        <defs>
          <linearGradient id="lt-trunk" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="var(--fg)" stopOpacity="0.28" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0.55" />
          </linearGradient>
          <radialGradient id="lt-glow"><stop offset="0" stopColor="var(--accent)" stopOpacity="0.5" /><stop offset="1" stopColor="var(--accent)" stopOpacity="0" /></radialGradient>
        </defs>

        {/* ground + roots */}
        <ellipse cx={W / 2} cy={H - 26} rx="150" ry="12" fill="var(--fg)" opacity="0.07" />
        {[-1, 1].map(s => (
          <path key={s} d={`M${W / 2} ${H - 30} q${s * 34} 6 ${s * 62} 20`} fill="none" stroke="var(--fg)" strokeOpacity="0.16" strokeWidth="4" strokeLinecap="round" />
        ))}

        {/* trunk grows once, then the branches follow it */}
        <motion.path d={`M${W / 2} ${H - 30} C ${W / 2 - 14} ${H - 190}, ${W / 2 + 14} ${H - 300}, ${W / 2} 96`}
          fill="none" stroke="url(#lt-trunk)" strokeWidth="13" strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
          transition={{ duration: 1.6, ease: 'easeOut' }} />

        {/* crown */}
        <motion.circle cx={W / 2} cy="86" r="30" fill="url(#lt-glow)"
          animate={reduce ? {} : { scale: [1, 1.12, 1], opacity: [0.5, 0.85, 0.5] }} transition={{ duration: 4, repeat: Infinity }} />

        {nodes.map((nd, i) => {
          const grown = i <= active
          return (
            <motion.path key={i} d={`M${nd.bx} ${nd.by} Q ${nd.cx} ${nd.cy} ${nd.x} ${nd.y}`}
              fill="none" stroke={i === active ? 'var(--accent)' : 'var(--fg)'} strokeOpacity={i === active ? 0.95 : 0.3}
              strokeWidth={i === active ? 4 : 3} strokeLinecap="round"
              initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: grown ? 1 : 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }} />
          )
        })}

        {leaves.map((lf, k) => (
          <motion.ellipse key={k} cx={lf.x} cy={lf.y} rx={lf.r + 3} ry={lf.r} fill={lf.i === active ? 'var(--accent)' : 'var(--fg)'}
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: lf.i <= active ? 1 : 0, opacity: lf.i <= active ? (lf.i === active ? 0.9 : 0.22) : 0, rotate: reduce ? 0 : [0, 7, 0] }}
            transition={{ scale: { duration: 0.5, delay: 0.25 }, opacity: { duration: 0.5 }, rotate: { duration: 4 + (k % 4), repeat: Infinity, ease: 'easeInOut' } }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
        ))}

        {/* fireflies drifting through the canopy */}
        {!reduce && Array.from({ length: 7 }).map((_, i) => (
          <motion.circle key={i} r={1.8} fill="var(--accent-2)"
            initial={{ cx: 90 + i * 45, cy: 420, opacity: 0 }}
            animate={{ cx: [90 + i * 45, 120 + i * 42, 90 + i * 45], cy: [420, 150 - i * 8, 420], opacity: [0, 0.9, 0] }}
            transition={{ duration: 9 + i, repeat: Infinity, delay: i * 1.2, ease: 'easeInOut' }} />
        ))}
      </svg>

      {/* the icon for each activity sits on its branch tip */}
      {nodes.map((nd, i) => (
        <motion.span key={i} className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(nd.x / W) * 100}%`, top: `${(nd.y / H) * 100}%` }}
          initial={reduce ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: i <= active ? (i === active ? 1 : 0.7) : 0, opacity: i <= active ? 1 : 0 }}
          transition={{ duration: 0.45, delay: i <= active ? 0.3 : 0, ease: [0.22, 1, 0.36, 1] }}>
          <span className={`grid place-items-center rounded-full border transition-colors ${i === active ? 'bg-accent text-accent-fg border-accent shadow-[0_0_26px_var(--accent)]' : 'bg-surface/80 text-muted border-line'}`}
            style={{ width: i === active ? 44 : 30, height: i === active ? 44 : 30 }} title={items[i]?.label}>
            <Icon name={items[i]?.icon ?? 'Sparkles'} size={i === active ? 19 : 14} />
          </span>
        </motion.span>
      ))}
    </div>
  )
}
