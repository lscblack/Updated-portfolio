import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Terminal } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        {/* Code block style 404 */}
        <div className="bg-gray-950 rounded-xl border border-gray-800 p-8 mb-10 inline-block text-left">
          <div className="flex items-center gap-1.5 mb-5">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-3 text-gray-600 text-xs font-mono-stack">error.ts</span>
          </div>
          <div className="font-mono-stack text-sm leading-7">
            <div className="text-gray-600 italic">// Unexpected navigation</div>
            <div>
              <span className="text-blue-400">throw new</span>{' '}
              <span className="text-yellow-300">HttpError</span>
              <span className="text-gray-500">(</span>
            </div>
            <div className="pl-5">
              <span className="text-amber-300">404</span>
              <span className="text-gray-500">,</span>
            </div>
            <div className="pl-5">
              <span className="text-amber-300">"Page not found"</span>
            </div>
            <div><span className="text-gray-500">);</span></div>
            <div className="mt-4 text-green-400 italic">
              // Route does not exist in this portfolio
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#1A56A4] flex items-center justify-center">
              <Terminal size={14} className="text-white" />
            </div>
            <span className="font-mono font-bold text-[#1A56A4]">&lt;lsc /&gt;</span>
          </div>

          <h1 className="text-7xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-3">
            404
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-base leading-relaxed">
            The page you're looking for doesn't exist.<br />
            It may have moved or the URL might be wrong.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A56A4] text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
              <ArrowLeft size={15} />
              Back to Portfolio
            </Link>
            <Link to="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold text-sm hover:border-[#1A56A4] hover:text-[#1A56A4] transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
