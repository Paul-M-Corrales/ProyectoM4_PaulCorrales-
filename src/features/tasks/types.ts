export const PRIORITIES = ['alta', 'media', 'baja'] as const
export type Priority = (typeof PRIORITIES)[number]

export const FILTERS = ['all', 'pending', 'completed'] as const
export type TaskFilter = (typeof FILTERS)[number]

/** Tarea tal como la persistirá Firestore en el siguiente ticket. */
export interface Task {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly priority: Priority
  /** Fecha límite en formato AAAA-MM-DD, o null si no tiene. */
  readonly dueDate: string | null
  readonly completed: boolean
}

/** Datos que aporta el usuario al crear o editar una tarea. */
export type TaskDraft = Pick<Task, 'title' | 'description' | 'priority' | 'dueDate'>

export type TaskActionResult = { readonly ok: true } | { readonly ok: false; readonly message: string }
