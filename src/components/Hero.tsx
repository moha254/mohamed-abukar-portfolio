import type { CSSProperties } from 'react'
import { ArrowRight, Briefcase, MapPin } from 'lucide-react'
import { profile } from '../data/profile'
import { DownloadCVButton } from './DownloadCVButton'

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

export function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <p className="hero__vertical" aria-hidden="true">
        {profile.business.tagline}
      </p>
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="hero__hello hero-in" style={delay(0)}>
            Hello, I&rsquo;m
          </p>
          <h1 id="hero-title" className="hero__name hero-in" style={delay(80)}>
            Mohamed <span className="text-accent">Abukar</span>
          </h1>
          <p className="hero__roles hero-in" style={delay(160)}>
            {profile.headline.map((role, i) => (
              <span key={role} className="hero__role">
                {role}
                {i < profile.headline.length - 1 && (
                  <span className="hero__sep" aria-hidden="true">
                    {' '}|
                  </span>
                )}
              </span>
            ))}
          </p>
          <span className="hero__rule hero-in" aria-hidden="true" style={delay(220)} />
          <p className="hero__summary hero-in" style={delay(260)}>
            {profile.summary}
          </p>
          <div className="hero__actions hero-in" style={delay(340)}>
            <a href="#projects" className="btn btn--primary">
              Explore My Work <ArrowRight aria-hidden="true" size={18} />
            </a>
            <a href="#contact" className="btn btn--secondary">
              Contact Me
            </a>
            <DownloadCVButton variant="ghost" />
          </div>
          <p className="hero__available hero-in" style={delay(420)}>
            <span className="pulse-dot" aria-hidden="true" />
            Open to software, SaaS, programme and operations opportunities
          </p>
        </div>

        <div className="hero__visual hero-in" style={delay(200)} aria-hidden="true">
          <div className="hero__orbit hero__orbit--1" />
          <div className="hero__orbit hero__orbit--2" />
          <div className="hero__disc">
            <span className="hero__monogram">MA</span>
            <span className="hero__disc-caption">Software · Programmes · Operations</span>
          </div>
          <div className="hero__float hero__float--loc">
            <MapPin size={16} />
            <div>
              <small>Based in</small>
              <strong>Nairobi, Kenya</strong>
            </div>
          </div>
          <div className="hero__float hero__float--biz">
            <Briefcase size={16} />
            <div>
              <small>Founder</small>
              <strong>MohaTech Solutions</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
