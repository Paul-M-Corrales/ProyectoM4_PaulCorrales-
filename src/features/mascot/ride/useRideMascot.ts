import { useCallback, useState } from 'react'
import type { ClipName } from '../contracts'
import { rideStateFor, type RideState, type TaskProgress } from './rideProgress'

interface Options {
  readonly reducedMotion?: boolean
}

interface RideMascotControl extends Omit<RideState, 'clip'> {
  readonly clip: ClipName
  readonly onClipFinished: (clip: ClipName) => void
}

/** Sube al conejo a la bici una vez (ride-mount) y luego sigue el progreso de tareas. */
export function useRideMascot(progress: TaskProgress, { reducedMotion = false }: Options = {}): RideMascotControl {
  const [mounted, setMounted] = useState(false)
  const target = rideStateFor(progress)

  const onClipFinished = useCallback((finished: ClipName) => {
    if (finished === 'ride-mount') setMounted(true)
  }, [])

  if (!mounted && !reducedMotion) return { clip: 'ride-mount', speed: 1, onClipFinished }
  return { ...target, onClipFinished }
}
