import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, ArrowLeft, Mail, KeyRound } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { errorMessage } from '../../api/client'
import { Sun, Moon } from 'lucide-react'

type Step = { challenge_id: string; delivery: string; expires_in: number; masked_email: string }

export default function Login() {
  const { startLogin, verify, isAuthenticated, ready } = useAuth()
  const { mode, toggle } = useTheme()
  const nav = useNavigate()
  const loc = useLocation()
  const from = (loc.state as { from?: string } | null)?.from || '/admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [show, setShow] = useState(false)
  const [step, setStep] = useState<Step | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [left, setLeft] = useState(0)
  const codeRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (ready && isAuthenticated) nav(from, { replace: true }) }, [ready, isAuthenticated, nav, from])
  useEffect(() => {
    if (!step) return
    setLeft(step.expires_in)
    const t = setInterval(() => setLeft(x => Math.max(0, x - 1)), 1000)
    setTimeout(() => codeRef.current?.focus(), 50)
    return () => clearInterval(t)
  }, [step])

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setBusy(true)
    try { setStep(await startLogin(email.trim(), password)) } catch (err) { setError(errorMessage(err, 'Sign-in failed')) } finally { setBusy(false) }
  }
  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setBusy(true)
    try { await verify(step!.challenge_id, code.replace(/\s/g, ''), remember); nav(from, { replace: true }) } catch (err) { setError(errorMessage(err, 'Verification failed')) } finally { setBusy(false) }
  }

  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0')

  return (
    <div className="min-h-screen bg-bg text-fg grid lg:grid-cols-[1.1fr_1fr]">
      <div className="hidden lg:flex relative overflow-hidden flex-col justify-between p-12 bg-surface border-r border-line">
        <div className="absolute inset-0 grid-bg" aria-hidden="true" />
        <Link to="/" className="relative font-mono text-sm font-bold text-fg">&lt;lsc /&gt;</Link>
        <div className="relative max-w-md">
          <span className="inline-grid place-items-center w-12 h-12 rounded-full bg-accent/15 text-accent-ink mb-6"><ShieldCheck size={22} /></span>
          <h1 className="h-section text-fg">Portfolio control room.</h1>
          <p className="mt-4 text-muted leading-relaxed">Edit every word, colour and font on the public site. Sign-in is protected by a password plus a one-time code sent to your inbox.</p>
        </div>
        <p className="relative text-xs text-muted font-mono">Sessions are encrypted end to end and revoked when the password changes.</p>
      </div>

      <div className="flex flex-col p-6 sm:p-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg"><ArrowLeft size={14} /> Back to site</Link>
          <button onClick={toggle} className="w-9 h-9 rounded-full grid place-items-center text-muted hover:bg-surface-2" aria-label="Toggle theme">{mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
        </div>
        <div className="flex-1 grid place-items-center">
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">
              {!step ? (
                <motion.form key="pw" onSubmit={submitPassword} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-5">
                  <div><h2 className="font-display font-extrabold text-2xl">Sign in</h2><p className="text-sm text-muted mt-1">Use your administrator email.</p></div>
                  <div><label className="label" htmlFor="email">Email</label><div className="relative"><Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input id="email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} className="input !pl-10" placeholder="you@example.com" /></div></div>
                  <div><label className="label" htmlFor="password">Password</label><div className="relative"><KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="input !pl-10 !pr-11" placeholder="Your password" /><button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg" aria-label="Show password">{show ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></div>
                  <label className="flex items-center gap-2 text-sm text-muted cursor-pointer"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-[var(--accent)]" /> Keep me signed in on this device</label>
                  {error && <p className="text-sm text-red-500 flex items-center gap-2"><AlertCircle size={14} />{error}</p>}
                  <button type="submit" disabled={busy} className="btn btn-primary w-full">{busy && <Loader2 size={15} className="animate-spin" />} Continue</button>
                </motion.form>
              ) : (
                <motion.form key="otp" onSubmit={submitCode} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="space-y-5">
                  <div>
                    <h2 className="font-display font-extrabold text-2xl">Check your inbox</h2>
                    <p className="text-sm text-muted mt-1">
                      {step.delivery === 'console' ? 'Email is disabled on the server — the code was printed to the API log.' : <>A one-time code was sent to <span className="text-fg font-semibold">{step.masked_email}</span>.</>}
                    </p>
                  </div>
                  <div>
                    <label className="label" htmlFor="code">Verification code</label>
                    <input ref={codeRef} id="code" inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={e => setCode(e.target.value.replace(/[^\d ]/g, '').slice(0, 10))} className="input font-mono text-2xl tracking-[0.5em] text-center" placeholder="••••••" />
                    <p className="field-hint flex justify-between"><span>Expires in {mm}:{ss}</span><button type="button" onClick={() => { setStep(null); setCode(''); setError('') }} className="text-accent-ink hover:underline">Start over</button></p>
                  </div>
                  {error && <p className="text-sm text-red-500 flex items-center gap-2"><AlertCircle size={14} />{error}</p>}
                  <button type="submit" disabled={busy || left === 0} className="btn btn-primary w-full">{busy && <Loader2 size={15} className="animate-spin" />} Verify and sign in</button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
