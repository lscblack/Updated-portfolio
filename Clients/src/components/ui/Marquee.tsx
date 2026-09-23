export default function Marquee({ items, speed = 38, className = '' }: { items: string[]; speed?: number; className?: string }) {
  if (!items?.length) return null
  const row = [...items, ...items]
  return (
    <div className={`overflow-hidden mask-fade-x ${className}`} aria-hidden="true">
      <div className="marquee-track gap-3 py-1" style={{ ['--marquee-duration' as string]: `${speed}s` }}>
        {row.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-3 font-mono text-[0.72rem] tracking-[0.18em] uppercase text-muted whitespace-nowrap px-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/70" />
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
