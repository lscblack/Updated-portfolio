/** Animated scene used in the Life section when an activity has no photo or clip yet.
 *  Each one hints at the activity itself, so the section never looks like empty placeholders. */
import { motion, useReducedMotion } from 'framer-motion'
import { useMemo } from 'react'

type Props = { kind: string; playing?: boolean }

function pick(kind: string): string {
  const k = kind.toLowerCase()
  if (/piano|keyboard/.test(k)) return 'piano'
  if (/guitar|string/.test(k)) return 'guitar'
  if (/music|mic|sing|song/.test(k)) return 'wave'
  if (/danc|zap|move/.test(k)) return 'dance'
  if (/run|foot|bike|walk|sport|gym|dumbbell/.test(k)) return 'run'
  if (/read|book|write|learn/.test(k)) return 'read'
  if (/user|mentor|team|community|people|handshake/.test(k)) return 'people'
  if (/globe|world|travel|plane|map/.test(k)) return 'globe'
  if (/heart|faith|church|love/.test(k)) return 'heart'
  if (/car|driv/.test(k)) return 'drive'
  return 'wave'
}

export default function ActivityScene({ kind, playing = true }: Props) {
  const reduce = useReducedMotion()
  const scene = useMemo(() => pick(kind), [kind])
  const on = playing && !reduce
  const A = 'var(--accent)', B = 'var(--accent-2)'

  return (
    <svg viewBox="0 0 320 220" className="w-full h-full" role="img" aria-label={`${kind} illustration`}>
      <defs>
        <linearGradient id="as-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={A} stopOpacity="0.18" />
          <stop offset="1" stopColor={A} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#as-fade)" />

      {scene === 'piano' && (
        <g transform="translate(40,70)">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.rect key={i} x={i * 24} y={0} width={21} height={80} rx={3} fill="var(--fg)" opacity={0.14}
              animate={on ? { y: [0, 6, 0], opacity: [0.14, 0.4, 0.14] } : {}}
              transition={{ duration: 1.1, repeat: Infinity, delay: (i % 5) * 0.18, ease: 'easeInOut' }} />
          ))}
          {[1, 3, 6, 8].map(i => (
            <motion.rect key={`b${i}`} x={i * 24 + 14} y={0} width={13} height={50} rx={2} fill={A}
              animate={on ? { y: [0, 5, 0] } : {}} transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.12 }} />
          ))}
        </g>
      )}

      {scene === 'guitar' && (
        <g transform="translate(60,40)">
          <motion.circle cx="100" cy="90" r="52" fill="none" stroke={A} strokeWidth="3" opacity="0.5"
            animate={on ? { scale: [1, 1.04, 1] } : {}} transition={{ duration: 2.4, repeat: Infinity }} style={{ transformOrigin: '100px 90px' }} />
          <circle cx="100" cy="90" r="20" fill="none" stroke={B} strokeWidth="2" opacity="0.7" />
          <rect x="96" y="-10" width="8" height="80" rx="3" fill="var(--fg)" opacity="0.25" />
          {[0, 1, 2, 3].map(i => (
            <motion.line key={i} x1={80 + i * 13} y1="-6" x2={80 + i * 13} y2="140" stroke={B} strokeWidth="1.4" opacity="0.55"
              animate={on ? { opacity: [0.2, 0.85, 0.2] } : {}} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </g>
      )}

      {scene === 'wave' && (
        <g transform="translate(0,110)">
          {Array.from({ length: 28 }).map((_, i) => (
            <motion.rect key={i} x={12 + i * 11} y={-70} width={6} height={70} rx={3} fill={i % 3 === 0 ? B : A} opacity="0.75"
              style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
              animate={on ? { scaleY: [0.16, 0.3 + ((i * 37) % 60) / 90, 0.16] } : { scaleY: 0.3 }}
              transition={{ duration: 0.9 + (i % 5) * 0.12, repeat: Infinity, ease: 'easeInOut', delay: (i % 7) * 0.08 }} />
          ))}
        </g>
      )}

      {scene === 'dance' && (
        <g transform="translate(160,110)">
          {[0, 1, 2].map(i => (
            <motion.circle key={i} r={30 + i * 22} fill="none" stroke={i % 2 ? B : A} strokeWidth="2" opacity={0.35 - i * 0.08}
              animate={on ? { scale: [0.9, 1.12, 0.9], rotate: [0, 180, 360] } : {}}
              transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }} />
          ))}
          <motion.g animate={on ? { rotate: [-9, 9, -9] } : {}} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
            <circle cx="0" cy="-34" r="10" fill="var(--fg)" />
            <rect x="-5" y="-22" width="10" height="34" rx="5" fill={A} />
            <motion.line x1="0" y1="-16" x2="-24" y2="-30" stroke="var(--fg)" strokeWidth="5" strokeLinecap="round"
              animate={on ? { rotate: [0, -18, 0] } : {}} transition={{ duration: 1.2, repeat: Infinity }} style={{ transformOrigin: '0px -16px' }} />
            <motion.line x1="0" y1="-16" x2="26" y2="-34" stroke="var(--fg)" strokeWidth="5" strokeLinecap="round"
              animate={on ? { rotate: [0, 18, 0] } : {}} transition={{ duration: 1.2, repeat: Infinity }} style={{ transformOrigin: '0px -16px' }} />
            <line x1="0" y1="12" x2="-14" y2="44" stroke="var(--fg)" strokeWidth="5" strokeLinecap="round" />
            <line x1="0" y1="12" x2="15" y2="44" stroke="var(--fg)" strokeWidth="5" strokeLinecap="round" />
          </motion.g>
        </g>
      )}

      {scene === 'run' && (
        <g transform="translate(0,150)">
          <line x1="0" y1="14" x2="320" y2="14" stroke="var(--fg)" strokeOpacity="0.15" strokeWidth="2" />
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.g key={i} animate={on ? { opacity: [0, 1, 0] } : { opacity: 0.4 }} transition={{ duration: 2.1, repeat: Infinity, delay: i * 0.3 }}>
              <ellipse cx={30 + i * 42} cy={i % 2 ? 4 : 22} rx="9" ry="5" fill={A} opacity="0.8" transform={`rotate(-18 ${30 + i * 42} ${i % 2 ? 4 : 22})`} />
            </motion.g>
          ))}
        </g>
      )}

      {scene === 'read' && (
        <g transform="translate(80,60)">
          <rect x="0" y="0" width="75" height="100" rx="5" fill="var(--fg)" opacity="0.12" />
          <rect x="83" y="0" width="75" height="100" rx="5" fill="var(--fg)" opacity="0.12" />
          {[0, 1, 2, 3, 4].map(i => (
            <motion.rect key={i} x="10" y={16 + i * 16} width={55} height={4} rx={2} fill={A} opacity="0.65"
              style={{ transformBox: 'fill-box', transformOrigin: 'left' }}
              animate={on ? { scaleX: [0, 1, 1] } : { scaleX: 1 }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.22 }} />
          ))}
          <motion.rect x="93" y="16" width={55} height={4} rx={2} fill={B} opacity="0.65"
            style={{ transformBox: 'fill-box', transformOrigin: 'left' }}
            animate={on ? { scaleX: [0, 1] } : { scaleX: 1 }} transition={{ duration: 2.4, repeat: Infinity, delay: 0.4 }} />
          <motion.path d="M79 0 q28 50 0 100" fill="none" stroke={B} strokeWidth="2" opacity="0.8"
            animate={on ? { opacity: [0, 0.8, 0] } : {}} transition={{ duration: 2.6, repeat: Infinity }} />
        </g>
      )}

      {scene === 'people' && (
        <g transform="translate(160,110)">
          {[-70, 0, 70].map((x, i) => (
            <motion.g key={x} animate={on ? { y: [0, -7, 0] } : {}} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
              <circle cx={x} cy="-22" r={i === 1 ? 16 : 13} fill={i === 1 ? A : 'var(--fg)'} opacity={i === 1 ? 1 : 0.35} />
              <rect x={x - (i === 1 ? 16 : 13)} y="-2" width={(i === 1 ? 32 : 26)} height="42" rx={i === 1 ? 14 : 12} fill={i === 1 ? A : 'var(--fg)'} opacity={i === 1 ? 0.75 : 0.25} />
            </motion.g>
          ))}
        </g>
      )}

      {scene === 'globe' && (
        <g transform="translate(160,110)">
          <circle r="60" fill="none" stroke={A} strokeWidth="2" opacity="0.6" />
          {[0.35, 0.7].map((k, i) => <ellipse key={i} rx={60 * k} ry="60" fill="none" stroke={A} strokeWidth="1.5" opacity="0.35" />)}
          <line x1="-60" y1="0" x2="60" y2="0" stroke={A} strokeWidth="1.5" opacity="0.35" />
          <motion.circle r="6" fill={B} animate={on ? { cx: [-60, 60, -60], cy: [0, -18, 0] } : {}} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
        </g>
      )}

      {scene === 'heart' && (
        <g transform="translate(160,108)">
          <motion.path d="M0 34 C-46 4 -34 -32 0 -14 C34 -32 46 4 0 34 Z" fill={A}
            animate={on ? { scale: [1, 1.09, 1, 1.05, 1] } : {}} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
          {[0, 1].map(i => (
            <motion.path key={i} d="M0 34 C-46 4 -34 -32 0 -14 C34 -32 46 4 0 34 Z" fill="none" stroke={B} strokeWidth="2"
              animate={on ? { scale: [1, 1.8], opacity: [0.5, 0] } : {}} transition={{ duration: 2.2, repeat: Infinity, delay: i * 1.1 }} />
          ))}
        </g>
      )}

      {scene === 'drive' && (
        <g transform="translate(0,120)">
          <motion.g animate={on ? { x: [-40, 360] } : { x: 120 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}>
            <rect x="0" y="0" width="86" height="26" rx="10" fill={A} />
            <rect x="18" y="-16" width="46" height="20" rx="7" fill={A} opacity="0.75" />
            <circle cx="22" cy="30" r="9" fill="var(--fg)" /><circle cx="66" cy="30" r="9" fill="var(--fg)" />
          </motion.g>
          <line x1="0" y1="44" x2="320" y2="44" stroke="var(--fg)" strokeOpacity="0.18" strokeWidth="3" />
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.rect key={i} x={i * 42} y="42" width="22" height="3" rx="1.5" fill={B} opacity="0.5"
              animate={on ? { x: [340, -30] } : { x: i * 42 }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', delay: i * 0.2 }} />
          ))}
        </g>
      )}
    </svg>
  )
}
