export type ProductStatus = 'Live' | 'In Development' | 'Academic'

export interface Product {
  id: string
  name: string
  category: string
  description: string
  status: ProductStatus
  /** Plain-language note explaining the status. */
  statusNote: string
  stack?: string[]
  url?: string
}

// Statuses verified on 23 Oct 2026: "Live" means the URL responded publicly.
export const products: Product[] = [
  {
    id: 'wholesalepro',
    name: 'WholesalePro',
    category: 'Wholesale & inventory',
    description:
      'Inventory, sales and money management for wholesalers with multiple branches: point of sale, stock across branches, suppliers, customer credit and expenses in one place.',
    status: 'Live',
    statusNote: 'Deployed and publicly reachable',
    stack: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
    url: 'https://wholesalepro.mohatechsolutions.com/',
  },
  {
    id: 'fleetpro',
    name: 'FleetPro',
    category: 'Fleet & car hire',
    description:
      'Car-rental and fleet management for hire businesses: vehicles and availability, bookings, customers, drivers, maintenance, payments and fleet reports.',
    status: 'Live',
    statusNote: 'Deployed and publicly reachable',
    stack: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
    url: 'https://fleet-pro-frontend.vercel.app/',
  },
  {
    id: 'creatorpay',
    name: 'CreatorPay',
    category: 'Creator earnings',
    description:
      'Earnings and withdrawal management for TikTok creator-management agencies, offered with its own plans through the MohaTech SaaS platform.',
    status: 'Live',
    statusNote: 'Deployed and publicly reachable',
    url: 'https://creator-pay-frontend.vercel.app/',
  },
  {
    id: 'fuelflow',
    name: 'FuelFlow',
    category: 'Fuel stations',
    description:
      'Operations and accounting for fuel stations: pumps, nozzles and tanks, shifts and meter readings, fuel sales, deliveries and reconciliation.',
    status: 'In Development',
    statusNote: 'Built; not yet publicly deployed',
    stack: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
  },
]
