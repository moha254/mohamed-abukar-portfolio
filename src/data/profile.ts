export const profile = {
  name: 'Mohamed Abukar',
  initials: 'MA',
  headline: ['Software Engineer', 'Programme Assistant', 'Operations Manager', 'SaaS Entrepreneur'],
  summary:
    'I build practical software, support child-focused programmes, and keep business operations running through technology, coordination, and careful problem-solving.',
  location: 'Nairobi, Kenya',
  email: 'mohamedabukar412@gmail.com',
  phone: '+254 792 837 410',
  phoneHref: 'tel:+254792837410',
  github: 'https://github.com/moha254',
  githubHandle: 'moha254',
  business: {
    name: 'MohaTech Solutions',
    tagline: 'Smart Tech. Real Solutions.',
  },
  cv: {
    href: '/resume.pdf',
    downloadName: 'Mohamed-Abukar-CV.pdf',
  },
} as const

export const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'products', label: 'SaaS Products' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
] as const

export type SectionId = (typeof navLinks)[number]['id']
