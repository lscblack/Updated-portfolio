/** Visit tracking for the public site.
 *
 * No cookies: a random id in localStorage identifies the *device* (so repeat visits can be recognised)
 * and the server stores only a keyed hash of it. Honours Do Not Track, skips the dashboard, and reports
 * cumulative values so a dropped beacon never loses earlier progress.
 *
 * Deliberately a module-level singleton: React StrictMode mounts effects twice in development, and a
 * per-call tracker would open two sessions and split the counters between them.
 */
import { API_BASE } from '../api/client'

const DEVICE_KEY = 'lsc_device'
const HEARTBEAT_MS = 15_000
const FIRST_PING_MS = 4_000      // short visits should still record their sections and scroll depth
const IDLE_AFTER_MS = 60_000     // stop counting time once the visitor goes quiet

type State = {
  session: string
  interactions: number
  maxScroll: number
  activeMs: number
  lastTick: number
  lastActivity: number
  sections: Set<string>
  timers: number[]
  observer: IntersectionObserver | null
  bound: boolean
}

let s: State | null = null

function deviceId(): string | null {
  try {
    let id = localStorage.getItem(DEVICE_KEY)
    if (!id) {
      id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/-/g, '')
      localStorage.setItem(DEVICE_KEY, id)
    }
    return id
  } catch {
    return null   // storage blocked (private mode): the visit simply is not counted
  }
}

function doNotTrack(): boolean {
  const nav = navigator as Navigator & { msDoNotTrack?: string }
  const w = window as Window & { doNotTrack?: string }
  return [nav.doNotTrack, nav.msDoNotTrack, w.doNotTrack].some(v => v === '1' || v === 'yes')
}

function post(path: string, body: unknown, beacon = false) {
  const url = `${API_BASE}${path}`
  const payload = JSON.stringify(body)
  if (beacon && navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }))
    return Promise.resolve(null)
  }
  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: beacon })
    .then(r => (r.ok ? r.json() : null)).catch(() => null)
}

function tick() {
  if (!s) return
  const now = Date.now()
  // only count time while the tab is visible and the visitor has done something recently
  if (document.visibilityState === 'visible' && now - s.lastActivity < IDLE_AFTER_MS) s.activeMs += now - s.lastTick
  s.lastTick = now
}

function scanSections() {
  if (!s) return
  if (!s.observer) {
    s.observer = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting && e.target.id) s?.sections.add(e.target.id) }),
      { threshold: 0, rootMargin: '-35% 0px -35% 0px' },
    )
  }
  document.querySelectorAll('section[id]').forEach(el => s!.observer!.observe(el))
}

function send(beacon = false) {
  tick()
  if (!s?.session) return
  post(`/api/public/visit/${s.session}/ping`, {
    duration: Math.round(s.activeMs / 1000),
    interactions: s.interactions,
    max_scroll: s.maxScroll,
    sections: [...s.sections],
    pages: 1,
  }, beacon)
}

const onActivity = () => { if (s) { s.lastActivity = Date.now(); s.interactions += 1 } }
const onScroll = () => {
  if (!s) return
  s.lastActivity = Date.now()
  const doc = document.documentElement
  const total = doc.scrollHeight
  if (total > 0) s.maxScroll = Math.min(100, Math.max(s.maxScroll, Math.round(((window.scrollY + window.innerHeight) / total) * 100)))
}
const onVisibility = () => { tick(); if (document.visibilityState === 'hidden') send(true) }
const onLeave = () => send(true)

export function startTracking(): () => void {
  if (typeof window === 'undefined') return () => {}
  if (doNotTrack() || location.pathname.startsWith('/admin')) return () => {}
  if (s) return () => {}          // already running — StrictMode remount, not a new visit
  const visitor = deviceId()
  if (!visitor) return () => {}

  const now = Date.now()
  s = { session: '', interactions: 0, maxScroll: 0, activeMs: 0, lastTick: now, lastActivity: now, sections: new Set(), timers: [], observer: null, bound: true }

  addEventListener('click', onActivity, { passive: true })
  addEventListener('keydown', onActivity, { passive: true })
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('visibilitychange', onVisibility)
  addEventListener('pagehide', onLeave)

  post('/api/public/visit', {
    visitor,
    path: location.pathname,
    referrer: document.referrer || '',
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    language: navigator.language || '',
  }).then(r => {
    const res = r as { session?: string } | null
    if (!s || !res?.session) return
    s.session = res.session
    scanSections()
    s.timers.push(window.setTimeout(() => { scanSections(); send() }, FIRST_PING_MS))
    s.timers.push(window.setInterval(() => { scanSections(); send() }, HEARTBEAT_MS))
  })

  // the tracker lives for the life of the page, so the React cleanup intentionally does nothing
  return () => {}
}
