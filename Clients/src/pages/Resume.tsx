import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, ExternalLink, FileText, Loader2, Mail, AlertCircle, Sun, Moon } from 'lucide-react'
import { useSite } from '../contexts/SiteContext'
import { useTheme } from '../contexts/ThemeContext'
import BrandMark from '../components/ui/BrandMark'

export default function Resume() {
  const { data, loading } = useSite()
  const { mode, toggle } = useTheme()
  const [ready, setReady] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)

  const url = (data?.settings?.resume_url || '').trim()
  const name = data?.about?.name || 'Resume'
  const isPdf = /\.pdf(\?|#|$)/i.test(url) || url.startsWith('/uploads/')

  useEffect(() => { document.title = `${name} — Resume` }, [name])

  // Check the file really is there before embedding it: a missing or non-PDF file otherwise renders as a
  // blank box with the browser's broken-document icon, which says nothing about what went wrong.
  useEffect(() => {
    if (!url) return
    setProblem(null); setReady(false)
    let cancelled = false
    fetch(url, { method: 'HEAD' })
      .then(r => {
        if (cancelled || r.type === 'opaque') return          // cross-origin: no usable status, just render
        if (r.status >= 400) setProblem(`The file could not be loaded (HTTP ${r.status}).`)
      })
      .catch(() => { /* CORS or offline: inconclusive, so let the viewer try */ })
    return () => { cancelled = true }
  }, [url, isPdf])

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
        ) : problem ? (
          <div className="flex-1 grid place-items-center">
            <div className="card p-8 sm:p-12 text-center max-w-lg">
              <span className="w-14 h-14 rounded-full bg-red-500/15 text-red-500 grid place-items-center mx-auto"><AlertCircle size={24} /></span>
              <h1 className="mt-5 font-display font-extrabold text-xl">The resume could not be displayed</h1>
              <p className="mt-2 text-sm text-muted">{problem}</p>
              <p className="mt-3 font-mono text-[0.7rem] text-muted break-all bg-surface-2/60 rounded-card-sm px-3 py-2">{url}</p>
              <p className="mt-3 text-sm text-muted">Re-upload the PDF in the dashboard under <span className="text-fg font-semibold">Site &amp; hero → Resume</span>.</p>
              <div className="mt-6 flex items-center justify-center gap-2">
                <a href={url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><ExternalLink size={13} /> Try opening it</a>
                <Link to="/" className="btn btn-ghost btn-sm">Back to portfolio</Link>
              </div>
            </div>
          </div>
        ) : isPdf ? (
          <div className="flex-1 flex flex-col">
            <div className="relative flex-1 min-h-[70svh] rounded-card border border-line overflow-hidden bg-white">
              {!ready && (
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
            <p className="mt-3 text-xs text-muted">Not rendering? Use <span className="text-fg">Open</span> or <span className="text-fg">Download</span> above — some browsers block inline PDFs.</p>
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
