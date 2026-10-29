import { AnimationClip, QuaternionKeyframeTrack } from 'three'
import { CLIPS } from '@/features/mascot/clips'
import { buildWelcomeClip } from '@/features/mascot/welcome/buildWelcomeClip'
import { WELCOME_BONES, WELCOME_DURATION, welcomePose } from '@/features/mascot/welcome/welcomePose'

function fakeIdle(): AnimationClip {
  const tracks = WELCOME_BONES.map((bone) => new QuaternionKeyframeTrack(`${bone}.quaternion`, [0, 1], [0, 0, 0, 1, 0, 0, 0, 1]))
  return new AnimationClip('idle', 1, tracks)
}

describe('animación welcome', () => {
  it('es un clip finito de una sola pasada, sin bicicleta', () => {
    expect(CLIPS.welcome).toMatchObject({ repetitions: 1, bike: false, durationSec: WELCOME_DURATION })
  })

  it('empieza y termina en la pose natural (sin deltas)', () => {
    for (const t of [0, WELCOME_DURATION]) {
      for (const delta of Object.values(welcomePose(t))) expect(delta.map((v) => Math.abs(v))).toEqual([0, 0, 0])
    }
  })

  it('saluda con el brazo derecho y levanta el puño con el izquierdo, en ese orden', () => {
    const wave = welcomePose(1.2)
    const fist = welcomePose(3.6)
    expect(Math.abs(wave.mixamorigRightArm?.[2] ?? 0)).toBeGreaterThan(90)
    expect(Math.abs(wave.mixamorigLeftArm?.[2] ?? 0)).toBeLessThan(1)
    expect(Math.abs(fist.mixamorigLeftArm?.[2] ?? 0)).toBeGreaterThan(90)
    expect(Math.abs(fist.mixamorigRightArm?.[2] ?? 0)).toBeLessThan(1)
    expect(Math.abs(fist.mixamorigLeftHandIndex2?.[2] ?? 0)).toBeGreaterThan(60)
  })

  it('el saludo oscila (el antebrazo no queda quieto)', () => {
    const samples = [0.9, 1.0, 1.1, 1.2, 1.3].map((t) => welcomePose(t).mixamorigRightForeArm?.[2] ?? 0)
    expect(Math.max(...samples) - Math.min(...samples)).toBeGreaterThan(15)
  })

  it('construye un clip sobre huesos reales a 30 fps y no reutiliza point', () => {
    const clip = buildWelcomeClip(fakeIdle())
    expect(clip.name).toBe('welcome')
    expect(clip.duration).toBeCloseTo(WELCOME_DURATION)
    expect(clip.tracks).toHaveLength(WELCOME_BONES.length)
    expect(clip.tracks[0]?.times).toHaveLength(Math.round(WELCOME_DURATION * 30) + 1)
    expect(clip.tracks.every((t) => t.name.startsWith('mixamorig') && t.name.endsWith('.quaternion'))).toBe(true)
  })

  it('ignora huesos que no existan en idle', () => {
    expect(buildWelcomeClip(new AnimationClip('idle', 1, [])).tracks).toHaveLength(0)
  })
})
