import { useEffect, useMemo, useState } from 'react'
import { unconnectedTaskRepository, type TaskRepository } from '../services/taskRepository'
import type { Task } from '../types'

const EMPTY: readonly Task[] = []

/** Única puerta de entrada a las tareas; el siguiente ticket inyecta el repositorio de Firestore. */
export function useTasks(repository: TaskRepository = unconnectedTaskRepository) {
  const [tasks, setTasks] = useState<readonly Task[]>(EMPTY)

  useEffect(() => repository.subscribe(setTasks), [repository])

  return useMemo(
    () => ({
      tasks,
      connected: repository.connected,
      create: repository.create.bind(repository),
      update: repository.update.bind(repository),
      remove: repository.remove.bind(repository),
    }),
    [tasks, repository],
  )
}
