import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg text-fg grid place-items-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg -z-10" aria-hidden="true" />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-lg">
        <span className="inline-grid place-items-center w-16 h-16 rounded-full bg-accent/15 text-accent-ink mb-8"><Compass size={26} /></span>
        <p className="section-label justify-center">error 404</p>
        <h1 className="h-display text-[clamp(4rem,14vw,9rem)] mt-3 text-gradient">404</h1>
        <p className="mt-4 text-muted text-lg leading-relaxed">This path does not exist on the map. It may have moved or the link might be wrong.</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/" className="btn btn-primary"><ArrowLeft size={15} /> Back home</Link>
          <Link to="/admin" className="btn btn-outline">Dashboard</Link>
        </div>
      </motion.div>
    </div>
  )
}
