interface SectionHeaderProps {
  eyebrow: string
  title: string
  intro?: string
  id: string
  tone?: 'light' | 'dark'
}

export function SectionHeader({ eyebrow, title, intro, id, tone = 'light' }: SectionHeaderProps) {
  return (
    <header className={`section-header section-header--${tone}`} data-reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="section-title">
        {title}
      </h2>
      {intro && <p className="section-intro">{intro}</p>}
    </header>
  )
}
