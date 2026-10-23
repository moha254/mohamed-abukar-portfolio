import type { ProductStatus } from './products'

export interface Project {
  id: string
  name: string
  tagline: string
  problem: string
  contribution: string
  features: string[]
  stack: string[]
  status: ProductStatus
  liveUrl?: string
  sourceUrl?: string
}

export const projects: Project[] = [
  {
    id: 'wholesalepro',
    name: 'WholesalePro',
    tagline: 'Know your stock. Control your money.',
    problem:
      'Wholesalers running several branches often track stock, credit sales and supplier balances in separate books, which makes it hard to know what is on hand and who owes what.',
    contribution:
      'Designed and built the product, frontend and backend, and connected it to the MohaTech central platform for plans and subscriptions.',
    features: [
      'Point of sale with payments',
      'Per-branch inventory, stock movements and transfers',
      'Purchases, suppliers and supplier ledger',
      'Customer credit ledger and expenses',
      'Reports dashboard, staff accounts and audit log',
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Express', 'MongoDB'],
    status: 'Live',
    liveUrl: 'https://wholesalepro.mohatechsolutions.com/',
  },
  {
    id: 'fleetpro',
    name: 'FleetPro',
    tagline: 'Smart fleet. Better business.',
    problem:
      'Car-hire businesses need to know which vehicles are free, who has them, and what each vehicle costs and earns, without juggling spreadsheets and phone calls.',
    contribution:
      'Designed and built the product end to end, including bookings, fleet records, reporting and the subscription integration.',
    features: [
      'Vehicle records and availability tracking',
      'Bookings calendar, active rentals and history',
      'Customers, drivers and maintenance logs',
      'Payments, expenses and fuel logs',
      'Revenue, utilisation and vehicle performance reports with PDF export',
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Express', 'MongoDB'],
    status: 'Live',
    liveUrl: 'https://fleet-pro-frontend.vercel.app/',
  },
  {
    id: 'fuelflow',
    name: 'FuelFlow',
    tagline: 'Fuel station operations and accounting.',
    problem:
      'Fuel stations reconcile pump meter readings, tank levels, deliveries and cash by shift, which is slow and error-prone on paper.',
    contribution:
      'Designed and built the application and its permission-based access control, integrated with the MohaTech control center for subscriptions.',
    features: [
      'Stations, pumps, nozzles and tanks',
      'Shifts with nozzle assignments and meter readings',
      'Fuel sales, payments and reconciliation',
      'Tank readings, deliveries and price history',
      'Role-based permissions and reports',
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Express', 'MongoDB'],
    status: 'In Development',
  },
  {
    id: 'car-hire-admin',
    name: 'Car Hire Administration System',
    tagline: 'Final-year project, BSc Software Engineering.',
    problem:
      'A car-hire business needs a single place for staff to sign in and manage its records instead of relying on paper and scattered files.',
    contribution: 'Planned, designed and built the system as my academic final project at Zetech University.',
    features: ['Staff login', 'Administrative dashboard', 'Data stored in MongoDB'],
    stack: ['MongoDB'],
    status: 'Academic',
  },
]
