import { useSite } from '../../contexts/SiteContext'

/** The avatar used in the navbar, dashboard sidebar and footer.
 *  Falls back to a letter badge only while the site data is still loading or no portrait is set. */
export default function BrandMark({ size = 32, className = '', ring = true }: { size?: number; className?: string; ring?: boolean }) {
  const { data } = useSite()
  const a = data?.about
  const src = a?.gallery?.[0] || a?.avatar_url || ''
  const letter = (data?.settings?.logo_text || a?.name || 'L').trim().charAt(0).toUpperCase()
  const base = `shrink-0 rounded-full overflow-hidden grid place-items-center ${ring ? 'ring-1 ring-line' : ''} ${className}`
  if (!src) {
    return <span className={`${base} bg-accent text-accent-fg font-display font-extrabold`} style={{ width: size, height: size, fontSize: size * 0.45 }} aria-hidden="true">{letter}</span>
  }
  return (
    <span className={base} style={{ width: size, height: size }}>
      <img src={src} alt={a?.name ? `${a.name} — portrait` : 'Portrait'} width={size} height={size} className="w-full h-full object-cover" loading="eager" decoding="async" />
    </span>
  )
}
