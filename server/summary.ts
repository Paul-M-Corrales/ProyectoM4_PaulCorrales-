import type { Priority, SummaryTask, TasksSnapshot } from './types.js'

/** Máximo de tareas detalladas en el correo. */
export const MAX_LISTED = 25

export interface Summary {
  readonly total: number
  readonly completed: number
  readonly pending: number
  /** Tareas sin estado válido: se informan aparte para no comunicar cifras falsas. */
  readonly unknown: number
  /** Entero de 0 a 100 sobre el total global. */
  readonly percent: number
  readonly listed: readonly SummaryTask[]
  /** Pendientes que NO aparecen en la lista (la lista nunca es exhaustiva). */
  readonly hidden: number
}

const WEIGHT: Record<Priority, number> = { alta: 0, media: 1, baja: 2 }

const byUrgency = (a: SummaryTask, b: SummaryTask) => {
  if (a.dueDate !== b.dueDate) {
    if (a.dueDate === null) return 1
    if (b.dueDate === null) return -1
    return a.dueDate < b.dueDate ? -1 : 1
  }
  return WEIGHT[a.priority] - WEIGHT[b.priority]
}

/**
 * Los contadores son globales (vienen de agregaciones). La lista es una muestra: de las pendientes
 * candidatas (las primeras por id de documento) se muestran, con tope, las más urgentes:
 * primero por fecha de vencimiento (sin fecha al final) y luego por prioridad alta > media > baja.
 */
export function buildSummary(snapshot: TasksSnapshot): Summary {
  const { total, completed, pending, unknown } = snapshot
  const listed = snapshot.candidates.filter((task) => !task.completed).sort(byUrgency).slice(0, MAX_LISTED)
  return {
    total,
    completed,
    pending,
    unknown,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    listed,
    hidden: Math.max(0, pending - listed.length),
  }
}
