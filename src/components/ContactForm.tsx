import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react'
import {
  CONTACT_LIMITS,
  validateContact,
  type ContactField,
  type ContactRequest,
  type ContactResponse,
  type FieldErrors,
} from '../lib/contact'
import { profile } from '../data/profile'

type Status = 'idle' | 'validating' | 'sending' | 'success' | 'error'

const EMPTY: ContactRequest = { name: '', email: '', subject: '', message: '' }
const FALLBACK_ERROR = 'Unable to send your message right now. Please try again.'

const newSubmissionId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`

/** Reads the API response without assuming it is valid JSON (e.g. a proxy error page). */
async function readResponse(response: Response): Promise<ContactResponse> {
  try {
    const body: unknown = await response.json()
    if (typeof body === 'object' && body !== null && typeof (body as ContactResponse).message === 'string') {
      const parsed = body as ContactResponse
      return { ...parsed, success: response.ok && parsed.success === true }
    }
  } catch {
    // fall through
  }
  return { success: false, message: FALLBACK_ERROR }
}

export function ContactForm() {
  const [values, setValues] = useState<ContactRequest>(EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [feedback, setFeedback] = useState('')
  const [website, setWebsite] = useState('')

  // Refs, not state: they must be current inside the same event, before any re-render.
  const inFlight = useRef(false)
  const startedAt = useRef(Date.now())
  const submissionId = useRef(newSubmissionId())
  const fieldRefs = useRef<Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement | null>>>({})

  const sending = status === 'sending'

  const onChange = (field: ContactField) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value
    setValues((v) => ({ ...v, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
    // A changed message is a new submission as far as de-duplication is concerned.
    submissionId.current = newSubmissionId()
    if (status === 'success' || status === 'error') setStatus('idle')
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (inFlight.current) return // duplicate click or Enter while a request is pending

    setStatus('validating')
    const result = validateContact(values)
    if (!result.ok) {
      setErrors(result.errors)
      setStatus('error')
      setFeedback('Please fix the highlighted fields.')
      const first = (['name', 'email', 'subject', 'message'] as const).find((f) => result.errors[f])
      if (first) fieldRefs.current[first]?.focus()
      return
    }

    inFlight.current = true
    setErrors({})
    setStatus('sending')
    setFeedback('Sending your message…')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...result.data,
          website,
          startedAt: startedAt.current,
          submissionId: submissionId.current,
        }),
      })
      const body = await readResponse(response)

      if (body.success) {
        setValues(EMPTY)
        setStatus('success')
        setFeedback("Thank you, your message has been sent. I'll reply to the email address you provided.")
        submissionId.current = newSubmissionId()
        startedAt.current = Date.now()
      } else {
        if (body.errors) setErrors(body.errors)
        setStatus('error')
        setFeedback(body.message || FALLBACK_ERROR)
      }
    } catch {
      setStatus('error')
      setFeedback('Network error — please check your connection and try again.')
    } finally {
      inFlight.current = false
    }
  }

  const fieldProps = (field: ContactField) => ({
    id: `contact-${field}`,
    name: field,
    value: values[field],
    onChange: onChange(field),
    maxLength: CONTACT_LIMITS[field],
    disabled: sending,
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `contact-${field}-error` : undefined,
    ref: (el: HTMLInputElement | HTMLTextAreaElement | null) => {
      fieldRefs.current[field] = el
    },
  })

  const errorText = (field: ContactField) =>
    errors[field] ? (
      <p id={`contact-${field}-error`} className="form-field__error">
        <AlertCircle aria-hidden="true" size={14} /> {errors[field]}
      </p>
    ) : null

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate aria-busy={sending}>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="contact-name">Your name</label>
          <input type="text" autoComplete="name" required {...fieldProps('name')} />
          {errorText('name')}
        </div>
        <div className="form-field">
          <label htmlFor="contact-email">Your email</label>
          <input type="email" autoComplete="email" inputMode="email" required {...fieldProps('email')} />
          {errorText('email')}
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="contact-subject">Subject</label>
        <input type="text" required {...fieldProps('subject')} />
        {errorText('subject')}
      </div>

      <div className="form-field">
        <label htmlFor="contact-message">Message</label>
        <textarea rows={6} required {...fieldProps('message')} />
        <div className="form-field__meta">
          {errorText('message')}
          <span className="form-field__count" aria-hidden="true">
            {values.message.length.toLocaleString('en')}/{CONTACT_LIMITS.message.toLocaleString('en')}
          </span>
        </div>
      </div>

      {/* Honeypot: invisible to people and skipped by keyboard and screen readers. */}
      <div className="form-hp" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="contact-form__footer">
        <button type="submit" className="btn btn--primary contact-form__submit" disabled={sending}>
          {sending ? (
            <>
              <Loader2 aria-hidden="true" size={18} className="spin" /> Sending…
            </>
          ) : (
            <>
              <Send aria-hidden="true" size={18} /> Send Message
            </>
          )}
        </button>
        <p className="contact-form__alt">
          Prefer email? <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </p>
      </div>

      <div
        className={`form-status${status === 'success' ? ' form-status--success' : ''}${status === 'error' ? ' form-status--error' : ''}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {(status === 'success' || status === 'error' || status === 'sending') && (
          <>
            {status === 'success' && <CheckCircle2 aria-hidden="true" size={18} />}
            {status === 'error' && <AlertCircle aria-hidden="true" size={18} />}
            <span>{feedback}</span>
          </>
        )}
      </div>
    </form>
  )
}
