import { defineConfig } from 'vite'
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

export default defineConfig({
  plugins: [react()],
  define: {
    __HAS_CV__: JSON.stringify(hasValidCv()),
  },
})
