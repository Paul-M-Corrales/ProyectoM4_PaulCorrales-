import type { Priority, SummaryTask } from './types.js'

export const MAX_LISTED = 25

export interface Summary {
  readonly total: number
  readonly completed: number
  readonly pending: number
  /** Entero de 0 a 100. */
  readonly percent: number
  readonly listed: readonly SummaryTask[]
  /** Pendientes que no caben en la lista del correo. */
  readonly hidden: number
  /** true si Firestore devolvió más tareas de las que se analizan. */
  readonly partial: boolean
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

/** Calcula el progreso y selecciona, con tope explícito, las pendientes más urgentes. */
export function buildSummary(tasks: readonly SummaryTask[], partial = false): Summary {
  const completed = tasks.filter((task) => task.completed).length
  const pendingTasks = tasks.filter((task) => !task.completed).sort(byUrgency)
  return {
    total: tasks.length,
    completed,
    pending: pendingTasks.length,
    percent: tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100),
    listed: pendingTasks.slice(0, MAX_LISTED),
    hidden: Math.max(0, pendingTasks.length - MAX_LISTED),
    partial,
  }
}
