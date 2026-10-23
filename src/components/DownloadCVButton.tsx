import { Download } from 'lucide-react'
import { profile } from '../data/profile'
import { hasCv } from '../lib/cv'

interface DownloadCVButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'sm'
  className?: string
  label?: string
}

/**
 * Downloads the CV served from public/resume.pdf. Replace that file to update
 * the CV; this component does not need to change. Renders nothing if the PDF
 * was missing at build time, so it never links to a file that does not exist.
 */
export function DownloadCVButton({ variant = 'secondary', size = 'md', className = '', label = 'Download CV' }: DownloadCVButtonProps) {
  if (!hasCv) return null
  return (
    <a
      href={profile.cv.href}
      download={profile.cv.downloadName}
      type="application/pdf"
      className={`btn btn--${variant} btn--${size} ${className}`.trim()}
      aria-label={`Download ${profile.name}'s professional CV as a PDF`}
    >
      <Download aria-hidden="true" size={18} />
      <span>{label}</span>
    </a>
  )
}
