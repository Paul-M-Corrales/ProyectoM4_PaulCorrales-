import { plateau, smooth, wave } from './easing'

/** Rotación local en grados (x, y, z) que se compone sobre la pose de reposo de idle. */
export type Euler3 = readonly [number, number, number]
export type PoseDeltas = Readonly<Record<string, Euler3>>

export const WELCOME_DURATION = 5.6

const FINGERS = ['Index', 'Middle', 'Ring', 'Pinky'] as const
const PHALANGES = [1, 2, 3] as const
const SIDES = ['Right', 'Left'] as const

const fingerBones = (side: string) =>
  FINGERS.flatMap((f) => PHALANGES.map((k) => `mixamorig${side}Hand${f}${k}`))

export const WELCOME_BONES: readonly string[] = [
  ...SIDES.flatMap((s) => [
    `mixamorig${s}Arm`,
    `mixamorig${s}ForeArm`,
    `mixamorig${s}Hand`,
    `mixamorig${s}HandThumb1`,
    `mixamorig${s}HandThumb2`,
    ...fingerBones(s),
  ]),
  'mixamorigSpine2',
  'mixamorigNeck',
  'mixamorigHead',
]

/**
 * Ejes calibrados sobre el rig (Mixamo): Z de brazo/antebrazo abre el brazo y flexiona el codo
 * (positivo en el derecho, negativo en el izquierdo); Z de los dedos los cierra; Z negativo del
 * pulgar derecho lo levanta y positivo lo remete. El izquierdo es el espejo (signos invertidos).
 *
 * 0–0.8 sube el brazo derecho y cierra la mano · 0.8–2.4 pulgar arriba (se sostiene) ·
 * 2.3–3.2 baja y sube el puño izquierdo · 3.2–4.3 puño con dos impulsos · 4.3–5.1 reposo.
 */
/** Énfasis: la mano que hace el gesto crece hasta un 25 % para que se lea a distancia. */
export const HAND_SCALE_BONES = ['mixamorigRightHand', 'mixamorigLeftHand'] as const

export function handScale(t: number): Record<(typeof HAND_SCALE_BONES)[number], number> {
  const right = plateau(0.1, 0.9, 2.3, 3.1, t)
  const left = plateau(2.4, 3.2, 4.2, 5.0, t)
  return { mixamorigRightHand: 1 + 0.25 * right, mixamorigLeftHand: 1 + 0.25 * left }
}

export function welcomePose(t: number): PoseDeltas {
  const raise = plateau(0, 0.85, 2.3, 3.1, t)
  const grip = plateau(0.1, 0.9, 2.3, 3.1, t)
  const thumb = smooth(0.55, 0.95, t) - smooth(2.3, 2.7, t)
  const flick = wave(t, 1.0, 0.9) * smooth(0.95, 1.2, t) * (1 - smooth(2.0, 2.3, t))

  const fist = plateau(2.3, 3.2, 4.2, 5.1, t)
  const clench = plateau(2.4, 3.2, 4.2, 5.0, t)
  const pumping = smooth(3.2, 3.4, t) * (1 - smooth(3.9, 4.2, t))
  const pump = wave(t, 3.2, 0.55) * pumping

  const pose: Record<string, Euler3> = {
    mixamorigRightArm: [0, 0, 60 * raise],
    mixamorigRightForeArm: [0, 0, 95 * raise + 3 * flick],
    mixamorigRightHand: [20 * grip, 20 * grip, 50 * grip],
    mixamorigRightHandThumb1: [0, 0, -40 * thumb - 5 * flick],
    mixamorigRightHandThumb2: [0, 0, -50 * thumb - 6 * flick],
    mixamorigLeftArm: [0, 0, -(70 * fist + 8 * pump)],
    mixamorigLeftForeArm: [0, 0, -(102 * fist + 6 * pump)],
    mixamorigLeftHand: [20 * clench, -20 * clench, -50 * clench],
    mixamorigLeftHandThumb1: [0, 0, -40 * clench],
    mixamorigLeftHandThumb2: [0, 0, -50 * clench],
    mixamorigSpine2: [-4 * Math.abs(pump) - 2 * fist, -3 * raise + 3 * fist, 0],
    mixamorigNeck: [-2 * fist, 6 * raise - 5 * fist, 0],
    mixamorigHead: [0, 0, 0],
  }
  for (const bone of fingerBones('Right')) pose[bone] = [0, 0, 85 * grip]
  for (const bone of fingerBones('Left')) pose[bone] = [0, 0, -85 * clench]
  return pose
}
