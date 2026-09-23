import { useEffect, useMemo, useState } from 'react'
import { Loader2, Save, RotateCcw, Check, Type, Sparkles, SunMoon } from 'lucide-react'
import api, { errorMessage } from '../../api/client'
import { useSite } from '../../contexts/SiteContext'
import { useTheme } from '../../contexts/ThemeContext'
import { PRESETS, normalizeTheme, contrastText } from '../../lib/theme'
import { FONTS, normalizeFonts, googleFontsUrl } from '../../lib/fonts'
import type { Effects, Fonts, Theme, ThemeTones } from '../../lib/types'
import { Card, ColorInput, Field, PageHeader, Select, Toggle } from './ui/Fields'
import { useToast } from './ui/Toast'

const TONE_KEYS: (keyof ThemeTones)[] = ['bg', 'surface', 'surface2', 'fg', 'muted', 'line']
const TONE_LABEL: Record<keyof ThemeTones, string> = { bg: 'Background', surface: 'Surface', surface2: 'Surface 2', fg: 'Text', muted: 'Muted text', line: 'Borders' }
const EFFECTS: { key: keyof Effects; label: string; hint: string }[] = [
  { key: 'preloader', label: 'Intro preloader', hint: 'Logo reveal on first load' },
  { key: 'walker', label: 'Walking journey', hint: 'Scroll-driven character in the Journey section (falls back to a list when off)' },
  { key: 'particles', label: 'Hero particles', hint: 'Floating accent particles behind the hero' },
  { key: 'cursor_glow', label: 'Cursor glow', hint: 'Soft light following the pointer (desktop only)' },
  { key: 'grain', label: 'Film grain', hint: 'Subtle noise overlay for depth' },
  { key: 'marquee', label: 'Tech marquee', hint: 'Scrolling strip of technologies under the hero' },
]

