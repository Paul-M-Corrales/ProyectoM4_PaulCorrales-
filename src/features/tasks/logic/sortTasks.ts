import type { Priority, Task } from '../types'

export const SORT_KEYS = ['due', 'priority', 'title'] as const
export type SortKey = (typeof SORT_KEYS)[number]

export const SORT_LABELS: Record<SortKey, string> = {
  due: 'Fecha límite',
  priority: 'Prioridad',
  title: 'Título',
}

const WEIGHT: Record<Priority, number> = { alta: 0, media: 1, baja: 2 }

const byDue = (a: Task, b: Task) => {
  if (a.dueDate === b.dueDate) return 0
  if (a.dueDate === null) return 1
  if (b.dueDate === null) return -1
  return a.dueDate < b.dueDate ? -1 : 1
}

const COMPARATORS: Record<SortKey, (a: Task, b: Task) => number> = {
  due: byDue,
  priority: (a, b) => WEIGHT[a.priority] - WEIGHT[b.priority] || byDue(a, b),
  title: (a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }),
}

/** Devuelve una copia ordenada; el criterio "due" deja las tareas sin fecha al final. */
export function sortTasks(tasks: readonly Task[], key: SortKey): Task[] {
  return [...tasks].sort(COMPARATORS[key])
}
