import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Terminal, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      nav('/admin', { replace: true })
    } catch {
      setError('Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 text-sm bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-[#1A56A4] transition-colors'

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-10 h-10 rounded-xl bg-[#1A56A4] flex items-center justify-center">
            <Terminal size={18} className="text-white" />
          </div>
          <span className="font-mono text-lg font-bold text-[#4A90D9]">&lt;lsc /&gt;</span>
        </div>

        <h1 className="text-xl font-black text-gray-100 text-center mb-1">Admin Dashboard</h1>
        <p className="text-xs text-gray-500 text-center mb-8">Sign in to manage your portfolio</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">Username</label>
            <input
              type="text"
              autoComplete="username"
              placeholder="lscblack"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                className={`${inputCls} pr-11`}
              />
              <button type="button" onClick={() => setShowPwd(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/40 border border-red-800 rounded-lg px-3 py-2.5">
              <AlertCircle size={13} />
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[#1A56A4] text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-700">
          Portfolio of Loue Sauveur Christian &nbsp;·&nbsp; Kigali, Rwanda 🇷🇼
        </p>
      </div>
    </div>
  )
}
