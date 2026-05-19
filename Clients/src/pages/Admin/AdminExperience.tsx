import { useEffect, useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2, CheckCircle2 } from 'lucide-react'
import api from '../../api/client'

type Job = {
  id?: number
  num: string
  title: string
  company: string
  location: string
  period: string
  job_type: string
  bullets: string[]
  tags: string[]
  order: number
  visible: boolean
}

const BLANK: Job = {
  num: '', title: '', company: '', location: '',
  period: '', job_type: '', bullets: [''], tags: [''],
  order: 0, visible: true,
}

const inputCls = 'w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-md text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-[#1A56A4] transition-colors'

function JobCard({ job, onChange, onDelete, onSave, saving }: {
  job: Job; onChange: (j: Job) => void; onDelete: () => void; onSave: () => void; saving: boolean
}) {
  const [open, setOpen] = useState(!job.id)

  const updateBullet = (i: number, v: string) => {
    const bullets = [...job.bullets]; bullets[i] = v; onChange({ ...job, bullets })
  }
  const addBullet = () => onChange({ ...job, bullets: [...job.bullets, ''] })
  const removeBullet = (i: number) => onChange({ ...job, bullets: job.bullets.filter((_, idx) => idx !== i) })

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/2 transition-colors">
        <div>
          <span className="font-mono text-xs text-gray-500">{job.num || '??'}</span>
          <span className="ml-3 font-semibold text-sm text-gray-100">
            {job.company || 'New Role'} — {job.title || '…'}
          </span>
          <span className="ml-2 text-xs text-gray-500">{job.period}</span>
        </div>
        {open ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-800 pt-5">
          <div className="grid sm:grid-cols-3 gap-3">
            {([['num', 'Number'], ['title', 'Title'], ['company', 'Company'],
               ['location', 'Location'], ['period', 'Period'], ['job_type', 'Type']] as [keyof Job, string][]).map(([k, label]) => (
              <div key={k}>
                <label className="block text-[11px] text-gray-500 mb-1">{label}</label>
                <input className={inputCls} value={String(job[k])}
                  onChange={e => onChange({ ...job, [k]: e.target.value })} />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[11px] text-gray-500 mb-2">Bullet Points</label>
            <div className="space-y-2">
              {job.bullets.map((b, i) => (
                <div key={i} className="flex gap-2">
                  <input className={`${inputCls} flex-1`} value={b}
                    onChange={e => updateBullet(i, e.target.value)} placeholder={`Bullet ${i + 1}`} />
                  <button onClick={() => removeBullet(i)} className="text-gray-600 hover:text-red-400 transition-colors px-1">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button onClick={addBullet} className="text-xs text-[#1A56A4] hover:underline">+ Add bullet</button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-gray-500 mb-1.5">Tags (comma-separated)</label>
            <input className={inputCls} value={job.tags.join(', ')}
              onChange={e => onChange({ ...job, tags: e.target.value.split(',').map(t => t.trim()) })} />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={onSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A56A4] text-white rounded-md text-sm font-medium disabled:opacity-60 hover:bg-blue-700 transition-colors">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-2 border border-red-800 text-red-400 rounded-md text-sm hover:bg-red-950/30 transition-colors">
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminExperience() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | string | null>(null)

  const load = () => {
    setLoading(true)
    api.get('/api/experience')
      .then(r => setJobs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const update = (i: number, j: Job) => setJobs(list => list.map((x, idx) => idx === i ? j : x))

  const save = async (i: number) => {
    const job = jobs[i]
    setSavingId(job.id ?? 'new')
    try {
      if (job.id) {
        await api.put(`/api/experience/${job.id}`, job)
      } else {
        const r = await api.post('/api/experience', job)
        setJobs(list => list.map((x, idx) => idx === i ? r.data : x))
      }
    } catch {}
    setSavingId(null)
  }

  const remove = async (i: number) => {
    const job = jobs[i]
    if (job.id) {
      await api.delete(`/api/experience/${job.id}`).catch(() => {})
    }
    setJobs(list => list.filter((_, idx) => idx !== i))
  }

  const addNew = () => setJobs(list => [...list, { ...BLANK, num: String(list.length + 1).padStart(2, '0') }])

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-gray-100">Work Experience</h1>
          <p className="text-xs text-gray-500 mt-0.5">Add, edit, or remove roles. Each saves independently.</p>
        </div>
        <button onClick={addNew}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#1A56A4] text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors">
          <Plus size={13} /> Add Role
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 py-8">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.length === 0 && (
            <p className="text-sm text-gray-600 py-4">
              No experience entries yet. Click "Add Role" or make sure the backend is running so defaults load.
            </p>
          )}
          {jobs.map((job, i) => (
            <JobCard key={job.id ?? `new-${i}`} job={job}
              onChange={j => update(i, j)}
              onDelete={() => remove(i)}
              onSave={() => save(i)}
              saving={savingId === (job.id ?? 'new')} />
          ))}
        </div>
      )}
    </div>
  )
}
