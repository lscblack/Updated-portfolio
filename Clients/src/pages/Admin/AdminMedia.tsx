import { useCallback, useEffect, useState } from 'react'
import { Upload, Trash2, Copy, Loader2, Images, FileText } from 'lucide-react'
import api, { errorMessage } from '../../api/client'
import type { UploadItem } from '../../lib/types'
import { Confirm, PageHeader } from './ui/Fields'
import { useToast } from './ui/Toast'

function size(n: number) { return n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB` }

export default function AdminMedia() {
  const { toast } = useToast()
  const [items, setItems] = useState<UploadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState<UploadItem | null>(null)
  const [drag, setDrag] = useState(false)

  const load = useCallback(async () => { try { const r = await api.get('/api/admin/uploads'); setItems(r.data) } catch (e) { toast(errorMessage(e), 'error') } finally { setLoading(false) } }, [toast])
  useEffect(() => { load() }, [load])

  const upload = async (files: FileList | File[]) => {
    setBusy(true)
    for (const f of Array.from(files)) {
      try { const fd = new FormData(); fd.append('file', f); await api.post('/api/admin/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } }) } catch (e) { toast(`${f.name}: ${errorMessage(e)}`, 'error') }
    }
    setBusy(false); await load(); toast('Upload complete')
  }
  const copy = (url: string) => { navigator.clipboard.writeText(url).then(() => toast('URL copied')) }
  const remove = async (u: UploadItem) => { setConfirm(null); try { await api.delete(`/api/admin/uploads/${u.id}`); setItems(x => x.filter(i => i.id !== u.id)); toast('Deleted') } catch (e) { toast(errorMessage(e), 'error') } }

  return (
    <div>
      <PageHeader title="Media" description="Images for portraits, project covers and logos. Files are re-encoded on upload, which strips metadata." />
      <label onDragOver={e => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) upload(e.dataTransfer.files) }}
        className={`card border-dashed p-10 grid place-items-center text-center cursor-pointer transition-colors ${drag ? 'border-accent bg-accent/5' : 'hover:border-muted'}`}>
        <input type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,application/pdf" className="hidden" onChange={e => { if (e.target.files?.length) upload(e.target.files); e.target.value = '' }} />
        <span className="w-12 h-12 rounded-full bg-accent/15 text-accent-ink grid place-items-center mb-3">{busy ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}</span>
        <p className="text-sm font-semibold text-fg">Drop images here or click to upload</p>
        <p className="text-xs text-muted mt-1">JPEG, PNG, WebP, GIF or PDF</p>
      </label>
      <div className="mt-6">
        {loading ? <p className="text-sm text-muted">Loading</p> : !items.length ? <p className="text-sm text-muted text-center py-10"><Images className="mx-auto mb-2" size={22} />No uploads yet.</p> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(u => (
              <figure key={u.id} className="card overflow-hidden group">
                <div className="aspect-square bg-surface-2 overflow-hidden grid place-items-center">{u.content_type === 'application/pdf' ? <a href={u.url} target="_blank" rel="noreferrer" className="text-accent-ink flex flex-col items-center gap-2 text-xs"><FileText size={34} />PDF</a> : <img src={u.url} alt={u.original_name} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />}</div>
                <figcaption className="p-3">
                  <p className="text-xs font-semibold text-fg truncate" title={u.original_name}>{u.original_name || u.filename}</p>
                  <p className="text-[0.65rem] text-muted">{u.width ? `${u.width}×${u.height} · ` : ''}{size(u.size)}</p>
                  <div className="mt-2 flex gap-1"><button onClick={() => copy(u.url)} className="btn btn-outline btn-sm flex-1"><Copy size={12} /> Copy URL</button><button onClick={() => setConfirm(u)} className="btn btn-ghost btn-sm text-red-500"><Trash2 size={12} /></button></div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
      <Confirm open={!!confirm} title="Delete this image?" text="Anything still referencing it will show a broken image." onCancel={() => setConfirm(null)} onConfirm={() => confirm && remove(confirm)} />
    </div>
  )
}
