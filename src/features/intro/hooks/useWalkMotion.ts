import { animate, useMotionValue, type AnimationPlaybackControls } from 'motion/react'
import { useEffect } from 'react'
import { OFFSCREEN_PX, START_OFFSET, STOP_SEC, STOP_TRAVEL, WALK_SEC } from '../introTimeline'
import type { IntroPhase } from '../introTypes'

/**
 * Desplazamiento horizontal real del conejo, ligado a la fase de la intro.
 * walk: velocidad constante (sin aceleraciones, para no patinar); stop: frenado suave.
 */
export function useWalkMotion(phase: IntroPhase, height: number, settled: boolean) {
  const x = useMotionValue(settled ? 0 : OFFSCREEN_PX)

  useEffect(() => {
    if (height === 0) return
    let controls: AnimationPlaybackControls | undefined
    if (phase === 'opening') x.set(-START_OFFSET * height)
    else if (phase === 'walk') {
      controls = animate(x, -STOP_TRAVEL * height, { duration: WALK_SEC, ease: 'linear' })
    } else if (phase === 'stop') {
      controls = animate(x, 0, { duration: STOP_SEC, ease: 'easeOut' })
    } else x.set(0)
    return () => controls?.stop()
  }, [phase, height, x])

  return x
}
