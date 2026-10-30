export const PRIORITIES = ['alta', 'media', 'baja'] as const
export type Priority = (typeof PRIORITIES)[number]

export const FILTERS = ['all', 'pending', 'completed'] as const
export type TaskFilter = (typeof FILTERS)[number]

/** Tarea del usuario autenticado, tal como la persiste Firestore en `users/{uid}/tasks/{id}`. */
export interface Task {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly priority: Priority
  /** Fecha límite como texto AAAA-MM-DD (día de calendario, sin hora ni zona), o null. */
  readonly dueDate: string | null
  readonly completed: boolean
  /** Instante de creación en ms desde epoch (Timestamp del servidor). */
  readonly createdAt: number
  /** Posición manual para el reordenamiento futuro (drag & drop). */
  readonly order: number
}

/** Datos que aporta el usuario al crear o editar una tarea. */
export type TaskDraft = Pick<Task, 'title' | 'description' | 'priority' | 'dueDate'>

export type TaskChanges = Partial<TaskDraft & { completed: boolean }>

export type TaskActionResult = { readonly ok: true } | { readonly ok: false; readonly message: string }
