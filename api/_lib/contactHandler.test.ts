import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createContactHandler, resendSendEmail, type ContactEnv, type SendEmail } from './contactHandler'
import { createMemoryRateLimiter } from './rateLimit'

const sendMock = vi.fn()
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send: sendMock } })),
}))

const NOW = Date.UTC(2026, 9, 23, 9, 30)
const ENV: ContactEnv = {
  RESEND_API_KEY: 're_test_key',
  CONTACT_FROM_EMAIL: 'Portfolio Contact <onboarding@resend.dev>',
  CONTACT_TO_EMAIL: 'mohamedabukar412@gmail.com',
}

const valid = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  subject: 'Project enquiry',
  message: 'Hello Mohamed, I would like to discuss a project.',
  website: '',
  startedAt: NOW - 60_000,
  submissionId: '6f1c2b8e-1d2a-4f7e-9a1b-0c3d4e5f6a7b',
}

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://portfolio.example/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', host: 'portfolio.example', 'x-forwarded-for': '203.0.113.7', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

function setup(overrides: { env?: ContactEnv; sendEmail?: SendEmail; limit?: number } = {}) {
  const sendEmail = vi.fn<SendEmail>(overrides.sendEmail ?? (async () => ({ ok: true, id: 'email_123' })))
  const log = vi.fn()
  const handle = createContactHandler({
    env: () => overrides.env ?? ENV,
    sendEmail,
    rateLimiter: createMemoryRateLimiter({ limit: overrides.limit ?? 100, windowMs: 60_000, now: () => NOW }),
    now: () => NOW,
    log,
  })
  return { handle, sendEmail, log }
}

async function call(handle: (r: Request) => Promise<Response>, request: Request) {
  const response = await handle(request)
  return { status: response.status, headers: response.headers, body: await response.json() }
}

