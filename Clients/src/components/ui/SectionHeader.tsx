import Reveal, { Words } from './Reveal'

type Props = { label: string; title: string; subtitle?: string; align?: 'left' | 'center'; className?: string; index?: string }

export default function SectionHeader({ label, title, subtitle, align = 'left', className = '', index }: Props) {
  return (
    <div className={`${align === 'center' ? 'text-center mx-auto' : ''} max-w-3xl ${className}`}>
      <Reveal>
        <p className="section-label">{index && <span className="opacity-60">{index}</span>}{label}</p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="h-section mt-4 text-balance"><Words text={title} /></h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.16}>
          <p className="mt-4 text-muted text-base sm:text-lg leading-relaxed text-pretty max-w-2xl">{subtitle}</p>
        </Reveal>
      )}
    </div>
  )
}
