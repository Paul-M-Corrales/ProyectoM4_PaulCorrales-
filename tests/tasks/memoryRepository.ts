import type { TaskRepository } from '@/features/tasks/services/taskRepository'
import type { Task, TaskActionResult } from '@/features/tasks/types'

export const task = (id: string, over: Partial<Task> = {}): Task => ({
  id,
  title: `Tarea ${id}`,
  description: '',
  priority: 'media',
  dueDate: null,
  completed: false,
  createdAt: 0,
  order: 0,
  ...over,
})

export interface MemoryRepository extends TaskRepository {
  /** Emite un nuevo estado del servidor, como lo haría onSnapshot. */
  push(tasks: readonly Task[]): void
  fail(message: string): void
  readonly unsubscribed: { count: number }
  readonly calls: { create: unknown[]; update: unknown[]; remove: string[] }
}

/** Repositorio en memoria con el mismo contrato que Firestore, para probar UI y hooks sin red. */
export function memoryRepository(initial: readonly Task[] = [], result: TaskActionResult = { ok: true }): MemoryRepository {
  let tasks = initial
  const listeners = new Set<(tasks: readonly Task[]) => void>()
  const errors = new Set<(message: string) => void>()
  const unsubscribed = { count: 0 }
  const calls = { create: [] as unknown[], update: [] as unknown[], remove: [] as string[] }
  const emit = () => listeners.forEach((listener) => listener(tasks))

  return {
    connected: true,
    unsubscribed,
    calls,
    push(next) {
      tasks = next
      emit()
    },
    fail: (message) => errors.forEach((onError) => onError(message)),
    subscribe(onChange, onError) {
      listeners.add(onChange)
      errors.add(onError)
      onChange(tasks)
      return () => {
        unsubscribed.count += 1
        listeners.delete(onChange)
        errors.delete(onError)
      }
    },
    create(draft) {
      calls.create.push(draft)
      if (result.ok) this.push([...tasks, task(`n${tasks.length}`, { ...draft, createdAt: tasks.length + 1 })])
      return Promise.resolve(result)
    },
    update(id, changes) {
      calls.update.push({ id, changes })
      if (result.ok) this.push(tasks.map((item) => (item.id === id ? { ...item, ...changes } : item)))
      return Promise.resolve(result)
    },
    remove(id) {
      calls.remove.push(id)
      if (result.ok) this.push(tasks.filter((item) => item.id !== id))
      return Promise.resolve(result)
    },
  }
}
