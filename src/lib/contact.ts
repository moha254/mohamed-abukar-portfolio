// Contact-form rules shared by the browser form and the /api/contact function.
// Keep this module dependency-free: the serverless function imports it directly.

export interface ContactRequest {
  name: string
  email: string
  subject: string
  message: string
}

export type ContactField = keyof ContactRequest
export type FieldErrors = Partial<Record<ContactField, string>>

/** Extra, non-content fields the form sends for spam protection and de-duplication. */
export interface ContactMeta {
  /** Honeypot: hidden from people, so any value means a bot filled it in. */
  website: string
  /** Epoch ms when the form was first shown, for a minimum-fill-time check. */
  startedAt: number
  /** Per-submission id, used as the Resend idempotency key. */
  submissionId: string
}

export interface ContactResponse {
  success: boolean
  message: string
  errors?: FieldErrors
}

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  subject: 200,
  message: 5000,
} as const satisfies Record<ContactField, number>

export const CONTACT_FIELDS: ContactField[] = ['name', 'email', 'subject', 'message']

/** Largest accepted request body in bytes (well above the sum of the field limits). */
export const MAX_BODY_BYTES = 16 * 1024

/** Submissions faster than this after the form appeared are treated as automated. */
export const MIN_FILL_MS = 3000

// Practical email check: one @, no spaces, a dotted domain and sane label characters.
const EMAIL_RE = /^[^\s@"(),:;<>[\]\\]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/

const LABELS: Record<ContactField, string> = {
  name: 'Name',
  email: 'Email',
  subject: 'Subject',
  message: 'Message',
}

export function isValidEmail(value: string): boolean {
  if (value.length > CONTACT_LIMITS.email) return false
  const at = value.lastIndexOf('@')
  if (at < 1 || value.slice(0, at).length > 64) return false
  return EMAIL_RE.test(value)
}

/**
 * Validates and trims the four content fields. Accepts unknown input so the
 * server can pass parsed JSON straight in; anything that is not a string fails.
 */
export function validateContact(input: unknown): { ok: true; data: ContactRequest } | { ok: false; errors: FieldErrors } {
  const source = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>
  const errors: FieldErrors = {}
  const data = {} as ContactRequest

  for (const field of CONTACT_FIELDS) {
    const raw = source[field]
    if (raw !== undefined && typeof raw !== 'string') {
      errors[field] = `${LABELS[field]} must be text.`
      continue
    }
    const value = (raw ?? '').trim()
    if (!value) {
      errors[field] = `Please enter your ${LABELS[field].toLowerCase()}.`
    } else if (value.length > CONTACT_LIMITS[field]) {
      errors[field] = `${LABELS[field]} must be ${CONTACT_LIMITS[field].toLocaleString('en')} characters or fewer.`
    } else if (field !== 'message' && /[\r\n]/.test(value)) {
      // Single-line fields end up in email headers; line breaks are never legitimate there.
      errors[field] = `${LABELS[field]} must be on a single line.`
    } else if (field === 'email' && !isValidEmail(value)) {
      errors[field] = 'Please enter a valid email address.'
    }
    data[field] = value
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, data }
}
