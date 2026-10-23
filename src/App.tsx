import { About } from './components/About'
import { Contact } from './components/Contact'
import { Education } from './components/Education'
import { Experience } from './components/Experience'
import { FeaturedProjects } from './components/FeaturedProjects'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Navbar } from './components/Navbar'
import { SaaSProducts } from './components/SaaSProducts'
import { Skills } from './components/Skills'
import { WhatsAppButton } from './components/WhatsAppButton'
import { useReveal } from './hooks/useReveal'

export default function App() {
  useReveal()
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Experience />
        <Skills />
        <FeaturedProjects />
        <SaaSProducts />
        <Education />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
