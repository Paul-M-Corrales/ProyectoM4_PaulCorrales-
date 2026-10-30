import { useEffect, useMemo, useState } from 'react'
import type { TaskRepository } from '../services/taskRepository'
import type { Task } from '../types'

const EMPTY: readonly Task[] = []

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
      create: (draft: Parameters<TaskRepository['create']>[0]) => repository.create(draft),
      update: (id: string, changes: Parameters<TaskRepository['update']>[1]) => repository.update(id, changes),
      remove: (id: string) => repository.remove(id),
    }
  }, [state, repository])
}
