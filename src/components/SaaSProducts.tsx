import type { CSSProperties } from 'react'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { products } from '../data/products'
import { profile } from '../data/profile'
import { SectionHeader } from './SectionHeader'
import { StatusBadge } from './StatusBadge'

export function SaaSProducts() {
  return (
    <section id="products" className="section section--dark" aria-labelledby="products-title">
      <div className="container">
        <div className="products__intro">
          <SectionHeader
            id="products-title"
            tone="dark"
            eyebrow={profile.business.name}
            title={profile.business.tagline}
            intro="MohaTech Solutions develops practical software products designed to help businesses manage workflows, information and operations more effectively."
          />
          <a href="#contact" className="btn btn--light" data-reveal>
            Discuss a Project <ArrowRight aria-hidden="true" size={18} />
          </a>
        </div>
        <ul className="products-grid">
          {products.map((p, i) => (
            <li key={p.id} className="product-card" data-reveal style={{ '--d': `${i * 80}ms` } as CSSProperties}>
              <div className="product-card__top">
                <p className="product-card__category">{p.category}</p>
                <StatusBadge status={p.status} />
              </div>
              <h3>{p.name}</h3>
              <p className="product-card__desc">{p.description}</p>
              <p className="product-card__note">{p.statusNote}</p>
              {p.stack && (
                <ul className="chips chips--small chips--dark" aria-label={`${p.name} technology stack`}>
                  {p.stack.map((t) => (
                    <li key={t} className="chip">
                      {t}
                    </li>
                  ))}
                </ul>
              )}
              {p.url && (
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="product-card__link">
                  Open {p.name} <ExternalLink aria-hidden="true" size={15} />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
