import { Link } from 'react-router-dom'
import { ArrowUp, ArrowUpRight, Mail, MapPin, Phone, FileText, Briefcase } from 'lucide-react'
import { useSite } from '../contexts/SiteContext'
import { SocialIcon } from './ui/Brand'
import BrandMark from './ui/BrandMark'
import Reveal from './ui/Reveal'

export default function Footer() {
  const { data } = useSite()
  const s = data?.settings
  const a = data?.about
  const sections = (s?.sections ?? []).filter(x => x.visible !== false && x.key !== 'hero')
  const featured = (data?.projects ?? []).filter(p => p.featured && (p.live_url || p.github_url)).slice(0, 4)
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-line/60 bg-surface/50 overflow-hidden">
      <div className="container-x pt-16 pb-8">
        <Reveal>
          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
            {/* brand */}
            <div className="max-w-sm">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <BrandMark size={38} />
                <span className="font-mono text-base font-bold text-fg">&lt;{s?.logo_text || 'lsc'} /&gt;</span>
              </Link>
              <p className="mt-4 text-sm text-muted leading-relaxed">{a?.role}{a?.location ? ` based in ${a.location}.` : '.'} {s?.footer_text}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-muted">
                <span className={`w-2 h-2 rounded-full ${s?.available ? 'bg-emerald-500 pulse-dot' : 'bg-muted'}`} />{s?.availability_text}
              </div>
              {!!s?.social_links?.length && (
                <div className="mt-5 flex gap-1.5">
                  {s.social_links.map(l => <a key={l.url} href={l.url} target={l.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer" aria-label={l.label} className="w-9 h-9 rounded-full bg-surface-2/70 grid place-items-center text-muted hover:bg-accent hover:text-accent-fg transition-colors"><SocialIcon name={l.icon} size={15} /></a>)}
                </div>
              )}
            </div>

            {/* navigate */}
            <div>
              <p className="label">Navigate</p>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                {sections.map(x => <li key={x.key}><a href={`#${x.key}`} className="text-sm text-muted hover:text-accent-ink transition-colors">{x.label}</a></li>)}
                {s?.resume_url && <li><Link to="/resume" className="text-sm text-muted hover:text-accent-ink transition-colors inline-flex items-center gap-1.5"><FileText size={13} /> Resume</Link></li>}
              </ul>
            </div>

            {/* work */}
            <div>
              <p className="label">Work</p>
              <ul className="space-y-2.5">
                {featured.map(p => <li key={p.id}><a href={p.live_url || p.github_url} target="_blank" rel="noreferrer" className="text-sm text-muted hover:text-accent-ink transition-colors inline-flex items-center gap-1 group">{p.title}<ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" /></a></li>)}
                {(s?.live_sites ?? []).map(x => <li key={x.url}><a href={x.url} target="_blank" rel="noreferrer" className="text-sm font-mono text-muted hover:text-accent-ink transition-colors">{x.label}</a></li>)}
              </ul>
            </div>

            {/* contact */}
            <div>
              <p className="label">Get in touch</p>
              <ul className="space-y-2.5 text-sm">
                {a?.email && <li><a href={`mailto:${a.email}`} className="inline-flex items-center gap-2.5 text-muted hover:text-accent-ink transition-colors"><Mail size={14} className="text-accent-ink" />{a.email}</a></li>}
                {a?.phone && <li><a href={`tel:${a.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2.5 text-muted hover:text-accent-ink transition-colors"><Phone size={14} className="text-accent-ink" />{a.phone}</a></li>}
                {a?.location && <li className="inline-flex items-center gap-2.5 text-muted"><MapPin size={14} className="text-accent-ink" />{a.location}</li>}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                <a href="#hire" className="btn btn-primary btn-sm"><Briefcase size={13} /> Hire me</a>
                <a href="#contact" className="btn btn-outline btn-sm">Message</a>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-14 pt-6 border-t border-line/60 flex flex-wrap items-center justify-between gap-4 text-xs text-muted">
          <p>© {year} {a?.name || s?.site_name}. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span className="font-mono hidden sm:inline">React · FastAPI · PostgreSQL</span>
            <Link to="/admin" className="hover:text-fg transition-colors">Admin</Link>
            <a href="#hero" aria-label="Back to top" className="w-9 h-9 rounded-full bg-surface-2/70 grid place-items-center hover:bg-accent hover:text-accent-fg transition-colors"><ArrowUp size={14} /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
