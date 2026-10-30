import type { ClipName } from '../contracts'

/** Progreso real de tareas; lo calculará la capa de datos (Firestore) en el siguiente ticket. */
export interface TaskProgress {
  readonly total: number
  readonly completed: number
}

export type RideClip = Extract<ClipName, 'ride-idle' | 'ride' | 'ride-celebrate'>

export interface RideState {
  readonly clip: RideClip
  /** Multiplicador de velocidad del clip. */
  readonly speed: number
}

export const MIN_PEDAL_SPEED = 0.6
export const MAX_PEDAL_SPEED = 2.2

const safeCount = (value: number) => (Number.isFinite(value) && value > 0 ? Math.floor(value) : 0)

/** Fracción completada en [0, 1]. Sin tareas no hay progreso: 0. */
export function progressRatio({ total, completed }: TaskProgress): number {
  const all = safeCount(total)
  if (all === 0) return 0
  return Math.min(safeCount(completed), all) / all
}

/**
 * 0 %, 100 % (o sin tareas): reposo. Parcial: pedaleo cada vez más rápido. La celebración
 * (ride-celebrate) es un evento puntual que decide useRideMascot, no un estado: al terminar descansa.
 */
export function rideStateFor(progress: TaskProgress): RideState {
  const ratio = progressRatio(progress)
  if (ratio === 0 || ratio === 1) return { clip: 'ride-idle', speed: 1 }
  return { clip: 'ride', speed: MIN_PEDAL_SPEED + (MAX_PEDAL_SPEED - MIN_PEDAL_SPEED) * ratio }
}
