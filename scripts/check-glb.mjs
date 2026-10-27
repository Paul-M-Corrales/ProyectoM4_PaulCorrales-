import { readFileSync } from 'node:fs'

const GLB_PATH = new URL('../public/mascot/rabbit.glb', import.meta.url)
const REQUIRED = [
  'walk', 'stop', 'point', 'idle',
  'ride', 'ride-idle', 'ride-mount', 'ride-celebrate',
]

const buffer = readFileSync(GLB_PATH)
if (buffer.toString('ascii', 0, 4) !== 'glTF') {
  console.error('rabbit.glb no es un GLB válido (magic incorrecto).')
  process.exit(1)
}
const jsonLength = buffer.readUInt32LE(12)
const gltf = JSON.parse(buffer.toString('utf8', 20, 20 + jsonLength))
const found = (gltf.animations ?? []).map((a) => a.name)
const missing = REQUIRED.filter((name) => !found.includes(name))

console.log(`Clips detectados (${found.length}): ${found.join(', ')}`)
if (missing.length > 0) {
  console.error(`Faltan clips: ${missing.join(', ')}`)
  process.exit(1)
}
console.log('OK: el GLB contiene los 8 clips requeridos.')
