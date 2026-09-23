import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, ExternalLink, FileText, Loader2, Mail, AlertCircle, Sun, Moon } from 'lucide-react'
import { useSite } from '../contexts/SiteContext'
import { useTheme } from '../contexts/ThemeContext'
import BrandMark from '../components/ui/BrandMark'

/** Uploaded files are also served on this origin (nginx proxies /uploads, Vite proxies it in dev).
 *  Using the relative path keeps the PDF same-origin, so framing is never blocked by CSP. */
function sameOrigin(url: string): string {
  if (!url) return ''
  const i = url.indexOf('/uploads/')
  return i >= 0 ? url.slice(i) : url
}

export default function Resume() {
  const { data, loading } = useSite()
  const { mode, toggle } = useTheme()
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)

  const raw = data?.settings?.resume_url || ''
  const url = sameOrigin(raw)
  const name = data?.about?.name || 'Resume'
  const isPdf = /\.pdf(\?|#|$)/i.test(url) || url.startsWith('/uploads/')

  useEffect(() => { document.title = `${name} — Resume` }, [name])
  // some browsers silently refuse to render a PDF frame; offer the download instead of an empty box
  useEffect(() => {
    if (!isPdf || !url) return
    const t = setTimeout(() => setReady(r => { if (!r) setFailed(true); return r }), 6000)
    return () => clearTimeout(t)
  }, [isPdf, url])

  return (
    <div className="min-h-[100svh] bg-bg text-fg flex flex-col">
      <header className="h-16 glass border-b border-line sticky top-0 z-10">
        <div className="w-11/12 mx-auto h-full flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg shrink-0">
            <ArrowLeft size={15} /> <span className="hidden sm:inline">Back to portfolio</span>
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <BrandMark size={28} />
            <p className="font-display font-bold text-sm sm:text-base truncate">{name}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={toggle} className="w-9 h-9 rounded-full grid place-items-center text-muted hover:bg-surface-2" aria-label="Toggle theme">
              {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {url && <a href={url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm hidden sm:inline-flex"><ExternalLink size={13} /> Open</a>}
            {url && <a href={url} download className="btn btn-primary btn-sm"><Download size={14} /> <span className="hidden sm:inline">Download</span></a>}
          </div>
        </div>
      </header>

      <main className="flex-1 w-11/12 mx-auto py-5 sm:py-6 flex flex-col">
        {loading && !data ? (
          <div className="flex-1 grid place-items-center text-muted"><Loader2 className="animate-spin" /></div>
        ) : !url ? (
          <div className="flex-1 grid place-items-center">
            <div className="card p-10 sm:p-14 text-center max-w-md">
              <span className="w-14 h-14 rounded-full bg-surface-2 grid place-items-center text-accent-ink mx-auto"><FileText size={24} /></span>
              <h1 className="mt-5 font-display font-extrabold text-xl">No resume uploaded yet</h1>
              <p className="mt-2 text-sm text-muted">Add a PDF in the dashboard under <span className="text-fg font-semibold">Site &amp; hero → Resume</span> and it appears here.</p>
              <Link to="/#contact" className="btn btn-outline btn-sm mt-6"><Mail size={13} /> Get in touch instead</Link>
            </div>
          </div>
        ) : isPdf ? (
          <div className="flex-1 flex flex-col">
            <div className="relative flex-1 min-h-[70svh] rounded-card border border-line overflow-hidden bg-white">
              {!ready && !failed && (
                <div className="absolute inset-0 grid place-items-center bg-surface text-muted"><Loader2 className="animate-spin" /></div>
              )}
              <object data={`${url}#view=FitH&toolbar=1`} type="application/pdf" className="absolute inset-0 w-full h-full" onLoad={() => setReady(true)} aria-label={`${name} resume`}>
                {/* shown when the browser cannot display PDFs inline (common on phones) */}
                <div className="absolute inset-0 grid place-items-center p-8 text-center bg-surface">
                  <div>
                    <span className="w-12 h-12 rounded-full bg-surface-2 grid place-items-center text-accent-ink mx-auto"><FileText size={20} /></span>
                    <p className="mt-4 text-sm text-fg font-semibold">Your browser can’t show PDFs inline</p>
                    <p className="mt-1 text-sm text-muted">Open it in a new tab or download it instead.</p>
                    <div className="mt-5 flex items-center justify-center gap-2">
                      <a href={url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><ExternalLink size={13} /> Open</a>
                      <a href={url} download className="btn btn-primary btn-sm"><Download size={14} /> Download</a>
                    </div>
                  </div>
                </div>
              </object>
            </div>
            {failed && !ready && (
              <p className="mt-3 text-xs text-muted inline-flex items-center gap-2"><AlertCircle size={13} /> Taking a while to render — use Open or Download above if nothing appears.</p>
            )}
          </div>
        ) : (
          <div className="flex-1 grid place-items-center">
            <div className="card p-10 text-center max-w-md">
              <span className="w-14 h-14 rounded-full bg-surface-2 grid place-items-center text-accent-ink mx-auto"><FileText size={24} /></span>
              <p className="mt-5 text-muted">The resume is hosted externally.</p>
              <a href={url} target="_blank" rel="noreferrer" className="btn btn-primary mt-5">Open resume <ExternalLink size={14} /></a>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
