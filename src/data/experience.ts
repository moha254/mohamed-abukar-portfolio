export interface Experience {
  id: string
  organization: string
  role: string
  /** Shown as written. Leave undefined rather than guessing a date. */
  period: string
  current?: boolean
  location: string
  summary: string
  responsibilities: string[]
  skills: string[]
  note?: string
}

export const experience: Experience[] = [
  {
    id: 'hdf',
    organization: 'Human Development Fund (HDF)',
    role: 'Program Assistant — Orphan Care Program (OCP) and Children of Rahma (CRP)',
    period: 'January 2026 – Present',
    current: true,
    location: 'Kenya',
    summary:
      'I support programme activities, documentation, coordination, and information management within the Orphan Care Program and Children of Rahma.',
    responsibilities: [
      'Support the coordination and implementation of OCP and Children of Rahma programme activities.',
      'Assist with beneficiary records, documentation, data entry, tracking, and information accuracy.',
      'Support home visits and beneficiary follow-ups.',
      'Assist with mentorship, educational activities, back-to-school initiatives, and other child-focused activities.',
      'Support food parcel activities, health screening coordination, and other beneficiary support initiatives as assigned.',
      'Assist with donor visits, programme logistics, activity coordination, and documentation.',
      'Organise programme information and keep administrative records accurate.',
      'Handle sensitive programme and beneficiary information responsibly and confidentially.',
      'Collaborate with colleagues to support programme delivery and administrative processes.',
    ],
    skills: [
      'Programme coordination',
      'Programme administration',
      'Documentation & recordkeeping',
      'Information management',
      'Data accuracy & confidentiality',
      'Stakeholder communication',
      'Activity logistics',
      'Teamwork & problem-solving',
    ],
  },
  {
    id: 'shilaabo',
    organization: 'Shilaabo Tour & Car Hire',
    role: 'Operations Manager',
    period: 'Approximately two years',
    location: 'Nairobi, Kenya',
    summary:
      'I coordinated the day-to-day running of a vehicle-hire business, connecting bookings, fleet readiness, administration, and customer service.',
    responsibilities: [
      'Coordinated day-to-day business operations.',
      'Supported vehicle-hire bookings and customer follow-up.',
      'Coordinated fleet availability and operational readiness.',
      'Supported administrative records and documentation.',
      'Coordinated staff responsibilities and workflows.',
      'Communicated with customers and helped resolve service issues.',
      'Supported operational improvements and service delivery.',
      'Assisted with coordination across bookings, administration, and customer service.',
    ],
    skills: ['Operations', 'Business administration', 'Customer service', 'Staff coordination', 'Communication'],
  },
  {
    id: 'mohatech',
    organization: 'MohaTech Solutions',
    role: 'Founder · Software Engineer · SaaS Product Builder',
    period: 'Ongoing',
    current: true,
    location: 'Nairobi, Kenya',
    summary:
      'Under MohaTech Solutions I design and build business software products, from individual web applications to a shared SaaS platform that manages products and subscriptions.',
    responsibilities: [
      'Design and develop web applications with React, Vite, TypeScript, Node.js/Express, REST APIs, and MongoDB.',
      'Build SaaS products for business workflows such as wholesale, fleet hire, and fuel station operations.',
      'Implement product configuration and subscription/plan management workflows.',
      'Integrate products with a shared backend and a central SaaS control center.',
      'Debug application errors and improve reliability.',
      'Test builds and prepare products for cloud deployment.',
      'Build reusable patterns that are shared across multiple product codebases.',
    ],
    skills: ['React & TypeScript', 'Node.js & Express', 'MongoDB', 'SaaS architecture', 'Deployment'],
  },
  {
    id: 'qaffee-point',
    organization: 'Qaffee Point',
    role: 'Cashier',
    period: 'January 2020 – December 2021',
    location: 'Mombasa, Kenya',
    summary: 'My first role in a customer-facing business, handling transactions and day-to-day service.',
    responsibilities: [
      'Supported customer transactions and daily service operations.',
      'Followed company procedures and security protocols.',
      'Maintained awareness of potential theft and fraud.',
      'Coordinated with relevant staff when operational or security concerns arose.',
      'Contributed to an organised, customer-focused service environment.',
    ],
    skills: ['Customer service', 'Cash handling', 'Attention to detail'],
  },
]
