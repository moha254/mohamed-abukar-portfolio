import { navLinks, profile } from '../data/profile'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <a href="#home" className="wordmark wordmark--dark" aria-label={`${profile.name}, back to top`}>
            <span className="wordmark__mark" aria-hidden="true">
              {profile.initials}
            </span>
            <span className="wordmark__name">
              Mohamed <strong>Abukar</strong>
            </span>
          </a>
          <p className="footer__tag">{profile.headline.join(' · ')}</p>
        </div>
        <nav aria-label="Footer">
          <h2 className="footer__heading">Navigation</h2>
          <ul className="footer__links footer__links--cols">
            {navLinks.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="footer__heading">Get in touch</h2>
          <ul className="footer__links">
            <li>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </li>
            <li>
              <a href={profile.phoneHref}>{profile.phone}</a>
            </li>
            <li>
              <a href={profile.whatsappHref} target="_blank" rel="noopener noreferrer">
                WhatsApp<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={profile.github} target="_blank" rel="noopener noreferrer">
                GitHub<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer__bottom">
        <p>
          © {new Date().getFullYear()} {profile.name}. {profile.location}.
        </p>
        <p>
          {profile.business.name} — {profile.business.tagline}
        </p>
      </div>
    </footer>
  )
}
