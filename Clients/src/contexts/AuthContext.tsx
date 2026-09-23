import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { tokenStore } from '../api/client'

export type AdminInfo = { id: number; email: string; name: string; last_login_at: string | null }

interface AuthCtx {
  token: string | null
  admin: AdminInfo | null
  isAuthenticated: boolean
  ready: boolean
  startLogin: (email: string, password: string) => Promise<{ challenge_id: string; delivery: string; expires_in: number; masked_email: string }>
  verify: (challengeId: string, code: string, remember: boolean) => Promise<void>
  logout: (everywhere?: boolean) => Promise<void>
  setSession: (token: string, admin: AdminInfo) => void
}

const Ctx = createContext<AuthCtx>({
  token: null, admin: null, isAuthenticated: false, ready: false,
  startLogin: async () => ({ challenge_id: '', delivery: '', expires_in: 0, masked_email: '' }),
  verify: async () => {}, logout: async () => {}, setSession: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStore.get())
  const [admin, setAdmin] = useState<AdminInfo | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!token) { setReady(true); return }
    api.get('/api/admin/auth/me')
      .then(r => { if (!cancelled) setAdmin(r.data) })
      .catch(() => { if (!cancelled) { tokenStore.clear(); setToken(null); setAdmin(null) } })
      .finally(() => { if (!cancelled) setReady(true) })
    return () => { cancelled = true }
  }, [token])

  useEffect(() => {
    const onUnauthorized = () => { setToken(null); setAdmin(null) }
    window.addEventListener('lsc:unauthorized', onUnauthorized)
    return () => window.removeEventListener('lsc:unauthorized', onUnauthorized)
  }, [])

  const startLogin = useCallback(async (email: string, password: string) => {
    const r = await api.post('/api/admin/auth/login', { email, password })
    return r.data
  }, [])

  const setSession = useCallback((t: string, a: AdminInfo) => {
    const remember = !!localStorage.getItem('lsc_admin_token')
    tokenStore.set(t, remember)
    setToken(t); setAdmin(a)
  }, [])

  const verify = useCallback(async (challengeId: string, code: string, remember: boolean) => {
    const r = await api.post('/api/admin/auth/verify', { challenge_id: challengeId, code })
    tokenStore.set(r.data.access_token, remember)
    setToken(r.data.access_token); setAdmin(r.data.admin)
  }, [])

  const logout = useCallback(async (everywhere = false) => {
    try { await api.post(everywhere ? '/api/admin/auth/logout-all' : '/api/admin/auth/logout') } catch { /* ignore */ }
    tokenStore.clear(); setToken(null); setAdmin(null)
  }, [])

  const value = useMemo(() => ({ token, admin, isAuthenticated: !!token, ready, startLogin, verify, logout, setSession }), [token, admin, ready, startLogin, verify, logout, setSession])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
