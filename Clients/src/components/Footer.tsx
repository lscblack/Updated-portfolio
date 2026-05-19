export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-950 py-8">
      <div className="w-11/12 mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-mono-stack text-[#1A56A4] font-bold text-sm">&lt;lsc /&gt;</span>
        <p className="text-xs text-gray-500 text-center order-last sm:order-0">
          Built with React + FastAPI &nbsp;·&nbsp; Kigali, Rwanda 🇷🇼
        </p>
        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} Loue Sauveur Christian. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
