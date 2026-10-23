/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, openSync, readSync, closeSync } from 'node:fs'
import { resolve } from 'node:path'

// The Download CV button is only rendered when a real PDF is present at
// public/resume.pdf (checked by its "%PDF-" magic bytes at build time).
function hasValidCv(): boolean {
  const file = resolve(__dirname, 'public/resume.pdf')
  if (!existsSync(file)) return false
  const fd = openSync(file, 'r')
  const header = Buffer.alloc(5)
  readSync(fd, header, 0, 5, 0)
  closeSync(fd)
  return header.toString('latin1') === '%PDF-'
}

const SERVER_ENV_KEYS = ['RESEND_API_KEY', 'CONTACT_FROM_EMAIL', 'CONTACT_TO_EMAIL']

/**
 * Serves the Vercel function at api/contact.ts during `npm run dev`, so the
 * contact form works locally without the Vercel CLI. Server-only variables
 * from .env.local are copied into process.env here and never reach the bundle
 * (they have no VITE_ prefix). Production uses Vercel's own function runtime.
 */
function devApi(mode: string): Plugin {
  return {
    name: 'dev-api-contact',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(mode, process.cwd(), '')
      for (const key of SERVER_ENV_KEYS) if (env[key] && !process.env[key]) process.env[key] = env[key]

      server.middlewares.use('/api/contact', async (req, res) => {
        try {
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const headers = new Headers()
          for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v)
          const method = req.method ?? 'GET'
          const request = new Request(`http://${req.headers.host}/api/contact`, {
            method,
            headers,
            body: method === 'GET' || method === 'HEAD' ? undefined : Buffer.concat(chunks),
          })
          const mod = await server.ssrLoadModule('/api/contact.ts')
          const response: Response = await mod.default.fetch(request)
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(await response.text())
        } catch (error) {
          server.config.logger.error(`[dev-api] ${error instanceof Error ? error.message : String(error)}`)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: false, message: 'Unable to send your message right now. Please try again.' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), devApi(mode)],
  define: {
    __HAS_CV__: JSON.stringify(hasValidCv()),
  },
  test: {
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'api/**/*.test.ts'],
  },
}))
