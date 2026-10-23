import { Award, GraduationCap } from 'lucide-react'
import { qualifications, training } from '../data/education'
import { SectionHeader } from './SectionHeader'

export function Education() {
  const [degree, ...earlier] = qualifications
  return (
    <section id="education" className="section section--muted" aria-labelledby="education-title">
      <div className="container">
        <SectionHeader id="education-title" eyebrow="Education" title="Academic foundation" />
        <div className="edu-layout">
          <article className="card edu-card" data-reveal aria-labelledby={`edu-${degree.id}`}>
            <span className="icon-tile icon-tile--lg" aria-hidden="true">
              <GraduationCap size={28} />
            </span>
            <div>
              <p className="exp-card__org">{degree.institution}</p>
              <h3 id={`edu-${degree.id}`} className="exp-card__role">
                {degree.title}
              </h3>
              {degree.status && (
                <p className="edu-card__status">
                  <span className="badge badge--live">{degree.status}</span>
                </p>
              )}
              <p className="edu-card__text">
                My degree gave me the foundations I now use in product work: programming, software design, databases and the
                discipline of taking a system from requirements to a working build. For my final project I designed and built a{' '}
                <a href="#project-car-hire-admin" className="inline-link">
                  Car Hire Administration System
                </a>{' '}
                with login, an administrative dashboard and MongoDB storage.
              </p>
            </div>
          </article>

          <div className="edu-side" data-reveal>
            <ul className="card edu-list" aria-label="Earlier qualifications">
              {earlier.map((q) => (
                <li key={q.id}>
                  <div>
                    <h3>{q.title}</h3>
                    <p>{q.institution}</p>
                  </div>
                  {q.year && <span className="edu-list__year">{q.year}</span>}
                </li>
              ))}
            </ul>
            <div className="card edu-training">
              <h3>
                <Award aria-hidden="true" size={18} /> Relevant training
              </h3>
              <ul className="check-list check-list--compact">
                {training.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
