import type { Fonts } from './types'

export type FontDef = { name: string; spec: string; kind: 'sans' | 'serif' | 'mono'; note?: string }

/** Curated Google Fonts with the exact weight specs each family supports. */
export const FONTS: FontDef[] = [
  { name: 'Sora', spec: 'wght@300..800', kind: 'sans', note: 'Geometric, confident' },
  { name: 'Manrope', spec: 'wght@300..800', kind: 'sans', note: 'Clean and modern' },
  { name: 'Inter', spec: 'wght@300..900', kind: 'sans', note: 'The workhorse' },
  { name: 'Space Grotesk', spec: 'wght@300..700', kind: 'sans', note: 'Techy grotesque' },
  { name: 'Plus Jakarta Sans', spec: 'wght@300..800', kind: 'sans' },
  { name: 'Outfit', spec: 'wght@300..900', kind: 'sans', note: 'Display friendly' },
  { name: 'DM Sans', spec: 'wght@300..900', kind: 'sans' },
  { name: 'Syne', spec: 'wght@400..800', kind: 'sans', note: 'Bold editorial' },
  { name: 'Urbanist', spec: 'wght@300..900', kind: 'sans' },
  { name: 'Figtree', spec: 'wght@300..900', kind: 'sans' },
  { name: 'Onest', spec: 'wght@300..900', kind: 'sans' },
  { name: 'Geist', spec: 'wght@300..900', kind: 'sans' },
  { name: 'Instrument Sans', spec: 'wght@400..700', kind: 'sans' },
  { name: 'Bricolage Grotesque', spec: 'wght@300..800', kind: 'sans', note: 'Characterful display' },
  { name: 'Unbounded', spec: 'wght@300..900', kind: 'sans', note: 'Wide and loud' },
  { name: 'Poppins', spec: 'wght@300;400;500;600;700;800', kind: 'sans' },
  { name: 'Playfair Display', spec: 'wght@400..900', kind: 'serif', note: 'Elegant serif' },
  { name: 'Fraunces', spec: 'wght@300..900', kind: 'serif', note: 'Soft serif' },
  { name: 'Lora', spec: 'wght@400..700', kind: 'serif' },
  { name: 'Newsreader', spec: 'wght@300..800', kind: 'serif' },
  { name: 'JetBrains Mono', spec: 'wght@300..800', kind: 'mono' },
  { name: 'Fira Code', spec: 'wght@300..700', kind: 'mono' },
  { name: 'IBM Plex Mono', spec: 'wght@300;400;500;600;700', kind: 'mono' },
  { name: 'Geist Mono', spec: 'wght@300..900', kind: 'mono' },
  { name: 'Source Code Pro', spec: 'wght@300..900', kind: 'mono' },
  { name: 'Space Mono', spec: 'wght@400;700', kind: 'mono' },
  { name: 'DM Mono', spec: 'wght@300;400;500', kind: 'mono' },
]

export const DEFAULT_FONTS: Fonts = { display: 'Sora', body: 'Manrope', mono: 'JetBrains Mono' }

const SYSTEM_SANS = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
const SYSTEM_MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"

function specFor(name: string): string {
  const f = FONTS.find(x => x.name.toLowerCase() === name.toLowerCase())
  return f ? f.spec : 'wght@400;700'
}

export function normalizeFonts(f?: Partial<Fonts> | null): Fonts {
  const clean = (v: unknown, d: string) => (typeof v === 'string' && v.trim().length > 0 && v.length < 60 ? v.trim() : d)
  return { display: clean(f?.display, DEFAULT_FONTS.display), body: clean(f?.body, DEFAULT_FONTS.body), mono: clean(f?.mono, DEFAULT_FONTS.mono) }
}

export function googleFontsUrl(fonts: Fonts): string {
  const fams = Array.from(new Set([fonts.display, fonts.body, fonts.mono]))
    .map(n => `family=${encodeURIComponent(n).replace(/%20/g, '+')}:${specFor(n)}`)
  return `https://fonts.googleapis.com/css2?${fams.join('&')}&display=swap`
}

let currentHref = ''

/** Inject/replace the Google Fonts stylesheet and update the CSS font variables. */
export function applyFonts(fonts: Fonts, target: HTMLElement = document.documentElement) {
  const href = googleFontsUrl(fonts)
  if (href !== currentHref) {
    currentHref = href
    let link = document.getElementById('site-fonts') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link'); link.id = 'site-fonts'; link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
    link.href = href
  }
  const q = (n: string) => `'${n.replace(/'/g, '')}'`
  target.style.setProperty('--font-display', `${q(fonts.display)}, ${SYSTEM_SANS}`)
  target.style.setProperty('--font-body', `${q(fonts.body)}, ${SYSTEM_SANS}`)
  target.style.setProperty('--font-mono', `${q(fonts.mono)}, ${SYSTEM_MONO}`)
}
