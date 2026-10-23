import { createContactHandler } from './_lib/contactHandler.js'

// POST /api/contact — sends portfolio contact-form submissions through Resend.
// Credentials come only from server-side environment variables (see .env.example).
const handle = createContactHandler({
  env: () => ({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
  }),
})

export const config = { maxDuration: 15 }

export default {
  fetch(request: Request) {
    return handle(request)
  },
}
