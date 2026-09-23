import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, Reorder } from 'framer-motion'
import { Plus, Trash2, Save, Loader2, GripVertical, Eye, EyeOff, Search, X, Copy } from 'lucide-react'
import api, { errorMessage } from '../../api/client'
import { useSite } from '../../contexts/SiteContext'
import { Icon } from '../../lib/icons'
import { COLLECTIONS, type FieldDef } from './collections'
import { Confirm, Field, IconPicker, ImageField, ListEditor, ObjectListEditor, PageHeader, Select, TagInput, TextArea, TextInput, Toggle, NumberInput } from './ui/Fields'
import { useToast } from './ui/Toast'

type Row = Record<string, unknown> & { id?: number; order?: number; visible?: boolean }

function FieldControl({ def, value, onChange }: { def: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  switch (def.type) {
    case 'text': return <TextInput value={String(value ?? '')} onChange={onChange} placeholder={def.placeholder} />
    case 'textarea': return <TextArea value={String(value ?? '')} onChange={onChange} placeholder={def.placeholder} />
    case 'number': return <NumberInput value={Number(value ?? 0)} onChange={onChange} />
    case 'boolean': return <Toggle checked={!!value} onChange={onChange} label={def.hint ?? (value ? 'Yes' : 'No')} />
    case 'select': return <Select value={String(value ?? '')} onChange={onChange} options={def.options ?? []} />
    case 'tags': return <TagInput value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} suggestions={def.options} />
    case 'list': return <ListEditor value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} multiline={def.multiline} />
    case 'icon': return <IconPicker value={String(value ?? '')} onChange={onChange} />
    case 'image': return <ImageField value={String(value ?? '')} onChange={onChange} hint={def.hint} />
    case 'objects': return <ObjectListEditor value={Array.isArray(value) ? (value as Record<string, unknown>[]) : []} onChange={onChange} columns={def.columns ?? []} />
  }
}

