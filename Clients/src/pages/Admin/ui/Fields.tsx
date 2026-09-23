import { useEffect, useId, useRef, useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { GripVertical, Plus, Trash2, X, Upload, Loader2, ImageIcon, Search, FileText } from 'lucide-react'
import api, { errorMessage } from '../../../api/client'
import { ICON_NAMES, Icon } from '../../../lib/icons'
import { useToast } from './Toast'

/* ── basics ───────────────────────────────────────────────────────────── */
export function Field({ label, hint, children, className = '' }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><span className="label">{label}</span>{children}{hint && <p className="field-hint">{hint}</p>}</div>
}

export function TextInput({ value, onChange, ...rest }: { value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return <input className="input" value={value ?? ''} onChange={e => onChange(e.target.value)} {...rest} />
}

export function TextArea({ value, onChange, rows = 4, ...rest }: { value: string; onChange: (v: string) => void; rows?: number } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>) {
  return <textarea className="input" rows={rows} value={value ?? ''} onChange={e => onChange(e.target.value)} {...rest} />
}

export function NumberInput({ value, onChange, ...rest }: { value: number; onChange: (v: number) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return <input type="number" className="input" value={Number.isFinite(value) ? value : 0} onChange={e => onChange(Number(e.target.value))} {...rest} />
}

export function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: (string | { value: string; label: string })[] }) {
  return (
    <select className="input" value={value ?? ''} onChange={e => onChange(e.target.value)}>
      {options.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label?: string; hint?: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="toggle mt-0.5" />
      {(label || hint) && <span><span className="text-sm font-medium text-fg">{label}</span>{hint && <span className="block text-xs text-muted mt-0.5">{hint}</span>}</span>}
    </label>
  )
}

/* ── tags (string[]) ──────────────────────────────────────────────────── */
export function TagInput({ value, onChange, placeholder = 'Type and press Enter', suggestions }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; suggestions?: string[] }) {
  const [draft, setDraft] = useState('')
  const add = (t: string) => { const v = t.trim(); if (v && !value.includes(v)) onChange([...value, v]); setDraft('') }
  return (
    <div className="input !p-1.5 flex flex-wrap gap-1.5 items-center min-h-[2.8rem]">
      {value.map((t, i) => (
        <span key={`${t}-${i}`} className="tag !text-xs gap-1">{t}<button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label={`Remove ${t}`} className="opacity-60 hover:opacity-100"><X size={11} /></button></span>
      ))}
      <input value={draft} onChange={e => setDraft(e.target.value)} placeholder={value.length ? '' : placeholder} list={suggestions ? 'tag-suggestions' : undefined}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(draft) } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1)) }}
        onBlur={() => draft && add(draft)} className="flex-1 min-w-[120px] bg-transparent outline-none text-sm px-1.5 py-1" />
      {suggestions && <datalist id="tag-suggestions">{suggestions.map(s => <option key={s} value={s} />)}</datalist>}
    </div>
  )
}

/* ── list of long strings (bullets / paragraphs) ──────────────────────── */
function Row({ item, children, onRemove }: { item: unknown; children: React.ReactNode; onRemove: () => void }) {
  const controls = useDragControls()
  return (
    <Reorder.Item value={item} dragListener={false} dragControls={controls} className="flex items-start gap-2 bg-surface rounded-card-sm">
      <button type="button" onPointerDown={e => controls.start(e)} className="mt-3 text-muted hover:text-fg cursor-grab active:cursor-grabbing touch-none" aria-label="Drag to reorder"><GripVertical size={15} /></button>
      <div className="flex-1 min-w-0">{children}</div>
      <button type="button" onClick={onRemove} className="mt-2.5 p-1 text-muted hover:text-red-500" aria-label="Remove"><Trash2 size={14} /></button>
    </Reorder.Item>
  )
}

