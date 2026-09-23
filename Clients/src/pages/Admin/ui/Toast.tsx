import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

type Kind = 'success' | 'error' | 'info'
type Toast = { id: number; kind: Kind; text: string }
const Ctx = createContext<{ toast: (text: string, kind?: Kind) => void }>({ toast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const toast = useCallback((text: string, kind: Kind = 'success') => {
    const id = Date.now() + Math.random()
    setItems(x => [...x, { id, kind, text }])
    setTimeout(() => setItems(x => x.filter(t => t.id !== id)), kind === 'error' ? 6000 : 3200)
  }, [])
  const value = useMemo(() => ({ toast }), [toast])
  const icon = { success: <CheckCircle2 size={16} className="text-emerald-500" />, error: <AlertCircle size={16} className="text-red-500" />, info: <Info size={16} className="text-accent-ink" /> }
  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[min(92vw,360px)]" aria-live="polite">
        <AnimatePresence>
          {items.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} className="card glass p-3.5 pr-9 flex items-start gap-2.5 text-sm shadow-xl relative">
              <span className="mt-0.5 shrink-0">{icon[t.kind]}</span><span className="text-fg">{t.text}</span>
              <button onClick={() => setItems(x => x.filter(i => i.id !== t.id))} className="absolute top-2.5 right-2.5 text-muted hover:text-fg" aria-label="Dismiss"><X size={13} /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}
export const useToast = () => useContext(Ctx)
