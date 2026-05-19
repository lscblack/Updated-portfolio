import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2, Eye, EyeOff, LogOut, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/client'

type Status = 'idle' | 'saving' | 'saved' | 'error'

export default function AdminSettings() {
  const { username, logout } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({
    current_password: '',
    new_username: '',
    new_password: '',
    confirm_password: '',
  })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (form.new_password && form.new_password !== form.confirm_password) {
      setErrorMsg('New passwords do not match.')
      return
    }
    if (!form.new_username && !form.new_password) {
      setErrorMsg('Enter a new username or new password.')
      return
    }
    setStatus('saving')
    try {
      await api.patch('/api/admin/credentials', {
        current_password: form.current_password,
        new_username: form.new_username || undefined,
        new_password: form.new_password || undefined,
      })
      setStatus('saved')
      setForm({ current_password: '', new_username: '', new_password: '', confirm_password: '' })
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setErrorMsg(msg ?? 'Failed to update credentials.')
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  const handleLogout = () => {
    logout()
    nav('/admin/login', { replace: true })
  }

  const inputCls = 'w-full px-3 py-2.5 text-sm bg-gray-800 border border-gray-700 rounded-md text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-[#1A56A4] transition-colors'

  return (
    <div className="max-w-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-gray-100">Settings</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Logged in as <span className="text-[#4A90D9] font-mono">{username}</span>
          </p>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-700 text-gray-400 rounded-md text-xs hover:border-red-700 hover:text-red-400 transition-colors">
          <LogOut size={13} /> Logout
        </button>
      </div>

      <form onSubmit={handleSubmit} className="border border-gray-800 rounded-xl p-6 bg-gray-900/50 space-y-5">
        <h2 className="text-sm font-bold text-gray-300 mb-4">Update Credentials</h2>

        {/* Current password — always required */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Current Password *</label>
          <div className="relative">
            <input type={showCurrent ? 'text' : 'password'}
              value={form.current_password}
              onChange={e => setForm(f => ({ ...f, current_password: e.target.value }))}
              required placeholder="Your current password"
              className={`${inputCls} pr-10`} />
            <button type="button" onClick={() => setShowCurrent(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors">
              {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-5 space-y-4">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider">Change (leave blank to keep current)</p>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">New Username</label>
            <input type="text" value={form.new_username}
              onChange={e => setForm(f => ({ ...f, new_username: e.target.value }))}
              placeholder={username ?? 'lscblack'}
              className={inputCls} />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">New Password</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={form.new_password}
                onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}
                placeholder="New password"
                className={`${inputCls} pr-10`} />
              <button type="button" onClick={() => setShowNew(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors">
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {form.new_password && (
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">Confirm New Password</label>
              <input type="password" value={form.confirm_password}
                onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))}
                placeholder="Repeat new password"
                className={inputCls} />
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/40 border border-red-800 rounded-lg px-3 py-2.5">
            <AlertCircle size={13} />
            {errorMsg}
          </div>
        )}

        <button type="submit" disabled={status === 'saving'}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1A56A4] text-white rounded-md text-sm font-medium disabled:opacity-60 hover:bg-blue-700 transition-colors">
          {status === 'saving' && <Loader2 size={14} className="animate-spin" />}
          {status === 'saved' && <CheckCircle2 size={14} className="text-green-400" />}
          {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved!' : 'Update Credentials'}
        </button>
      </form>
    </div>
  )
}