export function ListEditor({ value, onChange, placeholder = 'Add an item', multiline = false, addLabel = 'Add item' }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; multiline?: boolean; addLabel?: string }) {
  // stable keys for drag-reorder; ids live in state and are only touched in handlers
  const [ids, setIds] = useState<number[]>(() => value.map((_, i) => i + 1))
  const counter = useRef(value.length + 1)
  const items = value.map((text, i) => ({ id: ids[i] ?? -(i + 1), text }))
  const set = (list: { id: number; text: string }[]) => { setIds(list.map(x => x.id)); onChange(list.map(x => x.text)) }
  const add = () => { const id = counter.current++; set([...items, { id, text: '' }]) }
  return (
    <div className="space-y-2">
      <Reorder.Group axis="y" values={items} onReorder={set} className="space-y-2">
        {items.map((it, i) => (
          <Row key={it.id} item={it} onRemove={() => set(items.filter((_, k) => k !== i))}>
            {multiline
              ? <textarea className="input input-sm" rows={2} value={it.text} placeholder={placeholder} onChange={e => set(items.map((x, k) => k === i ? { ...x, text: e.target.value } : x))} />
              : <input className="input input-sm" value={it.text} placeholder={placeholder} onChange={e => set(items.map((x, k) => k === i ? { ...x, text: e.target.value } : x))} />}
          </Row>
        ))}
      </Reorder.Group>
      <button type="button" onClick={add} className="btn btn-ghost btn-sm"><Plus size={14} /> {addLabel}</button>
    </div>
  )
}

/* ── list of objects (rows with typed columns) ────────────────────────── */
export type ColumnDef = { key: string; label: string; type?: 'text' | 'number' | 'url' | 'icon' | 'select'; options?: string[]; width?: string; placeholder?: string; min?: number; max?: number }

export function ObjectListEditor({ value, onChange, columns, addLabel = 'Add row' }: { value: Record<string, unknown>[]; onChange: (v: Record<string, unknown>[]) => void; columns: ColumnDef[]; addLabel?: string }) {
  const [ids, setIds] = useState<number[]>(() => value.map((_, i) => i + 1))
  const counter = useRef(value.length + 1)
  const items = value.map((row, i) => ({ id: ids[i] ?? -(i + 1), row }))
  const set = (list: { id: number; row: Record<string, unknown> }[]) => { setIds(list.map(x => x.id)); onChange(list.map(x => x.row)) }
  const blank = () => Object.fromEntries(columns.map(c => [c.key, c.type === 'number' ? 0 : c.type === 'select' ? (c.options?.[0] ?? '') : '']))
  const add = () => { const id = counter.current++; set([...items, { id, row: blank() }]) }
  const grid = columns.map(c => c.width ?? '1fr').join(' ')
  return (
    <div className="space-y-2">
      {!!items.length && <div className="hidden sm:grid gap-2 pl-7 pr-8 text-[0.65rem] uppercase tracking-wider text-muted" style={{ gridTemplateColumns: grid }}>{columns.map(c => <span key={c.key}>{c.label}</span>)}</div>}
      <Reorder.Group axis="y" values={items} onReorder={set} className="space-y-2">
        {items.map((it, i) => (
          <Row key={it.id} item={it} onRemove={() => set(items.filter((_, k) => k !== i))}>
            <div className="grid gap-2" style={{ gridTemplateColumns: grid }}>
              {columns.map(c => {
                const v = it.row[c.key]
                const upd = (nv: unknown) => set(items.map((x, k) => k === i ? { ...x, row: { ...x.row, [c.key]: nv } } : x))
                if (c.type === 'icon') return <IconPicker key={c.key} value={String(v ?? '')} onChange={upd} compact />
                if (c.type === 'select') return <select key={c.key} className="input input-sm" value={String(v ?? '')} onChange={e => upd(e.target.value)}>{(c.options ?? []).map(o => <option key={o} value={o}>{o}</option>)}</select>
                if (c.type === 'number') return <input key={c.key} type="number" className="input input-sm" value={Number(v ?? 0)} min={c.min} max={c.max} onChange={e => upd(Number(e.target.value))} placeholder={c.placeholder} />
                return <input key={c.key} className="input input-sm" value={String(v ?? '')} onChange={e => upd(e.target.value)} placeholder={c.placeholder ?? c.label} />
              })}
            </div>
          </Row>
        ))}
      </Reorder.Group>
      <button type="button" onClick={add} className="btn btn-ghost btn-sm"><Plus size={14} /> {addLabel}</button>
    </div>
  )
}

