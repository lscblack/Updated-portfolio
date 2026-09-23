/** Parsing helpers for API timestamps.
 *
 * The API returns ISO strings that may or may not carry an offset ("…+00:00" from timezone-aware
 * rows, plain "…" from older naive rows). A bare value is UTC, so it gets a "Z"; one that already
 * has an offset must be left alone or Date() rejects it.
 */
export function parseApiDate(iso: string | null | undefined): Date | null {
  if (!iso) return null
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(iso)
  const d = new Date(hasZone ? iso : `${iso}Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDateTime(iso: string | null | undefined): string {
  const d = parseApiDate(iso)
  return d ? d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}

export function timeAgo(iso: string | null | undefined): string {
  const d = parseApiDate(iso)
  if (!d) return '—'
  const s = (Date.now() - d.getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' })
}
