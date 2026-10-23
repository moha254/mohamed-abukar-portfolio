// Checks that public/resume.pdf (and dist/resume.pdf after a build) is a real PDF.
// Usage: npm run verify:cv
import { existsSync, readFileSync, statSync } from 'node:fs'

let failed = false

for (const file of ['public/resume.pdf', 'dist/resume.pdf']) {
  if (!existsSync(file)) {
    console.log(`MISSING  ${file}`)
    failed = true
    continue
  }
  const buf = readFileSync(file)
  const isPdf = buf.subarray(0, 5).toString('latin1') === '%PDF-'
  const hasEof = buf.subarray(-1024).toString('latin1').includes('%%EOF')
  const kb = (statSync(file).size / 1024).toFixed(1)
  console.log(`${isPdf && hasEof ? 'OK      ' : 'INVALID '} ${file} (${kb} KB)`)
  if (!isPdf || !hasEof) failed = true
}

process.exit(failed ? 1 : 0)
