# Mohamed Abukar — Portfolio

Personal portfolio for Mohamed Abukar: Software Engineer, Programme Assistant, Operations Manager and SaaS entrepreneur (MohaTech Solutions).

This is a **standalone project**, separate from the older portfolio at `my-portfolio-blond-six-35.vercel.app`. Deploy it as its own Vercel project.

## Stack

- React 19 + TypeScript + Vite 7
- Plain CSS with design tokens (`src/styles/tokens.css`), no CSS framework
- Lucide icons
- No backend, no environment variables

## Getting started

```bash
npm install
npm run dev        # local dev server
npm run typecheck  # TypeScript
npm run lint       # ESLint
npm run build      # production build -> dist/
npm run preview    # serve the production build
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

## Deploying to Vercel (new, independent project)

1. Create a **new** GitHub repository (e.g. `mohamed-abukar-portfolio`) and push this folder to it.
2. In Vercel: **Add New → Project**, import that new repository. Do *not* select the existing portfolio project.
3. Vercel detects Vite. Build command `npm run build`, output directory `dist` (also set in `vercel.json`). No environment variables are needed.
4. Deploy, then open `https://<new-domain>/resume.pdf` to confirm the CV downloads.

Or with the CLI from this folder: `npx vercel` (choose "create a new project"), then `npx vercel --prod`.

### After the production domain is known

- Add `<link rel="canonical" href="https://<domain>/">` and `og:url` to `index.html`.
- Add an absolute `og:image` if you create a social preview image.
- Add a `public/sitemap.xml` with the domain and uncomment the `Sitemap:` line in `public/robots.txt`.

## Privacy

Never add beneficiary names, photos, case details or any other confidential HDF programme information to this site.
