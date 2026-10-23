import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { navLinks, profile } from '../data/profile'
import { useActiveSection } from '../hooks/useActiveSection'
import { DownloadCVButton } from './DownloadCVButton'
import { MobileMenu } from './MobileMenu'

const sectionIds = navLinks.map((l) => l.id)

export function Navbar() {
  const active = useActiveSection(sectionIds)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <a href="#home" className="wordmark" aria-label={`${profile.name}, back to top`}>
          <span className="wordmark__mark" aria-hidden="true">
            {profile.initials}
          </span>
          <span className="wordmark__name">
            Mohamed <strong>Abukar</strong>
          </span>
        </a>

        <nav aria-label="Primary" className="navbar__nav">
          <ul className="navbar__links">
            {navLinks
              .filter((l) => l.id !== 'contact')
              .map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    className={`navbar__link${active === link.id ? ' is-active' : ''}`}
                    aria-current={active === link.id ? 'location' : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
          </ul>
        </nav>

        <div className="navbar__actions">
          <DownloadCVButton variant="ghost" size="sm" label="CV" className="navbar__cv" />
          <a
            href="#contact"
            className={`btn btn--outline btn--sm navbar__contact${active === 'contact' ? ' is-active' : ''}`}
            aria-current={active === 'contact' ? 'location' : undefined}
          >
            Contact Me
          </a>
          <button
            type="button"
            className="icon-btn navbar__toggle"
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            <Menu aria-hidden="true" size={22} />
          </button>
        </div>
      </div>
      <MobileMenu open={open} onClose={() => setOpen(false)} active={active} />
    </header>
  )
}
