import type { CSSProperties } from 'react'
import { skillGroups } from '../data/skills'
import { SectionHeader } from './SectionHeader'

export function Skills() {
  return (
    <section id="skills" className="section section--muted" aria-labelledby="skills-title">
      <div className="container">
        <SectionHeader
          id="skills-title"
          eyebrow="Skills"
          title="What I work with"
          intro="Technical and organisational skills I use in my day-to-day work."
        />
        <div className="skills-grid">
          {skillGroups.map(({ title, icon: Icon, items }, i) => (
            <article key={title} className="card skill-card" data-reveal style={{ '--d': `${i * 80}ms` } as CSSProperties}>
              <div className="skill-card__head">
                <span className="icon-tile" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <h3>{title}</h3>
              </div>
              <ul className="chips">
                {items.map((item) => (
                  <li key={item} className="chip">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
