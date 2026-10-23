import type { CSSProperties } from 'react'
import { ExternalLink } from 'lucide-react'
import { GithubIcon } from './GithubIcon'
import { projects } from '../data/projects'
import { SectionHeader } from './SectionHeader'
import { StatusBadge } from './StatusBadge'

export function FeaturedProjects() {
  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="container">
        <SectionHeader
          id="projects-title"
          eyebrow="Featured work"
          title="Selected projects"
          intro="Real projects, with their current status stated plainly. Features listed are those implemented in the code today."
        />
        <div className="projects-grid">
          {projects.map((p, i) => (
            <article
              key={p.id}
              className="card project-card"
              data-reveal
              style={{ '--d': `${(i % 2) * 90}ms` } as CSSProperties}
              aria-labelledby={`project-${p.id}`}
            >
              <div className={`project-card__banner project-card__banner--${p.id}`} aria-hidden="true">
                <span className="project-card__initial">{p.name.charAt(0)}</span>
                <span className="project-card__bars">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <div className="project-card__body">
                <div className="project-card__title-row">
                  <h3 id={`project-${p.id}`}>{p.name}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <p className="project-card__tagline">{p.tagline}</p>
                <dl className="project-card__facts">
                  <div>
                    <dt>Problem</dt>
                    <dd>{p.problem}</dd>
                  </div>
                  <div>
                    <dt>My contribution</dt>
                    <dd>{p.contribution}</dd>
                  </div>
                </dl>
                <h4 className="exp-card__subhead">Key features</h4>
                <ul className="check-list check-list--compact">
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <ul className="chips chips--small" aria-label={`${p.name} technology stack`}>
                  {p.stack.map((t) => (
                    <li key={t} className="chip">
                      {t}
                    </li>
                  ))}
                </ul>
                {(p.liveUrl || p.sourceUrl) && (
                  <div className="project-card__links">
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-link">
                        Live demo <ExternalLink aria-hidden="true" size={15} />
                        <span className="sr-only"> of {p.name} (opens in a new tab)</span>
                      </a>
                    )}
                    {p.sourceUrl && (
                      <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-link">
                        Source code <GithubIcon size={15} />
                        <span className="sr-only"> of {p.name} (opens in a new tab)</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
