import ScrollProgress from '../components/ScrollProgress'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import About from '../components/About'
import Skills from '../components/Skills'
import Experience from '../components/Experience'
import Projects from '../components/Projects'
import Activities from '../components/Activities'
import Interests from '../components/Interests'
import Education from '../components/Education'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
      <ScrollProgress />
      {/* Skip-to-content for accessibility + SEO crawlability */}
      <a href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:px-4 focus:py-2 focus:bg-[#1A56A4] focus:text-white focus:rounded-md focus:text-sm">
        Skip to content
      </a>
      <Navbar />
      <main itemScope itemType="https://schema.org/Person"
        itemID="https://lscblack.dev/#person">
        {/* Hidden machine-readable identity signals */}
        <meta itemProp="name" content="Loue Sauveur Christian" />
        <meta itemProp="alternateName" content="lscblack" />
        <meta itemProp="jobTitle" content="Senior Software Engineer" />
        <meta itemProp="email" content="louesauveur18@gmail.com" />
        <meta itemProp="url" content="https://lscblack.dev" />
        <meta itemProp="image" content="https://avatars.githubusercontent.com/u/141139366?v=4" />
        <meta itemProp="description" content="Senior Software Engineer specialising in cybersecurity, machine learning, and full-stack web development in Kigali, Rwanda." />
        <link itemProp="sameAs" href="https://github.com/lscblack" />
        <link itemProp="sameAs" href="https://www.linkedin.com/in/christian-loue-sauveur/" />

        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Activities />
        <Interests />
        <Education />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
