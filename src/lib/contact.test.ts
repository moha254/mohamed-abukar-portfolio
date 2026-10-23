import { describe, expect, it } from 'vitest'
import { isValidEmail, validateContact } from './contact'

describe('isValidEmail', () => {
  it.each(['jane@example.com', 'first.last+tag@sub.example.co.ke', "o'neil@example.org"])('accepts %s', (email) => {
    expect(isValidEmail(email)).toBe(true)
  })

  it.each(['', 'plain', '@example.com', 'jane@', 'jane@example', 'ja ne@example.com', 'jane@exa_mple.com', 'jane@-example.com', '<a>@example.com'])(
    'rejects %s',
    (email) => {
      expect(isValidEmail(email)).toBe(false)
    },
  )

  it('rejects a local part over 64 characters', () => {
    expect(isValidEmail(`${'a'.repeat(65)}@example.com`)).toBe(false)
  })
})

describe('validateContact', () => {
  it('returns trimmed data for valid input', () => {
    expect(validateContact({ name: ' Jane ', email: 'jane@example.com ', subject: ' Hi ', message: '  Hello\nthere  ' })).toEqual({
      ok: true,
      data: { name: 'Jane', email: 'jane@example.com', subject: 'Hi', message: 'Hello\nthere' },
    })
  })

  it('reports every missing field for non-object input', () => {
    const result = validateContact(null)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(Object.keys(result.errors)).toEqual(['name', 'email', 'subject', 'message'])
  })

  it('allows line breaks in the message only', () => {
    const result = validateContact({ name: 'A\nB', email: 'a@b.co', subject: 'S', message: 'line1\nline2' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors).toEqual({ name: 'Name must be on a single line.' })
  })
})
