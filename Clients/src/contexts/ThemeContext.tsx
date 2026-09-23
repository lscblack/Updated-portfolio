import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { applyTheme, normalizeTheme } from '../lib/theme'
import { applyFonts, normalizeFonts } from '../lib/fonts'
import type { Fonts, Theme } from '../lib/types'

type Mode = 'light' | 'dark'

interface ThemeCtx {
  mode: Mode
  toggle: () => void
  setMode: (m: Mode) => void
  theme: Theme
  fonts: Fonts
  /** Apply a site theme/fonts (called by SiteContext once data loads, and by the dashboard preview). */
  setSiteTheme: (t?: Partial<Theme> | null, f?: Partial<Fonts> | null) => void
}

const Ctx = createContext<ThemeCtx>({
  mode: 'dark', toggle: () => {}, setMode: () => {}, theme: normalizeTheme(null), fonts: normalizeFonts(null), setSiteTheme: () => {},
})

const MODE_KEY = 'lsc_mode'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => normalizeTheme(null))
  const [fonts, setFonts] = useState<Fonts>(() => normalizeFonts(null))
  const [mode, setModeState] = useState<Mode>(() => {
    try {
      const saved = localStorage.getItem(MODE_KEY)
      if (saved === 'light' || saved === 'dark') return saved
    } catch { /* ignore */ }
    return 'dark'
  })
  const [userChose, setUserChose] = useState<boolean>(() => { try { return !!localStorage.getItem(MODE_KEY) } catch { return false } })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', mode === 'dark')
    root.style.colorScheme = mode
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', mode === 'dark' ? theme.dark.bg : theme.light.bg)
  }, [mode, theme])

  useEffect(() => { applyTheme(theme) }, [theme])
  useEffect(() => { applyFonts(fonts) }, [fonts])

  const setMode = useCallback((m: Mode) => {
    setModeState(m); setUserChose(true)
    try { localStorage.setItem(MODE_KEY, m) } catch { /* ignore */ }
  }, [])
  const toggle = useCallback(() => setMode(mode === 'dark' ? 'light' : 'dark'), [mode, setMode])

  const setSiteTheme = useCallback((t?: Partial<Theme> | null, f?: Partial<Fonts> | null) => {
    const nt = normalizeTheme(t)
    setTheme(nt)
    setFonts(normalizeFonts(f))
    if (!userChose) {
      const pref = nt.default_mode
      if (pref === 'light' || pref === 'dark') setModeState(pref)
      else if (pref === 'system') setModeState(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    }
  }, [userChose])

  const value = useMemo(() => ({ mode, toggle, setMode, theme, fonts, setSiteTheme }), [mode, toggle, setMode, theme, fonts, setSiteTheme])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)
