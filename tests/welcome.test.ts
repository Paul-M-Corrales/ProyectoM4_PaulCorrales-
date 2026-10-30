import { AnimationClip, QuaternionKeyframeTrack } from 'three'
import { CLIPS } from '@/features/mascot/clips'
import { buildWelcomeClip } from '@/features/mascot/welcome/buildWelcomeClip'
import { WELCOME_BONES, WELCOME_DURATION, welcomePose } from '@/features/mascot/welcome/welcomePose'

function fakeIdle(): AnimationClip {
  const tracks = WELCOME_BONES.map((bone) => new QuaternionKeyframeTrack(`${bone}.quaternion`, [0, 1], [0, 0, 0, 1, 0, 0, 0, 1]))
  return new AnimationClip('idle', 1, tracks)
}

const z = (t: number, bone: string) => welcomePose(t)[bone]?.[2] ?? 0
const FINGERS = ['Index', 'Middle', 'Ring', 'Pinky'].flatMap((f) => [1, 2, 3].map((k) => `mixamorigRightHand${f}${k}`))

describe('animación welcome (pulgar arriba, solo brazo derecho)', () => {
  it('es un clip finito de una sola pasada, sin bicicleta', () => {
    expect(CLIPS.welcome).toMatchObject({ repetitions: 1, bike: false, durationSec: WELCOME_DURATION })
  })

  it('solo anima huesos del lado derecho (el izquierdo y el resto del cuerpo siguen a idle)', () => {
    expect(WELCOME_BONES.every((bone) => bone.startsWith('mixamorigRight'))).toBe(true)
    expect(WELCOME_BONES.some((bone) => /Left|Spine|Neck|Head|Hips|Leg|Foot/.test(bone))).toBe(false)
    for (let t = 0; t <= WELCOME_DURATION; t += 0.1) {
      expect(Object.keys(welcomePose(t)).every((bone) => WELCOME_BONES.includes(bone))).toBe(true)
    }
  })

  it('empieza y termina en la pose natural (sin deltas) y termina en idle', () => {
    for (const t of [0, WELCOME_DURATION]) {
      for (const delta of Object.values(welcomePose(t))) expect(delta.map((v) => Math.abs(v))).toEqual([0, 0, 0])
    }
  })

  it('el brazo sube gradualmente: antes de 0,4 s sigue en reposo', () => {
    expect(z(0.3, 'mixamorigRightArm')).toBe(0)
    expect(z(1.0, 'mixamorigRightArm')).toBeGreaterThan(5)
    expect(z(1.0, 'mixamorigRightArm')).toBeLessThan(z(1.9, 'mixamorigRightArm'))
  })

  it('pulgar arriba formado: codo flexionado, 4 dedos cerrados y pulgar extendido', () => {
    expect(z(2.5, 'mixamorigRightArm')).toBeGreaterThan(35)
    expect(z(2.5, 'mixamorigRightForeArm')).toBeGreaterThan(115)
    for (const bone of FINGERS) expect(z(2.5, bone)).toBeGreaterThan(80)
    expect(z(2.5, 'mixamorigRightHandThumb1')).toBeLessThan(-35)
    expect(z(2.5, 'mixamorigRightHandThumb2')).toBeLessThan(-45)
  })

  it('el gesto se sostiene unos 2 s sin cambiar', () => {
    const held = [2.0, 2.5, 3.0, 3.5, 3.85].map((t) => z(t, 'mixamorigRightForeArm'))
    expect(Math.max(...held) - Math.min(...held)).toBeLessThan(1)
    expect(Math.min(...held)).toBeGreaterThan(125)
  })

  it('no hay puño ni movimiento del brazo izquierdo, ni impulsos', () => {
    for (let t = 0; t <= WELCOME_DURATION; t += 0.05) {
      expect(Object.keys(welcomePose(t)).some((bone) => bone.includes('Left'))).toBe(false)
    }
  })

  it('anatomía: codo nunca hiperextendido ni pasado de 135°; brazo ≤ 45°', () => {
    for (let t = 0; t <= WELCOME_DURATION; t += 0.05) {
      expect(z(t, 'mixamorigRightForeArm')).toBeGreaterThanOrEqual(0)
      expect(z(t, 'mixamorigRightForeArm')).toBeLessThanOrEqual(135)
      expect(z(t, 'mixamorigRightArm')).toBeLessThanOrEqual(45)
    }
  })

  it('suave: brazos ≤ 6°/fotograma y dedos ≤ 7°/fotograma a 30 fps', () => {
    let previous = welcomePose(0)
    for (let i = 1; i <= Math.round(WELCOME_DURATION * 30); i += 1) {
      const current = welcomePose(i / 30)
      for (const [bone, delta] of Object.entries(current)) {
        const before = previous[bone] ?? [0, 0, 0]
        for (let axis = 0; axis < 3; axis += 1) {
          expect(Math.abs((delta[axis] ?? 0) - (before[axis] ?? 0))).toBeLessThan(/Arm$/.test(bone) ? 6 : 7)
        }
      }
      previous = current
    }
  })

  it('el clip solo contiene rotaciones (sin escalado de manos ni traslaciones)', () => {
    const clip = buildWelcomeClip(fakeIdle())
    expect(clip.name).toBe('welcome')
    expect(clip.duration).toBeCloseTo(WELCOME_DURATION)
    expect(clip.tracks).toHaveLength(WELCOME_BONES.length)
    expect(clip.tracks.every((t) => t.name.endsWith('.quaternion'))).toBe(true)
    expect(clip.tracks.some((t) => t.name.endsWith('.scale') || t.name.endsWith('.position'))).toBe(false)
    expect(clip.tracks[0]?.times).toHaveLength(Math.round(WELCOME_DURATION * 30) + 1)
  })

  it('ignora huesos que no existan en idle', () => {
    expect(buildWelcomeClip(new AnimationClip('idle', 1, [])).tracks).toHaveLength(0)
  })
})
