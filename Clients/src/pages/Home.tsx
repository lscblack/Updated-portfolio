import { useEffect, useMemo } from 'react'
import ScrollProgress from '../components/ScrollProgress'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import About from '../components/About'
import Journey from '../components/Journey'
import Skills from '../components/Skills'
import Experience from '../components/Experience'
import Projects from '../components/Projects'
import Education from '../components/Education'
import Activities from '../components/Activities'
import Interests from '../components/Interests'
import Contact from '../components/Contact'
import Hire from '../components/Hire'
import Footer from '../components/Footer'
import CursorGlow from '../components/ui/CursorGlow'
import Preloader from '../components/ui/Preloader'
import { useSite } from '../contexts/SiteContext'
import { startTracking } from '../lib/analytics'

const SECTIONS: Record<string, React.ComponentType> = {
  hero: Hero, about: About, journey: Journey, experience: Experience, skills: Skills,
  projects: Projects, education: Education, activities: Activities, interests: Interests, hire: Hire, contact: Contact,
}
const DEFAULT_ORDER = Object.keys(SECTIONS)

export default function Home() {
  const { data, loading, error } = useSite()
  useEffect(() => startTracking(), [])
  const s = data?.settings
  const effects = s?.effects ?? {}
  const order = useMemo(() => {
    const cfg = s?.sections?.length ? s.sections : DEFAULT_ORDER.map(key => ({ key, label: key, visible: true }))
    const keys = cfg.filter(x => x.visible !== false && SECTIONS[x.key]).map(x => x.key)
    // sections added after the settings row was created appear before "contact"
    const missing = DEFAULT_ORDER.filter(k => !cfg.some(x => x.key === k))
    const at = keys.indexOf('contact'); const merged = at >= 0 ? [...keys.slice(0, at), ...missing, ...keys.slice(at)] : [...keys, ...missing]
    return merged.includes('hero') ? merged : ['hero', ...merged]
  }, [s])

  if (error && !data) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div>
          <p className="section-label justify-center">offline</p>
          <h1 className="h-section mt-4">The portfolio API is not reachable.</h1>
          <p className="mt-3 text-muted">Start the server and refresh this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-bg text-fg ${effects.grain !== false ? 'noise' : ''}`}>
      {effects.preloader !== false && <Preloader text={s?.logo_text ? s.logo_text : 'lsc'} ready={!loading && !!data} />}
      {effects.cursor_glow !== false && <CursorGlow />}
      <ScrollProgress />
      <a href="#about" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-fg focus:rounded-full focus:text-sm">Skip to content</a>
      <Navbar />
      <main>
        {data ? order.map(key => { const C = SECTIONS[key]; return <C key={key} /> }) : <div className="min-h-screen" />}
      </main>
      {data && <Footer />}
    </div>
  )
}
