import type { CSSProperties } from 'react'
import { ClipboardList, Code2, Languages, Layers, Lightbulb, Settings2, Workflow } from 'lucide-react'
import { SectionHeader } from './SectionHeader'

const focusAreas = [
  {
    icon: Code2,
    title: 'Software development',
    text: 'Web applications built with React, TypeScript, Node.js and MongoDB, with systems thinking behind the design.',
  },
  {
    icon: ClipboardList,
    title: 'Programme information',
    text: 'Documentation, beneficiary records and information management for child-focused programmes.',
  },
  {
    icon: Settings2,
    title: 'Operations & administration',
    text: 'Day-to-day coordination of bookings, staff workflows, records and customer service.',
  },
  {
    icon: Layers,
    title: 'SaaS products',
    text: 'Business software with a shared backend, plans and subscriptions under MohaTech Solutions.',
  },
]

const strengths = [
  { icon: Workflow, label: 'Business process improvement' },
  { icon: Lightbulb, label: 'Practical problem-solving' },
  { icon: Languages, label: 'Somali, English & Kiswahili' },
]

export function About() {
  return (
    <section id="about" className="section section--muted" aria-labelledby="about-title">
      <div className="container about__grid">
        <div>
          <SectionHeader id="about-title" eyebrow="About me" title="Build. Support. Organise." />
          <div className="about__bio" data-reveal>
            <p>
              I am a Software Engineering graduate from Zetech University with practical experience in programme support,
              business operations and software product development.
            </p>
            <p>
              My work spans child-focused programme coordination and documentation at Human Development Fund, operations
              management at Shilaabo Tour &amp; Car Hire, and building business-focused software products through MohaTech
              Solutions.
            </p>
            <p>
              What connects it is an interest in using technology, organised processes and practical problem-solving to improve
              how people and organisations work.
            </p>
            <ul className="about__strengths">
              {strengths.map(({ icon: Icon, label }) => (
                <li key={label}>
                  <Icon aria-hidden="true" size={18} />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ul className="focus-grid" aria-label="Areas of focus">
          {focusAreas.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="focus-card" data-reveal style={{ '--d': `${i * 80}ms` } as CSSProperties}>
              <span className="icon-tile" aria-hidden="true">
                <Icon size={20} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
