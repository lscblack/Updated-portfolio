import { GitBranch, Mail, Terminal, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 mt-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Terminal size={12} className="text-white" />
          </div>
          <span className="text-sm text-slate-500">Loue Sauveur Christian · Kigali, Rwanda</span>
        </div>
        <p className="text-xs text-slate-600 order-last sm:order-0">
          © {new Date().getFullYear()} · BSc Software Engineering @ ALU
        </p>
        <div className="flex items-center gap-4">
          {[
            { icon: GitBranch, href: 'https://github.com/lscblack', label: 'GitHub' },
            { icon: GitBranch, href: 'https://www.linkedin.com/in/lscblack', label: 'LinkedIn' },
            { icon: Mail, href: 'mailto:l.christian@alustudent.com', label: 'Email' },
            { icon: Phone, href: 'tel:+250790110231', label: 'Phone' },
          ].map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              aria-label={label}
              className="text-slate-600 hover:text-indigo-400 transition-colors"
            >
              <Icon size={16} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
