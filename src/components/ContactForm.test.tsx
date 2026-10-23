// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ContactForm } from './ContactForm'

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => (resolve = r))
  return { promise, resolve }
}

async function fillForm(user = userEvent.setup()) {
  await user.type(screen.getByLabelText('Your name'), 'Jane Doe')
  await user.type(screen.getByLabelText('Your email'), 'jane@example.com')
  await user.type(screen.getByLabelText('Subject'), 'Project enquiry')
  await user.type(screen.getByLabelText('Message'), 'Hello, I would like to talk about a project.')
  return user
}

const submitButton = () => screen.getByRole('button', { name: /send message|sending/i })

describe('ContactForm', () => {
  it('shows field errors and does not call the API when fields are invalid', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.type(screen.getByLabelText('Your email'), 'not-an-email')
    await user.click(submitButton())

    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByText('Please enter your name.')).toBeInTheDocument()
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByText('Please enter your subject.')).toBeInTheDocument()
    expect(screen.getByText('Please enter your message.')).toBeInTheDocument()
    expect(screen.getByLabelText('Your name')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Your name')).toHaveFocus()
  })

  it('posts JSON to /api/contact and shows a loading state while pending', async () => {
    const pending = deferred<Response>()
    fetchMock.mockReturnValue(pending.promise)
    render(<ContactForm />)
    const user = await fillForm()
    await user.click(submitButton())

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/contact')
    expect(init?.method).toBe('POST')
    expect(new Headers(init?.headers).get('Content-Type')).toBe('application/json')
    const sent = JSON.parse(init?.body as string)
    expect(sent).toMatchObject({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'Project enquiry',
      message: 'Hello, I would like to talk about a project.',
      website: '',
    })
    expect(typeof sent.startedAt).toBe('number')
    expect(sent.submissionId).toMatch(/^[A-Za-z0-9-]{8,64}$/)

    expect(submitButton()).toBeDisabled()
    expect(submitButton()).toHaveTextContent('Sending…')
    expect(screen.getByRole('status')).toHaveTextContent('Sending your message…')
    expect(screen.getByLabelText('Your name')).toBeDisabled()

    await act(async () => pending.resolve(jsonResponse(200, { success: true, message: 'ok' })))
  })

  it('shows success and clears the form only when the server confirms', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { success: true, message: 'Your message was accepted for sending.' }))
    render(<ContactForm />)
    const user = await fillForm()
    await user.click(submitButton())

    expect(await screen.findByText(/your message has been sent/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Your name')).toHaveValue('')
    expect(screen.getByLabelText('Message')).toHaveValue('')
    expect(submitButton()).toBeEnabled()
    expect(submitButton()).toHaveTextContent('Send Message')
  })

  it('shows the server error and keeps the entered values when sending fails', async () => {
    fetchMock.mockResolvedValue(jsonResponse(502, { success: false, message: 'Unable to send your message right now. Please try again.' }))
    render(<ContactForm />)
    const user = await fillForm()
    await user.click(submitButton())

    expect(await screen.findByText('Unable to send your message right now. Please try again.')).toBeInTheDocument()
    expect(screen.getByLabelText('Your name')).toHaveValue('Jane Doe')
    expect(screen.getByLabelText('Message')).toHaveValue('Hello, I would like to talk about a project.')
    expect(submitButton()).toBeEnabled()
    expect(screen.queryByText(/has been sent/i)).not.toBeInTheDocument()
  })

  it('never reports success for a 200 response whose body does not confirm success', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Gateway</html>', { status: 200, headers: { 'Content-Type': 'text/html' } }))
    render(<ContactForm />)
    const user = await fillForm()
    await user.click(submitButton())

    expect(await screen.findByText('Unable to send your message right now. Please try again.')).toBeInTheDocument()
    expect(screen.getByLabelText('Your name')).toHaveValue('Jane Doe')
  })

  it('shows field errors returned by the server', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, { success: false, message: 'Please check the highlighted fields.', errors: { email: 'Please enter a valid email address.' } }),
    )
    render(<ContactForm />)
    const user = await fillForm()
    await user.click(submitButton())

    expect(await screen.findByText('Please check the highlighted fields.')).toBeInTheDocument()
    expect(screen.getByLabelText('Your email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows a rate-limit message from the server', async () => {
    fetchMock.mockResolvedValue(jsonResponse(429, { success: false, message: 'Too many messages in a short time. Please try again later.' }))
    render(<ContactForm />)
    const user = await fillForm()
    await user.click(submitButton())
    expect(await screen.findByText(/too many messages/i)).toBeInTheDocument()
  })

  it('handles a network failure', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    render(<ContactForm />)
    const user = await fillForm()
    await user.click(submitButton())

    expect(await screen.findByText(/network error/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Subject')).toHaveValue('Project enquiry')
    expect(submitButton()).toBeEnabled()
  })

  it('prevents duplicate submissions while a request is pending', async () => {
    const pending = deferred<Response>()
    fetchMock.mockReturnValue(pending.promise)
    render(<ContactForm />)
    await fillForm()

    const form = submitButton().closest('form')!
    // Fire submit twice in the same tick, before React re-renders the disabled button.
    act(() => {
      fireEvent.submit(form)
      fireEvent.submit(form)
    })
    fireEvent.submit(form)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    await act(async () => pending.resolve(jsonResponse(200, { success: true, message: 'ok' })))
    expect(await screen.findByText(/has been sent/i)).toBeInTheDocument()
  })

  it('keeps the honeypot field out of the tab order and hidden from assistive tech', () => {
    render(<ContactForm />)
    const honeypot = document.getElementById('contact-website')!
    expect(honeypot).toHaveAttribute('tabindex', '-1')
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('submits script-like text as plain data without rendering it', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { success: true, message: 'ok' }))
    render(<ContactForm />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Your name'), 'Eve')
    await user.type(screen.getByLabelText('Your email'), 'eve@example.com')
    await user.type(screen.getByLabelText('Subject'), 'Test')
    const payload = '<script>alert(1)</script>'
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: payload } })
    expect(document.querySelectorAll('script')).toHaveLength(0)
    await user.click(submitButton())

    expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string).message).toBe(payload)
    expect(document.querySelectorAll('script')).toHaveLength(0)
  })
})
