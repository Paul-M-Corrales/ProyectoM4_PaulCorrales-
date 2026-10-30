import { AnimationClip, QuaternionKeyframeTrack } from 'three'
import { CLIPS } from '@/features/mascot/clips'
import { buildWelcomeClip } from '@/features/mascot/welcome/buildWelcomeClip'
import { WELCOME_BONES, WELCOME_DURATION, welcomePose } from '@/features/mascot/welcome/welcomePose'

function fakeIdle(): AnimationClip {
  const tracks = WELCOME_BONES.map((bone) => new QuaternionKeyframeTrack(`${bone}.quaternion`, [0, 1], [0, 0, 0, 1, 0, 0, 0, 1]))
  return new AnimationClip('idle', 1, tracks)
}

const z = (t: number, bone: string) => welcomePose(t)[bone]?.[2] ?? 0

describe('animación welcome (pulgar arriba + puño)', () => {
  it('es un clip finito de una sola pasada, sin bicicleta', () => {
    expect(CLIPS.welcome).toMatchObject({ repetitions: 1, bike: false, durationSec: WELCOME_DURATION })
  })

  it('empieza y termina en la pose natural (sin deltas)', () => {
    for (const t of [0, WELCOME_DURATION]) {
      for (const delta of Object.values(welcomePose(t))) expect(delta.map((v) => Math.abs(v))).toEqual([0, 0, 0])
    }
  })

  it('1) pulgar arriba con el brazo derecho: codo flexionado, dedos cerrados y pulgar extendido', () => {
    expect(z(1.6, 'mixamorigRightArm')).toBeGreaterThan(55)
    expect(z(1.6, 'mixamorigRightForeArm')).toBeGreaterThan(85)
    expect(z(1.6, 'mixamorigRightHandIndex2')).toBeGreaterThan(75)
    expect(z(1.6, 'mixamorigRightHandThumb1')).toBeLessThan(-35)
    expect(Math.abs(z(1.6, 'mixamorigLeftArm'))).toBeLessThan(1)
  })

  it('el pulgar se mantiene visible un rato antes de pasar al puño', () => {
    const held = [1.0, 1.4, 1.8, 2.2].every((t) => z(t, 'mixamorigRightHandThumb1') < -30)
    expect(held).toBe(true)
  })

  it('2) puño con el brazo izquierdo: pulgar remetido y dedos cerrados', () => {
    expect(z(3.6, 'mixamorigLeftArm')).toBeLessThan(-60)
    expect(z(3.6, 'mixamorigLeftHandIndex2')).toBeLessThan(-75)
    expect(z(3.6, 'mixamorigLeftHandThumb1')).toBeLessThan(-30)
    expect(Math.abs(z(3.6, 'mixamorigRightArm'))).toBeLessThan(1)
  })

  it('anatomía: sin codos hiperextendidos ni brazos fuera de rango', () => {
    for (let t = 0; t <= WELCOME_DURATION; t += 0.05) {
      expect(z(t, 'mixamorigRightForeArm')).toBeGreaterThanOrEqual(-1)
      expect(z(t, 'mixamorigLeftForeArm')).toBeLessThanOrEqual(1)
      expect(Math.abs(z(t, 'mixamorigRightArm'))).toBeLessThanOrEqual(75)
      expect(Math.abs(z(t, 'mixamorigLeftArm'))).toBeLessThanOrEqual(85)
      expect(Math.abs(z(t, 'mixamorigRightForeArm'))).toBeLessThanOrEqual(110)
      expect(Math.abs(z(t, 'mixamorigLeftForeArm'))).toBeLessThanOrEqual(115)
    }
  })

  it('suave: brazos ≤ 6°/fotograma y dedos ≤ 7°/fotograma a 30 fps', () => {
    let previous = welcomePose(0)
    for (let i = 1; i <= Math.round(WELCOME_DURATION * 30); i += 1) {
      const current = welcomePose(i / 30)
      for (const [bone, delta] of Object.entries(current)) {
        const before = previous[bone] ?? [0, 0, 0]
        for (let axis = 0; axis < 3; axis += 1) {
          expect(Math.abs((delta[axis] ?? 0) - (before[axis] ?? 0))).toBeLessThan(/Arm$/.test(bone) || /ForeArm$/.test(bone) ? 6 : 7)
        }
      }
      previous = current
    }
  })

  it('construye un clip sobre huesos reales a 30 fps y no reutiliza point', () => {
    const clip = buildWelcomeClip(fakeIdle())
    expect(clip.name).toBe('welcome')
    expect(clip.duration).toBeCloseTo(WELCOME_DURATION)
    expect(clip.tracks).toHaveLength(WELCOME_BONES.length + 2)
    expect(clip.tracks[0]?.times).toHaveLength(Math.round(WELCOME_DURATION * 30) + 1)
    expect(clip.tracks.every((t) => t.name.startsWith('mixamorig') && /.(quaternion|scale)$/.test(t.name))).toBe(true)
  })

  it('ignora huesos que no existan en idle', () => {
    expect(buildWelcomeClip(new AnimationClip('idle', 1, [])).tracks).toHaveLength(0)
  })
})
