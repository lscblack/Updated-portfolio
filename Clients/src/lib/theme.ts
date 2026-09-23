import type { Theme, ThemeTones } from './types'

export const DARK_WARM: ThemeTones = { bg: '#0C0A09', surface: '#161311', surface2: '#1F1B18', fg: '#F5F0EB', muted: '#9C948B', line: '#2B2521' }
export const LIGHT_WARM: ThemeTones = { bg: '#FBF9F6', surface: '#FFFFFF', surface2: '#F3EEE7', fg: '#17130F', muted: '#6B625A', line: '#E7E0D6' }
export const DARK_COOL: ThemeTones = { bg: '#09090B', surface: '#131316', surface2: '#1B1B20', fg: '#F4F4F5', muted: '#8F8F99', line: '#26262C' }
export const LIGHT_COOL: ThemeTones = { bg: '#FAFAFA', surface: '#FFFFFF', surface2: '#F1F1F3', fg: '#121214', muted: '#66666E', line: '#E3E3E8' }
export const DARK_GREEN: ThemeTones = { bg: '#090C0A', surface: '#111614', surface2: '#181F1B', fg: '#F0F5F1', muted: '#8B9A90', line: '#22302A' }
export const LIGHT_GREEN: ThemeTones = { bg: '#F8FAF8', surface: '#FFFFFF', surface2: '#EDF2EE', fg: '#0F1512', muted: '#5F6D64', line: '#DCE5DE' }

export const DARK_PETROL: ThemeTones = { bg: '#0A1014', surface: '#101820', surface2: '#16222B', fg: '#EAF2F5', muted: '#8FA3AD', line: '#1E2E38' }
export const LIGHT_PETROL: ThemeTones = { bg: '#F5F9FB', surface: '#FFFFFF', surface2: '#E9F1F5', fg: '#0E1A21', muted: '#5C7280', line: '#D6E3EA' }

export type Preset = { key: string; name: string; theme: Theme }

export const PRESETS: Preset[] = [
  { key: 'petrol', name: 'Petrol', theme: { preset: 'petrol', accent: '#0B5C7F', accent2: '#4FB3D9', radius: 16, dark: DARK_PETROL, light: LIGHT_PETROL, default_mode: 'dark' } },
  { key: 'ember', name: 'Ember', theme: { preset: 'ember', accent: '#F0631C', accent2: '#F5B301', radius: 14, dark: DARK_WARM, light: LIGHT_WARM, default_mode: 'dark' } },
  { key: 'emerald', name: 'Emerald', theme: { preset: 'emerald', accent: '#10B981', accent2: '#A3E635', radius: 14, dark: DARK_GREEN, light: LIGHT_GREEN, default_mode: 'dark' } },
  { key: 'violet', name: 'Violet', theme: { preset: 'violet', accent: '#8B5CF6', accent2: '#F472B6', radius: 16, dark: DARK_COOL, light: LIGHT_COOL, default_mode: 'dark' } },
  { key: 'crimson', name: 'Crimson', theme: { preset: 'crimson', accent: '#E11D48', accent2: '#FB923C', radius: 12, dark: DARK_WARM, light: LIGHT_WARM, default_mode: 'dark' } },
  { key: 'gold', name: 'Gold', theme: { preset: 'gold', accent: '#D4A017', accent2: '#F0631C', radius: 10, dark: DARK_WARM, light: LIGHT_WARM, default_mode: 'dark' } },
  { key: 'mint', name: 'Mint', theme: { preset: 'mint', accent: '#2DD4BF', accent2: '#FDE047', radius: 18, dark: DARK_GREEN, light: LIGHT_GREEN, default_mode: 'dark' } },
  { key: 'lime', name: 'Lime', theme: { preset: 'lime', accent: '#A3E635', accent2: '#F97316', radius: 8, dark: DARK_COOL, light: LIGHT_COOL, default_mode: 'dark' } },
  { key: 'rose', name: 'Rose', theme: { preset: 'rose', accent: '#F43F5E', accent2: '#A78BFA', radius: 20, dark: DARK_COOL, light: LIGHT_COOL, default_mode: 'dark' } },
  { key: 'mono', name: 'Monochrome', theme: { preset: 'mono', accent: '#FAFAFA', accent2: '#A1A1AA', radius: 6, dark: DARK_COOL, light: { ...LIGHT_COOL }, default_mode: 'dark' } },
]

export const DEFAULT_THEME: Theme = PRESETS[0].theme

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function luminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const [r, g, b] = rgb.map(v => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastText(hex: string): string {
  return luminance(hex) > 0.42 ? '#0B0B0C' : '#FFFFFF'
}

export function isHex(v: unknown): v is string {
  return typeof v === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)
}

export function normalizeTheme(t?: Partial<Theme> | null): Theme {
  const base = DEFAULT_THEME
  const tones = (x: Partial<ThemeTones> | undefined, fallback: ThemeTones): ThemeTones => ({
    bg: isHex(x?.bg) ? x!.bg! : fallback.bg,
    surface: isHex(x?.surface) ? x!.surface! : fallback.surface,
    surface2: isHex(x?.surface2) ? x!.surface2! : fallback.surface2,
    fg: isHex(x?.fg) ? x!.fg! : fallback.fg,
    muted: isHex(x?.muted) ? x!.muted! : fallback.muted,
    line: isHex(x?.line) ? x!.line! : fallback.line,
  })
  return {
    preset: t?.preset ?? base.preset,
    accent: isHex(t?.accent) ? t!.accent! : base.accent,
    accent2: isHex(t?.accent2) ? t!.accent2! : base.accent2,
    radius: typeof t?.radius === 'number' ? Math.min(32, Math.max(0, t.radius)) : base.radius,
    dark: tones(t?.dark, base.dark),
    light: tones(t?.light, base.light),
    default_mode: t?.default_mode ?? base.default_mode,
  }
}

/** Push a theme into CSS variables on <html>. Mode-specific tones are set as --d-* and --l-*. */
export function applyTheme(theme: Theme, target: HTMLElement = document.documentElement) {
  const s = target.style
  s.setProperty('--accent', theme.accent)
  s.setProperty('--accent-2', theme.accent2)
  s.setProperty('--accent-fg', contrastText(theme.accent))
  // readable version of the accent for text on dark surfaces (dark accents like #0B5C7F need lifting)
  s.setProperty('--accent-ink-dark', luminance(theme.accent) < 0.2 ? `color-mix(in oklab, ${theme.accent} 55%, white)` : theme.accent)
  s.setProperty('--accent-ink-light', luminance(theme.accent) > 0.5 ? `color-mix(in oklab, ${theme.accent} 60%, black)` : theme.accent)
  s.setProperty('--accent-2-fg', contrastText(theme.accent2))
  s.setProperty('--radius', `${theme.radius}px`)
  for (const [k, v] of Object.entries(theme.dark)) s.setProperty(`--d-${k}`, v)
  for (const [k, v] of Object.entries(theme.light)) s.setProperty(`--l-${k}`, v)
}
