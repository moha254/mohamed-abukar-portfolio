export interface Qualification {
  id: string
  title: string
  institution: string
  /** Leave undefined rather than guessing a year. */
  year?: string
  status?: string
}

export const qualifications: Qualification[] = [
  {
    id: 'bsc',
    title: 'Bachelor of Science in Software Engineering',
    institution: 'Zetech University',
    status: 'Degree completed',
  },
  {
    id: 'diploma',
    title: 'Diploma in Software Engineering',
    institution: 'Zetech University',
    year: '2023',
  },
  {
    id: 'kcse',
    title: 'Kenya Certificate of Secondary Education (KCSE)',
    institution: 'Alidinna Visram Secondary School',
    year: '2019',
  },
]

export const training = ['Work Readiness', 'Introduction to Office and Project Management', 'Microsoft Office In-house Training']
