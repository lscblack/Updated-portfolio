/** Client half of the encrypted payload envelope: ECDH P-256 → HKDF-SHA256 → AES-256-GCM. */
const INFO = new TextEncoder().encode('lscblack-portfolio-payload-v1')

export type Envelope = { v: 1; epk?: string; iv: string; ct: string }

type SessionKey = { key: CryptoKey; epk: string; kid: string }

let session: SessionKey | null = null
let disabled = false
let pending: Promise<SessionKey | null> | null = null

const b64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf)))
const unb64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0))

export function envelopeSupported(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle && !disabled
}

export function resetEnvelope() { session = null; pending = null }

/** Derive (once) a shared AES key with the server's public key from /api/public/handshake. */
export async function getSessionKey(fetchHandshake: () => Promise<{ enabled: boolean; kid?: string; public_key?: string }>): Promise<SessionKey | null> {
  if (session) return session
  if (!envelopeSupported()) return null
  if (pending) return pending
  pending = (async () => {
    try {
      const hs = await fetchHandshake()
      if (!hs.enabled || !hs.public_key) { disabled = true; return null }
      const serverKey = await crypto.subtle.importKey('spki', unb64(hs.public_key), { name: 'ECDH', namedCurve: 'P-256' }, false, [])
      const mine = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])
      const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: serverKey }, mine.privateKey, 256)
      const hkdfKey = await crypto.subtle.importKey('raw', shared, 'HKDF', false, ['deriveKey'])
      const aes = await crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: INFO }, hkdfKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
      const spki = await crypto.subtle.exportKey('spki', mine.publicKey)
      session = { key: aes, epk: b64(spki), kid: hs.kid || '' }
      return session
    } catch {
      disabled = true
      return null
    } finally {
      pending = null
    }
  })()
  return pending
}

export async function seal(sk: SessionKey, data: unknown): Promise<Envelope> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plain = new TextEncoder().encode(JSON.stringify(data ?? {}))
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, sk.key, plain)
  return { v: 1, epk: sk.epk, iv: b64(iv), ct: b64(ct) }
}

export async function open(sk: SessionKey, env: Envelope): Promise<unknown> {
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(env.iv) }, sk.key, unb64(env.ct))
  const text = new TextDecoder().decode(plain)
  return text ? JSON.parse(text) : null
}
