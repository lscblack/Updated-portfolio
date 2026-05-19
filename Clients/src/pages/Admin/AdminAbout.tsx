import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import api from '../../api/client'

type AboutData = {
  name: string; role: string; tagline: string; bio_para1: string; bio_para2: string;
  quote: string; email: string; phone: string; github: string; linkedin: string;
  location: string; avatar_url: string; open_to: string;
}

const FIELDS: { key: keyof AboutData; label: string; multiline?: boolean }[] = [
  { key: 'name', label: 'Full Name' },
  { key: 'role', label: 'Role Title' },
  { key: 'tagline', label: 'Hero Tagline', multiline: true },
  { key: 'quote', label: 'Pull Quote (About section)', multiline: true },
  { key: 'bio_para1', label: 'Bio — Paragraph 1', multiline: true },
  { key: 'bio_para2', label: 'Bio — Paragraph 2', multiline: true },
  { key: 'open_to', label: 'Open To (comma-separated)' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'location', label: 'Location' },
  { key: 'github', label: 'GitHub URL' },
  { key: 'linkedin', label: 'LinkedIn URL' },
  { key: 'avatar_url', label: 'Avatar URL' },
]

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function AdminAbout() {
  const [data, setData] = useState<AboutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<SaveStatus>('idle')

  const load = () => {
    setLoading(true)
    api.get('/api/about')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleChange = (key: keyof AboutData, value: string) => {
    setData(d => d ? { ...d, [key]: value } : d)
  }

  const save = async () => {
    if (!data) return
    setStatus('saving')
    try {
      await api.patch('/api/about', data)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const inputCls = 'w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-md text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-[#1A56A4] transition-colors'

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-gray-100">About Me</h1>
          <p className="text-xs text-gray-500 mt-0.5">Edit your bio, tagline, quote, and contact details.</p>
        </div>
        <button onClick={load} className="text-gray-500 hover:text-gray-300 transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 py-8">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : data ? (
        <form onSubmit={e => { e.preventDefault(); save() }} className="space-y-5">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{f.label}</label>
              {f.multiline ? (
                <textarea
                  value={data[f.key]}
                  onChange={e => handleChange(f.key, e.target.value)}
                  rows={4}
                  className={`${inputCls} resize-none`}
                />
              ) : (
                <input
                  type="text"
                  value={data[f.key]}
                  onChange={e => handleChange(f.key, e.target.value)}
                  className={inputCls}
                />
              )}
            </div>
          ))}

          <div className="pt-2">
            <button type="submit" disabled={status === 'saving'}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1A56A4] text-white rounded-md text-sm font-medium hover:bg-[#1548861] disabled:opacity-60 transition-colors">
              {status === 'saving' && <Loader2 size={14} className="animate-spin" />}
              {status === 'saved' && <CheckCircle2 size={14} className="text-green-400" />}
              {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved!' : status === 'error' ? 'Error — retry' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-red-400 text-sm">Could not load data. Make sure the FastAPI server is running.</p>
      )}
    </div>
  )
}
