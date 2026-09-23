import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import { useTheme } from './ThemeContext'
import type { SectionTitle, SiteData } from '../lib/types'

interface SiteCtx {
  data: SiteData | null
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  sectionTitle: (key: string, fallback: SectionTitle) => Required<SectionTitle>
  isVisible: (key: string) => boolean
}

const Ctx = createContext<SiteCtx>({ data: null, loading: true, error: null, reload: async () => {}, sectionTitle: (_, f) => ({ label: f.label ?? '', title: f.title ?? '', subtitle: f.subtitle ?? '' }), isVisible: () => true })

const CACHE_KEY = 'lsc_site_cache_v2'

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const { setSiteTheme } = useTheme()
  const [data, setData] = useState<SiteData | null>(() => {
    try { const raw = sessionStorage.getItem(CACHE_KEY); return raw ? (JSON.parse(raw) as SiteData) : null } catch { return null }
  })
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const r = await api.get<SiteData>('/api/public/site')
      setData(r.data); setError(null)
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(r.data)) } catch { /* ignore */ }
    } catch (e) {
      setError((e as Error).message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { if (data?.settings) setSiteTheme(data.settings.theme, data.settings.fonts) }, [data, setSiteTheme])

  useEffect(() => {
    if (!data?.settings) return
    const s = data.settings
    if (s.seo_title) document.title = s.seo_title
    const set = (sel: string, attr: string, val: string) => { const el = document.querySelector(sel); if (el && val) el.setAttribute(attr, val) }
    set('meta[name="description"]', 'content', s.seo_description)
    set('meta[name="keywords"]', 'content', s.seo_keywords)
    set('meta[property="og:title"]', 'content', s.seo_title)
    set('meta[property="og:description"]', 'content', s.seo_description)
    set('meta[property="og:image"]', 'content', s.og_image)
    set('meta[name="twitter:image"]', 'content', s.og_image)
    set('link[rel="canonical"]', 'href', s.canonical_url)
  }, [data])

  const sectionTitle = useCallback((key: string, fallback: SectionTitle) => {
    const t = data?.settings?.section_titles?.[key] ?? {}
    return { label: t.label || fallback.label || key, title: t.title || fallback.title || '', subtitle: t.subtitle ?? fallback.subtitle ?? '' }
  }, [data])

  const isVisible = useCallback((key: string) => {
    const s = data?.settings?.sections?.find(x => x.key === key)
    return s ? s.visible !== false : true
  }, [data])

  const value = useMemo(() => ({ data, loading, error, reload: load, sectionTitle, isVisible }), [data, loading, error, load, sectionTitle, isVisible])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useSite = () => useContext(Ctx)
