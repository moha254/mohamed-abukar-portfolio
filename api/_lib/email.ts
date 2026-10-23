import type { ContactRequest } from '../../src/lib/contact.js'

export interface ContactEmail {
  subject: string
  text: string
  html: string
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch])
}

/** Builds the notification sent to the portfolio owner. All visitor text is treated as untrusted. */
export function buildContactEmail(data: ContactRequest, receivedAt: Date): ContactEmail {
  const when = receivedAt.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC')

  const text = [
    'New message from your portfolio contact form',
    '',
    `Name:     ${data.name}`,
    `Email:    ${data.email}`,
    `Subject:  ${data.subject}`,
    `Received: ${when}`,
    '',
    'Message:',
    data.message,
    '',
    '—',
    'Reply to this email to respond directly to the sender.',
  ].join('\n')

  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#6b7385;vertical-align:top">${label}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`

  const html = `<!doctype html><html><body style="font-family:Segoe UI,Arial,sans-serif;color:#0f172a;line-height:1.5">
<h2 style="margin:0 0 12px;font-size:18px;color:#1f4fd8">New portfolio message</h2>
<table style="border-collapse:collapse;font-size:14px">${row('Name', data.name)}${row('Email', data.email)}${row('Subject', data.subject)}${row('Received', when)}</table>
<div style="margin-top:16px;padding:12px 14px;border:1px solid #e3e6ec;border-radius:8px;white-space:pre-wrap;font-size:14px">${escapeHtml(data.message)}</div>
<p style="margin-top:16px;font-size:12px;color:#6b7385">Reply to this email to respond directly to the sender.</p>
</body></html>`

  return { subject: `Portfolio Contact: ${data.subject}`, text, html }
}