describe('POST /api/contact', () => {
  beforeEach(() => sendMock.mockReset())

  it('sends a valid submission to the configured inbox with the visitor as reply-to', async () => {
    const { handle, sendEmail } = setup()
    const res = await call(handle, post(valid))

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true, message: 'Your message was accepted for sending.' })
    expect(sendEmail).toHaveBeenCalledTimes(1)
    const [email, apiKey] = sendEmail.mock.calls[0]
    expect(apiKey).toBe('re_test_key')
    expect(email.to).toBe('mohamedabukar412@gmail.com')
    expect(email.from).toBe(ENV.CONTACT_FROM_EMAIL)
    expect(email.replyTo).toBe('jane@example.com')
    expect(email.subject).toBe('Portfolio Contact: Project enquiry')
    expect(email.text).toContain('Name:     Jane Doe')
    expect(email.text).toContain('Hello Mohamed, I would like to discuss a project.')
    expect(email.text).toContain('2026-10-23 09:30:00 UTC')
    expect(email.idempotencyKey).toBe(`portfolio-contact-${valid.submissionId}`)
  })

  it('trims whitespace before sending', async () => {
    const { handle, sendEmail } = setup()
    await call(handle, post({ ...valid, name: '  Jane Doe  ', email: ' jane@example.com ' }))
    expect(sendEmail.mock.calls[0][0].replyTo).toBe('jane@example.com')
    expect(sendEmail.mock.calls[0][0].text).toContain('Name:     Jane Doe\n')
  })

  it.each([
    ['name', { name: '' }, 'Please enter your name.'],
    ['name', { name: '    ' }, 'Please enter your name.'],
    ['email', { email: 'not-an-email' }, 'Please enter a valid email address.'],
    ['email', { email: 'jane@example' }, 'Please enter a valid email address.'],
    ['subject', { subject: undefined }, 'Please enter your subject.'],
    ['message', { message: '' }, 'Please enter your message.'],
    ['name', { name: 42 }, 'Name must be text.'],
    ['subject', { subject: 'Hi\r\nBcc: victim@example.com' }, 'Subject must be on a single line.'],
  ])('rejects an invalid %s (%j)', async (field, patch, expected) => {
    const { handle, sendEmail } = setup()
    const res = await call(handle, post({ ...valid, ...patch }))
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.errors[field]).toBe(expected)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it.each([
    ['name', 101],
    ['subject', 201],
    ['message', 5001],
  ])('rejects a %s longer than the limit', async (field, length) => {
    const { handle, sendEmail } = setup()
    const res = await call(handle, post({ ...valid, [field]: 'a'.repeat(length) }))
    expect(res.status).toBe(400)
    expect(res.body.errors[field]).toMatch(/characters or fewer/)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('rejects an email address longer than 254 characters', async () => {
    const { handle } = setup()
    const res = await call(handle, post({ ...valid, email: `${'a'.repeat(60)}@${'b'.repeat(200)}.com` }))
    expect(res.status).toBe(400)
    expect(res.body.errors.email).toBeDefined()
  })

  it('rejects a request body over 16 KB with 413', async () => {
    const { handle, sendEmail } = setup()
    const res = await call(handle, post({ ...valid, message: 'x'.repeat(17_000) }))
    expect(res.status).toBe(413)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('rejects malformed JSON with 400', async () => {
    const { handle } = setup()
    const res = await call(handle, post('{"name": "Jane",'))
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ success: false, message: 'The form data could not be read. Please try again.' })
  })

  it.each([['[]'], ['"text"'], ['null']])('rejects a non-object JSON body %s', async (raw) => {
    const { handle } = setup()
    expect((await call(handle, post(raw))).status).toBe(400)
  })

  it('rejects non-JSON content types with 415', async () => {
    const { handle } = setup()
    const res = await call(handle, post('name=Jane', { 'Content-Type': 'application/x-www-form-urlencoded' }))
    expect(res.status).toBe(415)
  })

  it.each(['GET', 'PUT', 'DELETE', 'OPTIONS'])('returns 405 for %s', async (method) => {
    const { handle } = setup()
    const res = await call(handle, new Request('https://portfolio.example/api/contact', { method }))
    expect(res.status).toBe(405)
    expect(res.headers.get('Allow')).toBe('POST')
    expect(res.body.success).toBe(false)
  })

  it('rejects cross-site requests with 403', async () => {
    const { handle, sendEmail } = setup()
    const res = await call(handle, post(valid, { origin: 'https://evil.example' }))
    expect(res.status).toBe(403)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('accepts same-origin requests', async () => {
    const { handle } = setup()
    expect((await call(handle, post(valid, { origin: 'https://portfolio.example' }))).status).toBe(200)
  })

  it('rejects submissions that fill the honeypot field without sending', async () => {
    const { handle, sendEmail, log } = setup()
    const res = await call(handle, post({ ...valid, website: 'https://spam.example' }))
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(sendEmail).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith('honeypot_triggered')
  })

  it('rejects submissions made faster than a person could type', async () => {
    const { handle, sendEmail } = setup()
    const res = await call(handle, post({ ...valid, startedAt: NOW - 500 }))
    expect(res.status).toBe(400)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('returns 429 with Retry-After once the rate limit is exceeded', async () => {
    const { handle, sendEmail } = setup({ limit: 2 })
    expect((await call(handle, post(valid))).status).toBe(200)
    expect((await call(handle, post(valid))).status).toBe(200)
    const third = await call(handle, post(valid))
    expect(third.status).toBe(429)
    expect(Number(third.headers.get('Retry-After'))).toBeGreaterThan(0)
    expect(sendEmail).toHaveBeenCalledTimes(2)
    // A different client is unaffected.
    expect((await call(handle, post(valid, { 'x-forwarded-for': '198.51.100.9' }))).status).toBe(200)
  })

  it.each(['RESEND_API_KEY', 'CONTACT_FROM_EMAIL', 'CONTACT_TO_EMAIL'] as const)(
    'returns 500 without leaking details when %s is missing',
    async (key) => {
      const { handle, sendEmail, log } = setup({ env: { ...ENV, [key]: '' } })
      const res = await call(handle, post(valid))
      expect(res.status).toBe(500)
      expect(res.body).toEqual({ success: false, message: 'The contact form is not available right now. Please email me directly.' })
      expect(JSON.stringify(res.body)).not.toContain(key)
      expect(sendEmail).not.toHaveBeenCalled()
      expect(log).toHaveBeenCalledWith('missing_configuration', { missing: [key] })
    },
  )

  it.each([
    ['invalid_api_key', 401, 500],
    ['invalid_from_address', 403, 500],
    ['validation_error', 422, 500],
    ['rate_limit_exceeded', 429, 503],
    ['daily_quota_exceeded', 429, 503],
    ['internal_server_error', 500, 502],
    ['application_error', 500, 502],
  ])('maps Resend error %s to HTTP %i → %i', async (name, statusCode, expected) => {
    const { handle, log } = setup({ sendEmail: async () => ({ ok: false, name, statusCode }) })
    const res = await call(handle, post(valid))
    expect(res.status).toBe(expected)
    expect(res.body.success).toBe(false)
    expect(JSON.stringify(res.body)).not.toMatch(/re_test_key|invalid_api_key|stack/)
    expect(log).toHaveBeenCalledWith('provider_error', { name, statusCode })
  })

  it('returns 502 when the provider call throws (network failure)', async () => {
    const { handle } = setup({
      sendEmail: async () => {
        throw new TypeError('fetch failed')
      },
    })
    const res = await call(handle, post(valid))
    expect(res.status).toBe(502)
    expect(res.body).toEqual({ success: false, message: 'Unable to send your message right now. Please try again.' })
  })

  it('never logs the message content or the API key', async () => {
    const { handle, log } = setup({ sendEmail: async () => ({ ok: false, name: 'invalid_api_key', statusCode: 401 }) })
    await call(handle, post(valid))
    const logged = JSON.stringify(log.mock.calls)
    expect(logged).not.toContain(valid.message)
    expect(logged).not.toContain('re_test_key')
  })

  it('escapes HTML and script content in the HTML email and keeps it literal in plain text', async () => {
    const { handle, sendEmail } = setup()
    const message = '<script>alert("x")</script> <img src=x onerror=alert(1)> & done'
    await call(handle, post({ ...valid, name: '<b>Eve</b>', message }))
    const email = sendEmail.mock.calls[0][0]
    expect(email.html).not.toContain('<script>')
    expect(email.html).not.toContain('<img')
    expect(email.html).not.toContain('<b>Eve</b>')
    expect(email.html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;')
    expect(email.html).toContain('&amp; done')
    expect(email.text).toContain(message)
  })
})

describe('resendSendEmail', () => {
  beforeEach(() => sendMock.mockReset())

  const email = {
    from: ENV.CONTACT_FROM_EMAIL!,
    to: ENV.CONTACT_TO_EMAIL!,
    replyTo: 'jane@example.com',
    subject: 'Portfolio Contact: Hi',
    text: 'text',
    html: '<p>html</p>',
    idempotencyKey: 'portfolio-contact-abc12345',
  }

  it('passes reply-to and the idempotency key to the Resend SDK', async () => {
    sendMock.mockResolvedValue({ data: { id: 'email_1' }, error: null })
    await expect(resendSendEmail(email, 're_test_key')).resolves.toEqual({ ok: true, id: 'email_1' })
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: ['mohamedabukar412@gmail.com'], replyTo: 'jane@example.com', subject: 'Portfolio Contact: Hi' }),
      { idempotencyKey: 'portfolio-contact-abc12345' },
    )
  })

  it('returns the Resend error name and status instead of throwing', async () => {
    sendMock.mockResolvedValue({ data: null, error: { name: 'invalid_api_key', message: 'API key is invalid', statusCode: 401 } })
    await expect(resendSendEmail(email, 're_bad')).resolves.toEqual({ ok: false, name: 'invalid_api_key', statusCode: 401 })
  })
})