/* ── icon picker ──────────────────────────────────────────────────────── */
export function IconPicker({ value, onChange, compact = false }: { value: string; onChange: (v: string) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])
  const names = ICON_NAMES.filter(n => n.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(o => !o)} className={`input ${compact ? 'input-sm' : ''} flex items-center gap-2 text-left`}>
        <span className="text-accent-ink"><Icon name={value} size={16} /></span><span className="truncate flex-1">{value || 'Pick an icon'}</span>
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-[280px] card glass shadow-2xl p-2">
          <div className="relative mb-2"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" /><input autoFocus className="input input-sm !pl-8" placeholder="Search icons" value={q} onChange={e => setQ(e.target.value)} /></div>
          <div className="grid grid-cols-6 gap-1 max-h-56 overflow-y-auto">
            {names.map(n => (
              <button key={n} type="button" title={n} onClick={() => { onChange(n); setOpen(false) }} className={`aspect-square rounded-card-sm grid place-items-center hover:bg-surface-2 ${n === value ? 'bg-accent text-accent-fg' : 'text-fg'}`}><Icon name={n} size={16} /></button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── image upload ─────────────────────────────────────────────────────── */
export function ImageField({ value, onChange, hint }: { value: string; onChange: (v: string) => void; hint?: string }) {
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const id = useId()
  const upload = async (file: File) => {
    setBusy(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const r = await api.post('/api/admin/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onChange(r.data.url); toast('Image uploaded')
    } catch (e) { toast(errorMessage(e), 'error') } finally { setBusy(false) }
  }
  return (
    <div className="flex gap-3 items-start">
      <div className="w-20 h-20 rounded-card-sm border border-line bg-surface-2 overflow-hidden grid place-items-center shrink-0 text-muted">
        {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={20} />}
      </div>
      <div className="flex-1 space-y-2">
        <input className="input input-sm" value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder="https://… or upload" />
        <div className="flex gap-2">
          <label htmlFor={id} className="btn btn-outline btn-sm cursor-pointer">{busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload</label>
          <input id={id} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
          {value && <button type="button" onClick={() => onChange('')} className="btn btn-ghost btn-sm">Clear</button>}
        </div>
        {hint && <p className="field-hint">{hint}</p>}
      </div>
    </div>
  )
}

/* ── document upload (PDF) ────────────────────────────────────────────── */
export function FileField({ value, onChange, hint, accept = 'application/pdf' }: { value: string; onChange: (v: string) => void; hint?: string; accept?: string }) {
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const id = useId()
  const upload = async (file: File) => {
    setBusy(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const r = await api.post('/api/admin/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onChange(r.data.url); toast('File uploaded')
    } catch (e) { toast(errorMessage(e), 'error') } finally { setBusy(false) }
  }
  return (
    <div className="flex gap-3 items-start">
      <div className="w-14 h-14 rounded-card-sm bg-surface-2 grid place-items-center shrink-0 text-accent-ink"><FileText size={20} /></div>
      <div className="flex-1 space-y-2">
        <input className="input input-sm" value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder="https://… or upload a PDF" />
        <div className="flex gap-2 flex-wrap">
          <label htmlFor={id} className="btn btn-outline btn-sm cursor-pointer">{busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload PDF</label>
          <input id={id} type="file" accept={accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
          {value && <a href={value} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Open</a>}
          {value && <button type="button" onClick={() => onChange('')} className="btn btn-ghost btn-sm">Clear</button>}
        </div>
        {hint && <p className="field-hint">{hint}</p>}
      </div>
    </div>
  )
}

/* ── image gallery (list of image urls) ───────────────────────────────── */
export function GalleryField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const id = useId()
  const upload = async (files: FileList) => {
    setBusy(true)
    const urls: string[] = []
    for (const f of Array.from(files)) {
      try { const fd = new FormData(); fd.append('file', f); const r = await api.post('/api/admin/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); urls.push(r.data.url) } catch (e) { toast(`${f.name}: ${errorMessage(e)}`, 'error') }
    }
    setBusy(false)
    // a newly uploaded portrait becomes the primary one — that is what 'change my picture' means
    if (urls.length) onChange([...urls, ...value])
  }
  const move = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= value.length) return; const v = [...value]; [v[i], v[j]] = [v[j], v[i]]; onChange(v) }
  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {value.map((u, i) => (
          <div key={`${u}-${i}`} className="relative group aspect-square rounded-card-sm overflow-hidden bg-surface-2">
            <img src={u} alt="" className="w-full h-full object-cover" />
            {i === 0 && <span className="absolute top-1.5 left-1.5 tag !text-[0.6rem]">Primary</span>}
            <div className="absolute inset-x-0 bottom-0 p-1.5 flex items-center justify-between gap-1 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              <button type="button" onClick={() => move(i, -1)} className="text-white text-xs px-1" aria-label="Move left">←</button>
              {i !== 0 && <button type="button" onClick={() => onChange([value[i], ...value.filter((_, k) => k !== i)])} className="text-white text-[0.6rem] font-bold px-1" title="Use as primary">SET</button>}
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="text-white" aria-label="Remove"><Trash2 size={13} /></button>
              <button type="button" onClick={() => move(i, 1)} className="text-white text-xs px-1" aria-label="Move right">→</button>
            </div>
          </div>
        ))}
        <label htmlFor={id} className="aspect-square rounded-card-sm border border-dashed border-line grid place-items-center text-muted hover:text-fg hover:border-muted cursor-pointer">
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          <input id={id} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={e => { if (e.target.files?.length) upload(e.target.files); e.target.value = '' }} />
        </label>
      </div>
      <p className="field-hint">The first image is your profile picture — used in the hero, About and social previews; the rest crossfade behind it. New uploads become primary automatically; hover an image and press SET to promote it.</p>
    </div>
  )
}

/* ── colour ───────────────────────────────────────────────────────────── */
export function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 card p-2.5 cursor-pointer">
      <span className="relative w-9 h-9 rounded-full border border-line shrink-0 overflow-hidden" style={{ background: value }}>
        <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'} onChange={e => onChange(e.target.value.toUpperCase())} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label={label} />
      </span>
      <span className="flex-1 min-w-0"><span className="block text-xs text-muted">{label}</span>
        <input value={value} onChange={e => onChange(e.target.value)} className="w-full bg-transparent font-mono text-sm text-fg outline-none uppercase" maxLength={7} /></span>
    </label>
  )
}

/* ── confirm ──────────────────────────────────────────────────────────── */
export function Confirm({ open, title, text, onCancel, onConfirm, danger = true }: { open: boolean; title: string; text?: string; onCancel: () => void; onConfirm: () => void; danger?: boolean }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/50 backdrop-blur-sm p-4" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="card p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-display font-bold text-lg text-fg">{title}</h3>
        {text && <p className="mt-2 text-sm text-muted">{text}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="btn btn-ghost btn-sm">Cancel</button>
          <button onClick={onConfirm} className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
      <div><h1 className="font-display font-extrabold text-2xl text-fg tracking-tight">{title}</h1>{description && <p className="text-sm text-muted mt-1 max-w-xl">{description}</p>}</div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ title, description, children, className = '' }: { title?: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`}>
      {title && <div className="mb-5"><h2 className="font-display font-bold text-base text-fg">{title}</h2>{description && <p className="text-xs text-muted mt-1">{description}</p>}</div>}
      {children}
    </section>
  )
}
