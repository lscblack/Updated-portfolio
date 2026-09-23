import { useEffect, useState } from 'react'
import { Loader2, Save, RotateCcw } from 'lucide-react'
import api, { errorMessage } from '../../api/client'
import { useSite } from '../../contexts/SiteContext'
import type { About } from '../../lib/types'
import { Card, Field, GalleryField, ListEditor, ObjectListEditor, PageHeader, TagInput, TextArea, TextInput } from './ui/Fields'
import { useToast } from './ui/Toast'

export default function AdminAbout() {
  const { reload } = useSite()
  const { toast } = useToast()
  const [a, setA] = useState<About | null>(null)
  const [orig, setOrig] = useState<About | null>(null)
  const [busy, setBusy] = useState(false)
  const dirty = JSON.stringify(a) !== JSON.stringify(orig)

  useEffect(() => { api.get('/api/admin/about').then(r => { setA(r.data); setOrig(r.data) }).catch(e => toast(errorMessage(e), 'error')) }, [toast])
  const set = <K extends keyof About>(k: K, v: About[K]) => setA(x => x ? { ...x, [k]: v } : x)
  const save = async () => {
    if (!a) return
    setBusy(true)
    try { const r = await api.patch('/api/admin/about', a); setA(r.data); setOrig(r.data); await reload(); toast('About saved') } catch (e) { toast(errorMessage(e), 'error') } finally { setBusy(false) }
  }
  if (!a) return <div className="text-muted flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading</div>
  const actions = <><button onClick={() => setA(orig)} disabled={!dirty} className="btn btn-ghost btn-sm"><RotateCcw size={13} /> Discard</button><button onClick={save} disabled={busy || !dirty} className="btn btn-primary btn-sm">{busy ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save</button></>

  return (
    <div>
      <PageHeader title="About" description="Your name, headline, biography and contact details." actions={actions} />
      <div className="space-y-6">
        <Card title="Identity">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name"><TextInput value={a.name} onChange={v => set('name', v)} /></Field>
            <Field label="Role"><TextInput value={a.role} onChange={v => set('role', v)} /></Field>
            <Field label="Headline" className="sm:col-span-2" hint="The big statement at the top of the About section"><TextInput value={a.headline} onChange={v => set('headline', v)} /></Field>
            <Field label="Highlighted words" hint="A phrase inside the headline rendered in the accent colour"><TextInput value={a.headline_highlight} onChange={v => set('headline_highlight', v)} /></Field>
          </div>
        </Card>
        <Card title="Portraits" description="Upload one or more photos; they rotate on the hero card and the About section.">
          <GalleryField value={a.gallery ?? []} onChange={v => { set('gallery', v); set('avatar_url', v[0] ?? '') }} />
        </Card>
        <Card title="Story">
          <div className="grid gap-4">
            <Field label="Pull quote"><TextArea rows={2} value={a.quote} onChange={v => set('quote', v)} /></Field>
            <Field label="Biography paragraphs"><ListEditor multiline value={a.bio} onChange={v => set('bio', v)} addLabel="Add paragraph" /></Field>
          </div>
        </Card>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card title="Contact">
            <div className="grid gap-4">
              <Field label="Email"><TextInput type="email" value={a.email} onChange={v => set('email', v)} /></Field>
              <Field label="Phone"><TextInput value={a.phone} onChange={v => set('phone', v)} /></Field>
              <Field label="Location"><TextInput value={a.location} onChange={v => set('location', v)} /></Field>
              <Field label="Languages"><TagInput value={a.languages} onChange={v => set('languages', v)} /></Field>
              <Field label="Open to"><TagInput value={a.open_to} onChange={v => set('open_to', v)} /></Field>
            </div>
          </Card>
          <div className="space-y-6">
            <Card title="Currently" description="Roles shown on the hero card and About section.">
              <ObjectListEditor value={a.currently} onChange={v => set('currently', v as About['currently'])} columns={[{ key: 'role', label: 'Role' }, { key: 'org', label: 'Organisation' }, { key: 'url', label: 'URL', type: 'url' }]} addLabel="Add role" />
            </Card>
            <Card title="Quick facts" description="Label / value pairs under the portrait.">
              <ObjectListEditor value={a.facts} onChange={v => set('facts', v as About['facts'])} columns={[{ key: 'label', label: 'Label', width: '140px' }, { key: 'value', label: 'Value' }]} addLabel="Add fact" />
            </Card>
          </div>
        </div>
        <div className="flex justify-end gap-2">{actions}</div>
      </div>
    </div>
  )
}
