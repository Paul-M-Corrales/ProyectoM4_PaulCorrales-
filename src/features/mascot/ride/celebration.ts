import type { TaskProgress } from './rideProgress'

/** Lo observado en un instante: si los datos ya llegaron del servidor y el progreso de ese momento. */
export interface ProgressSnapshot extends TaskProgress {
  readonly ready: boolean
}

const isComplete = ({ total, completed }: TaskProgress) => total > 0 && completed >= total

/**
 * Celebra solo cuando el usuario completa la última tarea pendiente: ambos datos ya cargados,
 * antes incompleto, ahora completo, subió el número de completadas y el total no cambió.
 * Así no se celebra al cargar una cuenta ya terminada, sin tareas, al borrar una tarea
 * (cambia el denominador) ni al cambiar filtros (no cambian los datos).
 */
export function shouldCelebrate(prev: ProgressSnapshot, next: ProgressSnapshot): boolean {
  return (
    prev.ready &&
    next.ready &&
    !isComplete(prev) &&
    isComplete(next) &&
    next.completed > prev.completed &&
    next.total === prev.total
  )
}
