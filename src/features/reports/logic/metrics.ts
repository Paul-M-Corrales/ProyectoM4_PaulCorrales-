import { daysFromToday } from '@/features/tasks/logic/dates'
import { groupKeyOf } from '@/features/tasks/logic/groupTasks'
import { countTasks } from '@/features/tasks/logic/taskFilters'
import { PRIORITIES, type Priority, type Task } from '@/features/tasks/types'

export const UPCOMING_LIMIT = 5

export interface PriorityStat {
  readonly priority: Priority
  readonly total: number
  readonly completed: number
  readonly pending: number
}

export interface Metrics {
  readonly total: number
  readonly completed: number
  readonly pending: number
  /** Pendientes con fecha límite anterior a hoy: la misma definición del grupo «Vencidas» de Mis tareas. */
  readonly overdue: number
  /** completadas / total, redondeado; 0 sin tareas (igual que el anillo de Mis tareas). */
  readonly percent: number
  readonly byPriority: readonly PriorityStat[]
  /** Próximas pendientes con vencimiento hoy o después, por fecha y luego prioridad. */
  readonly upcoming: readonly Task[]
}

export const percentOf = (completed: number, total: number) =>
  total === 0 ? 0 : Math.round((completed / total) * 100)

const rank = (priority: Priority) => PRIORITIES.indexOf(priority)

/** Todas las cifras salen de la misma lista de tareas en tiempo real; nada se estima ni se inventa. */
export function computeMetrics(tasks: readonly Task[], today: Date = new Date()): Metrics {
  const { total, completed, pending } = countTasks(tasks)
  const upcoming = tasks
    .filter((task) => {
      const days = task.dueDate === null ? null : daysFromToday(task.dueDate, today)
      return !task.completed && days !== null && days >= 0
    })
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? '') || rank(a.priority) - rank(b.priority))
    .slice(0, UPCOMING_LIMIT)
  return {
    total,
    completed,
    pending,
    overdue: tasks.filter((task) => !task.completed && groupKeyOf(task, today) === 'overdue').length,
    percent: percentOf(completed, total),
    byPriority: PRIORITIES.map((priority) => {
      const own = tasks.filter((task) => task.priority === priority)
      const done = own.filter((task) => task.completed).length
      return { priority, total: own.length, completed: done, pending: own.length - done }
    }),
    upcoming,
  }
}
