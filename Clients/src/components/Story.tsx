/** The walking character used by the Journey scene. Pure SVG + CSS keyframes (see index.css `.walker`). */
export type WalkerState = 'idle' | 'walking'

export default function Walker({ state, facing = 1, speed = 1, size = 150, className = '' }: { state: WalkerState; facing?: 1 | -1; speed?: number; size?: number; className?: string }) {
  const step = Math.max(0.28, Math.min(0.8, 0.62 / Math.max(0.4, speed)))
  return (
    <svg viewBox="0 0 84 144" width={size * 0.58} height={size} className={`walker ${state} ${className}`}
      style={{ ['--step' as string]: `${step}s`, transform: `scaleX(${facing})`, transformOrigin: '50% 50%' }} aria-hidden="true">
      {/* shadow */}
      <ellipse cx="44" cy="139" rx="22" ry="3.5" fill="currentColor" opacity=".18" />

      {/* back leg */}
      <g className="leg-l" style={{ transformBox: 'view-box', transformOrigin: '44px 76px' }}>
        <line x1="44" y1="76" x2="44" y2="104" stroke="var(--fg)" strokeWidth="10" strokeLinecap="round" opacity=".78" />
        <g className="shin-l" style={{ transformBox: 'view-box', transformOrigin: '44px 104px' }}>
          <line x1="44" y1="104" x2="44" y2="130" stroke="var(--fg)" strokeWidth="9" strokeLinecap="round" opacity=".78" />
          <path d="M40 131 h14 a4 4 0 0 1 4 4 v1 h-20 z" fill="var(--fg)" opacity=".78" />
        </g>
      </g>

      <g className="body-bob">
        {/* back arm */}
        <g className="arm-l" style={{ transformBox: 'view-box', transformOrigin: '44px 40px' }}>
          <line x1="44" y1="40" x2="44" y2="70" stroke="var(--fg)" strokeWidth="7" strokeLinecap="round" opacity=".7" />
        </g>
        {/* bag on back */}
        <rect x="16" y="44" width="17" height="27" rx="6" fill="var(--accent)" />
        <path d="M30 46 q-4 12 0 24" stroke="var(--bg)" strokeWidth="2" fill="none" opacity=".5" />
        {/* torso */}
        <path d="M44 34 v42" stroke="var(--accent)" strokeWidth="18" strokeLinecap="round" />
        <path d="M44 34 v42" stroke="var(--fg)" strokeWidth="18" strokeLinecap="round" opacity=".08" />
        {/* head */}
        <circle cx="45" cy="18" r="11.5" fill="var(--fg)" />
        <path d="M34 15 q11 -12 22 -1 q-4 -3 -11 -2 q-6 0 -11 3z" fill="var(--fg)" opacity=".9" />
        {/* front arm */}
        <g className="arm-r" style={{ transformBox: 'view-box', transformOrigin: '44px 40px' }}>
          <line x1="44" y1="40" x2="44" y2="70" stroke="var(--fg)" strokeWidth="7" strokeLinecap="round" />
          <circle cx="44" cy="72" r="4.2" fill="var(--fg)" />
        </g>
      </g>

      {/* front leg */}
      <g className="leg-r" style={{ transformBox: 'view-box', transformOrigin: '44px 76px' }}>
        <line x1="44" y1="76" x2="44" y2="104" stroke="var(--fg)" strokeWidth="10" strokeLinecap="round" />
        <g className="shin-r" style={{ transformBox: 'view-box', transformOrigin: '44px 104px' }}>
          <line x1="44" y1="104" x2="44" y2="130" stroke="var(--fg)" strokeWidth="9" strokeLinecap="round" />
          <path d="M40 131 h14 a4 4 0 0 1 4 4 v1 h-20 z" fill="var(--accent)" />
        </g>
      </g>
    </svg>
  )
}
