import type { LucideIcon } from 'lucide-react'
import { Code2, Database, Layers, Users } from 'lucide-react'

export interface SkillGroup {
  title: string
  icon: LucideIcon
  items: string[]
}

export const skillGroups: SkillGroup[] = [
  {
    title: 'Software Engineering',
    icon: Code2,
    items: ['JavaScript', 'TypeScript', 'React', 'Vite', 'Node.js', 'HTML', 'CSS', 'REST API integration', 'Responsive web development', 'Git & GitHub', 'UI/UX fundamentals'],
  },
  {
    title: 'Databases & Information Management',
    icon: Database,
    items: ['MongoDB', 'SQL', 'CRUD operations', 'Database fundamentals', 'Data validation', 'Records management', 'Information accuracy', 'Confidential data handling'],
  },
  {
    title: 'SaaS & Systems',
    icon: Layers,
    items: ['Multi-tenant SaaS concepts', 'Subscription & plan management', 'API integration', 'Shared backend architecture', 'Application deployment', 'Testing & debugging', 'Reusable component architecture'],
  },
  {
    title: 'Programme & Operations Support',
    icon: Users,
    items: ['Programme coordination', 'Administrative documentation', 'Beneficiary records management', 'Activity logistics', 'Stakeholder communication', 'Customer service', 'Process improvement', 'Teamwork & problem-solving', 'Microsoft Office (Word, Excel, PowerPoint, Outlook)'],
  },
]
