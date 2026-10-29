import type { Task } from '../types'
import { daysFromToday } from './dates'

export type GroupKey = 'overdue' | 'today' | 'week' | 'later' | 'none' | 'earlier'

export interface TaskGroup {
  readonly key: GroupKey
  readonly label: string
  readonly tasks: readonly Task[]
}

const ORDER: readonly { key: GroupKey; label: string }[] = [
  { key: 'overdue', label: 'Vencidas' },
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Esta semana' },
  { key: 'later', label: 'Más adelante' },
  { key: 'none', label: 'Sin fecha' },
  { key: 'earlier', label: 'Anteriores' },
]

export function groupKeyOf(task: Task, today: Date): GroupKey {
  if (task.dueDate === null) return 'none'
  const days = daysFromToday(task.dueDate, today)
  if (days === null) return 'none'
  if (days < 0) return task.completed ? 'earlier' : 'overdue'
  if (days === 0) return 'today'
  return days <= 7 ? 'week' : 'later'
}

/** Agrupa por vencimiento conservando el orden recibido; solo devuelve grupos con tareas. */
export function groupTasks(tasks: readonly Task[], today: Date = new Date()): TaskGroup[] {
  const buckets = new Map<GroupKey, Task[]>()
  for (const task of tasks) {
    const key = groupKeyOf(task, today)
    buckets.set(key, [...(buckets.get(key) ?? []), task])
  }
  return ORDER.flatMap(({ key, label }) => {
    const list = buckets.get(key)
    return list ? [{ key, label, tasks: list }] : []
  })
}
