// @vitest-environment node
import { execFileSync } from 'node:child_process'

describe('rabbit.glb', () => {
  it('contiene los 8 clips requeridos (scripts/check-glb.mjs)', () => {
    const output = execFileSync(process.execPath, ['scripts/check-glb.mjs'], {
      encoding: 'utf8',
    })
    expect(output).toMatch(/OK: el GLB contiene los 8 clips/)
    for (const clip of ['walk', 'stop', 'point', 'idle', 'ride-idle', 'ride-mount']) {
      expect(output).toContain(clip)
    }
  })
})
