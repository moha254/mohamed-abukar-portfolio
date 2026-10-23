import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { navLinks } from '../data/profile'
import { DownloadCVButton } from './DownloadCVButton'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  active: string
}

export function MobileMenu({ open, onClose, active }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      // Keep keyboard focus inside the open menu.
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>('a[href], button')
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      opener?.focus({ preventScroll: true })
    }
  }, [open, onClose])

  // Portalled to <body>: the navbar's backdrop-filter would otherwise become the
  // containing block for this fixed overlay and clip it to the navbar's height.
  return createPortal(
    <div className={`mobile-menu${open ? ' is-open' : ''}`} hidden={!open} id="mobile-menu">
      <div className="mobile-menu__backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} className="mobile-menu__panel" role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className="mobile-menu__head">
          <span className="eyebrow">Menu</span>
          <button ref={closeRef} type="button" className="icon-btn" aria-label="Close navigation menu" onClick={onClose}>
            <X aria-hidden="true" size={22} />
          </button>
        </div>
        <nav aria-label="Mobile">
          <ul className="mobile-menu__links">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={onClose}
                  className={active === link.id ? 'is-active' : undefined}
                  aria-current={active === link.id ? 'location' : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mobile-menu__actions">
          <a href="#contact" className="btn btn--primary" onClick={onClose}>
            Contact Me
          </a>
          <DownloadCVButton variant="secondary" />
        </div>
      </div>
    </div>,
    document.body,
  )
}
