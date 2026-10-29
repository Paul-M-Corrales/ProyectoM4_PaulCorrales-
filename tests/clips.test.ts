import { CLIPS, LOGIN_SEQUENCE } from '@/features/mascot/clips'
import { CLIP_NAMES } from '@/features/mascot/contracts'

describe('configuración de clips', () => {
  it('define los 8 clips del GLB y el clip procedural welcome', () => {
    expect(CLIP_NAMES).toHaveLength(9)
    expect(Object.keys(CLIPS).sort()).toEqual([...CLIP_NAMES].sort())
  })

  it('la secuencia de login es walk → stop → point → idle', () => {
    expect(LOGIN_SEQUENCE).toEqual(['walk', 'stop', 'point', 'idle'])
  })

  it('solo los clips ride-* muestran la bicicleta, e idle es un bucle', () => {
    for (const name of CLIP_NAMES) {
      expect(CLIPS[name].bike).toBe(name.startsWith('ride'))
    }
    expect(CLIPS.idle.repetitions).toBe(Infinity)
  })
})
