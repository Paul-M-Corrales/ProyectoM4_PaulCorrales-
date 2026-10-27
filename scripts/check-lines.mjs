import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const MAX_LINES = 150
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css'])
const IGNORED = new Set(['node_modules', 'dist', '.git', '.zip', 'package-lock.json'])
const root = process.cwd()

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (IGNORED.has(name)) continue
    const path = join(dir, name)
    if (statSync(path).isDirectory()) yield* walk(path)
    else if (EXTENSIONS.has(extname(name))) yield path
  }
}

const offenders = []
let checked = 0
for (const file of walk(root)) {
  checked += 1
  const text = readFileSync(file, 'utf8')
  const lines = text.endsWith('\n') ? text.split('\n').length - 1 : text.split('\n').length
  if (lines > MAX_LINES) offenders.push(`${relative(root, file)} (${lines} líneas)`)
}

if (offenders.length > 0) {
  console.error(`Archivos que superan ${MAX_LINES} líneas:\n- ${offenders.join('\n- ')}`)
  process.exit(1)
}
console.log(`OK: ${checked} archivos de código revisados, ninguno supera ${MAX_LINES} líneas.`)
