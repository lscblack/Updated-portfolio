import { useEffect, useState } from 'react'
import { Reorder } from 'framer-motion'
import { Loader2, Save, RotateCcw, GripVertical, Eye, EyeOff } from 'lucide-react'
import api, { errorMessage } from '../../api/client'
import { useSite } from '../../contexts/SiteContext'
import type { SiteSettings } from '../../lib/types'
import { Card, Field, FileField, ImageField, ListEditor, ObjectListEditor, PageHeader, TagInput, TextArea, TextInput, Toggle } from './ui/Fields'
import { useToast } from './ui/Toast'

const SECTION_KEYS = ['about', 'journey', 'experience', 'skills', 'projects', 'education', 'activities', 'interests', 'hire', 'contact']
const SOCIAL_ICONS = ['Github', 'Linkedin', 'Mail', 'X', 'Instagram', 'Youtube', 'Globe', 'MessageCircle', 'Phone']

export default function AdminSite() {
  const { data, reload } = useSite()
  const { toast } = useToast()
  const [s, setS] = useState<SiteSettings | null>(null)
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    api.get('/api/admin/settings').then(r => setS(r.data)).catch(e => toast(errorMessage(e), 'error'))
  }, [toast])

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => { setS(x => x ? { ...x, [k]: v } : x); setDirty(true) }
  const save = async () => {
    if (!s) return
    setBusy(true)
    try {
      const { id: _id, ...payload } = s as SiteSettings & { id?: number }
      void _id
      const r = await api.patch('/api/admin/settings', payload)
      setS(r.data); setDirty(false); await reload(); toast('Site settings saved')
    } catch (e) { toast(errorMessage(e), 'error') } finally { setBusy(false) }
  }

  if (!s) return <div className="text-muted flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading</div>

  const sections = SECTION_KEYS.map(k => s.sections.find(x => x.key === k) ?? { key: k, label: k[0].toUpperCase() + k.slice(1), visible: true })
  const ordered = [...s.sections.filter(x => x.key !== 'hero' && SECTION_KEYS.includes(x.key)), ...sections.filter(x => !s.sections.some(y => y.key === x.key))]
  const setSections = (list: typeof ordered) => set('sections', [{ key: 'hero', label: 'Home', visible: true }, ...list])
  const titles = s.section_titles ?? {}
  const setTitle = (key: string, field: 'label' | 'title' | 'subtitle', v: string) => set('section_titles', { ...titles, [key]: { ...(titles[key] ?? {}), [field]: v } })

  const actions = <><button onClick={() => { setDirty(false); setS(data?.settings ?? s) }} disabled={!dirty} className="btn btn-ghost btn-sm"><RotateCcw size={13} /> Discard</button><button onClick={save} disabled={busy || !dirty} className="btn btn-primary btn-sm">{busy ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save</button></>

  return (
    <div>
      <PageHeader title="Site & hero" description="Identity, SEO, the hero section, metrics, links, and which sections appear in what order." actions={actions} />
      <div className="space-y-6">
        <Card title="Identity & SEO">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Site name"><TextInput value={s.site_name} onChange={v => set('site_name', v)} /></Field>
            <Field label="Logo text" hint="Shown as <text /> in the navbar"><TextInput value={s.logo_text} onChange={v => set('logo_text', v)} maxLength={24} /></Field>
            <Field label="SEO title" className="sm:col-span-2"><TextInput value={s.seo_title} onChange={v => set('seo_title', v)} /></Field>
            <Field label="SEO description" className="sm:col-span-2"><TextArea rows={3} value={s.seo_description} onChange={v => set('seo_description', v)} /></Field>
            <Field label="Keywords" className="sm:col-span-2"><TextArea rows={2} value={s.seo_keywords} onChange={v => set('seo_keywords', v)} /></Field>
            <Field label="Canonical URL"><TextInput value={s.canonical_url} onChange={v => set('canonical_url', v)} /></Field>
            <Field label="Social share image"><ImageField value={s.og_image} onChange={v => set('og_image', v)} /></Field>
          </div>
        </Card>

        <Card title="Hero">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Kicker badge" className="sm:col-span-2"><TextInput value={s.hero_kicker} onChange={v => set('hero_kicker', v)} /></Field>
            <Field label="Typewriter phrases" className="sm:col-span-2"><ListEditor value={s.hero_phrases} onChange={v => set('hero_phrases', v)} addLabel="Add phrase" /></Field>
            <Field label="Intro paragraph" className="sm:col-span-2"><TextArea value={s.hero_intro} onChange={v => set('hero_intro', v)} /></Field>
            <Field label="Primary button label"><TextInput value={s.hero_primary_label} onChange={v => set('hero_primary_label', v)} /></Field>
            <Field label="Primary button link"><TextInput value={s.hero_primary_href} onChange={v => set('hero_primary_href', v)} placeholder="#projects" /></Field>
            <Field label="Secondary button label"><TextInput value={s.hero_secondary_label} onChange={v => set('hero_secondary_label', v)} /></Field>
            <Field label="Secondary button link"><TextInput value={s.hero_secondary_href} onChange={v => set('hero_secondary_href', v)} placeholder="/resume.pdf" /></Field>
            <Field label="Resume (PDF)" hint="Opens in the in-app viewer at /resume with a download button" className="sm:col-span-2"><FileField value={s.resume_url} onChange={v => set('resume_url', v)} /></Field>
            <Field label="Availability text"><TextInput value={s.availability_text} onChange={v => set('availability_text', v)} /></Field>
            <div className="sm:col-span-2"><Toggle label="Show as available" checked={s.available} onChange={v => set('available', v)} /></div>
          </div>
        </Card>

        <Card title="Metrics" description="The numbers under the hero. Values like 14M+ or 3+ animate up on load.">
          <ObjectListEditor value={s.metrics} onChange={v => set('metrics', v as SiteSettings['metrics'])} columns={[{ key: 'value', label: 'Value', width: '90px', placeholder: '3+' }, { key: 'label', label: 'Label' }, { key: 'sub', label: 'Sub text' }]} addLabel="Add metric" />
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card title="Tech marquee"><TagInput value={s.marquee} onChange={v => set('marquee', v)} /></Card>
          <Card title="Live sites" description="Small badges on the hero card and footer.">
            <ObjectListEditor value={s.live_sites} onChange={v => set('live_sites', v as SiteSettings['live_sites'])} columns={[{ key: 'label', label: 'Label' }, { key: 'url', label: 'URL', type: 'url' }]} addLabel="Add site" />
          </Card>
        </div>

        <Card title="Social links">
          <ObjectListEditor value={s.social_links} onChange={v => set('social_links', v as SiteSettings['social_links'])} columns={[{ key: 'label', label: 'Label', width: '120px' }, { key: 'url', label: 'URL' }, { key: 'icon', label: 'Icon', type: 'select', options: SOCIAL_ICONS, width: '140px' }]} addLabel="Add link" />
        </Card>

        <Card title="Sections" description="Drag to reorder the page. Hidden sections also disappear from the navigation.">
          <Reorder.Group axis="y" values={ordered} onReorder={setSections} className="space-y-2">
            {ordered.map(sec => (
              <Reorder.Item key={sec.key} value={sec} className="card p-3 flex flex-wrap items-center gap-3 cursor-grab active:cursor-grabbing">
                <GripVertical size={15} className="text-muted" />
                <input className="input input-sm max-w-[160px]" value={sec.label} onChange={e => setSections(ordered.map(x => x.key === sec.key ? { ...x, label: e.target.value } : x))} aria-label="Navigation label" />
                <span className="font-mono text-xs text-muted">#{sec.key}</span>
                <div className="flex-1 grid sm:grid-cols-2 gap-2 min-w-[200px]">
                  <input className="input input-sm" placeholder="Section title" value={titles[sec.key]?.title ?? ''} onChange={e => setTitle(sec.key, 'title', e.target.value)} />
                  <input className="input input-sm" placeholder="Subtitle" value={titles[sec.key]?.subtitle ?? ''} onChange={e => setTitle(sec.key, 'subtitle', e.target.value)} />
                </div>
                <button onClick={() => setSections(ordered.map(x => x.key === sec.key ? { ...x, visible: !x.visible } : x))} className={`btn btn-sm ${sec.visible ? 'btn-outline' : 'btn-ghost text-muted'}`}>{sec.visible ? <Eye size={13} /> : <EyeOff size={13} />} {sec.visible ? 'Visible' : 'Hidden'}</button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </Card>

        <Card title="Contact & footer">
          <div className="grid gap-4">
            <Field label="Contact intro"><TextArea rows={3} value={s.contact_intro} onChange={v => set('contact_intro', v)} /></Field>
            <Field label="Footer text"><TextInput value={s.footer_text} onChange={v => set('footer_text', v)} /></Field>
          </div>
        </Card>

        <div className="flex justify-end gap-2">{actions}</div>
      </div>
    </div>
  )
}
