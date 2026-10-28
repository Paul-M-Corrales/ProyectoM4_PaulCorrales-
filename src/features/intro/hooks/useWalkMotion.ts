import { animate, useMotionValue, type AnimationPlaybackControls } from 'motion/react'
import { useEffect } from 'react'
import {
  OFFSCREEN_PX,
  START_OFFSET,
  STOP_SEC,
  STOP_TRAVEL,
  WALK_SEC,
  WALK_YAW,
} from '../introTimeline'
import type { IntroPhase } from '../introTypes'

/**
 * Desplazamiento horizontal y orientación del conejo, ligados a la fase de la intro.
 * walk: de perfil y a velocidad constante (sin aceleraciones, para no patinar);
 * stop: frena y gira hasta quedar de frente, con la misma duración que el clip.
 */
export function useWalkMotion(phase: IntroPhase, height: number, settled: boolean) {
  const x = useMotionValue(settled ? 0 : OFFSCREEN_PX)
  const yaw = useMotionValue(settled ? 0 : WALK_YAW)

  useEffect(() => {
    if (height === 0) return
    const controls: AnimationPlaybackControls[] = []
    if (phase === 'opening') {
      x.set(-START_OFFSET * height)
      yaw.set(WALK_YAW)
    } else if (phase === 'walk') {
      yaw.set(WALK_YAW)
      controls.push(animate(x, -STOP_TRAVEL * height, { duration: WALK_SEC, ease: 'linear' }))
    } else if (phase === 'stop') {
      controls.push(animate(x, 0, { duration: STOP_SEC, ease: 'easeOut' }))
      controls.push(animate(yaw, 0, { duration: STOP_SEC, ease: 'easeInOut' }))
    } else {
      x.set(0)
      yaw.set(0)
    }
    return () => controls.forEach((c) => c.stop())
  }, [phase, height, x, yaw])

  return { x, yaw }
}
