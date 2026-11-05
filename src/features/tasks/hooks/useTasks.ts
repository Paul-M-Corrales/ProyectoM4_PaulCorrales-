import { useEffect, useMemo, useState } from 'react'
import type { TaskRepository } from '../services/taskRepository'
import { pastDueError } from '../logic/localDate'
import type { Task, TaskActionResult } from '../types'

const EMPTY: readonly Task[] = []
const reject = (message: string): Promise<TaskActionResult> => Promise.resolve({ ok: false, message })

export type TasksStatus = 'loading' | 'ready' | 'error'

interface State {
  readonly repository: TaskRepository
  readonly tasks: readonly Task[]
  readonly status: TasksStatus
  readonly error?: string
}

/** Única puerta de entrada a las tareas: suscripción en tiempo real y acciones del repositorio. */
export function useTasks(repository: TaskRepository) {
  const [state, setState] = useState<State>({ repository, tasks: EMPTY, status: 'loading' })

  useEffect(
    () =>
      repository.subscribe(
        (tasks) => setState({ repository, tasks, status: 'ready' }),
        (error) => setState({ repository, tasks: EMPTY, status: 'error', error }),
      ),
    [repository],
  )

  return useMemo(() => {
    // Si cambió el repositorio (otro usuario), se descartan de inmediato los datos del anterior.
    const own = state.repository === repository
    return {
      tasks: own ? state.tasks : EMPTY,
      status: own ? state.status : ('loading' as TasksStatus),
      loadError: own ? state.error : undefined,
      connected: repository.connected,
      // Última barrera contra fechas pasadas, aunque se eluda el formulario. Conservar la fecha vencida original sí se permite.
      create: (draft: Parameters<TaskRepository['create']>[0]) => {
        const past = pastDueError(draft.dueDate)
        return past ? reject(past) : repository.create(draft)
      },
      update: (id: string, changes: Parameters<TaskRepository['update']>[1]) => {
        const original = (own ? state.tasks : EMPTY).find((task) => task.id === id)?.dueDate ?? null
        const past = changes.dueDate === undefined ? undefined : pastDueError(changes.dueDate, original)
        return past ? reject(past) : repository.update(id, changes)
      },
      remove: (id: string) => repository.remove(id),
      reorder: (orders: Parameters<TaskRepository['reorder']>[0]) => repository.reorder(orders),
    }
  }, [state, repository])
}
