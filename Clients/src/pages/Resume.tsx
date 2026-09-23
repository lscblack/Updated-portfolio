import { Link } from 'react-router-dom'
import { ArrowLeft, Download, ExternalLink, FileText } from 'lucide-react'
import { useSite } from '../contexts/SiteContext'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function Resume() {
  const { data } = useSite()
  const { mode, toggle } = useTheme()
  const url = data?.settings?.resume_url || ''
  const name = data?.about?.name || 'Resume'
  const isPdf = /\.pdf(\?|#|$)/i.test(url) || url.includes('/uploads/')
  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col">
      <header className="h-16 glass border-b border-line flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg"><ArrowLeft size={15} /> Back to portfolio</Link>
        <p className="font-display font-bold text-sm sm:text-base truncate">{name} — Resume</p>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="w-9 h-9 rounded-full grid place-items-center text-muted hover:bg-surface-2" aria-label="Toggle theme">{mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
          {url && <a href={url} download className="btn btn-primary btn-sm"><Download size={14} /> Download</a>}
        </div>
      </header>
      <main className="flex-1 w-11/12 mx-auto py-6">
        {!url ? (
          <div className="card p-12 text-center text-muted"><FileText className="mx-auto mb-3" size={26} /><p>No resume has been uploaded yet.</p></div>
        ) : isPdf ? (
          <iframe title="Resume" src={`${url}#view=FitH`} className="w-full h-[calc(100vh-8rem)] rounded-card border border-line bg-white" />
        ) : (
          <div className="card p-12 text-center"><FileText className="mx-auto mb-3 text-accent-ink" size={26} /><p className="text-muted mb-5">The resume is hosted externally.</p><a href={url} target="_blank" rel="noreferrer" className="btn btn-primary">Open resume <ExternalLink size={14} /></a></div>
        )}
      </main>
    </div>
  )
}
