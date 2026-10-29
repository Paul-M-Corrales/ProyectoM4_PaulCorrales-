import { plateau, smooth, wave } from './easing'

/** Rotación local en grados (x, y, z) que se compone sobre la pose de reposo de idle. */
export type Euler3 = readonly [number, number, number]
export type PoseDeltas = Readonly<Record<string, Euler3>>

export const WELCOME_DURATION = 5.2

const FINGERS = ['Index', 'Middle', 'Ring', 'Pinky'] as const
const PHALANGES = [1, 2, 3] as const

export const WELCOME_BONES: readonly string[] = [
  'mixamorigRightShoulder', 'mixamorigRightArm', 'mixamorigRightForeArm', 'mixamorigRightHand',
  'mixamorigLeftShoulder', 'mixamorigLeftArm', 'mixamorigLeftForeArm', 'mixamorigLeftHand',
  'mixamorigSpine1', 'mixamorigSpine2', 'mixamorigNeck', 'mixamorigHead',
  ...FINGERS.flatMap((f) => PHALANGES.map((k) => `mixamorigLeftHand${f}${k}`)),
]

/**
 * Saludo (brazo derecho del conejo) y puño de motivación (brazo izquierdo).
 * 0–0.55 sube la mano · 0.55–2.35 saluda · 2.35–3.15 baja y sube el puño ·
 * 3.15–4.15 puño arriba con dos impulsos · 4.15–4.75 vuelve a reposo.
 */
export function welcomePose(t: number): PoseDeltas {
  const hi = plateau(0, 0.55, 2.35, 2.95, t)
  const waving = smooth(0.55, 0.8, t) * (1 - smooth(2.1, 2.4, t))
  const osc = wave(t, 0.55, 0.6) * waving

  const fist = plateau(2.55, 3.15, 4.15, 4.75, t)
  const curl = plateau(2.75, 3.2, 4.2, 4.6, t)
  const pumping = smooth(3.15, 3.3, t) * (1 - smooth(3.95, 4.15, t))
  const pump = wave(t, 3.15, 0.5) * pumping

  const pose: Record<string, Euler3> = {
    mixamorigRightArm: [0, 0, 108 * hi],
    mixamorigRightForeArm: [0, 0, 88 * hi + 24 * osc],
    mixamorigRightHand: [0, 0, 16 * osc],
    mixamorigLeftArm: [0, 0, -108 * fist],
    mixamorigLeftForeArm: [0, 0, -88 * fist + 26 * pump],
    mixamorigSpine2: [-5 * Math.abs(pump) - 3 * hi, 4 * hi - 4 * fist, 0],
    mixamorigNeck: [-4 * fist, 10 * hi - 8 * fist, 0],
    mixamorigHead: [0, 0, -3 * hi],
  }
  for (const f of FINGERS) {
    for (const k of PHALANGES) pose[`mixamorigLeftHand${f}${k}`] = [0, 0, -82 * curl]
  }
  return pose
}
