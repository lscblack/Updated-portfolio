import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { envelopeSupported, getSessionKey, open, resetEnvelope, seal, type Envelope } from '../lib/crypto'

/** Same-origin in production (nginx proxies /api), explicit URL in development. */
export const API_BASE: string = (import.meta.env.VITE_API_URL as string | undefined) || ''

const TOKEN_KEY = 'lsc_admin_token'

export const tokenStore = {
  get: () => { try { return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) } catch { return null } },
  set: (t: string, remember: boolean) => {
    try { (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, t); (remember ? sessionStorage : localStorage).removeItem(TOKEN_KEY) } catch { /* ignore */ }
  },
  clear: () => { try { sessionStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ } },
}

const api = axios.create({ baseURL: API_BASE, timeout: 20000, headers: { 'X-Requested-With': 'lscblack-portfolio' } })

const plain = axios.create({ baseURL: API_BASE, timeout: 10000 })
const fetchHandshake = () => plain.get('/api/public/handshake').then(r => r.data)

const ENCRYPT_PREFIXES = ['/api/admin', '/api/public/contact']
function shouldEncrypt(cfg: InternalAxiosRequestConfig): boolean {
  const url = cfg.url || ''
  if (!ENCRYPT_PREFIXES.some(p => url.startsWith(p))) return false
  if (cfg.data instanceof FormData) return false
  return envelopeSupported()
}

api.interceptors.request.use(async cfg => {
  const t = tokenStore.get()
  if (t) cfg.headers.set('Authorization', `Bearer ${t}`)
  if (shouldEncrypt(cfg)) {
    const sk = await getSessionKey(fetchHandshake)
    if (sk) {
      cfg.headers.set('X-Payload-Encryption', 'v1')
      cfg.headers.set('X-Payload-Key', sk.epk)
      if (cfg.data !== undefined && cfg.data !== null) {
        cfg.data = await seal(sk, cfg.data)
        cfg.headers.set('Content-Type', 'application/json')
      }
      ;(cfg as InternalAxiosRequestConfig & { _sealed?: boolean })._sealed = true
    }
  }
  return cfg
})

async function unseal(data: unknown): Promise<unknown> {
  const sk = await getSessionKey(fetchHandshake)
  if (!sk || !data || typeof data !== 'object' || !('ct' in (data as Envelope))) return data
  return open(sk, data as Envelope)
}

api.interceptors.response.use(
  async res => {
    if (res.headers?.['x-payload-encryption'] === 'v1') res.data = await unseal(res.data)
    return res
  },
  async (err: AxiosError) => {
    if (err.response?.headers?.['x-payload-encryption'] === 'v1') {
      try { err.response.data = await unseal(err.response.data) } catch { /* keep */ }
    }
    if (err.response?.status === 400 && (err.response.data as { detail?: string })?.detail === 'Bad encrypted envelope') {
      resetEnvelope()   // server key rotated — next request re-handshakes
    }
    if (err.response?.status === 401 && (err.config?.url || '').startsWith('/api/admin') && !(err.config?.url || '').includes('/auth/login')) {
      tokenStore.clear()
      window.dispatchEvent(new CustomEvent('lsc:unauthorized'))
    }
    return Promise.reject(err)
  },
)

export function errorMessage(e: unknown, fallback = 'Something went wrong'): string {
  const err = e as AxiosError<{ detail?: string | { msg: string }[] }>
  const d = err?.response?.data?.detail
  if (typeof d === 'string') return d
  if (Array.isArray(d)) return d.map(x => x.msg).join('; ')
  if (err?.code === 'ERR_NETWORK') return 'Cannot reach the API. Is the server running?'
  return err?.message || fallback
}

export default api
