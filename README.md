# Mohamed Abukar — Portfolio

Personal portfolio for Mohamed Abukar: Software Engineer, Programme Assistant, Operations Manager and SaaS entrepreneur (MohaTech Solutions).

This is a **standalone project**, separate from the older portfolio at `my-portfolio-blond-six-35.vercel.app`. Deploy it as its own Vercel project.

## Stack

- React 19 + TypeScript + Vite 7
- Plain CSS with design tokens (`src/styles/tokens.css`), no CSS framework
- Lucide icons
- One Vercel serverless function, `api/contact.ts`, that sends contact-form messages through [Resend](https://resend.com/docs)
- Vitest + Testing Library for tests

## Getting started

```bash
npm install
npm run dev        # local dev server
npm run typecheck  # TypeScript
npm run lint       # ESLint
npm run build      # production build -> dist/
npm run preview    # serve the production build (static only; /api is not served here)
npm test           # unit + component tests (Resend is mocked; no real email is sent)
npm run verify:cv  # check public/resume.pdf and dist/resume.pdf are real PDFs
```

## Updating content

All content lives in `src/data/`, so text changes never require touching components:

| File | What it holds |
| --- | --- |
| `profile.ts` | Name, headline, contact details, nav links, CV path |
| `experience.ts` | HDF, Shilaabo Tour & Car Hire, MohaTech Solutions and Qaffee Point roles |
| `projects.ts` | Featured project cards (problem, contribution, features, links, status) |
| `products.ts` | MohaTech SaaS product cards and statuses |
| `skills.ts` | Skill groups |
| `education.ts` | Degree, diploma, KCSE and training |

Statuses are `Live`, `In Development` or `Academic`. Only mark a product `Live` once its URL is publicly reachable.

## CV download

- The public CV file is **`public/resume.pdf`**. It is served at `/resume.pdf` and downloaded as `Mohamed-Abukar-CV.pdf`.
- To update the CV, replace `public/resume.pdf` and redeploy. `DownloadCVButton` does not need to change.
- The current PDF is generated from **`cv/resume.html`**. Edit that file, then regenerate the PDF with headless Microsoft Edge:
  `powershell -ExecutionPolicy Bypass -File cv/build-cv.ps1`
- At build time, `vite.config.ts` checks that `public/resume.pdf` exists and starts with the `%PDF-` header. **If not, every Download CV button is hidden**, so the site never links to a missing file.
- `vercel.json` sets `Content-Type: application/pdf` and an attachment `Content-Disposition` for `/resume.pdf`. There are no SPA rewrites, so the PDF path is never redirected to `index.html`.
- Do not put the editable `.docx` CV in `public/`; everything there is publicly downloadable.

## Contact form (Resend)

The form in the Contact section posts JSON to the same-origin endpoint **`/api/contact`**, implemented in `api/contact.ts`.

| File | Role |
| --- | --- |
| `api/contact.ts` | Vercel function entry (web-standard `fetch` handler) |
| `api/_lib/contactHandler.ts` | Request checks, validation, rate limiting, Resend call, error mapping |
| `api/_lib/email.ts` | Builds the plain-text + HTML-escaped notification email |
| `api/_lib/rateLimit.ts` | In-memory rate limiter |
| `src/lib/contact.ts` | Field rules shared by the browser and the server |
| `src/components/ContactForm.tsx` | The form UI and its idle / validating / sending / success / error states |

Files in `api/_lib/` start with `_`, so Vercel does not deploy them as separate endpoints.

### Environment variables (server-only)

| Variable | Example | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | `re_…` | Create in Resend → API Keys. **Never** prefix with `VITE_`. |
| `CONTACT_FROM_EMAIL` | `Portfolio Contact <contact@your-verified-domain.com>` | Must be on a domain verified in Resend. `onboarding@resend.dev` works only for testing and can only deliver to your own Resend account email. |
| `CONTACT_TO_EMAIL` | `mohamedabukar412@gmail.com` | Inbox that receives submissions. |

- **Local:** copy `.env.example` to `.env.local` (git-ignored) and fill it in. `npm run dev` serves `/api/contact` through a small Vite middleware (see `vite.config.ts`) that runs the same function code.
- **Vercel:** Project → Settings → Environment Variables → add all three for Production (and Preview if wanted), then redeploy.
- The visitor's address is used as `replyTo`; the sender is always `CONTACT_FROM_EMAIL`.

### What the endpoint checks

| Check | Response |
| --- | --- |
| Method other than POST | 405 (`Allow: POST`) |
| Cross-site `Origin` header | 403 |
| Content type not JSON | 415 |
| Body over 16 KB | 413 |
| Malformed JSON | 400 |
| Honeypot field filled, or form submitted under 3 s after loading | 400 (nothing sent) |
| More than 5 requests per IP per 10 minutes | 429 with `Retry-After` |
| Missing/empty/too-long fields, bad email, line breaks in single-line fields | 400 with per-field `errors` |
| Missing environment variable | 500 (variable *names* logged, never values) |
| Resend key / sender-domain / payload errors | 500 |
| Resend throttling or quota | 503 |
| Other provider or network failure | 502 |
| Accepted by Resend | 200 `{ "success": true }` |

Field limits: name 100, email 254, subject 200, message 5,000 characters. Each submission carries an id used as the Resend idempotency key, so a retried request cannot produce a duplicate email. Server logs contain only event names, Resend error codes and status codes, never message text or keys.

A 200 response means Resend **accepted** the email; check the Resend dashboard → Emails for actual delivery status.

### Rate limiting

The limiter is in memory, so each Vercel function instance counts separately. It stops bursts from one client but is **not** a global limit. For a strict global limit, replace `createMemoryRateLimiter` with a shared store such as [Upstash Redis](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview) (free tier available; needs `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`). The `RateLimiter` interface in `api/_lib/rateLimit.ts` is the only thing that needs a new implementation.

### Adding a visitor confirmation email later

Call `sendEmail` a second time in `contactHandler.ts`, after the owner notification succeeds, with `to: result.data.email`. Handle its result separately: a failed confirmation must not turn a delivered notification into an error.

## Deploying to Vercel (new, independent project)

1. Create a **new** GitHub repository (e.g. `mohamed-abukar-portfolio`) and push this folder to it.
2. In Vercel: **Add New → Project**, import that new repository. Do *not* select the existing portfolio project.
3. Vercel detects Vite. Build command `npm run build`, output directory `dist` (also set in `vercel.json`). Add the three contact-form environment variables above before deploying.
4. Deploy, then open `https://<new-domain>/resume.pdf` to confirm the CV downloads, and send a test message through the contact form.

Or with the CLI from this folder: `npx vercel` (choose "create a new project"), then `npx vercel --prod`.

### After the production domain is known

- Add `<link rel="canonical" href="https://<domain>/">` and `og:url` to `index.html`.
- Add an absolute `og:image` if you create a social preview image.
- Add a `public/sitemap.xml` with the domain and uncomment the `Sitemap:` line in `public/robots.txt`.

## Privacy

Never add beneficiary names, photos, case details or any other confidential HDF programme information to this site.
