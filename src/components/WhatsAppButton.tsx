import { MessageCircle } from 'lucide-react'
import { profile } from '../data/profile'

/** Floating "Chat on WhatsApp" button, fixed to the bottom-right corner. */
export function WhatsAppButton() {
  return (
    <a href={profile.whatsappHref} target="_blank" rel="noopener noreferrer" className="whatsapp-fab">
      <MessageCircle aria-hidden="true" size={24} />
      <span className="whatsapp-fab__label">Chat on WhatsApp</span>
      <span className="sr-only"> (opens WhatsApp in a new tab)</span>
    </a>
  )
}
