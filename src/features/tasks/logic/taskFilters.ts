import type { TaskProgress } from '@/features/mascot'
import type { Task, TaskFilter } from '../types'

const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

export function filterTasks(tasks: readonly Task[], filter: TaskFilter, query: string): Task[] {
  const needle = normalize(query)
  return tasks.filter((task) => {
    if (filter === 'pending' && task.completed) return false
    if (filter === 'completed' && !task.completed) return false
    if (!needle) return true
    return normalize(`${task.title} ${task.description}`).includes(needle)
  })
}

export function progressOf(tasks: readonly Task[]): TaskProgress {
  return { total: tasks.length, completed: tasks.filter((task) => task.completed).length }
}

export interface TaskCounts {
  readonly total: number
  readonly pending: number
  readonly completed: number
}

export function countTasks(tasks: readonly Task[]): TaskCounts {
  const { total, completed } = progressOf(tasks)
  return { total, completed, pending: total - completed }
}