export default function AdminCollection({ name }: { name: string }) {
  const def = COLLECTIONS[name]
  const { reload } = useSite()
  const { toast } = useToast()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Row | null>(null)
  const [orig, setOrig] = useState<Row | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState<Row | null>(null)
  const [q, setQ] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await api.get(`/api/admin/c/${name}`); setRows(r.data) } catch (e) { toast(errorMessage(e), 'error') } finally { setLoading(false) }
  }, [name, toast])
  useEffect(() => { load(); setSelected(null); setOrig(null); setQ('') }, [load])

  const dirty = useMemo(() => JSON.stringify(selected) !== JSON.stringify(orig), [selected, orig])
  const pick = (r: Row | null) => {
    if (dirty && !window.confirm('Discard unsaved changes?')) return
    setSelected(r ? { ...r } : null); setOrig(r ? { ...r } : null)
  }
  const create = () => pick({ ...def.blank })
  const duplicate = (r: Row) => { const { id: _id, ...rest } = r; void _id; pick({ ...rest, [def.titleKey]: `${String(r[def.titleKey] ?? '')} (copy)` }) }

  const save = async () => {
    if (!selected) return
    setBusy(true)
    try {
      const r = selected.id ? await api.put(`/api/admin/c/${name}/${selected.id}`, selected) : await api.post(`/api/admin/c/${name}`, selected)
      toast(selected.id ? 'Saved' : 'Created')
      setSelected({ ...r.data }); setOrig({ ...r.data })
      await load(); await reload()
    } catch (e) { toast(errorMessage(e), 'error') } finally { setBusy(false) }
  }
  const remove = async (r: Row) => {
    setConfirm(null)
    try { await api.delete(`/api/admin/c/${name}/${r.id}`); toast('Deleted'); if (selected?.id === r.id) { setSelected(null); setOrig(null) } await load(); await reload() } catch (e) { toast(errorMessage(e), 'error') }
  }
  const toggleVisible = async (r: Row) => {
    const key = 'visible' in r ? 'visible' : 'public' in r ? 'public' : null
    if (!key) return
    try { await api.put(`/api/admin/c/${name}/${r.id}`, { ...r, [key]: !r[key] }); await load(); await reload() } catch (e) { toast(errorMessage(e), 'error') }
  }
  const reorder = async (list: Row[]) => {
    setRows(list)
    try { await api.post(`/api/admin/c/${name}/reorder`, list.map(r => r.id)); await reload() } catch (e) { toast(errorMessage(e), 'error') }
  }

  const filtered = q ? rows.filter(r => JSON.stringify(r).toLowerCase().includes(q.toLowerCase())) : rows
  if (!def) return <p className="text-red-500">Unknown collection.</p>

  return (
    <div>
      <PageHeader title={def.title} description={def.description} actions={<button onClick={create} className="btn btn-primary btn-sm"><Plus size={14} /> New {def.singular}</button>} />
      <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* list */}
        <div className="card overflow-hidden lg:sticky lg:top-24">
          <div className="p-3 border-b border-line relative">
            <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input input-sm !pl-8" placeholder={`Search ${rows.length} ${def.singular}s`} value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="max-h-[calc(100vh-14rem)] overflow-y-auto">
            {loading ? <div className="p-6 text-muted text-sm flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading</div> : !filtered.length ? <div className="p-6 text-muted text-sm">Nothing here yet.</div> : (
              <Reorder.Group axis="y" values={filtered} onReorder={q ? () => {} : reorder} className="divide-y divide-line">
                {filtered.map(r => {
                  const hidden = ('visible' in r && r.visible === false) || ('public' in r && r.public === false)
                  const active = selected?.id === r.id
                  return (
                    <Reorder.Item key={r.id} value={r} dragListener={!q} className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer ${active ? 'bg-accent/10' : 'hover:bg-surface-2'}`} onClick={() => pick(r)}>
                      <GripVertical size={14} className="text-muted shrink-0 cursor-grab" />
                      {def.imageKey && r[def.imageKey] ? <img src={String(r[def.imageKey])} alt="" className="w-8 h-8 rounded-card-sm object-cover shrink-0" /> :
                        def.badgeKey === 'icon' ? <span className="w-8 h-8 rounded-card-sm bg-surface-2 grid place-items-center text-accent-ink shrink-0"><Icon name={String(r.icon ?? '')} size={14} /></span> :
                        <span className="w-8 h-8 rounded-card-sm bg-surface-2 grid place-items-center font-mono text-[0.6rem] text-muted shrink-0 truncate px-1">{String(r[def.badgeKey ?? ''] ?? '').slice(0, 4)}</span>}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold truncate ${hidden ? 'text-muted line-through' : 'text-fg'}`}>{String(r[def.titleKey] || 'Untitled')}</p>
                        {def.subtitleKey && <p className="text-xs text-muted truncate">{String(r[def.subtitleKey] ?? '')}</p>}
                      </div>
                      {r.featured === true && <span className="tag !text-[0.6rem]">Featured</span>}
                      <button onClick={e => { e.stopPropagation(); toggleVisible(r) }} className="p-1 text-muted hover:text-fg" aria-label="Toggle visibility">{hidden ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                    </Reorder.Item>
                  )
                })}
              </Reorder.Group>
            )}
          </div>
          {!q && rows.length > 1 && <p className="px-3 py-2 text-[0.65rem] text-muted border-t border-line">Drag rows to reorder — saved instantly.</p>}
        </div>

        {/* editor */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div key={selected.id ?? 'new'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div><h2 className="font-display font-bold text-lg text-fg">{selected.id ? `Edit ${def.singular}` : `New ${def.singular}`}</h2>{selected.id && <p className="text-xs text-muted font-mono">#{selected.id}</p>}</div>
                <div className="flex items-center gap-1.5">
                  {selected.id && <button onClick={() => duplicate(selected)} className="btn btn-ghost btn-sm" title="Duplicate"><Copy size={13} /></button>}
                  {selected.id && <button onClick={() => setConfirm(selected)} className="btn btn-ghost btn-sm text-red-500" title="Delete"><Trash2 size={13} /></button>}
                  <button onClick={() => pick(null)} className="btn btn-ghost btn-sm" title="Close"><X size={14} /></button>
                </div>
              </div>
              <form onSubmit={e => { e.preventDefault(); save() }} className="grid sm:grid-cols-2 gap-5">
                {def.fields.map(f => (
                  <Field key={f.key} label={f.label} hint={f.type === 'boolean' || f.type === 'image' ? undefined : f.hint} className={f.span === 2 ? 'sm:col-span-2' : ''}>
                    <FieldControl def={f} value={selected[f.key]} onChange={v => setSelected(s => s ? { ...s, [f.key]: v } : s)} />
                  </Field>
                ))}
                <div className="sm:col-span-2 flex items-center justify-between pt-3 border-t border-line">
                  <p className="text-xs text-muted">{dirty ? 'Unsaved changes' : 'All changes saved'}</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setSelected(orig ? { ...orig } : null)} disabled={!dirty} className="btn btn-ghost btn-sm">Discard</button>
                    <button type="submit" disabled={busy || !dirty} className="btn btn-primary btn-sm">{busy ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} {selected.id ? 'Save' : 'Create'}</button>
                  </div>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-10 text-center text-muted border-dashed">
              <p className="text-sm">Select a {def.singular} on the left or create a new one.</p>
              <button onClick={create} className="btn btn-outline btn-sm mt-4"><Plus size={14} /> New {def.singular}</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Confirm open={!!confirm} title={`Delete this ${def.singular}?`} text="This cannot be undone." onCancel={() => setConfirm(null)} onConfirm={() => confirm && remove(confirm)} />
    </div>
  )
}
