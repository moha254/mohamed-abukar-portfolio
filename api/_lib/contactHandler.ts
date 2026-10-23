import { Resend } from 'resend'
import { MAX_BODY_BYTES, MIN_FILL_MS, validateContact, type ContactResponse } from '../../src/lib/contact.js'
import { buildContactEmail } from './email.js'
import { createMemoryRateLimiter, type RateLimiter } from './rateLimit.js'

export interface OutgoingEmail {
  from: string
  to: string
  replyTo: string
  subject: string
  text: string
  html: string
  idempotencyKey?: string
}

export type SendResult = { ok: true; id: string } | { ok: false; name: string; statusCode: number | null }
export type SendEmail = (email: OutgoingEmail, apiKey: string) => Promise<SendResult>

export interface ContactEnv {
  RESEND_API_KEY?: string
  CONTACT_FROM_EMAIL?: string
  CONTACT_TO_EMAIL?: string
}

export interface HandlerDeps {
  env: () => ContactEnv
  sendEmail?: SendEmail
  rateLimiter?: RateLimiter
  now?: () => number
  log?: (event: string, details?: Record<string, unknown>) => void
}

const MESSAGES = {
  success: 'Your message was accepted for sending.',
  method: 'Method not allowed.',
  origin: 'Requests must come from this website.',
  contentType: 'Please send the form as JSON.',
  tooLarge: 'Your message is too long. Please shorten it and try again.',
  malformed: 'The form data could not be read. Please try again.',
  invalid: 'Please check the highlighted fields.',
  bot: 'Your message could not be sent. Please email me directly instead.',
  tooFast: 'That was very quick. Please wait a moment and try again.',
  rateLimited: 'Too many messages in a short time. Please try again later.',
  notConfigured: 'The contact form is not available right now. Please email me directly.',
  busy: 'The email service is busy. Please try again in a few minutes.',
  failed: 'Unable to send your message right now. Please try again.',
} as const

// Resend errors caused by our own configuration (key, sender domain, payload) rather than the visitor.
const CONFIG_ERRORS = new Set([
  'missing_api_key',
  'invalid_api_key',
  'restricted_api_key',
  'invalid_from_address',
  'invalid_access',
  'validation_error',
  'missing_required_field',
  'invalid_parameter',
  'security_error',
])
const THROTTLE_ERRORS = new Set(['rate_limit_exceeded', 'daily_quota_exceeded', 'monthly_quota_exceeded', 'concurrent_idempotent_requests'])

function json(status: number, body: ContactResponse, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  })
}

const fail = (status: number, message: string, headers?: Record<string, string>) =>
  json(status, { success: false, message }, headers)

export const resendSendEmail: SendEmail = async ({ idempotencyKey, ...email }, apiKey) => {
  const resend = new Resend(apiKey)
  const { data, error } = await resend.emails.send(
    { from: email.from, to: [email.to], replyTo: email.replyTo, subject: email.subject, text: email.text, html: email.html },
    idempotencyKey ? { idempotencyKey } : undefined,
  )
  if (error || !data) return { ok: false, name: error?.name ?? 'unknown_error', statusCode: error?.statusCode ?? null }
  return { ok: true, id: data.id }
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || request.headers.get('x-real-ip') || 'unknown'
}

/** Rejects cross-site browser posts. Requests without an Origin header (e.g. curl) still face every other check. */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

const SUBMISSION_ID_RE = /^[A-Za-z0-9-]{8,64}$/

export function createContactHandler({
  env,
  sendEmail = resendSendEmail,
  rateLimiter = createMemoryRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 }),
  now = Date.now,
  log = (event, details) => console.warn(`[contact] ${event}`, details ?? ''),
}: HandlerDeps) {
  return async function handle(request: Request): Promise<Response> {
    if (request.method !== 'POST') return fail(405, MESSAGES.method, { Allow: 'POST' })
    if (!isSameOrigin(request)) return fail(403, MESSAGES.origin)

    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.toLowerCase().includes('application/json')) return fail(415, MESSAGES.contentType)

    const declaredLength = Number(request.headers.get('content-length') ?? 0)
    if (declaredLength > MAX_BODY_BYTES) return fail(413, MESSAGES.tooLarge)

    let raw: string
    try {
      raw = await request.text()
    } catch {
      return fail(400, MESSAGES.malformed)
    }
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return fail(413, MESSAGES.tooLarge)

    let body: unknown
    try {
      body = JSON.parse(raw)
    } catch {
      return fail(400, MESSAGES.malformed)
    }
    if (typeof body !== 'object' || body === null || Array.isArray(body)) return fail(400, MESSAGES.malformed)
    const fields = body as Record<string, unknown>

    if (typeof fields.website === 'string' && fields.website.trim() !== '') {
      log('honeypot_triggered')
      return fail(400, MESSAGES.bot)
    }
    if (typeof fields.startedAt === 'number' && now() - fields.startedAt < MIN_FILL_MS) {
      return fail(400, MESSAGES.tooFast)
    }

    const limit = rateLimiter.hit(clientKey(request))
    if (!limit.allowed) {
      log('rate_limited')
      return fail(429, MESSAGES.rateLimited, { 'Retry-After': String(limit.retryAfterSeconds) })
    }

    const result = validateContact(fields)
    if (!result.ok) return json(400, { success: false, message: MESSAGES.invalid, errors: result.errors })

    const { RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL } = env()
    const missing = Object.entries({ RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL })
      .filter(([, v]) => !v?.trim())
      .map(([k]) => k)
    if (missing.length > 0) {
      log('missing_configuration', { missing }) // names only, never values
      return fail(500, MESSAGES.notConfigured)
    }

    const email = buildContactEmail(result.data, new Date(now()))
    const submissionId = typeof fields.submissionId === 'string' && SUBMISSION_ID_RE.test(fields.submissionId) ? fields.submissionId : undefined

    let sent: SendResult
    try {
      sent = await sendEmail(
        {
          from: CONTACT_FROM_EMAIL!,
          to: CONTACT_TO_EMAIL!,
          replyTo: result.data.email,
          ...email,
          idempotencyKey: submissionId ? `portfolio-contact-${submissionId}` : undefined,
        },
        RESEND_API_KEY!,
      )
    } catch (error) {
      log('provider_exception', { error: error instanceof Error ? error.name : 'unknown' })
      return fail(502, MESSAGES.failed)
    }

    if (!sent.ok) {
      log('provider_error', { name: sent.name, statusCode: sent.statusCode })
      if (THROTTLE_ERRORS.has(sent.name) || sent.statusCode === 429) return fail(503, MESSAGES.busy, { 'Retry-After': '120' })
      if (CONFIG_ERRORS.has(sent.name)) return fail(500, MESSAGES.notConfigured)
      return fail(502, MESSAGES.failed)
    }

    return json(200, { success: true, message: MESSAGES.success })
  }
}
