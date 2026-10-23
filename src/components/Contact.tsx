import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { GithubIcon } from './GithubIcon'
import { profile } from '../data/profile'
import { ContactForm } from './ContactForm'
import { DownloadCVButton } from './DownloadCVButton'
import { SectionHeader } from './SectionHeader'

const topics = [
  'Software development opportunities',
  'SaaS and business systems',
  'Technology projects',
  'Programme and operations opportunities',
  'Professional collaboration',
]

export function Contact() {
  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="container contact__grid">
        <div className="contact__info">
          <SectionHeader
            id="contact-title"
            eyebrow="Contact"
            title="Let's work together"
            intro="Have a role, a project or an idea in mind? I'm happy to talk about:"
          />
          <ul className="check-list" data-reveal>
            {topics.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <div className="card contact-card" data-reveal>
            <ul className="contact-list">
              <li>
                <a href={`mailto:${profile.email}`} className="contact-item">
                  <span className="icon-tile" aria-hidden="true">
                    <Mail size={20} />
                  </span>
                  <span>
                    <small>Email</small>
                    <strong>{profile.email}</strong>
                  </span>
                </a>
              </li>
              <li>
                <a href={profile.phoneHref} className="contact-item">
                  <span className="icon-tile" aria-hidden="true">
                    <Phone size={20} />
                  </span>
                  <span>
                    <small>Phone</small>
                    <strong>{profile.phone}</strong>
                  </span>
                </a>
              </li>
              <li>
                <a href={profile.whatsappHref} target="_blank" rel="noopener noreferrer" className="contact-item">
                  <span className="icon-tile icon-tile--whatsapp" aria-hidden="true">
                    <MessageCircle size={20} />
                  </span>
                  <span>
                    <small>WhatsApp</small>
                    <strong>{profile.phone}</strong>
                    <span className="sr-only"> (opens WhatsApp in a new tab)</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="contact-item">
                  <span className="icon-tile" aria-hidden="true">
                    <GithubIcon size={20} />
                  </span>
                  <span>
                    <small>GitHub</small>
                    <strong>github.com/{profile.githubHandle}</strong>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </span>
                </a>
              </li>
              <li>
                <div className="contact-item">
                  <span className="icon-tile" aria-hidden="true">
                    <MapPin size={20} />
                  </span>
                  <span>
                    <small>Location</small>
                    <strong>{profile.location}</strong>
                  </span>
                </div>
              </li>
            </ul>
            <div className="contact-card__actions">
              <a href={profile.whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn--whatsapp">
                <MessageCircle aria-hidden="true" size={18} /> WhatsApp Me
                <span className="sr-only"> (opens WhatsApp in a new tab)</span>
              </a>
              <DownloadCVButton variant="secondary" />
            </div>
          </div>
        </div>

        <div className="card contact-form-card" data-reveal>
          <h3 className="contact-form-card__title">Send me a message</h3>
          <p className="contact-form-card__intro">Your message goes straight to my inbox, and my reply comes back to the email you enter.</p>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
