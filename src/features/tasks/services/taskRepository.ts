import type { Task, TaskActionResult, TaskDraft } from '../types'

/** Contrato que implementará Firestore. Las pantallas solo dependen de esta interfaz. */
export interface TaskRepository {
  readonly connected: boolean
  subscribe(onChange: (tasks: readonly Task[]) => void): () => void
  create(draft: TaskDraft): Promise<TaskActionResult>
  update(id: string, changes: Partial<TaskDraft & { completed: boolean }>): Promise<TaskActionResult>
  remove(id: string): Promise<TaskActionResult>
}

const NOT_CONNECTED: TaskActionResult = {
  ok: false,
  message: 'El guardado de tareas todavía no está conectado. Llega con el próximo ticket.',
}

/** Repositorio provisional honesto: no guarda nada ni inventa tareas. */
export const unconnectedTaskRepository: TaskRepository = {
  connected: false,
  subscribe(onChange) {
    onChange([])
    return () => {}
  },
  create: () => Promise.resolve(NOT_CONNECTED),
  update: () => Promise.resolve(NOT_CONNECTED),
  remove: () => Promise.resolve(NOT_CONNECTED),
}
