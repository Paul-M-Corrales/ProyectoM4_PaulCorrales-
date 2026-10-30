import { AnimationClip, Euler, Quaternion, QuaternionKeyframeTrack, VectorKeyframeTrack } from 'three'
import { HAND_SCALE_BONES, WELCOME_BONES, WELCOME_DURATION, handScale, welcomePose } from './welcomePose'

const FPS = 30
const DEG = Math.PI / 180
const ZERO: readonly [number, number, number] = [0, 0, 0]

/** Pose de reposo de un hueso: primer fotograma de su pista de rotación en idle. */
function restQuaternion(idle: AnimationClip, bone: string): Quaternion | null {
  const track = idle.tracks.find((t) => t.name === `${bone}.quaternion`)
  if (!track) return null
  const [x = 0, y = 0, z = 0, w = 1] = track.values
  return new Quaternion(x, y, z, w)
}

/**
 * Crea el clip `welcome` sobre los huesos reales del rig, sin tocar el GLB.
 * Cada pista de rotación = reposo de idle × rotación local de welcomePose(t), muestreada a 30 fps;
 * las manos añaden una pista de escala uniforme para dar énfasis al gesto.
 */
export function buildWelcomeClip(idle: AnimationClip): AnimationClip {
  const frames = Math.round(WELCOME_DURATION * FPS)
  const times = Array.from({ length: frames + 1 }, (_, i) => i / FPS)
  const poses = times.map((t) => welcomePose(t))
  const tracks = WELCOME_BONES.flatMap((bone) => {
    const rest = restQuaternion(idle, bone)
    if (!rest) return []
    const values: number[] = []
    for (const pose of poses) {
      const [x, y, z] = pose[bone] ?? ZERO
      const q = rest.clone().multiply(new Quaternion().setFromEuler(new Euler(x * DEG, y * DEG, z * DEG)))
      values.push(q.x, q.y, q.z, q.w)
    }
    return [new QuaternionKeyframeTrack(`${bone}.quaternion`, times, values)]
  })
  const scales = HAND_SCALE_BONES.flatMap((bone) => {
    if (!restQuaternion(idle, bone)) return []
    const values = times.flatMap((t) => {
      const s = handScale(t)[bone]
      return [s, s, s]
    })
    return [new VectorKeyframeTrack(`${bone}.scale`, times, values)]
  })
  return new AnimationClip('welcome', WELCOME_DURATION, [...tracks, ...scales])
}
