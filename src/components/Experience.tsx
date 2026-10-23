import { Building2, CalendarDays, MapPin } from 'lucide-react'
import { experience } from '../data/experience'
import { SectionHeader } from './SectionHeader'

export function Experience() {
  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <div className="container">
        <SectionHeader
          id="experience-title"
          eyebrow="Professional experience"
          title="Where I have worked"
          intro="Distinct roles across NGO programme support, business operations, software product development and customer service."
        />
        <ol className="timeline">
          {experience.map((job) => (
            <li key={job.id} className="timeline__item" data-reveal>
              <span className={`timeline__dot${job.current ? ' timeline__dot--current' : ''}`} aria-hidden="true" />
              <article className="card exp-card" aria-labelledby={`exp-${job.id}`}>
                <div className="exp-card__head">
                  <div>
                    <p className="exp-card__org">
                      <Building2 aria-hidden="true" size={16} />
                      {job.organization}
                    </p>
                    <h3 id={`exp-${job.id}`} className="exp-card__role">
                      {job.role}
                    </h3>
                  </div>
                  {job.current && <span className="badge badge--live">Current</span>}
                </div>
                <dl className="exp-card__meta">
                  <div>
                    <dt className="sr-only">Period</dt>
                    <dd>
                      <CalendarDays aria-hidden="true" size={15} />
                      {job.period}
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Location</dt>
                    <dd>
                      <MapPin aria-hidden="true" size={15} />
                      {job.location}
                    </dd>
                  </div>
                </dl>
                <p className="exp-card__summary">{job.summary}</p>
                <h4 className="exp-card__subhead">Responsibilities</h4>
                <ul className="check-list">
                  {job.responsibilities.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <h4 className="exp-card__subhead">Skills applied</h4>
                <ul className="chips" aria-label={`Skills applied at ${job.organization}`}>
                  {job.skills.map((s) => (
                    <li key={s} className="chip">
                      {s}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
