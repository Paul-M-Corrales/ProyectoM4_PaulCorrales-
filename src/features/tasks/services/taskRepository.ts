import type { TaskOrder } from '../logic/reorder'
import type { Task, TaskActionResult, TaskChanges, TaskDraft } from '../types'

/** Contrato entre las pantallas y la persistencia. Las pantallas solo dependen de esta interfaz. */
export interface TaskRepository {
  readonly connected: boolean
  /** Escucha en tiempo real. Devuelve la función que cancela la suscripción. */
  subscribe(onChange: (tasks: readonly Task[]) => void, onError: (message: string) => void): () => void
  create(draft: TaskDraft): Promise<TaskActionResult>
  update(id: string, changes: TaskChanges): Promise<TaskActionResult>
  remove(id: string): Promise<TaskActionResult>
  /** Guarda varias posiciones de forma atómica (todo o nada, mientras quepan en un lote). */
  reorder(orders: readonly TaskOrder[]): Promise<TaskActionResult>
}

const NOT_CONNECTED: TaskActionResult = {
  ok: false,
  message: 'El guardado de tareas no está disponible: falta configurar Firebase o iniciar sesión.',
}

/** Repositorio sin Firebase: no guarda nada ni inventa tareas. */
export const unconnectedTaskRepository: TaskRepository = {
  connected: false,
  subscribe(onChange) {
    onChange([])
    return () => {}
  },
  create: () => Promise.resolve(NOT_CONNECTED),
  update: () => Promise.resolve(NOT_CONNECTED),
  remove: () => Promise.resolve(NOT_CONNECTED),
  reorder: () => Promise.resolve(NOT_CONNECTED),
}
