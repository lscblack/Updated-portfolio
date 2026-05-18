import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Story from '../components/Story'
import Skills from '../components/Skills'
import Projects from '../components/Projects'
import PersonalProjects from '../components/PersonalProjects'
import Timeline from '../components/Timeline'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <div className="bg-mesh" />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Story />
        <Skills />
        <Projects />
        <PersonalProjects />
        <Timeline />
        <Contact />
        <Footer />
      </div>
    </div>
  )
}
