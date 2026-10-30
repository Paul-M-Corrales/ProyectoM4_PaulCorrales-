import { plateau } from './easing'

/** Rotación local en grados (x, y, z) que se compone sobre la pose de reposo de idle. */
export type Euler3 = readonly [number, number, number]
export type PoseDeltas = Readonly<Record<string, Euler3>>

export const WELCOME_DURATION = 5.2

const FINGERS = ['Index', 'Middle', 'Ring', 'Pinky'] as const
const PHALANGES = [1, 2, 3] as const

const FINGER_BONES: readonly string[] = FINGERS.flatMap((f) =>
  PHALANGES.map((k) => `mixamorigRightHand${f}${k}`),
)

/** Únicos huesos que toca `welcome`: toda la cadena del brazo derecho. El resto sigue a idle. */
export const WELCOME_BONES: readonly string[] = [
  'mixamorigRightArm',
  'mixamorigRightForeArm',
  'mixamorigRightHand',
  'mixamorigRightHandThumb1',
  'mixamorigRightHandThumb2',
  ...FINGER_BONES,
]

/** Ángulos de la pose final (pulgar arriba a la altura del pecho, como en la referencia). */
export const THUMBS_UP = {
  arm: 38,
  forearm: 128,
  wrist: [20, 20, 50],
  fingers: 85,
  thumb: [-40, -50],
} as const

/**
 * Ejes calibrados sobre el rig Mixamo: Z del brazo lo separa del cuerpo; Z del antebrazo flexiona el codo;
 * Z de los dedos los cierra; Z negativo del pulgar lo levanta.
 *
 * 0–0.4 reposo · 0.4–1.6 sube el brazo · 1.1–1.9 cierra la mano y levanta el pulgar ·
 * 1.9–3.9 sostiene (≈2 s) · 3.9–5.0 baja el brazo y al final relaja la mano.
 */
export function welcomePose(t: number): PoseDeltas {
  const lift = plateau(0.4, 1.6, 3.9, 5.0, t)
  const grip = plateau(1.0, 1.8, 4.2, 5.0, t)
  const thumb = plateau(1.3, 1.9, 4.3, 4.9, t)
  const [wx, wy, wz] = THUMBS_UP.wrist

  const pose: Record<string, Euler3> = {
    mixamorigRightArm: [0, 0, THUMBS_UP.arm * lift],
    mixamorigRightForeArm: [0, 0, THUMBS_UP.forearm * lift],
    mixamorigRightHand: [wx * grip, wy * grip, wz * grip],
    mixamorigRightHandThumb1: [0, 0, THUMBS_UP.thumb[0] * thumb],
    mixamorigRightHandThumb2: [0, 0, THUMBS_UP.thumb[1] * thumb],
  }
  for (const bone of FINGER_BONES) pose[bone] = [0, 0, THUMBS_UP.fingers * grip]
  return pose
}
