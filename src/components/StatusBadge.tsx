import type { ProductStatus } from '../data/products'

const variant: Record<ProductStatus, string> = {
  Live: 'badge--live',
  'In Development': 'badge--dev',
  Academic: 'badge--academic',
}

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span className={`badge ${variant[status]}`}>
      <span className="badge__dot" aria-hidden="true" />
      {status}
    </span>
  )
}