function FontPreview({ family, kind }: { family: string; kind: 'display' | 'body' | 'mono' }) {
  const url = useMemo(() => googleFontsUrl({ display: family, body: family, mono: family }), [family])
  useEffect(() => {
    const id = `font-preview-${family.replace(/\s/g, '-')}`
    if (document.getElementById(id)) return
    const l = document.createElement('link'); l.id = id; l.rel = 'stylesheet'; l.href = url; document.head.appendChild(l)
  }, [url, family])
  const style = { fontFamily: `'${family}', sans-serif` }
  return (
    <div className="card p-4 bg-surface-2/50" style={style}>
      {kind === 'display' && <p className="text-3xl font-extrabold tracking-tight leading-none text-fg">Loue Sauveur Christian</p>}
      {kind === 'body' && <p className="text-sm text-fg leading-relaxed">Building secure, scalable systems across government, fintech and health — with security designed in, not bolted on.</p>}
      {kind === 'mono' && <p className="text-sm text-fg">const engineer = &#123; focus: "security", stack: ["FastAPI", "React"] &#125;</p>}
      <p className="mt-2 text-[0.65rem] text-muted font-sans">{family}</p>
    </div>
  )
}

export default function AdminAppearance() {
  const { data, reload } = useSite()
  const { setSiteTheme } = useTheme()
  const { toast } = useToast()
  const saved = data?.settings
  const [theme, setTheme] = useState<Theme>(() => normalizeTheme(saved?.theme))
  const [fonts, setFonts] = useState<Fonts>(() => normalizeFonts(saved?.fonts))
  const [effects, setEffects] = useState<Effects>(() => ({ ...(saved?.effects ?? {}) }))
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => { if (saved && !dirty) { setTheme(normalizeTheme(saved.theme)); setFonts(normalizeFonts(saved.fonts)); setEffects({ ...(saved.effects ?? {}) }) } }, [saved, dirty])
  // live preview: the dashboard itself uses the same tokens
  useEffect(() => { setSiteTheme(theme, fonts) }, [theme, fonts, setSiteTheme])
  useEffect(() => () => { if (saved) setSiteTheme(saved.theme, saved.fonts) }, [saved, setSiteTheme])

  const upd = (patch: Partial<Theme>) => { setTheme(t => ({ ...t, ...patch, preset: 'custom' })); setDirty(true) }
  const updTone = (mode: 'dark' | 'light', key: keyof ThemeTones, v: string) => { setTheme(t => ({ ...t, preset: 'custom', [mode]: { ...t[mode], [key]: v } })); setDirty(true) }
  const applyPreset = (key: string) => { const p = PRESETS.find(x => x.key === key); if (p) { setTheme({ ...p.theme }); setDirty(true) } }

  const save = async () => {
    setBusy(true)
    try {
      await api.patch('/api/admin/settings', { theme, fonts, effects })
      await reload(); setDirty(false); toast('Appearance saved — live on the site')
    } catch (e) { toast(errorMessage(e), 'error') } finally { setBusy(false) }
  }
  const reset = () => { if (saved) { setTheme(normalizeTheme(saved.theme)); setFonts(normalizeFonts(saved.fonts)); setEffects({ ...(saved.effects ?? {}) }); setDirty(false) } }

  const sans = FONTS.filter(f => f.kind !== 'mono').map(f => ({ value: f.name, label: `${f.name}${f.note ? ` — ${f.note}` : ''}` }))
  const mono = FONTS.filter(f => f.kind === 'mono').map(f => ({ value: f.name, label: f.name }))

  return (
    <div>
      <PageHeader title="Appearance" description="Colours, fonts and effects. What you see in this dashboard is a live preview — nothing changes on the public site until you save."
        actions={<><button onClick={reset} disabled={!dirty} className="btn btn-ghost btn-sm"><RotateCcw size={13} /> Discard</button><button onClick={save} disabled={busy || !dirty} className="btn btn-primary btn-sm">{busy ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save</button></>} />

      <div className="space-y-6">
        <Card title="Presets" description="Start from a palette, then fine-tune anything below.">
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {PRESETS.map(p => {
              const active = theme.preset === p.key
              return (
                <button key={p.key} onClick={() => applyPreset(p.key)} className={`card p-2 text-left transition-all ${active ? 'ring-accent border-accent' : 'card-hover'}`}>
                  <div className="h-12 rounded-card-sm relative overflow-hidden" style={{ background: p.theme.dark.bg }}>
                    <span className="absolute left-2 top-2 w-6 h-6 rounded-full" style={{ background: p.theme.accent }} />
                    <span className="absolute left-7 top-5 w-4 h-4 rounded-full" style={{ background: p.theme.accent2 }} />
                    <span className="absolute right-2 bottom-2 w-8 h-2 rounded-full" style={{ background: p.theme.dark.surface2 }} />
                    {active && <span className="absolute right-1.5 top-1.5 w-4 h-4 rounded-full bg-white text-black grid place-items-center"><Check size={10} /></span>}
                  </div>
                  <p className="mt-2 text-xs font-semibold text-fg">{p.name}</p>
                </button>
              )
            })}
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card title="Accent colours" description="The accent is used for buttons, highlights and the walker's details.">
            <div className="grid sm:grid-cols-2 gap-3">
              <ColorInput label="Primary accent" value={theme.accent} onChange={v => upd({ accent: v })} />
              <ColorInput label="Secondary accent" value={theme.accent2} onChange={v => upd({ accent2: v })} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="btn btn-primary btn-sm pointer-events-none">Primary button</span>
              <span className="tag">Tag</span>
              <span className="text-xs font-mono text-muted">text on accent: {contrastText(theme.accent)}</span>
            </div>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <Field label="Corner radius" hint={`${theme.radius}px — cards, inputs and buttons`}>
                <input type="range" min={0} max={32} value={theme.radius} onChange={e => upd({ radius: Number(e.target.value) })} className="w-full accent-[var(--accent)]" />
              </Field>
              <Field label="Default mode" hint="What first-time visitors see">
                <Select value={theme.default_mode ?? 'dark'} onChange={v => upd({ default_mode: v as Theme['default_mode'] })} options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }, { value: 'system', label: 'Follow device' }]} />
              </Field>
            </div>
          </Card>

          <Card title="Effects" description="Motion and atmosphere. Visitors who prefer reduced motion always get the calm version.">
            <div className="space-y-4">
              {EFFECTS.map(e => <Toggle key={e.key} label={e.label} hint={e.hint} checked={effects[e.key] !== false} onChange={v => { setEffects(x => ({ ...x, [e.key]: v })); setDirty(true) }} />)}
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {(['dark', 'light'] as const).map(m => (
            <Card key={m} title={`${m === 'dark' ? 'Dark' : 'Light'} mode tones`} description="Neutral surfaces for this mode.">
              <div className="grid sm:grid-cols-2 gap-3">
                {TONE_KEYS.map(k => <ColorInput key={k} label={TONE_LABEL[k]} value={theme[m][k]} onChange={v => updTone(m, k, v)} />)}
              </div>
              <div className="mt-4 rounded-card p-4 border" style={{ background: theme[m].bg, borderColor: theme[m].line, color: theme[m].fg }}>
                <div className="rounded-card-sm p-3 border" style={{ background: theme[m].surface, borderColor: theme[m].line }}>
                  <p className="font-display font-bold text-sm">Preview card</p>
                  <p className="text-xs mt-1" style={{ color: theme[m].muted }}>Muted text on a surface.</p>
                  <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-[0.65rem] font-bold" style={{ background: theme.accent, color: contrastText(theme.accent) }}>Accent</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card title="Typography" description="Google Fonts are loaded automatically. Headings, body and code can each use a different family.">
          <div className="grid lg:grid-cols-3 gap-5">
            <div><Field label="Display (headings)"><Select value={fonts.display} onChange={v => { setFonts(f => ({ ...f, display: v })); setDirty(true) }} options={sans} /></Field><div className="mt-3"><FontPreview family={fonts.display} kind="display" /></div></div>
            <div><Field label="Body"><Select value={fonts.body} onChange={v => { setFonts(f => ({ ...f, body: v })); setDirty(true) }} options={sans} /></Field><div className="mt-3"><FontPreview family={fonts.body} kind="body" /></div></div>
            <div><Field label="Monospace"><Select value={fonts.mono} onChange={v => { setFonts(f => ({ ...f, mono: v })); setDirty(true) }} options={mono} /></Field><div className="mt-3"><FontPreview family={fonts.mono} kind="mono" /></div></div>
          </div>
          <p className="field-hint mt-4 inline-flex items-center gap-1.5"><Type size={12} /> Fonts are cached by the browser after the first visit.</p>
        </Card>

        <div className="flex items-center justify-between card p-4">
          <p className="text-sm text-muted inline-flex items-center gap-2"><Sparkles size={14} className="text-accent-ink" /> {dirty ? 'You have unsaved changes.' : 'Everything is saved.'}</p>
          <div className="flex gap-2"><button onClick={reset} disabled={!dirty} className="btn btn-ghost btn-sm"><SunMoon size={13} /> Discard</button><button onClick={save} disabled={busy || !dirty} className="btn btn-primary btn-sm">{busy ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save appearance</button></div>
        </div>
      </div>
    </div>
  )
}
