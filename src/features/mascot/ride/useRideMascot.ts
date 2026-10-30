import { useState } from 'react'
import type { ClipName } from '../contracts'
import { shouldCelebrate, type ProgressSnapshot } from './celebration'
import { rideStateFor, type RideState, type TaskProgress } from './rideProgress'

interface Options {
  readonly reducedMotion?: boolean
  /** false mientras los datos todavía no llegaron: nada se celebra ni se da por cierto. */
  readonly ready?: boolean
  /** Identidad de los datos (uid): al cambiar se reinicia el estado transitorio. */
  readonly resetKey?: string | null
}

interface RideMascotControl extends Omit<RideState, 'clip'> {
  readonly clip: ClipName
  readonly onClipFinished: (clip: ClipName) => void
}

interface Seen {
  readonly key: string | null
  readonly snapshot: ProgressSnapshot
  readonly celebrating: boolean
}

/**
 * Sube al conejo a la bici una vez (ride-mount), sigue el progreso real y celebra una sola vez
 * cuando se completa la última tarea pendiente.
 */
export function useRideMascot(
  progress: TaskProgress,
  { reducedMotion = false, ready = true, resetKey = null }: Options = {},
): RideMascotControl {
  const [mounted, setMounted] = useState(false)
  const snapshot: ProgressSnapshot = { ...progress, ready }
  const [seen, setSeen] = useState<Seen>({ key: resetKey, snapshot, celebrating: false })

  const changed =
    seen.snapshot.ready !== ready ||
    seen.snapshot.total !== progress.total ||
    seen.snapshot.completed !== progress.completed
  if (seen.key !== resetKey) {
    setSeen({ key: resetKey, snapshot, celebrating: false })
  } else if (changed) {
    const celebrate = !reducedMotion && shouldCelebrate(seen.snapshot, snapshot)
    setSeen({ key: resetKey, snapshot, celebrating: celebrate || (seen.celebrating && progress.completed >= progress.total) })
  }

  const onClipFinished = (finished: ClipName) => {
    if (finished === 'ride-mount') setMounted(true)
    if (finished === 'ride-celebrate') setSeen((current) => ({ ...current, celebrating: false }))
  }

  if (!mounted && !reducedMotion) return { clip: 'ride-mount', speed: 1, onClipFinished }
  if (seen.celebrating) return { clip: 'ride-celebrate', speed: 1, onClipFinished }
  return { ...rideStateFor(progress), onClipFinished }
}
